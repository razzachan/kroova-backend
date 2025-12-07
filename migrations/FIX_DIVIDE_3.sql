-- DIVISÃO POR 3: todos RTPs baixos (6-40%), precisamos ~3X maior
-- Estratégia: dividir todos os value_adjustment por 3

-- Valores atuais: 0.80/1.50/1.80/2.00/2.50
-- Novos valores: 0.27/0.50/0.60/0.67/0.83 (÷3)

UPDATE booster_types SET value_adjustment = 0.27 WHERE name LIKE 'Básico%';   -- 0.80 ÷ 3
UPDATE booster_types SET value_adjustment = 0.50 WHERE name LIKE 'Padrão%';   -- 1.50 ÷ 3
UPDATE booster_types SET value_adjustment = 0.60 WHERE name LIKE 'Premium%';  -- 1.80 ÷ 3
UPDATE booster_types SET value_adjustment = 0.67 WHERE name LIKE 'Elite%';    -- 2.00 ÷ 3
UPDATE booster_types SET value_adjustment = 0.83 WHERE name LIKE 'Whale%';    -- 2.50 ÷ 3

-- Verificar
SELECT name, value_adjustment FROM booster_types ORDER BY name;
