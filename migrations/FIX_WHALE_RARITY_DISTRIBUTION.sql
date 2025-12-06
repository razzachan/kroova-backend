-- ============================================================================
-- FIX WHALE RARITY DISTRIBUTION - URGENTE
-- ============================================================================
-- Whale R$ 10.00 está dropando 30% trash + 30% meme + 22% viral
-- DEVERIA ser: 5% viral, 60% legendary, 35% godmode!

-- Atualizar distribuição do Whale (R$ 10.00)
UPDATE booster_types
SET rarity_distribution = jsonb_build_object(
  'trash', 0.0,
  'meme', 0.0,
  'viral', 5.0,
  'legendary', 60.0,
  'godmode', 35.0
)
WHERE price_brl = 10.00;

-- Atualizar distribuição do Elite (R$ 5.00)
UPDATE booster_types
SET rarity_distribution = jsonb_build_object(
  'trash', 0.0,
  'meme', 10.0,
  'viral', 30.0,
  'legendary', 58.0,
  'godmode', 2.0
)
WHERE price_brl = 5.00;

-- Atualizar distribuição do Premium (R$ 2.00)
UPDATE booster_types
SET rarity_distribution = jsonb_build_object(
  'trash', 5.0,
  'meme', 35.0,
  'viral', 50.0,
  'legendary', 8.0,
  'godmode', 2.0
)
WHERE price_brl = 2.00;

-- Atualizar distribuição do Standard (R$ 1.00)
UPDATE booster_types
SET rarity_distribution = jsonb_build_object(
  'trash', 20.0,
  'meme', 50.0,
  'viral', 25.0,
  'legendary', 4.0,
  'godmode', 1.0
)
WHERE price_brl = 1.00;

-- Atualizar distribuição do Basic (R$ 0.50)
UPDATE booster_types
SET rarity_distribution = jsonb_build_object(
  'trash', 40.0,
  'meme', 45.0,
  'viral', 12.0,
  'legendary', 2.5,
  'godmode', 0.5
)
WHERE price_brl = 0.50;

-- VERIFICATION
SELECT 
  name,
  price_brl,
  rarity_distribution->>'trash' as trash_pct,
  rarity_distribution->>'meme' as meme_pct,
  rarity_distribution->>'viral' as viral_pct,
  rarity_distribution->>'legendary' as legendary_pct,
  rarity_distribution->>'godmode' as godmode_pct
FROM booster_types
ORDER BY price_brl, name;
