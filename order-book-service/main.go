package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"sort"
	"strings"
	"sync"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
	"github.com/google/uuid"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"github.com/shopspring/decimal"
	"github.com/sirupsen/logrus"
	"github.com/spf13/viper"
)

const maxTradesPerSymbol = 200

var (
	rdb             *redis.Client
	logger          *logrus.Logger
	orderBooks      = make(map[string]*OrderBook)
	orderBooksMutex sync.RWMutex
	tradesBySymbol  = make(map[string][]MarketTrade)
	tradesMutex     sync.RWMutex
)

// Order представляет ордер в стакане
type Order struct {
	ID        string          `json:"id"`
	Symbol    string          `json:"symbol"`
	Side      string          `json:"side"`
	Type      string          `json:"type"`
	Quantity  decimal.Decimal `json:"quantity"`
	Price     decimal.Decimal `json:"price"`
	Timestamp time.Time       `json:"timestamp"`
}

// OrderBook представляет стакан ордеров
type OrderBook struct {
	Symbol string
	Bids   []Order
	Asks   []Order
	Mutex  sync.RWMutex
}

// OrderBookSnapshot представляет снимок стакана
type OrderBookSnapshot struct {
	Symbol    string           `json:"symbol"`
	Timestamp time.Time        `json:"timestamp"`
	Bids      []OrderBookEntry `json:"bids"`
	Asks      []OrderBookEntry `json:"asks"`
}

// OrderBookEntry представляет уровень в стакане
type OrderBookEntry struct {
	Price    decimal.Decimal `json:"price"`
	Quantity decimal.Decimal `json:"quantity"`
	Count    int             `json:"count"`
}

// MarketTrade — запись в ленте сделок по паре (агрегатор ликвидности / симуляция)
type MarketTrade struct {
	ID        string          `json:"id"`
	Symbol    string          `json:"symbol"`
	Side      string          `json:"side"`
	Price     decimal.Decimal `json:"price"`
	Quantity  decimal.Decimal `json:"quantity"`
	Quote     decimal.Decimal `json:"quote"`
	Timestamp time.Time       `json:"timestamp"`
}

// CreateOrderRequest представляет запрос на создание ордера
type CreateOrderRequest struct {
	Symbol   string `json:"symbol" binding:"required"`
	Side     string `json:"side" binding:"required"`
	Type     string `json:"type" binding:"required"`
	Quantity string `json:"quantity" binding:"required"`
	Price    string `json:"price,omitempty"`
}

// CreateOrderResponse представляет ответ на создание ордера
type CreateOrderResponse struct {
	OrderID string `json:"order_id"`
	Status  string `json:"status"`
	Message string `json:"message"`
}

// HealthResponse представляет ответ health check
type HealthResponse struct {
	Status    string `json:"status"`
	Timestamp string `json:"timestamp"`
	Service   string `json:"service"`
}

func main() {
	// Инициализация логгера
	logger = logrus.New()
	logger.SetFormatter(&logrus.JSONFormatter{})
	logger.SetLevel(logrus.InfoLevel)

	// Загрузка конфигурации
	loadConfig()

	// Инициализация Redis
	initRedis()

	// Создание HTTP сервера
	router := gin.Default()

	// Middleware
	router.Use(gin.Logger())
	router.Use(gin.Recovery())
	router.Use(corsMiddleware())

	// Health check
	router.GET("/health", healthCheck)
	router.GET("/ready", readyCheck)

	// Prometheus метрики
	router.GET("/metrics", gin.WrapH(promhttp.Handler()))

	// API маршруты
	api := router.Group("/api/v1")
	{
		api.POST("/orders", createOrder)
		api.GET("/orderbook/:symbol", getOrderBook)
		api.GET("/trades/:symbol", getRecentTrades)
		api.DELETE("/orders/:id", cancelOrder)
		api.GET("/orders", listOrders)
	}

	// Настройка сервера
	port := viper.GetString("PORT")
	if port == "" {
		port = "8081"
	}

	srv := &http.Server{
		Addr:    ":" + port,
		Handler: router,
	}

	// Graceful shutdown
	go func() {
		logger.Infof("🚀 Order Book Service запущен на порту %s", port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Fatalf("Ошибка запуска сервера: %v", err)
		}
	}()

	// Ожидание сигнала для graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	logger.Info("🛑 Получен сигнал завершения...")

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		logger.Fatal("Принудительное завершение сервера:", err)
	}

	logger.Info("✅ Сервер корректно завершен")
}

func loadConfig() {
	viper.SetConfigName("config")
	viper.SetConfigType("yaml")
	viper.AddConfigPath(".")
	viper.AddConfigPath("./config")

	// Переменные окружения
	viper.AutomaticEnv()

	// Значения по умолчанию
	viper.SetDefault("PORT", "8081")
	viper.SetDefault("REDIS_URL", "redis://localhost:6379")

	if err := viper.ReadInConfig(); err != nil {
		logger.Warnf("Не удалось прочитать конфигурационный файл: %v", err)
	}
}

func initRedis() {
	redisURL := viper.GetString("REDIS_URL")
	if redisURL == "" {
		redisURL = "redis://localhost:6379"
	}

	opt, err := redis.ParseURL(redisURL)
	if err != nil {
		logger.Fatalf("Ошибка парсинга Redis URL: %v", err)
	}

	rdb = redis.NewClient(opt)

	// Проверка подключения
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := rdb.Ping(ctx).Err(); err != nil {
		logger.Fatalf("Ошибка подключения к Redis: %v", err)
	}

	logger.Info("✅ Подключение к Redis установлено")
}

func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

func healthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, HealthResponse{
		Status:    "ok",
		Timestamp: time.Now().UTC().Format(time.RFC3339),
		Service:   "order-book-service",
	})
}

func readyCheck(c *gin.Context) {
	// Проверяем подключение к Redis
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	if err := rdb.Ping(ctx).Err(); err != nil {
		c.JSON(http.StatusServiceUnavailable, HealthResponse{
			Status:    "not ready",
			Timestamp: time.Now().UTC().Format(time.RFC3339),
			Service:   "order-book-service",
		})
		return
	}

	c.JSON(http.StatusOK, HealthResponse{
		Status:    "ready",
		Timestamp: time.Now().UTC().Format(time.RFC3339),
		Service:   "order-book-service",
	})
}

func createOrder(c *gin.Context) {
	var req CreateOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Валидация
	if req.Side != "buy" && req.Side != "sell" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "side must be 'buy' or 'sell'"})
		return
	}

	if req.Type != "market" && req.Type != "limit" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "type must be 'market' or 'limit'"})
		return
	}

	quantity, err := decimal.NewFromString(req.Quantity)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid quantity"})
		return
	}

	if quantity.LessThanOrEqual(decimal.Zero) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "quantity must be positive"})
		return
	}

	var price decimal.Decimal
	if req.Type == "limit" {
		if req.Price == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "price is required for limit orders"})
			return
		}
		price, err = decimal.NewFromString(req.Price)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid price"})
			return
		}
		if price.LessThanOrEqual(decimal.Zero) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "price must be positive"})
			return
		}
	}

	// Создаем ордер
	order := Order{
		ID:        uuid.New().String(),
		Symbol:    strings.ToUpper(req.Symbol),
		Side:      req.Side,
		Type:      req.Type,
		Quantity:  quantity,
		Price:     price,
		Timestamp: time.Now().UTC(),
	}

	// Матчим входящий ордер против противоположной стороны стакана.
	// Остаток лимитного ордера попадает в книгу; маркет-ордер не добавляется.
	remaining, status := matchOrder(&order)

	// Сохраняем в Redis (для наблюдения)
	saveOrderToRedis(order)

	msg := "Order created successfully"
	if status == "filled" {
		msg = "Order fully matched"
	} else if status == "partial" {
		msg = "Order partially matched"
	}
	_ = remaining

	c.JSON(http.StatusOK, CreateOrderResponse{
		OrderID: order.ID,
		Status:  status,
		Message: msg,
	})
}

// matchOrder выполняет простой матчинг входящего ордера против противоположной
// стороны стакана. Возвращает оставшееся (нематченное) количество и статус:
// "filled" — полностью исполнен, "partial" — частично исполнен, "open" — полностью в книгу.
func matchOrder(incoming *Order) (decimal.Decimal, string) {
	orderBooksMutex.Lock()
	book, exists := orderBooks[incoming.Symbol]
	if !exists {
		book = &OrderBook{Symbol: incoming.Symbol}
		orderBooks[incoming.Symbol] = book
	}
	orderBooksMutex.Unlock()

	book.Mutex.Lock()
	defer book.Mutex.Unlock()

	remaining := incoming.Quantity
	anyMatched := false

	for remaining.GreaterThan(decimal.Zero) {
		var opposite *[]Order
		var isBuy bool
		if incoming.Side == "buy" {
			opposite = &book.Asks
			isBuy = true
		} else {
			opposite = &book.Bids
			isBuy = false
		}
		if len(*opposite) == 0 {
			break
		}
		top := (*opposite)[0]

		if incoming.Type == "limit" {
			if isBuy && top.Price.GreaterThan(incoming.Price) {
				break
			}
			if !isBuy && top.Price.LessThan(incoming.Price) {
				break
			}
		}

		tradeQty := decimal.Min(remaining, top.Quantity)
		tradePx := top.Price
		recordTrade(incoming.Symbol, incoming.Side, tradePx, tradeQty, incoming.Timestamp)

		top.Quantity = top.Quantity.Sub(tradeQty)
		remaining = remaining.Sub(tradeQty)
		anyMatched = true

		if top.Quantity.LessThanOrEqual(decimal.Zero) {
			*opposite = (*opposite)[1:]
		} else {
			(*opposite)[0] = top
		}
	}

	status := "open"
	if remaining.LessThanOrEqual(decimal.Zero) {
		status = "filled"
	} else if anyMatched {
		status = "partial"
	}

	if incoming.Type == "limit" && remaining.GreaterThan(decimal.Zero) {
		rest := *incoming
		rest.Quantity = remaining
		if incoming.Side == "buy" {
			book.Bids = append(book.Bids, rest)
			sort.Slice(book.Bids, func(i, j int) bool {
				return book.Bids[i].Price.GreaterThan(book.Bids[j].Price)
			})
		} else {
			book.Asks = append(book.Asks, rest)
			sort.Slice(book.Asks, func(i, j int) bool {
				return book.Asks[i].Price.LessThan(book.Asks[j].Price)
			})
		}
	}

	return remaining, status
}

// recordTrade добавляет запись в ленту сделок по символу.
func recordTrade(symbol, takerSide string, price, qty decimal.Decimal, ts time.Time) {
	if symbol == "" || qty.LessThanOrEqual(decimal.Zero) {
		return
	}
	t := MarketTrade{
		ID:        uuid.New().String(),
		Symbol:    symbol,
		Side:      takerSide,
		Price:     price,
		Quantity:  qty,
		Quote:     qty.Mul(price),
		Timestamp: ts,
	}
	tradesMutex.Lock()
	defer tradesMutex.Unlock()
	sl := tradesBySymbol[symbol]
	sl = append([]MarketTrade{t}, sl...)
	if len(sl) > maxTradesPerSymbol {
		sl = sl[:maxTradesPerSymbol]
	}
	tradesBySymbol[symbol] = sl
}

func getOrderBook(c *gin.Context) {
	symbol := strings.ToUpper(c.Param("symbol"))

	orderBooksMutex.RLock()
	orderBook, exists := orderBooks[symbol]
	orderBooksMutex.RUnlock()

	if !exists {
		// Пустой стакан — отдаём валидный снимок без 404 (удобно для UI до первого ордера)
		c.JSON(http.StatusOK, OrderBookSnapshot{
			Symbol:    symbol,
			Timestamp: time.Now().UTC(),
			Bids:      []OrderBookEntry{},
			Asks:      []OrderBookEntry{},
		})
		return
	}

	snapshot := orderBook.GetSnapshot()
	c.JSON(http.StatusOK, snapshot)
}

func getRecentTrades(c *gin.Context) {
	symbol := strings.ToUpper(c.Param("symbol"))
	limit := 50
	tradesMutex.RLock()
	sl := tradesBySymbol[symbol]
	tradesMutex.RUnlock()
	if len(sl) > limit {
		sl = sl[:limit]
	}
	if sl == nil {
		sl = []MarketTrade{}
	}
	c.JSON(http.StatusOK, gin.H{
		"symbol": symbol,
		"trades": sl,
	})
}

func cancelOrder(c *gin.Context) {
	orderID := c.Param("id")

	// TODO: Реализовать отмену ордера
	c.JSON(http.StatusOK, gin.H{
		"message": "Cancel order endpoint",
		"orderId": orderID,
		"status":  "not implemented",
	})
}

func listOrders(c *gin.Context) {
	// TODO: Реализовать список ордеров
	c.JSON(http.StatusOK, gin.H{
		"message": "List orders endpoint",
		"status":  "not implemented",
	})
}

// GetSnapshot возвращает снимок стакана
func (ob *OrderBook) GetSnapshot() OrderBookSnapshot {
	ob.Mutex.RLock()
	defer ob.Mutex.RUnlock()

	// Агрегируем ордера по ценам
	bidsMap := make(map[decimal.Decimal]OrderBookEntry)
	asksMap := make(map[decimal.Decimal]OrderBookEntry)

	// Обрабатываем bids
	for _, order := range ob.Bids {
		entry := bidsMap[order.Price]
		entry.Price = order.Price
		entry.Quantity = entry.Quantity.Add(order.Quantity)
		entry.Count++
		bidsMap[order.Price] = entry
	}

	// Обрабатываем asks
	for _, order := range ob.Asks {
		entry := asksMap[order.Price]
		entry.Price = order.Price
		entry.Quantity = entry.Quantity.Add(order.Quantity)
		entry.Count++
		asksMap[order.Price] = entry
	}

	// Конвертируем в слайсы
	bids := make([]OrderBookEntry, 0, len(bidsMap))
	for _, entry := range bidsMap {
		bids = append(bids, entry)
	}
	sort.Slice(bids, func(i, j int) bool {
		return bids[i].Price.GreaterThan(bids[j].Price)
	})

	asks := make([]OrderBookEntry, 0, len(asksMap))
	for _, entry := range asksMap {
		asks = append(asks, entry)
	}
	sort.Slice(asks, func(i, j int) bool {
		return asks[i].Price.LessThan(asks[j].Price)
	})

	return OrderBookSnapshot{
		Symbol:    ob.Symbol,
		Timestamp: time.Now().UTC(),
		Bids:      bids,
		Asks:      asks,
	}
}

// saveOrderToRedis сохраняет ордер в Redis
func saveOrderToRedis(order Order) {
	ctx := context.Background()

	orderJSON, err := json.Marshal(order)
	if err != nil {
		logger.Errorf("Ошибка сериализации ордера: %v", err)
		return
	}

	key := fmt.Sprintf("order:%s", order.ID)
	err = rdb.Set(ctx, key, orderJSON, 24*time.Hour).Err()
	if err != nil {
		logger.Errorf("Ошибка сохранения ордера в Redis: %v", err)
		return
	}

	// Добавляем в список ордеров для символа
	listKey := fmt.Sprintf("orders:%s", order.Symbol)
	err = rdb.LPush(ctx, listKey, order.ID).Err()
	if err != nil {
		logger.Errorf("Ошибка добавления ордера в список: %v", err)
	}
}
