-- ============================================================================
-- Sistema de Market Tier - Divide cartas de mesma raridade por valor/poder
-- ============================================================================

-- Cada raridade terá sub-tiers de 1-5 (1=comum/barato, 5=raro/caro)
-- Isso permite legendary barata em booster básico E legendary cara só em whale

-- 1. Adicionar coluna market_tier
ALTER TABLE cards_base 
ADD COLUMN IF NOT EXISTS market_tier INTEGER DEFAULT 3;

-- 2. Adicionar constraint (valores 1-5)
ALTER TABLE cards_base
ADD CONSTRAINT market_tier_range CHECK (market_tier BETWEEN 1 AND 5);

-- 3. Criar índice para queries eficientes
CREATE INDEX IF NOT EXISTS idx_cards_base_market_tier 
ON cards_base(market_tier, rarity);

-- 4. Comentário
COMMENT ON COLUMN cards_base.market_tier IS 
  'Sub-tier de mercado (1=comum/barato, 5=raro/caro). Permite cartas legendary baratas (tier 1-2) em boosters básicos e legendary caras (tier 4-5) só em whale. Mantém raridade especial.';

-- ============================================================================
-- Distribuir market_tiers baseado em base_liquidity_brl atual
-- ============================================================================

-- GODMODE (só 1 carta): automaticamente tier 5
UPDATE cards_base 
SET market_tier = 5 
WHERE rarity = 'godmode';

-- LEGENDARY: dividir em 5 tiers baseado em valor
WITH legendary_ranked AS (
  SELECT 
    id,
    base_liquidity_brl,
    NTILE(5) OVER (ORDER BY base_liquidity_brl) as tier
  FROM cards_base
  WHERE rarity = 'legendary'
)
UPDATE cards_base
SET market_tier = legendary_ranked.tier
FROM legendary_ranked
WHERE cards_base.id = legendary_ranked.id;

-- VIRAL: dividir em 4 tiers (1-4, reservar 5 para as melhores)
WITH viral_ranked AS (
  SELECT 
    id,
    base_liquidity_brl,
    NTILE(4) OVER (ORDER BY base_liquidity_brl) as tier
  FROM cards_base
  WHERE rarity = 'viral'
)
UPDATE cards_base
SET market_tier = viral_ranked.tier
FROM viral_ranked
WHERE cards_base.id = viral_ranked.id;

-- MEME: dividir em 3 tiers (1-3)
WITH meme_ranked AS (
  SELECT 
    id,
    base_liquidity_brl,
    NTILE(3) OVER (ORDER BY base_liquidity_brl) as tier
  FROM cards_base
  WHERE rarity = 'meme'
)
UPDATE cards_base
SET market_tier = meme_ranked.tier
FROM meme_ranked
WHERE cards_base.id = meme_ranked.id;

-- TRASH: maioria tier 1, algumas tier 2
UPDATE cards_base 
SET market_tier = CASE 
  WHEN base_liquidity_brl > 0.01 THEN 2
  ELSE 1
END
WHERE rarity = 'trash';

-- ============================================================================
-- Verificar distribuição
-- ============================================================================

SELECT 
  rarity,
  market_tier,
  COUNT(*) as quantidade,
  ROUND(AVG(base_liquidity_brl), 4) as avg_liquidity,
  ROUND(MIN(base_liquidity_brl), 4) as min_liquidity,
  ROUND(MAX(base_liquidity_brl), 4) as max_liquidity
FROM cards_base
WHERE edition_id = 'ED01'
GROUP BY rarity, market_tier
ORDER BY 
  CASE rarity 
    WHEN 'trash' THEN 1 
    WHEN 'meme' THEN 2 
    WHEN 'viral' THEN 3 
    WHEN 'legendary' THEN 4 
    WHEN 'godmode' THEN 5 
  END,
  market_tier;
