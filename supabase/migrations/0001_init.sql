-- Kro(u)va Initial Schema Migration
-- Run with: supabase db push

-- ============= ENUMS (using CHECK constraints for portability) =============
-- If later you prefer native enums, replace with CREATE TYPE and adjust columns.

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  display_id text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  name text,
  cpf text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  balance_brl numeric(12,2) NOT NULL DEFAULT 0,
  balance_crypto numeric(18,8) NOT NULL DEFAULT 0,
  wallet_private_enc text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('deposit','withdraw','market_buy','market_sell','recycle','booster_purchase')),
  amount_brl numeric(12,2) NOT NULL DEFAULT 0,
  amount_crypto numeric(18,8) NOT NULL DEFAULT 0,
  status text NOT NULL CHECK (status IN ('pending','confirmed','failed')),
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cards_base (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  display_id text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  rarity text NOT NULL CHECK (rarity IN ('trash','meme','viral','legendary','godmode')),
  archetype text,
  base_liquidity_brl numeric(12,2) NOT NULL DEFAULT 0,
  base_liquidity_crypto numeric(18,8) NOT NULL DEFAULT 0,
  edition_id text NOT NULL,
  image_url text,
  metadata jsonb
);

CREATE INDEX IF NOT EXISTS idx_cards_base_edition ON cards_base(edition_id);
CREATE INDEX IF NOT EXISTS idx_cards_base_rarity ON cards_base(rarity);

CREATE TABLE IF NOT EXISTS cards_instances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  base_id uuid NOT NULL REFERENCES cards_base(id) ON DELETE CASCADE,
  owner_id uuid REFERENCES users(id) ON DELETE SET NULL,
  skin text,
  minted_at timestamptz NOT NULL DEFAULT now(),
  hash_onchain text
);
CREATE INDEX IF NOT EXISTS idx_cards_instances_owner ON cards_instances(owner_id);

CREATE TABLE IF NOT EXISTS user_inventory (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  card_instance_id uuid NOT NULL REFERENCES cards_instances(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, card_instance_id)
);

CREATE TABLE IF NOT EXISTS pending_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  items jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_pending_inventory_email ON pending_inventory(email);

CREATE TABLE IF NOT EXISTS booster_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price_brl numeric(12,2) NOT NULL DEFAULT 0,
  price_crypto numeric(18,8) NOT NULL DEFAULT 0,
  rarity_distribution jsonb NOT NULL
);

CREATE TABLE IF NOT EXISTS booster_openings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  booster_type_id uuid NOT NULL REFERENCES booster_types(id) ON DELETE CASCADE,
  cards_obtained jsonb NOT NULL,
  opened_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_booster_openings_user ON booster_openings(user_id);

CREATE TABLE IF NOT EXISTS user_stats_pity (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  edition_id text NOT NULL,
  attempts_since_last_godmode integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, edition_id)
);

CREATE TABLE IF NOT EXISTS recycle_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  card_instance_id uuid REFERENCES cards_instances(id) ON DELETE SET NULL,
  gained_brl numeric(12,2) NOT NULL DEFAULT 0,
  gained_crypto numeric(18,8) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_recycle_history_user ON recycle_history(user_id);

CREATE TABLE IF NOT EXISTS market_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  card_instance_id uuid NOT NULL REFERENCES cards_instances(id) ON DELETE CASCADE,
  price_brl numeric(12,2) NOT NULL DEFAULT 0,
  price_crypto numeric(18,8) NOT NULL DEFAULT 0,
  status text NOT NULL CHECK (status IN ('active','sold','cancelled')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_market_listings_status ON market_listings(status);
CREATE INDEX IF NOT EXISTS idx_market_listings_card ON market_listings(card_instance_id);

CREATE TABLE IF NOT EXISTS audit_hashes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL,
  hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_hashes_source ON audit_hashes(source);

-- Basic helper function for generating display ids (optional)
CREATE OR REPLACE FUNCTION gen_display_id(prefix text)
RETURNS text AS $$
DECLARE
  hex text;
BEGIN
  SELECT substring(md5(random()::text), 1, 6) INTO hex;
  RETURN prefix || '_' || hex;
END;
$$ LANGUAGE plpgsql;

-- Ensure pgcrypto for gen_random_uuid
CREATE EXTENSION IF NOT EXISTS pgcrypto;
