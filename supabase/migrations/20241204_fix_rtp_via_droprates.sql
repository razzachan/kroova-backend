-- ============================================================================
-- Ajustar rarity_distribution dos tiers para atingir RTP ~70%
-- SEM inflar preços das cartas (cada carta tem valor fixo)
-- ============================================================================

-- A ideia: tiers mais caros dropam mais cartas RARAS (que valem mais naturalmente)
-- não as mesmas cartas com preços inflados

-- Valores médios aproximados por raridade (base_liquidity_brl):
-- meme/trash: R$ 0.01
-- viral: R$ 0.05
-- legendary: R$ 0.15
-- godmode: R$ 0.50

-- Para RTP 70%, precisamos que o valor médio por booster seja:
-- Básico (R$ 0.50): retorno = R$ 0.35 → média por carta = R$ 0.07
-- Padrão (R$ 1.00): retorno = R$ 0.70 → média por carta = R$ 0.14
-- Premium (R$ 2.00): retorno = R$ 1.40 → média por carta = R$ 0.28
-- Elite (R$ 5.00): retorno = R$ 3.50 → média por carta = R$ 0.70
-- Whale (R$ 10.00): retorno = R$ 7.00 → média por carta = R$ 1.40

-- Básico (R$ 0.50) - mantém distribuição atual
UPDATE booster_types 
SET rarity_distribution = jsonb_build_object(
  'meme', 30,
  'trash', 55,
  'viral', 12,
  'legendary', 3,
  'godmode', 0.2
)
WHERE price_brl = 0.50;

-- Padrão (R$ 1.00) - aumenta legendary e viral
UPDATE booster_types 
SET rarity_distribution = jsonb_build_object(
  'meme', 25,
  'trash', 45,
  'viral', 20,
  'legendary', 9,
  'godmode', 1
)
WHERE price_brl = 1.00;

-- Premium (R$ 2.00) - mais legendary, aparece godmode
UPDATE booster_types 
SET rarity_distribution = jsonb_build_object(
  'meme', 20,
  'trash', 35,
  'viral', 25,
  'legendary', 17,
  'godmode', 3
)
WHERE price_brl = 2.00;

-- Elite (R$ 5.00) - muito legendary e godmode
UPDATE booster_types 
SET rarity_distribution = jsonb_build_object(
  'meme', 10,
  'trash', 25,
  'viral', 25,
  'legendary', 32,
  'godmode', 8
)
WHERE price_brl = 5.00;

-- Whale (R$ 10.00) - quase garantido legendary/godmode
UPDATE booster_types 
SET rarity_distribution = jsonb_build_object(
  'meme', 5,
  'trash', 15,
  'viral', 20,
  'legendary', 45,
  'godmode', 15
)
WHERE price_brl = 10.00;

-- Verificar
SELECT 
  name,
  price_brl,
  rarity_distribution
FROM booster_types
WHERE edition_id = 'ED01'
ORDER BY price_brl;
