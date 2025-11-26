-- 20241130_refresh_tokens.sql
-- Adds refresh_tokens table for rotating secure refresh tokens.
CREATE TABLE IF NOT EXISTS public.refresh_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  revoked boolean NOT NULL DEFAULT false,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  replaced_by uuid NULL REFERENCES public.refresh_tokens(id)
);
CREATE INDEX IF NOT EXISTS refresh_tokens_user_idx ON public.refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS refresh_tokens_expires_idx ON public.refresh_tokens(expires_at);

-- Removed manual migration record insertion; handled by CLI.
