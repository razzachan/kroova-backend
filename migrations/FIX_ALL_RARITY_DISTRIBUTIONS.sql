-- ===========================================================================
-- CORRIGIR DISTRIBUIÇÕES DE RARIDADE - TODOS OS TIERS
-- ===========================================================================
-- Problema: Todos os tiers (Alpha, Beta, Gamma) estão com legendary
-- Solução: Atualizar para distribuições corretas

-- BÁSICO: 60% trash, 40% meme (0% legendary!)
UPDATE booster_types 
SET rarity_distribution = '{"trash":60,"meme":40,"viral":0,"legendary":0,"godmode":0}'
WHERE name LIKE 'Básico%';

-- PADRÃO: 35% trash, 40% meme, 18% viral, 7% legendary
UPDATE booster_types 
SET rarity_distribution = '{"trash":35,"meme":40,"viral":18,"legendary":7,"godmode":0}'
WHERE name LIKE 'Padrão%';

-- PREMIUM: 30% trash, 25% meme, 34% viral, 10% legendary, 0.1% godmode
UPDATE booster_types 
SET rarity_distribution = '{"trash":30,"meme":25,"viral":34,"legendary":10,"godmode":0.1}'
WHERE name LIKE 'Premium%';

-- ELITE: 20% trash, 12% meme, 46% viral, 18% legendary, 0.2% godmode
UPDATE booster_types 
SET rarity_distribution = '{"trash":20,"meme":12,"viral":46,"legendary":18,"godmode":0.2}'
WHERE name LIKE 'Elite%';

-- WHALE: 0% trash, 0% meme, 55% viral, 32% legendary, 8.5% godmode
UPDATE booster_types 
SET rarity_distribution = '{"trash":0,"meme":0,"viral":55,"legendary":32,"godmode":8.5}'
WHERE name LIKE 'Whale%';

-- Verificar resultados
SELECT 
  name as booster_name,
  rarity_distribution
FROM booster_types
ORDER BY 
  CASE 
    WHEN name LIKE 'Básico%' THEN 1
    WHEN name LIKE 'Padrão%' THEN 2
    WHEN name LIKE 'Premium%' THEN 3
    WHEN name LIKE 'Elite%' THEN 4
    WHEN name LIKE 'Whale%' THEN 5
    ELSE 6
  END,
  name;
