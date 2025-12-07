-- AJUSTE FINO: Calibrar para 62-72% RTP
-- Analisar resultados anteriores e ajustar

-- Básico: 10% RTP com value_adj 10.0 → precisa REDUZIR para ~3.0
UPDATE booster_types SET value_adjustment = 3.0 WHERE name LIKE 'Básico%';

-- Padrão: 5% RTP com value_adj 6.0 → precisa REDUZIR para ~1.5
UPDATE booster_types SET value_adjustment = 1.5 WHERE name LIKE 'Padrão%';

-- Premium: 12.5% RTP com value_adj 3.0 → precisa REDUZIR para ~1.0
UPDATE booster_types SET value_adjustment = 1.0 WHERE name LIKE 'Premium%';

-- Elite: 39.5% RTP com value_adj 1.5 → precisa REDUZIR para ~0.9
UPDATE booster_types SET value_adjustment = 0.9 WHERE name LIKE 'Elite%';

-- Whale: 119.4% RTP com value_adj 0.8 → precisa AUMENTAR para ~1.3
UPDATE booster_types SET value_adjustment = 1.3 WHERE name LIKE 'Whale%';

SELECT name, value_adjustment FROM booster_types
ORDER BY CASE 
  WHEN name LIKE 'Básico%' THEN 1
  WHEN name LIKE 'Padrão%' THEN 2
  WHEN name LIKE 'Premium%' THEN 3
  WHEN name LIKE 'Elite%' THEN 4
  WHEN name LIKE 'Whale%' THEN 5
END;
