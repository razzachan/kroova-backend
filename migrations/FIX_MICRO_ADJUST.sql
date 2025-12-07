-- MICRO-AJUSTE baseado em 1 tier validado:
-- Básico: 68.8% ✅ VALIDADO (manter 0.32)
-- Padrão: 197% com 3 legendaries (aumentar: 2.50 → 3.20)
-- Premium: 112% com 1 legendary premium (aumentar: 1.50 → 1.80)
-- Elite: 48% só virals (diminuir: 1.30 → 1.00)
-- Whale: 73.3% ✅ QUASE (ajustar: 0.55 → 0.58)

UPDATE booster_types SET value_adjustment = 0.32 WHERE name LIKE 'Básico%';   -- MANTER ✅
UPDATE booster_types SET value_adjustment = 3.20 WHERE name LIKE 'Padrão%';   -- 197% → 61%
UPDATE booster_types SET value_adjustment = 1.80 WHERE name LIKE 'Premium%';  -- 112% → 94%
UPDATE booster_types SET value_adjustment = 1.00 WHERE name LIKE 'Elite%';    -- 48% → 62%
UPDATE booster_types SET value_adjustment = 0.58 WHERE name LIKE 'Whale%';    -- 73% → 69%

-- Verificar
SELECT name, value_adjustment FROM booster_types ORDER BY name;
