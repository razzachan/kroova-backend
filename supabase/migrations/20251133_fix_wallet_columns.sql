-- Ensure wallets has created_at and updated_at columns
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
