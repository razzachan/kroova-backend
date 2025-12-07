-- AJUSTE PROPORCIONAL final baseado em Básico validado:
-- Básico: 62.5% ✅ VALIDADO (manter 0.32)
-- Padrão: 45.3% (precisa 1.4X: 5.00 → 3.50)
-- Premium: 30.3% (precisa 2.2X: 2.20 → 1.00)
-- Elite: 49.7% (precisa 1.3X: 1.05 → 0.80)
-- Whale: 78.6% (precisa 0.8X: 0.70 → 0.90)

UPDATE booster_types SET value_adjustment = 0.32 WHERE name LIKE 'Básico%';   -- MANTER ✅
UPDATE booster_types SET value_adjustment = 3.50 WHERE name LIKE 'Padrão%';   -- 45% → 64%
UPDATE booster_types SET value_adjustment = 1.00 WHERE name LIKE 'Premium%';  -- 30% → 67%
UPDATE booster_types SET value_adjustment = 0.80 WHERE name LIKE 'Elite%';    -- 50% → 65%
UPDATE booster_types SET value_adjustment = 0.90 WHERE name LIKE 'Whale%';    -- 79% → 61%

-- Verificar
SELECT name, value_adjustment FROM booster_types ORDER BY name;
