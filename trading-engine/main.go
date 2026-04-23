package main

import (
	"context"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"github.com/sirupsen/logrus"
	"github.com/spf13/viper"
)

var (
	rdb    *redis.Client
	logger *logrus.Logger
)

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
		// Торговые операции
		trading := api.Group("/trading")
		{
			trading.POST("/orders", createOrder)
			trading.GET("/orders/:id", getOrder)
			trading.DELETE("/orders/:id", cancelOrder)
			trading.GET("/orders", listOrders)
			trading.GET("/trades", listTrades)
		}

		// Market data
		market := api.Group("/market")
		{
			market.GET("/ticker/:symbol", getTicker)
			market.GET("/orderbook/:symbol", getOrderBook)
			market.GET("/trades/:symbol", getMarketTrades)
		}
	}

	// Настройка сервера
	port := viper.GetString("PORT")
	if port == "" {
		port = "8080"
	}

	srv := &http.Server{
		Addr:    ":" + port,
		Handler: router,
	}

	// Graceful shutdown
	go func() {
		logger.Infof("🚀 Trading Engine запущен на порту %s", port)
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
	viper.SetDefault("PORT", "8080")
	viper.SetDefault("REDIS_URL", "redis://localhost:6379")
	viper.SetDefault("ORDER_BOOK_URL", "http://localhost:8081")
	viper.SetDefault("WALLET_SERVICE_URL", "http://localhost:3002")

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
	c.JSON(http.StatusOK, gin.H{
		"status":    "ok",
		"timestamp": time.Now().UTC(),
		"service":   "trading-engine",
	})
}

func readyCheck(c *gin.Context) {
	// Проверяем подключение к Redis
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	if err := rdb.Ping(ctx).Err(); err != nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"status":  "not ready",
			"error":   "Redis connection failed",
			"service": "trading-engine",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":    "ready",
		"timestamp": time.Now().UTC(),
		"service":   "trading-engine",
	})
}

// API handlers
func createOrder(c *gin.Context) {
	// TODO: Реализовать создание ордера
	c.JSON(http.StatusOK, gin.H{
		"message": "Order creation endpoint",
		"status":  "not implemented",
	})
}

func getOrder(c *gin.Context) {
	orderID := c.Param("id")
	c.JSON(http.StatusOK, gin.H{
		"message": "Get order endpoint",
		"orderId": orderID,
		"status":  "not implemented",
	})
}

func cancelOrder(c *gin.Context) {
	orderID := c.Param("id")
	c.JSON(http.StatusOK, gin.H{
		"message": "Cancel order endpoint",
		"orderId": orderID,
		"status":  "not implemented",
	})
}

func listOrders(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "List orders endpoint",
		"status":  "not implemented",
	})
}

func listTrades(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "List trades endpoint",
		"status":  "not implemented",
	})
}

func getTicker(c *gin.Context) {
	symbol := c.Param("symbol")
	c.JSON(http.StatusOK, gin.H{
		"message": "Get ticker endpoint",
		"symbol":  symbol,
		"status":  "not implemented",
	})
}

func getOrderBook(c *gin.Context) {
	symbol := c.Param("symbol")
	c.JSON(http.StatusOK, gin.H{
		"message": "Get orderbook endpoint",
		"symbol":  symbol,
		"status":  "not implemented",
	})
}

func getMarketTrades(c *gin.Context) {
	symbol := c.Param("symbol")
	c.JSON(http.StatusOK, gin.H{
		"message": "Get market trades endpoint",
		"symbol":  symbol,
		"status":  "not implemented",
	})
}
