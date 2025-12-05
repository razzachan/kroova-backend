-- ============================================================================
-- MARKET TIER SYSTEM - Sistema completo de sub-tiers dentro de raridades
-- ============================================================================
-- 
-- PROBLEMA: 
-- - Legendary caindo 40% no Whale desvaloriza a raridade
-- - RTP muito baixo em tiers caros sem inflar preços
--
-- SOLUÇÃO:
-- - Criar "market_tier" (1-5) dentro de cada raridade
-- - Legendary BARATA (tier 1-2) pode cair em booster Básico (raro, mas possível)
-- - Legendary CARA (tier 4-5) só cai em Whale
-- - Mantém legendary RARA em todos os tiers, mas ajusta QUALIDADE
-- ============================================================================

-- PASSO 1: Adicionar market_tier em cards_base
-- ============================================================================

ALTER TABLE cards_base 
ADD COLUMN IF NOT EXISTS market_tier INTEGER DEFAULT 3;

ALTER TABLE cards_base
DROP CONSTRAINT IF EXISTS market_tier_range;

ALTER TABLE cards_base
ADD CONSTRAINT market_tier_range CHECK (market_tier BETWEEN 1 AND 5);

CREATE INDEX IF NOT EXISTS idx_cards_base_market_tier 
ON cards_base(market_tier, rarity);

COMMENT ON COLUMN cards_base.market_tier IS 
  'Sub-tier de mercado (1=comum/barato, 5=raro/caro). Permite cartas legendary baratas (tier 1-2) em boosters básicos e legendary caras (tier 4-5) só em whale. Mantém raridade especial.';

-- PASSO 2: Distribuir market_tiers E aumentar valores das cartas top
-- ============================================================================

-- GODMODE: automaticamente tier 5, valor moderado
UPDATE cards_base 
SET 
  market_tier = 5,
  base_liquidity_brl = base_liquidity_brl * 1.3  -- R$ 1.40 -> ~R$ 1.82
WHERE rarity = 'godmode';

-- LEGENDARY: dividir em 5 tiers com aumentos menores
WITH legendary_ranked AS (
  SELECT 
    id,
    NTILE(5) OVER (PARTITION BY edition_id ORDER BY base_liquidity_brl) as tier
  FROM cards_base
  WHERE rarity = 'legendary'
)
UPDATE cards_base
SET 
  market_tier = legendary_ranked.tier,
  base_liquidity_brl = CASE legendary_ranked.tier
    WHEN 1 THEN base_liquidity_brl * 0.7  -- tier 1: ~R$ 0.21 (básico)
    WHEN 2 THEN base_liquidity_brl * 0.8  -- tier 2: ~R$ 0.24
    WHEN 3 THEN base_liquidity_brl * 0.9  -- tier 3: ~R$ 0.27
    WHEN 4 THEN base_liquidity_brl * 0.95 -- tier 4: ~R$ 0.29 (reduzido)
    WHEN 5 THEN base_liquidity_brl * 1.05 -- tier 5: ~R$ 0.32 (reduzido)
  END
FROM legendary_ranked
WHERE cards_base.id = legendary_ranked.id;

-- VIRAL: dividir em 4 tiers com aumentos menores
WITH viral_ranked AS (
  SELECT 
    id,
    NTILE(4) OVER (PARTITION BY edition_id ORDER BY base_liquidity_brl) as tier
  FROM cards_base
  WHERE rarity = 'viral'
)
UPDATE cards_base
SET 
  market_tier = viral_ranked.tier,
  base_liquidity_brl = CASE viral_ranked.tier
    WHEN 1 THEN base_liquidity_brl * 0.8  -- tier 1: ~R$ 0.07
    WHEN 2 THEN base_liquidity_brl * 0.9  -- tier 2: ~R$ 0.08
    WHEN 3 THEN base_liquidity_brl * 1.0  -- tier 3: ~R$ 0.09 (manter)
    WHEN 4 THEN base_liquidity_brl * 1.05 -- tier 4: ~R$ 0.095 (reduzido)
  END
FROM viral_ranked
WHERE cards_base.id = viral_ranked.id;

-- MEME: dividir em 3 tiers sem aumentar muito
WITH meme_ranked AS (
  SELECT 
    id,
    NTILE(3) OVER (PARTITION BY edition_id ORDER BY base_liquidity_brl) as tier
  FROM cards_base
  WHERE rarity = 'meme'
)
UPDATE cards_base
SET 
  market_tier = meme_ranked.tier,
  base_liquidity_brl = CASE meme_ranked.tier
    WHEN 1 THEN base_liquidity_brl * 0.8  -- tier 1: ~R$ 0.03
    WHEN 2 THEN base_liquidity_brl * 0.9  -- tier 2: ~R$ 0.04
    WHEN 3 THEN base_liquidity_brl * 1.0  -- tier 3: ~R$ 0.04 (manter)
  END
FROM meme_ranked
WHERE cards_base.id = meme_ranked.id;

-- TRASH: maioria tier 1, algumas tier 2
UPDATE cards_base 
SET market_tier = CASE 
  WHEN base_liquidity_brl > 0.01 THEN 2
  ELSE 1
END
WHERE rarity = 'trash';

-- PASSO 3: Adicionar market_tier_filter e skin_boost em booster_types
-- ============================================================================

ALTER TABLE booster_types
ADD COLUMN IF NOT EXISTS market_tier_filter JSONB DEFAULT '{"min": 1, "max": 5}';

ALTER TABLE booster_types
ADD COLUMN IF NOT EXISTS skin_boost JSONB DEFAULT '{"premium": 15, "ghost": 5, "holo": 0, "dark": 0, "glitch": 0}';

ALTER TABLE booster_types
ADD COLUMN IF NOT EXISTS value_adjustment DECIMAL(4,2) DEFAULT 1.0;

COMMENT ON COLUMN booster_types.market_tier_filter IS
  'Filtro de market_tier permitido. Ex: {"min": 1, "max": 3} = só dropa cartas market_tier 1-3';

COMMENT ON COLUMN booster_types.skin_boost IS
  'Probabilidades (%) de dropar skins especiais. Default: 80% default, resto dividido entre skins. Multipliers: premium 1.5x, ghost 3x, holo 2.5x, dark 4x, glitch 6x';

COMMENT ON COLUMN booster_types.value_adjustment IS
  'Multiplicador final de valor para este tier. Ajusta RTP mantendo proporções de raridade e skin. Ex: 0.75 = reduz 25% todos valores';

-- PASSO 4: Configurar filtros, distribuições E skin boost por tier
-- ============================================================================

-- Básico (R$ 0.50): market_tier 1-2, skins padrão
UPDATE booster_types
SET 
  market_tier_filter = '{"min": 1, "max": 2}',
  skin_boost = '{"premium": 10, "ghost": 2, "holo": 0, "dark": 0, "glitch": 0}',
  value_adjustment = 0.93,  -- Ajuste fino: 79% -> 73%
  rarity_distribution = jsonb_build_object(
    'trash', 50,
    'meme', 38,
    'viral', 9,
    'legendary', 3,
    'godmode', 0
  )
WHERE price_brl = 0.50;

-- Padrão (R$ 1.00): market_tier 1-3, 15% skins especiais
UPDATE booster_types
SET 
  market_tier_filter = '{"min": 1, "max": 3}',
  skin_boost = '{"premium": 12, "ghost": 2, "holo": 1, "dark": 0, "glitch": 0}',
  value_adjustment = 0.91,  -- Ajuste fino: 77% -> 70%
  rarity_distribution = jsonb_build_object(
    'trash', 40,
    'meme', 35,
    'viral', 18,
    'legendary', 7,
    'godmode', 0
  )
WHERE price_brl = 1.00;

-- Premium (R$ 2.00): market_tier 2-4, 18% skins especiais
UPDATE booster_types
SET 
  market_tier_filter = '{"min": 2, "max": 4}',
  skin_boost = '{"premium": 13, "ghost": 3, "holo": 1, "dark": 1, "glitch": 0}',
  value_adjustment = 0.75,  -- Reduz 25%: 93% -> 70%
  rarity_distribution = jsonb_build_object(
    'trash', 25,
    'meme', 30,
    'viral', 34,
    'legendary', 10,
    'godmode', 1
  )
WHERE price_brl = 2.00;

-- Elite (R$ 5.00): market_tier 3-5, 25% skins especiais
UPDATE booster_types
SET 
  market_tier_filter = '{"min": 3, "max": 5}',
  skin_boost = '{"premium": 15, "ghost": 6, "holo": 2, "dark": 1, "glitch": 1}',
  value_adjustment = 0.72,  -- Reduz 28%: 97% -> 70%
  rarity_distribution = jsonb_build_object(
    'trash', 12,
    'meme', 20,
    'viral', 46,
    'legendary', 18,
    'godmode', 4
  )
WHERE price_brl = 5.00;

-- Whale (R$ 10.00): market_tier 4-5 (SÓ AS MELHORES), 33% skins especiais
UPDATE booster_types
SET 
  market_tier_filter = '{"min": 4, "max": 5}',
  skin_boost = '{"premium": 18, "ghost": 8, "holo": 4, "dark": 2, "glitch": 1}',
  value_adjustment = 0.68,  -- Reduz 32%: 102% -> 69%
  rarity_distribution = jsonb_build_object(
    'trash', 3,
    'meme', 0,
    'viral', 55,
    'legendary', 32,
    'godmode', 10
  )
WHERE price_brl = 10.00;

-- PASSO 5: Verificar configuração
-- ============================================================================

SELECT 
  '=== DISTRIBUIÇÃO DE MARKET TIERS ===' as info;

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

SELECT 
  '=== CONFIGURAÇÃO DOS BOOSTERS ===' as info;

SELECT 
  name,
  price_brl,
  market_tier_filter,
  rarity_distribution
FROM booster_types
WHERE edition_id = 'ED01'
ORDER BY price_brl;
