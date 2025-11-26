-- Ensure users table has cpf and cpf_verified columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS cpf TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS cpf_verified BOOLEAN DEFAULT false;
