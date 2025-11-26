-- Migration 0002: add refresh_tokens table and missing columns used by services
-- Ensure alignment with AuthService and inventory logic

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  revoked boolean NOT NULL DEFAULT false,
  replaced_by uuid REFERENCES refresh_tokens(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_hash ON refresh_tokens(token_hash);

-- pending_inventory extra workflow flags
ALTER TABLE pending_inventory ADD COLUMN IF NOT EXISTS claimed boolean DEFAULT false;
ALTER TABLE pending_inventory ADD COLUMN IF NOT EXISTS claimed_at timestamptz;

-- user_inventory acquisition timestamp for ordering
ALTER TABLE user_inventory ADD COLUMN IF NOT EXISTS acquired_at timestamptz DEFAULT now();
