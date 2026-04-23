-- Инициализация базы данных для криптобиржи

-- Создание расширений
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Создание пользователя для приложения
CREATE USER crypto_exchange_user WITH PASSWORD 'crypto_exchange_password';

-- Создание схем
CREATE SCHEMA IF NOT EXISTS users;
CREATE SCHEMA IF NOT EXISTS wallets;
CREATE SCHEMA IF NOT EXISTS trading;
CREATE SCHEMA IF NOT EXISTS analytics;

-- Таблица пользователей
CREATE TABLE IF NOT EXISTS users.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(255),
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица кошельков
CREATE TABLE IF NOT EXISTS wallets.wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users.users(id) ON DELETE CASCADE,
    currency VARCHAR(10) NOT NULL,
    balance DECIMAL(20, 8) DEFAULT 0,
    locked_balance DECIMAL(20, 8) DEFAULT 0,
    total_deposited DECIMAL(20, 8) DEFAULT 0,
    total_withdrawn DECIMAL(20, 8) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'closed')),
    address VARCHAR(255),
    memo VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    last_activity_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, currency)
);

-- Таблица транзакций
CREATE TABLE IF NOT EXISTS wallets.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID NOT NULL REFERENCES wallets.wallets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users.users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'transfer', 'trade', 'fee', 'refund')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed', 'cancelled')),
    amount DECIMAL(20, 8) NOT NULL,
    fee DECIMAL(20, 8) DEFAULT 0,
    currency VARCHAR(10) NOT NULL,
    tx_hash VARCHAR(255),
    from_address VARCHAR(255),
    to_address VARCHAR(255),
    memo VARCHAR(255),
    description TEXT,
    confirmations INTEGER DEFAULT 0,
    block_number BIGINT,
    order_id UUID,
    reference_id VARCHAR(255),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица торговых пар
CREATE TABLE IF NOT EXISTS trading.trading_pairs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    base_currency VARCHAR(10) NOT NULL,
    quote_currency VARCHAR(10) NOT NULL,
    symbol VARCHAR(20) NOT NULL UNIQUE,
    min_order_size DECIMAL(20, 8) NOT NULL,
    max_order_size DECIMAL(20, 8) NOT NULL,
    tick_size DECIMAL(20, 8) NOT NULL,
    maker_fee DECIMAL(10, 8) DEFAULT 0.001,
    taker_fee DECIMAL(10, 8) DEFAULT 0.001,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица ордеров
CREATE TABLE IF NOT EXISTS trading.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users.users(id) ON DELETE CASCADE,
    trading_pair_id UUID NOT NULL REFERENCES trading.trading_pairs(id),
    type VARCHAR(10) NOT NULL CHECK (type IN ('market', 'limit', 'stop', 'stop_limit')),
    side VARCHAR(4) NOT NULL CHECK (side IN ('buy', 'sell')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'filled', 'cancelled', 'rejected')),
    quantity DECIMAL(20, 8) NOT NULL,
    filled_quantity DECIMAL(20, 8) DEFAULT 0,
    price DECIMAL(20, 8),
    stop_price DECIMAL(20, 8),
    total_value DECIMAL(20, 8),
    fee DECIMAL(20, 8) DEFAULT 0,
    fee_currency VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица сделок
CREATE TABLE IF NOT EXISTS trading.trades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buy_order_id UUID NOT NULL REFERENCES trading.orders(id),
    sell_order_id UUID NOT NULL REFERENCES trading.orders(id),
    trading_pair_id UUID NOT NULL REFERENCES trading.trading_pairs(id),
    quantity DECIMAL(20, 8) NOT NULL,
    price DECIMAL(20, 8) NOT NULL,
    total_value DECIMAL(20, 8) NOT NULL,
    buy_fee DECIMAL(20, 8) DEFAULT 0,
    sell_fee DECIMAL(20, 8) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица аналитики
CREATE TABLE IF NOT EXISTS analytics.daily_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    trading_pair_id UUID NOT NULL REFERENCES trading.trading_pairs(id),
    volume DECIMAL(20, 8) DEFAULT 0,
    trades_count INTEGER DEFAULT 0,
    high_price DECIMAL(20, 8),
    low_price DECIMAL(20, 8),
    open_price DECIMAL(20, 8),
    close_price DECIMAL(20, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(date, trading_pair_id)
);

-- Индексы для оптимизации производительности
CREATE INDEX IF NOT EXISTS idx_users_email ON users.users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users.users(created_at);

CREATE INDEX IF NOT EXISTS idx_wallets_user_currency ON wallets.wallets(user_id, currency);
CREATE INDEX IF NOT EXISTS idx_wallets_status ON wallets.wallets(status);

CREATE INDEX IF NOT EXISTS idx_transactions_wallet_id ON wallets.transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON wallets.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON wallets.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON wallets.transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON wallets.transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_tx_hash ON wallets.transactions(tx_hash);

CREATE INDEX IF NOT EXISTS idx_trading_pairs_symbol ON trading.trading_pairs(symbol);
CREATE INDEX IF NOT EXISTS idx_trading_pairs_active ON trading.trading_pairs(is_active);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON trading.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_trading_pair_id ON trading.orders(trading_pair_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON trading.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON trading.orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_price_side ON trading.orders(price, side);

CREATE INDEX IF NOT EXISTS idx_trades_trading_pair_id ON trading.trades(trading_pair_id);
CREATE INDEX IF NOT EXISTS idx_trades_created_at ON trading.trades(created_at);

CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON analytics.daily_stats(date);
CREATE INDEX IF NOT EXISTS idx_daily_stats_trading_pair ON analytics.daily_stats(trading_pair_id);

-- Вставка начальных данных

-- Торговые пары
INSERT INTO trading.trading_pairs (base_currency, quote_currency, symbol, min_order_size, max_order_size, tick_size, maker_fee, taker_fee) VALUES
('BTC', 'USDT', 'BTCUSDT', 0.0001, 1000, 0.01, 0.001, 0.001),
('ETH', 'USDT', 'ETHUSDT', 0.001, 10000, 0.01, 0.001, 0.001),
('ETH', 'BTC', 'ETHBTC', 0.001, 1000, 0.000001, 0.001, 0.001),
('LTC', 'USDT', 'LTCUSDT', 0.01, 100000, 0.01, 0.001, 0.001),
('XRP', 'USDT', 'XRPUSDT', 1, 10000000, 0.0001, 0.001, 0.001)
ON CONFLICT (symbol) DO NOTHING;

-- Демо-аккаунты для ручного теста торговли (пароль у всех: DemoTrader123!)
INSERT INTO users.users (id, email, password_hash, first_name, last_name, is_verified, is_active)
VALUES
    ('00000000-0000-4000-8000-000000000001'::uuid, 'demo.alice@cryptospot.demo', '$2a$10$qjHxmGIdjqBFtJkwrlxj4ej8q1ba7YWCQ.JCAJyZRyEeYhTuUZGbO', 'Alice', 'Demo', TRUE, TRUE),
    ('00000000-0000-4000-8000-000000000002'::uuid, 'demo.bob@cryptospot.demo', '$2a$10$qjHxmGIdjqBFtJkwrlxj4ej8q1ba7YWCQ.JCAJyZRyEeYhTuUZGbO', 'Bob', 'Demo', TRUE, TRUE)
ON CONFLICT (email) DO NOTHING;

INSERT INTO wallets.wallets (user_id, currency, balance, locked_balance, total_deposited, total_withdrawn, status, address, is_active, last_activity_at)
VALUES
    ('00000000-0000-4000-8000-000000000001'::uuid, 'USDT', 1000, 0, 1000, 0, 'active', 'usdt_demo_alice', TRUE, CURRENT_TIMESTAMP),
    ('00000000-0000-4000-8000-000000000002'::uuid, 'USDT', 1000, 0, 1000, 0, 'active', 'usdt_demo_bob', TRUE, CURRENT_TIMESTAMP)
ON CONFLICT (user_id, currency) DO NOTHING;

INSERT INTO wallets.transactions (wallet_id, user_id, type, status, amount, fee, currency, description, confirmations)
SELECT w.id, w.user_id, 'deposit', 'confirmed', 1000, 0, 'USDT', 'Demo seed balance', 1
FROM wallets.wallets w
WHERE w.user_id IN (
    '00000000-0000-4000-8000-000000000001'::uuid,
    '00000000-0000-4000-8000-000000000002'::uuid
  )
  AND w.currency = 'USDT'
  AND NOT EXISTS (
    SELECT 1 FROM wallets.transactions t
    WHERE t.wallet_id = w.id AND t.description = 'Demo seed balance'
  );

-- Функция для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггеры для автоматического обновления updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON wallets.wallets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON wallets.transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trading_pairs_updated_at BEFORE UPDATE ON trading.trading_pairs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON trading.orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Представления для удобства

-- Представление для статистики пользователей
CREATE OR REPLACE VIEW users.user_stats AS
SELECT 
    u.id,
    u.email,
    u.created_at,
    COUNT(DISTINCT w.id) as wallet_count,
    SUM(w.balance) as total_balance,
    COUNT(t.id) as transaction_count
FROM users.users u
LEFT JOIN wallets.wallets w ON u.id = w.user_id
LEFT JOIN wallets.transactions t ON u.id = t.user_id
GROUP BY u.id, u.email, u.created_at;

-- Представление для статистики торговых пар
CREATE OR REPLACE VIEW trading.pair_stats AS
SELECT 
    tp.symbol,
    tp.base_currency,
    tp.quote_currency,
    COUNT(o.id) as total_orders,
    COUNT(CASE WHEN o.status = 'filled' THEN 1 END) as filled_orders,
    SUM(CASE WHEN o.status = 'filled' THEN o.quantity ELSE 0 END) as total_volume,
    AVG(CASE WHEN o.status = 'filled' THEN o.price END) as avg_price
FROM trading.trading_pairs tp
LEFT JOIN trading.orders o ON tp.id = o.trading_pair_id
GROUP BY tp.id, tp.symbol, tp.base_currency, tp.quote_currency;

-- Права доступа
GRANT USAGE ON SCHEMA users, wallets, trading, analytics TO crypto_exchange_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA users, wallets, trading, analytics TO crypto_exchange_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA users, wallets, trading, analytics TO crypto_exchange_user; 