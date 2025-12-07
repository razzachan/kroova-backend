-- AJUSTE BASEADO NA MÉDIA DE 2 TESTES (variância é enorme em 1 teste):
-- Básico: média 62.5% ✅ (manter 0.32)
-- Padrão: média 107% (aumentar: 3.20 → 5.00 para compensar legendary)
-- Premium: média 115% (aumentar: 1.80 → 2.20)
-- Elite: média 67% ✅ PERFEITO (ajustar: 1.00 → 1.05 para baixar um pouco)
-- Whale: média 88% (aumentar: 0.58 → 0.70)

UPDATE booster_types SET value_adjustment = 0.32 WHERE name LIKE 'Básico%';   -- média 62.5% ✅
UPDATE booster_types SET value_adjustment = 5.00 WHERE name LIKE 'Padrão%';   -- média 107% → 69%
UPDATE booster_types SET value_adjustment = 2.20 WHERE name LIKE 'Premium%';  -- média 115% → 94%
UPDATE booster_types SET value_adjustment = 1.05 WHERE name LIKE 'Elite%';    -- média 67% → 64% ✅
UPDATE booster_types SET value_adjustment = 0.70 WHERE name LIKE 'Whale%';    -- média 88% → 73%

-- Verificar
SELECT name, value_adjustment FROM booster_types ORDER BY name;
