-- SOLUÇÃO GRADUAL: valores crescentes suavemente
-- Problema anterior: 0.51/0.80/3.00/4.00/5.00 (MUITO díspares)
--   Básico/Padrão ficaram ALTOS
--   Premium/Elite/Whale ficaram BAIXOS

-- NOVA ESTRATÉGIA: valores GRADUAIS entre 0.8 e 2.5
-- Básico: aumentar (estava alto 117% com 0.51)
-- Padrão: aumentar (estava alto 160% com 0.80)
-- Premium: diminuir muito (estava baixo 17% com 3.00)
-- Elite: diminuir muito (estava baixo 7% com 4.00)
-- Whale: diminuir muito (estava baixo 16% com 5.00)

UPDATE booster_types SET value_adjustment = 0.80 WHERE name LIKE 'Básico%';   -- era 0.51
UPDATE booster_types SET value_adjustment = 1.50 WHERE name LIKE 'Padrão%';   -- era 0.80
UPDATE booster_types SET value_adjustment = 1.80 WHERE name LIKE 'Premium%';  -- era 3.00
UPDATE booster_types SET value_adjustment = 2.00 WHERE name LIKE 'Elite%';    -- era 4.00
UPDATE booster_types SET value_adjustment = 2.50 WHERE name LIKE 'Whale%';    -- era 5.00

-- Verificar
SELECT name, value_adjustment FROM booster_types ORDER BY name;
