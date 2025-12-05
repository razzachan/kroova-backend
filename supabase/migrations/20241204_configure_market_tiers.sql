-- ============================================================================
-- Adicionar filtros de market_tier por booster tier
-- ============================================================================

-- Cada booster tier pode dropar certas combinações de rarity + market_tier
-- Exemplo: Básico pode dropar legendary tier 1-2, mas não legendary tier 5

ALTER TABLE booster_types
ADD COLUMN IF NOT EXISTS market_tier_filter JSONB DEFAULT '{"min": 1, "max": 5}';

COMMENT ON COLUMN booster_types.market_tier_filter IS
  'Filtro de market_tier permitido. Ex: {"min": 1, "max": 3} = só dropa cartas market_tier 1-3. Permite legendary barata em booster básico, legendary cara só em whale.';

-- ============================================================================
-- Configurar filtros por tier de preço
-- ============================================================================

-- Básico (R$ 0.50): só cartas market_tier 1-2 (legendaries baratas possíveis!)
UPDATE booster_types
SET market_tier_filter = '{"min": 1, "max": 2}'
WHERE price_brl = 0.50;

-- Padrão (R$ 1.00): cartas market_tier 1-3
UPDATE booster_types
SET market_tier_filter = '{"min": 1, "max": 3}'
WHERE price_brl = 1.00;

-- Premium (R$ 2.00): cartas market_tier 2-4 (exclui lixo tier 1)
UPDATE booster_types
SET market_tier_filter = '{"min": 2, "max": 4}'
WHERE price_brl = 2.00;

-- Elite (R$ 5.00): cartas market_tier 3-5 (só cartas boas)
UPDATE booster_types
SET market_tier_filter = '{"min": 3, "max": 5}'
WHERE price_brl = 5.00;

-- Whale (R$ 10.00): cartas market_tier 4-5 (só as melhores)
UPDATE booster_types
SET market_tier_filter = '{"min": 4, "max": 5}'
WHERE price_brl = 10.00;

-- ============================================================================
-- Ajustar rarity_distribution para valores BALANCEADOS
-- ============================================================================

-- Agora podemos ter % menor de legendary porque elas são REALMENTE raras
-- e quando caem, são apropriadas ao tier do booster

-- Básico (R$ 0.50): pode ter legendary tier 1-2 (baratas), mas é RARO
UPDATE booster_types
SET rarity_distribution = jsonb_build_object(
  'trash', 55,
  'meme', 35,
  'viral', 8,
  'legendary', 2,    -- 2% legendary (tier 1-2, baratas)
  'godmode', 0       -- impossível
)
WHERE price_brl = 0.50;

-- Padrão (R$ 1.00): legendary tier 1-3, um pouco mais comum
UPDATE booster_types
SET rarity_distribution = jsonb_build_object(
  'trash', 45,
  'meme', 35,
  'viral', 15,
  'legendary', 5,    -- 5% legendary (tier 1-3, médias)
  'godmode', 0       -- impossível
)
WHERE price_brl = 1.00;

-- Premium (R$ 2.00): legendary tier 2-4, mais frequente
UPDATE booster_types
SET rarity_distribution = jsonb_build_object(
  'trash', 30,
  'meme', 30,
  'viral', 28,
  'legendary', 11,   -- 11% legendary (tier 2-4, boas)
  'godmode', 1       -- 1% godmode (única, tier 5)
)
WHERE price_brl = 2.00;

-- Elite (R$ 5.00): legendary tier 3-5, bastante comum
UPDATE booster_types
SET rarity_distribution = jsonb_build_object(
  'trash', 15,
  'meme', 20,
  'viral', 35,
  'legendary', 26,   -- 26% legendary (tier 3-5, ótimas)
  'godmode', 4       -- 4% godmode
)
WHERE price_brl = 5.00;

-- Whale (R$ 10.00): legendary tier 4-5, muito comum MAS são as MELHORES
UPDATE booster_types
SET rarity_distribution = jsonb_build_object(
  'trash', 5,
  'meme', 10,
  'viral', 35,
  'legendary', 40,   -- 40% legendary (tier 4-5, AS MELHORES)
  'godmode', 10      -- 10% godmode
)
WHERE price_brl = 10.00;

-- ============================================================================
-- Verificar configuração
-- ============================================================================

SELECT 
  name,
  price_brl,
  market_tier_filter,
  rarity_distribution
FROM booster_types
WHERE edition_id = 'ED01'
ORDER BY price_brl;
