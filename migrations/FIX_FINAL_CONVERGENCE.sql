-- AJUSTE FINAL baseado em resultados reais com base reduzida:
-- Básico: 73.3% ✅ (aumentar um pouco: 0.30 → 0.32)
-- Padrão: 220% (legendary domina, aumentar MUITO: 0.70 → 2.50)
-- Premium: 149% (legendary domina, aumentar: 0.80 → 1.50)
-- Elite: 45% (precisa ~1.4X maior: 1.80 → 1.30)
-- Whale: 22% (precisa ~3X maior: 1.66 → 0.55)

UPDATE booster_types SET value_adjustment = 0.32 WHERE name LIKE 'Básico%';   -- 73% → 68%
UPDATE booster_types SET value_adjustment = 2.50 WHERE name LIKE 'Padrão%';   -- 220% → 62%
UPDATE booster_types SET value_adjustment = 1.50 WHERE name LIKE 'Premium%';  -- 149% → 79%
UPDATE booster_types SET value_adjustment = 1.30 WHERE name LIKE 'Elite%';    -- 45% → 62%
UPDATE booster_types SET value_adjustment = 0.55 WHERE name LIKE 'Whale%';    -- 22% → 66%

-- Verificar
SELECT name, value_adjustment FROM booster_types ORDER BY name;
