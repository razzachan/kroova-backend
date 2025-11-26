-- ============================================
-- KROOVA - Row Level Security (RLS) Policies
-- Migration: 20251126000000
-- ============================================
-- This migration implements proper RLS policies
-- to replace the current supabaseAdmin bypass
-- ============================================

-- Enable RLS on all tables if not already enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE booster_openings ENABLE ROW LEVEL SECURITY;

-- ========================================
-- USERS TABLE
-- ========================================

-- Users can view only their own data
CREATE POLICY "users_select_own" ON users
  FOR SELECT 
  USING (auth.uid()::text = id::text);

-- Users can update only their own data
CREATE POLICY "users_update_own" ON users
  FOR UPDATE 
  USING (auth.uid()::text = id::text);

-- ========================================
-- WALLETS TABLE
-- ========================================

-- Users can view only their own wallet
CREATE POLICY "wallets_select_own" ON wallets
  FOR SELECT 
  USING (auth.uid()::text = user_id::text);

-- Note: INSERT/UPDATE via admin client only
-- No direct wallet modification by users

-- ========================================
-- USER_INVENTORY TABLE
-- ========================================

-- Users can view only their own inventory
CREATE POLICY "inventory_select_own" ON user_inventory
  FOR SELECT 
  USING (auth.uid()::text = user_id::text);

-- Note: INSERT/DELETE via admin client only
-- System controls inventory changes

-- ========================================
-- CARDS_INSTANCES TABLE
-- ========================================

-- Users can view cards they own OR cards listed in active marketplace
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

-- Note: UPDATE via admin client only
-- System controls ownership transfers

-- ========================================
-- MARKET_LISTINGS TABLE
-- ========================================

-- Everyone can view active listings
-- Sellers can view their own listings (active or not)
CREATE POLICY "listings_select_public_or_own" ON market_listings
  FOR SELECT 
  USING (
    status = 'active' OR 
    auth.uid()::text = seller_id::text
  );

-- Users can create listings for their own cards
CREATE POLICY "listings_insert_own" ON market_listings
  FOR INSERT 
  WITH CHECK (auth.uid()::text = seller_id::text);

-- Only sellers can update their own listings
CREATE POLICY "listings_update_own" ON market_listings
  FOR UPDATE 
  USING (auth.uid()::text = seller_id::text);

-- Only sellers can delete their own listings
CREATE POLICY "listings_delete_own" ON market_listings
  FOR DELETE
  USING (auth.uid()::text = seller_id::text);

-- ========================================
-- TRANSACTIONS TABLE
-- ========================================

-- Users can view only their own transactions
CREATE POLICY "transactions_select_own" ON transactions
  FOR SELECT 
  USING (auth.uid()::text = user_id::text);

-- Note: INSERT via admin client only
-- System controls transaction recording

-- ========================================
-- BOOSTER_OPENINGS TABLE
-- ========================================

-- Users can view only their own booster openings
CREATE POLICY "booster_openings_select_own" ON booster_openings
  FOR SELECT 
  USING (auth.uid()::text = user_id::text);

-- Note: INSERT via admin client only
-- System controls booster opening records

-- ========================================
-- PUBLIC TABLES (Read-only for all)
-- ========================================

-- Cards Base table - everyone can read
CREATE POLICY "cards_base_select_public" ON cards_base
  FOR SELECT 
  USING (true);

-- Booster Types table - everyone can read
CREATE POLICY "booster_types_select_public" ON booster_types
  FOR SELECT 
  USING (true);

-- ========================================
-- ADMIN FUNCTIONS (Bypass RLS)
-- ========================================

-- Create helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user has admin role
  -- This can be expanded with actual admin role checking
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid()::text 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin() TO anon;

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Run these to verify policies are active:
-- SELECT tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE schemaname = 'public' 
-- ORDER BY tablename, policyname;

-- ========================================
-- MIGRATION COMPLETE
-- ========================================

-- To apply this migration in Supabase:
-- 1. Go to Supabase Dashboard > SQL Editor
-- 2. Paste this entire file
-- 3. Execute
-- 4. Verify with: SELECT * FROM pg_policies WHERE schemaname = 'public';
