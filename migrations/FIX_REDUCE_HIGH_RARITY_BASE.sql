-- SOLUÇÃO DEFINITIVA: Reduzir base_liquidity dos GODMODES para compensar skins
-- Problema: Godmode R$ 5.00 × dark 1.5x = R$ 7.50, mas CAP não funciona
-- 
-- Estratégia: Reduzir godmode base_liquidity para que MESMO com skins raras fique controlado
-- Godmode atual: R$ 5.00
-- Godmode × dark 1.5x / value_adj 1.66 = R$ 4.52 (SEM CAP)
-- Target: Godmode × dark deve ficar ~R$ 3.00-4.00 max
-- 
-- Cálculo reverso:
-- Target R$ 3.50 × 1.66 / 1.5 (dark) = R$ 3.87 base
-- Target R$ 4.00 × 1.66 / 1.5 (dark) = R$ 4.43 base

-- Reduzir godmode base de R$ 5.00 para R$ 3.50
UPDATE cards_base 
SET base_liquidity_brl = 3.50 
WHERE rarity = 'godmode';

-- TAMBÉM reduzir legendaries que têm variância alta
-- Legendary atual: R$ 2.00
-- Legendary × holo 2.5x / 1.66 = R$ 3.01
-- Reduzir para R$ 1.50
UPDATE cards_base 
SET base_liquidity_brl = 1.50 
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
