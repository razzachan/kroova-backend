-- Migration: Add prize system and recycle points
-- Players can redeem prize (keep card) or recycle (burn card for points)

-- ============================================================================
-- 1. ADD PRIZE COLUMNS TO CARDS_INSTANCES
-- ============================================================================

-- Prize amount that can be redeemed (keeps card in inventory)
ALTER TABLE cards_instances
ADD COLUMN IF NOT EXISTS prize_amount_brl DECIMAL(10, 2) DEFAULT 0.00;

-- Flag to track if prize was already redeemed
ALTER TABLE cards_instances
ADD COLUMN IF NOT EXISTS prize_redeemed BOOLEAN DEFAULT false;

-- Timestamp of prize redemption
ALTER TABLE cards_instances
ADD COLUMN IF NOT EXISTS prize_redeemed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_cards_instances_prize_redeemed 
ON cards_instances(prize_redeemed) WHERE prize_redeemed = false;

COMMENT ON COLUMN cards_instances.prize_amount_brl IS 
'Prize amount that can be redeemed. Card stays in inventory after redemption.';

COMMENT ON COLUMN cards_instances.prize_redeemed IS 
'Flag indicating if the prize was already redeemed. Can only redeem once.';

-- ============================================================================
-- 2. CREATE RECYCLE PROGRESS TABLE (POINTS SYSTEM)
-- ============================================================================

CREATE TABLE IF NOT EXISTS recycle_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0,
  lifetime_points INTEGER DEFAULT 0,
  lifetime_cards_recycled INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_recycle_progress_user ON recycle_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_recycle_progress_points ON recycle_progress(total_points);

COMMENT ON TABLE recycle_progress IS 
'Tracks recycle points for each user. Points can be exchanged for boosters.';

COMMENT ON COLUMN recycle_progress.total_points IS 
'Current points available for exchange.';

COMMENT ON COLUMN recycle_progress.lifetime_points IS 
'Total points earned all-time (including spent).';

-- ============================================================================
-- 3. CREATE RECYCLE HISTORY TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS recycle_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  card_instance_id UUID NOT NULL,
  rarity TEXT NOT NULL,
  points_earned INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_recycle_history_user ON recycle_history(user_id);
CREATE INDEX IF NOT EXISTS idx_recycle_history_created ON recycle_history(created_at DESC);

COMMENT ON TABLE recycle_history IS 
'History of recycled cards and points earned.';

-- ============================================================================
-- 4. CREATE POINTS EXCHANGE HISTORY TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS points_exchange_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  booster_type_id UUID NOT NULL REFERENCES booster_types(id),
  booster_tier TEXT NOT NULL,
  points_spent INTEGER NOT NULL,
  booster_opening_id UUID REFERENCES booster_openings(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_points_exchange_user ON points_exchange_history(user_id);
CREATE INDEX IF NOT EXISTS idx_points_exchange_created ON points_exchange_history(created_at DESC);

COMMENT ON TABLE points_exchange_history IS 
'History of points exchanged for boosters.';

-- ============================================================================
-- 5. RLS POLICIES
-- ============================================================================

ALTER TABLE recycle_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE recycle_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_exchange_history ENABLE ROW LEVEL SECURITY;

-- Users can view their own recycle progress
CREATE POLICY "Users can view own recycle progress"
ON recycle_progress FOR SELECT
USING (auth.uid() = user_id);

-- Users can view their own recycle history
CREATE POLICY "Users can view own recycle history"
ON recycle_history FOR SELECT
USING (auth.uid() = user_id);

-- Users can view their own exchange history
CREATE POLICY "Users can view own exchange history"
ON points_exchange_history FOR SELECT
USING (auth.uid() = user_id);
