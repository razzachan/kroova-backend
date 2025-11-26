-- ============================================
-- KROOVA - RLS Policies para Produ\u00e7\u00e3o
-- Execute este arquivo no Supabase Dashboard > SQL Editor
-- ============================================

-- Enable RLS nas tabelas principais
ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS cards_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS market_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS booster_openings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS cards_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS booster_types ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (idempotent)
DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;
DROP POLICY IF EXISTS "wallets_select_own" ON wallets;
DROP POLICY IF EXISTS "inventory_select_own" ON user_inventory;
DROP POLICY IF EXISTS "cards_instances_select_accessible" ON cards_instances;
DROP POLICY IF EXISTS "listings_select_public_or_own" ON market_listings;
DROP POLICY IF EXISTS "listings_insert_own" ON market_listings;
DROP POLICY IF EXISTS "listings_update_own" ON market_listings;
DROP POLICY IF EXISTS "listings_delete_own" ON market_listings;
DROP POLICY IF EXISTS "transactions_select_own" ON transactions;
DROP POLICY IF EXISTS "booster_openings_select_own" ON booster_openings;
DROP POLICY IF EXISTS "cards_base_select_public" ON cards_base;
DROP POLICY IF EXISTS "booster_types_select_public" ON booster_types;

-- ========================================
-- USERS: Usu\u00e1rios veem apenas seus pr\u00f3prios dados
-- ========================================
CREATE POLICY "users_select_own" ON users
  FOR SELECT 
  USING (auth.uid()::text = id::text);

CREATE POLICY "users_update_own" ON users
  FOR UPDATE 
  USING (auth.uid()::text = id::text);

-- ========================================
-- WALLETS: Usu\u00e1rios veem apenas sua pr\u00f3pria carteira
-- ========================================
CREATE POLICY "wallets_select_own" ON wallets
  FOR SELECT 
  USING (auth.uid()::text = user_id::text);

-- ========================================
-- USER_INVENTORY: Usu\u00e1rios veem apenas seu invent\u00e1rio
-- ========================================
CREATE POLICY "inventory_select_own" ON user_inventory
  FOR SELECT 
  USING (auth.uid()::text = user_id::text);

-- ========================================
-- CARDS_INSTANCES: Usu\u00e1rios veem cartas que possuem OU que est\u00e3o no marketplace
-- ========================================
CREATE POLICY "cards_instances_select_accessible" ON cards_instances
  FOR SELECT 
  USING (
    auth.uid()::text = owner_id::text OR
    EXISTS (
      SELECT 1 FROM market_listings ml
      WHERE ml.card_instance_id = cards_instances.id
      AND ml.status = 'active'
    )
  );

-- ========================================
-- MARKET_LISTINGS: Todos veem listings ativos, vendedores veem os seus
-- ========================================
CREATE POLICY "listings_select_public_or_own" ON market_listings
  FOR SELECT 
  USING (
    status = 'active' OR 
    auth.uid()::text = seller_id::text
  );

CREATE POLICY "listings_insert_own" ON market_listings
  FOR INSERT 
  WITH CHECK (auth.uid()::text = seller_id::text);

CREATE POLICY "listings_update_own" ON market_listings
  FOR UPDATE 
  USING (auth.uid()::text = seller_id::text);

CREATE POLICY "listings_delete_own" ON market_listings
  FOR DELETE
  USING (auth.uid()::text = seller_id::text);

-- ========================================
-- TRANSACTIONS: Usu\u00e1rios veem apenas suas pr\u00f3prias transa\u00e7\u00f5es
-- ========================================
CREATE POLICY "transactions_select_own" ON transactions
  FOR SELECT 
  USING (auth.uid()::text = user_id::text);

-- ========================================
-- BOOSTER_OPENINGS: Usu\u00e1rios veem apenas seus boosters
-- ========================================
CREATE POLICY "booster_openings_select_own" ON booster_openings
  FOR SELECT 
  USING (auth.uid()::text = user_id::text);

-- ========================================
-- TABELAS P\u00daBLICAS: Todos podem ler
-- ========================================
CREATE POLICY "cards_base_select_public" ON cards_base
  FOR SELECT 
  USING (true);

CREATE POLICY "booster_types_select_public" ON booster_types
  FOR SELECT 
  USING (true);

-- ========================================
-- VERIFICA\u00c7\u00c3O
-- ========================================
-- Execute para verificar as policies:
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;

-- Verificar RLS ativo:
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('users', 'wallets', 'user_inventory', 'cards_instances', 'market_listings', 'transactions', 'booster_openings')
ORDER BY tablename;
