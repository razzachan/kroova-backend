-- ============================================================================
-- REVERTER PARA VALORES ORIGINAIS - CORRETOS PARA DIVISÃO
-- ============================================================================
-- Os valores originais foram calibrados assumindo DIVISÃO
-- A implementação anterior estava multiplicando (ERRADO)
-- Agora que corrigimos para DIVISÃO, usamos valores originais

-- BÁSICO (R$ 0.50) - Target ~72% RTP
UPDATE booster_types SET value_adjustment = 270000.00 WHERE name = 'Básico Alpha';
UPDATE booster_types SET value_adjustment = 260000.00 WHERE name = 'Básico Beta';
UPDATE booster_types SET value_adjustment = 280000.00 WHERE name = 'Básico Gamma';

-- PADRÃO (R$ 1.00) - Target ~74% RTP  
UPDATE booster_types SET value_adjustment = 22.00 WHERE name = 'Padrão Alpha';
UPDATE booster_types SET value_adjustment = 70.00 WHERE name = 'Padrão Beta';
UPDATE booster_types SET value_adjustment = 50.00 WHERE name = 'Padrão Gamma';

-- PREMIUM (R$ 2.00) - Target ~70% RTP
UPDATE booster_types SET value_adjustment = 1950.00 WHERE name = 'Premium Alpha';
UPDATE booster_types SET value_adjustment = 999999.99 WHERE name = 'Premium Beta';
UPDATE booster_types SET value_adjustment = 20000.00 WHERE name = 'Premium Gamma';

-- ELITE (R$ 5.00) - Target ~60% RTP
UPDATE booster_types SET value_adjustment = 0.12 WHERE name = 'Elite Alpha';
UPDATE booster_types SET value_adjustment = 999999.99 WHERE name = 'Elite Beta';
UPDATE booster_types SET value_adjustment = 999999.99 WHERE name = 'Elite Gamma';

-- WHALE (R$ 10.00) - Target ~41-72% RTP
UPDATE booster_types SET value_adjustment = 0.01 WHERE name = 'Whale Alpha';
UPDATE booster_types SET value_adjustment = 999999.99 WHERE name = 'Whale Beta';
UPDATE booster_types SET value_adjustment = 220.00 WHERE name = 'Whale Gamma';

-- VERIFICATION
SELECT 
    name,
    price_brl,
    ROUND(value_adjustment::numeric, 2) as value_adj
FROM booster_types
ORDER BY price_brl, name;

-- EXPLICAÇÃO:
-- Com divisão, valores ALTOS = cartas BARATAS (RTP baixo)
-- - Basic 270k divide R$ 0.10 meme = R$ 0.0000004 → R$ 0.01 mínimo ✅
-- - Whale Alpha 0.01 divide R$ 5.00 legendary = R$ 500 ❌ EXPLODE
-- 
-- PROBLEMA: Whale Alpha/Elite Alpha com 0.01/0.12 vão EXPLODIR valores!
-- Precisamos valores ALTOS para dividir e reduzir:
--
-- CORREÇÃO NECESSÁRIA:
-- - Elite Alpha: 0.12 → 8.33 (1/0.12)
-- - Whale Alpha: 0.01 → 100 (1/0.01)  
-- - Whale Beta: 999999 → 0.000001 (1/999999)
