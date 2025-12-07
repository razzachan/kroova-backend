-- SOLUÇÃO DRÁSTICA: Legendary causando spikes mesmo em R$ 1.50
-- Space Rec ghost R$ 5.00 quebrou Whale (113.9%)
-- Water Boom legendary R$ 1.88 quebrou Elite (109.7%)
--
-- OPÇÃO 1: Reduzir legendary para R$ 0.80
-- legendary R$ 0.80 × ghost 3x / 0.90 = R$ 2.67 (OK para Whale)
-- legendary R$ 0.80 × premium 1.5x / 0.80 = R$ 1.50 (OK para Elite)
--
-- OPÇÃO 2: Aumentar value_adjustment MUITO
-- Mas isso faria tiers baixos ficarem MUITO baixos
--
-- ESCOLHA: OPÇÃO 1 (reduzir legendary)

UPDATE cards_base 
SET base_liquidity_brl = 0.80 
WHERE rarity = 'legendary';

-- Verificar
SELECT rarity, MAX(base_liquidity_brl) as max_base, MIN(base_liquidity_brl) as min_base
FROM cards_base
GROUP BY rarity
ORDER BY 
  CASE rarity
    WHEN 'trash' THEN 1
    WHEN 'meme' THEN 2
    WHEN 'viral' THEN 3
    WHEN 'legendary' THEN 4
    WHEN 'godmode' THEN 5
  END;
