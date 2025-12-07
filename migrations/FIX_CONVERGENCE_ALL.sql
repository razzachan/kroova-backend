-- CONVERGÊNCIA FINAL baseado em MÉDIAS de múltiplos testes:
-- 
-- MÉDIAS OBSERVADAS:
-- Básico: ~91.7% (testes: 62.5%, 75%, 137.5%) → precisa 0.68X
-- Padrão: ~25.2% (testes: 45.3%, 5%) → precisa 2.6X  
-- Premium: ~65.2% (testes: 30.3%, 100%) → OK! ajustar levemente 0.95X
-- Elite: ~63.1% (testes: 49.7%, 76.5%) → ✅ PERFEITO
-- Whale: ~62.9% (testes: 78.6%, 47.2%) → ✅ PERFEITO
--
-- AJUSTES CALCULADOS:
-- Básico: 0.32 → 0.47 (91.7% → 62%)
-- Padrão: 3.50 → 9.00 (25.2% → 66%)
-- Premium: 1.00 → 1.05 (65.2% → 62%)
-- Elite: 0.80 MANTER ✅
-- Whale: 0.90 MANTER ✅

UPDATE booster_types SET value_adjustment = 0.47 WHERE name LIKE 'Básico%';   -- 91.7% → 62%
UPDATE booster_types SET value_adjustment = 9.00 WHERE name LIKE 'Padrão%';   -- 25.2% → 66%
UPDATE booster_types SET value_adjustment = 1.05 WHERE name LIKE 'Premium%';  -- 65.2% → 62%
UPDATE booster_types SET value_adjustment = 0.80 WHERE name LIKE 'Elite%';    -- MANTER ✅
UPDATE booster_types SET value_adjustment = 0.90 WHERE name LIKE 'Whale%';    -- MANTER ✅

-- Verificar
SELECT name, value_adjustment FROM booster_types ORDER BY name;
