-- Clean initial baseline (created 2025-11-24, renamed to unique version 20241126)
-- Applies full schema idempotently. Safe to run after sentinel initial_schema.

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='transaction_type') THEN
    EXECUTE 'CREATE TYPE transaction_type AS ENUM (''deposit'',''withdraw'',''market_buy'',''market_sell'',''recycle'',''booster_purchase'')';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='transaction_status') THEN
    EXECUTE 'CREATE TYPE transaction_status AS ENUM (''pending'',''confirmed'',''failed'')';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='card_rarity') THEN
    EXECUTE 'CREATE TYPE card_rarity AS ENUM (''trash'',''meme'',''viral'',''legendary'',''godmode'')';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='listing_status') THEN
    EXECUTE 'CREATE TYPE listing_status AS ENUM (''active'',''sold'',''cancelled'')';
  END IF;
END $$;

-- 3. TABLES
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  display_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  cpf TEXT,
  cpf_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_cpf ON users(cpf);

CREATE TABLE IF NOT EXISTS wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  balance_brl NUMERIC(12,2) DEFAULT 0.00 CHECK (balance_brl >= 0),
  balance_crypto NUMERIC(18,8) DEFAULT 0.00000000 CHECK (balance_crypto >= 0),
  wallet_private_enc TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type transaction_type NOT NULL,
  amount_brl NUMERIC(12,2),
  amount_crypto NUMERIC(18,8),
  status transaction_status DEFAULT 'pending',
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);

CREATE TABLE IF NOT EXISTS cards_base (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  display_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  rarity card_rarity NOT NULL,
  archetype TEXT,
  base_liquidity_brl NUMERIC(12,2) NOT NULL,
  base_liquidity_crypto NUMERIC(18,8),
  edition_id TEXT NOT NULL,
  image_url TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_cards_base_rarity ON cards_base(rarity);
CREATE INDEX IF NOT EXISTS idx_cards_base_edition ON cards_base(edition_id);
CREATE INDEX IF NOT EXISTS idx_cards_base_display_id ON cards_base(display_id);
CREATE INDEX IF NOT EXISTS idx_cards_base_edition_rarity ON cards_base(edition_id, rarity);
CREATE INDEX IF NOT EXISTS idx_cards_base_metadata ON cards_base USING GIN (metadata);

CREATE TABLE IF NOT EXISTS cards_instances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  base_id UUID NOT NULL REFERENCES cards_base(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  skin TEXT,
  minted_at TIMESTAMP WITH TIME ZONE,
  hash_onchain TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_cards_instances_owner ON cards_instances(owner_id);
CREATE INDEX IF NOT EXISTS idx_cards_instances_base ON cards_instances(base_id);
CREATE INDEX IF NOT EXISTS idx_cards_instances_hash ON cards_instances(hash_onchain);

CREATE TABLE IF NOT EXISTS user_inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  card_instance_id UUID NOT NULL REFERENCES cards_instances(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, card_instance_id)
);
CREATE INDEX IF NOT EXISTS idx_user_inventory_user ON user_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_user_inventory_card ON user_inventory(card_instance_id);

CREATE TABLE IF NOT EXISTS pending_inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  items JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_pending_inventory_email ON pending_inventory(email);

CREATE TABLE IF NOT EXISTS booster_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  edition_id TEXT NOT NULL,
  price_brl NUMERIC(12,2) NOT NULL,
  price_crypto NUMERIC(18,8),
  rarity_distribution JSONB NOT NULL,
  cards_per_booster INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- Ensure edition_id column exists for pre-existing booster_types table created without it
ALTER TABLE booster_types ADD COLUMN IF NOT EXISTS edition_id TEXT;
CREATE INDEX IF NOT EXISTS idx_booster_types_edition ON booster_types(edition_id);

CREATE TABLE IF NOT EXISTS booster_openings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  booster_type_id UUID NOT NULL REFERENCES booster_types(id) ON DELETE CASCADE,
  cards_obtained JSONB NOT NULL,
  opened_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_booster_openings_user ON booster_openings(user_id);
CREATE INDEX IF NOT EXISTS idx_booster_openings_opened_at ON booster_openings(opened_at DESC);

CREATE TABLE IF NOT EXISTS recycle_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  card_instance_id UUID NOT NULL,
  gained_brl NUMERIC(12,2),
  gained_crypto NUMERIC(18,8),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_recycle_history_user ON recycle_history(user_id);
CREATE INDEX IF NOT EXISTS idx_recycle_history_created_at ON recycle_history(created_at DESC);

CREATE TABLE IF NOT EXISTS market_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  card_instance_id UUID NOT NULL REFERENCES cards_instances(id) ON DELETE CASCADE,
  price_brl NUMERIC(12,2),
  price_crypto NUMERIC(18,8),
  status listing_status DEFAULT 'active',
  buyer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  sold_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_market_listings_status ON market_listings(status);
CREATE INDEX IF NOT EXISTS idx_market_listings_seller ON market_listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_market_listings_card ON market_listings(card_instance_id);
CREATE INDEX IF NOT EXISTS idx_market_listings_price_brl ON market_listings(price_brl);

CREATE TABLE IF NOT EXISTS audit_hashes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source TEXT NOT NULL,
  hash TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_hashes_created_at ON audit_hashes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_hashes_source ON audit_hashes(source);

-- 4. TRIGGERS
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='update_users_updated_at') THEN EXECUTE 'CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()'; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='update_wallets_updated_at') THEN EXECUTE 'CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON wallets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()'; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='update_transactions_updated_at') THEN EXECUTE 'CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()'; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='update_market_listings_updated_at') THEN EXECUTE 'CREATE TRIGGER update_market_listings_updated_at BEFORE UPDATE ON market_listings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()'; END IF; END $$;

-- 5. RLS BASE
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_listings ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='Users can view own data' AND tablename='users') THEN EXECUTE 'CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id)'; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='Users can update own data' AND tablename='users') THEN EXECUTE 'CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id)'; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='Users can view own wallet' AND tablename='wallets') THEN EXECUTE 'CREATE POLICY "Users can view own wallet" ON wallets FOR SELECT USING (auth.uid() = user_id)'; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='Users can view own inventory' AND tablename='user_inventory') THEN EXECUTE 'CREATE POLICY "Users can view own inventory" ON user_inventory FOR SELECT USING (auth.uid() = user_id)'; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='Users can view own cards' AND tablename='cards_instances') THEN EXECUTE 'CREATE POLICY "Users can view own cards" ON cards_instances FOR SELECT USING (auth.uid() = owner_id)'; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='Anyone can view active listings' AND tablename='market_listings') THEN EXECUTE 'CREATE POLICY "Anyone can view active listings" ON market_listings FOR SELECT USING (status = ''active'')'; END IF; END $$;

-- 6. UTIL
CREATE OR REPLACE FUNCTION generate_display_id(prefix TEXT) RETURNS TEXT AS $$
DECLARE new_id TEXT; exists BOOLEAN; BEGIN LOOP
  new_id := prefix || '_' || substring(md5(random()::text) from 1 for 6);
  exists := EXISTS(SELECT 1 FROM users WHERE display_id = new_id);
  IF NOT exists THEN RETURN new_id; END IF; END LOOP; END; $$ LANGUAGE plpgsql;

-- END CLEAN BASELINE
