-- CORREÇÃO: INVERTER VALUE_ADJUSTMENTS
-- Quanto MAIOR o value_adjustment, MENOR o valor das cartas (divide mais)

-- Básico: precisa cartas BARATAS → value_adj ALTO
UPDATE booster_types SET value_adjustment = 10.0 WHERE name LIKE 'Básico%';

-- Padrão: precisa controlar virals/legendaries → value_adj ALTO
UPDATE booster_types SET value_adjustment = 6.0 WHERE name LIKE 'Padrão%';

-- Premium: pode ser moderado
UPDATE booster_types SET value_adjustment = 3.0 WHERE name LIKE 'Premium%';

-- Elite: pode ter cartas mais caras
UPDATE booster_types SET value_adjustment = 1.5 WHERE name LIKE 'Elite%';

-- Whale: pode ter cartas CARAS → value_adj BAIXO
UPDATE booster_types SET value_adjustment = 0.8 WHERE name LIKE 'Whale%';

-- Verificar
SELECT name, value_adjustment FROM booster_types
ORDER BY CASE 
  WHEN name LIKE 'Básico%' THEN 1
  WHEN name LIKE 'Padrão%' THEN 2
  WHEN name LIKE 'Premium%' THEN 3
  WHEN name LIKE 'Elite%' THEN 4
  WHEN name LIKE 'Whale%' THEN 5
END;
