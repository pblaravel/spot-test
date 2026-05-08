-- Для уже поднятого Postgres (том создан раньше изменений init-db).
-- docker compose exec -T postgres psql -U admin -d crypto_exchange < scripts/sync-demo-login.sql

ALTER TABLE users.users ADD COLUMN IF NOT EXISTS email_verification_token VARCHAR(255);
ALTER TABLE users.users ADD COLUMN IF NOT EXISTS password_reset_token VARCHAR(255);
ALTER TABLE users.users ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMP;

INSERT INTO users.users (id, email, password_hash, first_name, last_name, is_verified, is_active)
VALUES
    ('00000000-0000-4000-8000-000000000088'::uuid, 'test@example.com', '$2b$10$Xp6vSE4DeoN/UcFkdPGGauiWla/COzIN9Lfuq4DgdhQDAKBt8SsKi', 'Test', 'Example', TRUE, TRUE)
ON CONFLICT (email) DO NOTHING;

INSERT INTO wallets.wallets (user_id, currency, balance, locked_balance, total_deposited, total_withdrawn, status, address, is_active, last_activity_at)
VALUES
    ('00000000-0000-4000-8000-000000000088'::uuid, 'USDT', 1000, 0, 1000, 0, 'active', 'usdt_test_example', TRUE, CURRENT_TIMESTAMP)
ON CONFLICT (user_id, currency) DO NOTHING;

INSERT INTO wallets.transactions (wallet_id, user_id, type, status, amount, fee, currency, description, confirmations)
SELECT w.id, w.user_id, 'deposit', 'confirmed', 1000, 0, 'USDT', 'Demo seed balance', 1
FROM wallets.wallets w
WHERE w.user_id = '00000000-0000-4000-8000-000000000088'::uuid
  AND w.currency = 'USDT'
  AND NOT EXISTS (
    SELECT 1 FROM wallets.transactions t
    WHERE t.wallet_id = w.id AND t.description = 'Demo seed balance'
  );
