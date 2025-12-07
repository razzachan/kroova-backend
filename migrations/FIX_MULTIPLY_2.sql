-- MULTIPLICAR POR 2: RTPs em 103-174%, média precisa ~2X menor
-- Estratégia: multiplicar todos por 2 (÷ por 2 no efeito)

-- Valores atuais: 0.27/0.50/0.60/0.67/0.83
-- Novos valores: 0.54/1.00/1.20/1.34/1.66 (×2)

UPDATE booster_types SET value_adjustment = 0.54 WHERE name LIKE 'Básico%';   -- 0.27 × 2
UPDATE booster_types SET value_adjustment = 1.00 WHERE name LIKE 'Padrão%';   -- 0.50 × 2
UPDATE booster_types SET value_adjustment = 1.20 WHERE name LIKE 'Premium%';  -- 0.60 × 2
UPDATE booster_types SET value_adjustment = 1.34 WHERE name LIKE 'Elite%';    -- 0.67 × 2
UPDATE booster_types SET value_adjustment = 1.66 WHERE name LIKE 'Whale%';    -- 0.83 × 2

-- Verificar
SELECT name, value_adjustment FROM booster_types ORDER BY name;
