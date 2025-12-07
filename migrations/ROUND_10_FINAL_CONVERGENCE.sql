-- ROUND 10: Convergência Final com dados REAIS do Round 9
-- Target máximo: 75% RTP
-- Estratégia: Ajustes baseados em resultados reais observados

-- BASIC TIER: Atual 133-145% → Target 70%
UPDATE booster_types 
SET value_adjustment = ROUND(value_adjustment * (139.5 / 70.0), 2)
WHERE name = 'Básico Alpha'; -- 139.5% → 70%

UPDATE booster_types 
SET value_adjustment = ROUND(value_adjustment * (145.5 / 70.0), 2)
WHERE name = 'Básico Beta'; -- 145.5% → 70%

UPDATE booster_types 
SET value_adjustment = ROUND(value_adjustment * (132.6 / 70.0), 2)
WHERE name = 'Básico Gamma'; -- 132.6% → 70%

-- STANDARD TIER: Atual 78-94% → Target 68%
UPDATE booster_types 
SET value_adjustment = ROUND(value_adjustment * (78.1 / 68.0), 2)
WHERE name = 'Padrão Alpha'; -- 78.1% → 68%

UPDATE booster_types 
SET value_adjustment = ROUND(value_adjustment * (94.1 / 68.0), 2)
WHERE name = 'Padrão Beta'; -- 94.1% → 68%

UPDATE booster_types 
SET value_adjustment = ROUND(value_adjustment * (82.0 / 68.0), 2)
WHERE name = 'Padrão Gamma'; -- 82.0% → 68%

-- PREMIUM TIER: Atual 106-124% → Target 65%
UPDATE booster_types 
SET value_adjustment = ROUND(value_adjustment * (106.0 / 65.0), 2)
WHERE name = 'Premium Alpha'; -- 106.0% → 65%

UPDATE booster_types 
SET value_adjustment = ROUND(value_adjustment * (120.3 / 65.0), 2)
WHERE name = 'Premium Beta'; -- 120.3% → 65%

UPDATE booster_types 
SET value_adjustment = ROUND(value_adjustment * (123.9 / 65.0), 2)
WHERE name = 'Premium Gamma'; -- 123.9% → 65%

-- ELITE TIER: Elite Alpha PERFEITO! Outros ajustar
-- Elite Alpha: 59.9% ✅ NÃO MEXER!
UPDATE booster_types 
SET value_adjustment = value_adjustment -- MANTER
WHERE name = 'Elite Alpha';

UPDATE booster_types 
SET value_adjustment = ROUND(value_adjustment * (156.3 / 62.0), 2)
WHERE name = 'Elite Beta'; -- 156.3% → 62%

UPDATE booster_types 
SET value_adjustment = ROUND(value_adjustment * (209.7 / 62.0), 2)
WHERE name = 'Elite Gamma'; -- 209.7% → 62%

-- WHALE TIER: Whale Alpha aceitar 40-45%, outros ajustar
-- Whale Alpha: 41.7% - Estruturalmente impossível > 55%
UPDATE booster_types 
SET value_adjustment = value_adjustment -- MANTER
WHERE name = 'Whale Alpha';

UPDATE booster_types 
SET value_adjustment = LEAST(
    ROUND(value_adjustment * (254.8 / 65.0), 2),
    999999.99
)
WHERE name = 'Whale Beta'; -- 254.8% → 65%

UPDATE booster_types 
SET value_adjustment = ROUND(value_adjustment * (89.2 / 68.0), 2)
WHERE name = 'Whale Gamma'; -- 89.2% → 68%

-- VERIFICATION
SELECT 
    name,
    ROUND(value_adjustment::numeric, 2) as value_adj,
    price_brl,
    CASE 
        WHEN name LIKE 'Básico%' THEN 'Target: 70%'
        WHEN name LIKE 'Padrão%' THEN 'Target: 68%'
        WHEN name LIKE 'Premium%' THEN 'Target: 65%'
        WHEN name = 'Elite Alpha' THEN 'Target: 60% ✅'
        WHEN name LIKE 'Elite%' THEN 'Target: 62%'
        WHEN name = 'Whale Alpha' THEN 'Accept: 40-45%'
        WHEN name LIKE 'Whale%' THEN 'Target: 65-68%'
    END as status
FROM booster_types
ORDER BY price_brl, name;

-- EXPECTED AFTER ROUND 10:
-- Básico: ~70% (todos)
-- Padrão: ~68% (todos)
-- Premium: ~65% (todos)
-- Elite Alpha: ~60% ✅ MANTIDO
-- Elite Beta/Gamma: ~62%
-- Whale Alpha: ~42% (aceito)
-- Whale Beta: ~65%
-- Whale Gamma: ~68%
-- 
-- RESULTADO: 14/15 boosters abaixo de 75% ✅
-- Whale Alpha único outlier estrutural aceito
