-- Verificar distribuições de raridade de TODOS os tiers
SELECT 
  bt.name as booster_name,
  bt.rarity_distribution
FROM booster_types bt
ORDER BY 
  CASE bt.name
    WHEN 'Básico Pack' THEN 1
    WHEN 'Padrão Pack' THEN 2
    WHEN 'Premium Pack' THEN 3
    WHEN 'Elite Pack' THEN 4
    WHEN 'Whale Pack' THEN 5
    ELSE 6
  END;
