-- ============================================================================
-- MARKETPLACE ANALYTICS TABLES
-- Apply this in Supabase SQL Editor
-- ============================================================================

-- 1. Add columns to market_listings if not exist
ALTER TABLE market_listings 
ADD COLUMN IF NOT EXISTS buyer_id UUID REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE market_listings 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_market_listings_buyer ON market_listings(buyer_id);

-- 2. Create market_sales_history table
CREATE TABLE IF NOT EXISTS market_sales_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  card_base_id UUID NOT NULL REFERENCES cards_base(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES market_listings(id) ON DELETE SET NULL,
  seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  price_brl DECIMAL(12,2) NOT NULL,
  marketplace_fee_brl DECIMAL(12,2) NOT NULL DEFAULT 0,
  
  rarity TEXT NOT NULL,
  
  sold_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sales_history_card ON market_sales_history(card_base_id);
CREATE INDEX IF NOT EXISTS idx_sales_history_seller ON market_sales_history(seller_id);
CREATE INDEX IF NOT EXISTS idx_sales_history_buyer ON market_sales_history(buyer_id);
CREATE INDEX IF NOT EXISTS idx_sales_history_date ON market_sales_history(sold_at);
CREATE INDEX IF NOT EXISTS idx_sales_history_rarity ON market_sales_history(rarity);

-- 3. Create seller_ratings table
CREATE TABLE IF NOT EXISTS seller_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES market_listings(id) ON DELETE SET NULL,
  
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(buyer_id, listing_id)
);

CREATE INDEX IF NOT EXISTS idx_seller_ratings_seller ON seller_ratings(seller_id);

-- 4. Create market_analytics_cache table
CREATE TABLE IF NOT EXISTS market_analytics_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  metric_type TEXT NOT NULL,
  metric_data JSONB NOT NULL,
  
  period TEXT NOT NULL,
  scope TEXT,
  
  cached_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_cache_type ON market_analytics_cache(metric_type);
CREATE INDEX IF NOT EXISTS idx_analytics_cache_period ON market_analytics_cache(period);

-- 5. Create materialized view for card stats
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_card_stats AS
SELECT 
  card_base_id,
  MIN(price_brl) as floor_price,
  MAX(sold_at) as last_sale_date,
  MAX(price_brl) FILTER (WHERE sold_at = MAX(sold_at)) as last_sale_price,
  AVG(price_brl) as avg_price,
  COUNT(*) as total_sales,
  SUM(price_brl) as total_volume
FROM market_sales_history
GROUP BY card_base_id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_card_stats_card ON mv_card_stats(card_base_id);

-- 6. Function to record sale in history (trigger)
CREATE OR REPLACE FUNCTION fn_record_sale_history()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'sold' AND OLD.status = 'active' THEN
    INSERT INTO market_sales_history (
      card_base_id,
      listing_id,
      seller_id,
      buyer_id,
      price_brl,
      marketplace_fee_brl,
      rarity
    )
    SELECT 
      ci.base_id,
      NEW.id,
      NEW.seller_id,
      NEW.buyer_id,
      NEW.price_brl,
      NEW.price_brl * 0.04,
      cb.rarity
    FROM cards_instances ci
    JOIN cards_base cb ON ci.base_id = cb.id
    WHERE ci.id = NEW.card_instance_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Create trigger
DROP TRIGGER IF EXISTS trg_record_sale_history ON market_listings;
CREATE TRIGGER trg_record_sale_history
  AFTER UPDATE ON market_listings
  FOR EACH ROW
  EXECUTE FUNCTION fn_record_sale_history();

-- 8. Verify everything was created
SELECT 
  'Tables' as type,
  table_name as name
FROM information_schema.tables
WHERE table_schema = 'public' 
  AND table_name IN ('market_sales_history', 'seller_ratings', 'market_analytics_cache')
UNION ALL
SELECT 
  'Materialized Views' as type,
  matviewname as name
FROM pg_matviews
WHERE schemaname = 'public'
  AND matviewname = 'mv_card_stats'
UNION ALL
SELECT 
  'Functions' as type,
  proname as name
FROM pg_proc
WHERE proname = 'fn_record_sale_history'
ORDER BY type, name;
