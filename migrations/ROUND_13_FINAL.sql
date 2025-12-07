-- ROUND 13: CONVERGÊNCIA FINAL
-- Godmodes APENAS em Basic e Standard (0.0001%)
-- Premium, Elite, Whale SEM godmodes
-- Target: <75% RTP em TODOS

-- BASIC TIER: ~130-141% → Target 72%
UPDATE booster_types 
SET value_adjustment = LEAST(
    ROUND(value_adjustment * (141.1 / 72.0), 2),
    999999.99
)
WHERE name = 'Básico Alpha';

UPDATE booster_types 
SET value_adjustment = LEAST(
    ROUND(value_adjustment * (130.3 / 72.0), 2),
    999999.99
)
WHERE name = 'Básico Beta';

UPDATE booster_types 
SET value_adjustment = LEAST(
    ROUND(value_adjustment * (133.1 / 72.0), 2),
    999999.99
)
WHERE name = 'Básico Gamma';

-- STANDARD TIER: ~80-86% → Target 74%
UPDATE booster_types 
SET value_adjustment = ROUND(value_adjustment * (80.7 / 74.0), 2)
WHERE name = 'Padrão Alpha';

UPDATE booster_types 
SET value_adjustment = ROUND(value_adjustment * (85.7 / 74.0), 2)
WHERE name = 'Padrão Beta';

UPDATE booster_types 
SET value_adjustment = ROUND(value_adjustment * (82.1 / 74.0), 2)
WHERE name = 'Padrão Gamma';

-- PREMIUM TIER: SEM godmodes agora! Convergência possível
UPDATE booster_types 
SET value_adjustment = ROUND(value_adjustment * (110.5 / 72.0), 2)
WHERE name = 'Premium Alpha';

UPDATE booster_types 
SET value_adjustment = LEAST(
    ROUND(value_adjustment * (229.5 / 72.0), 2),
    999999.99
)
WHERE name = 'Premium Beta'; -- Cap no máximo para evitar overflow

UPDATE booster_types 
SET value_adjustment = ROUND(value_adjustment * (116.1 / 72.0), 2)
WHERE name = 'Premium Gamma';

-- ELITE TIER: Elite Alpha perfeito, outros precisam ajuste
UPDATE booster_types 
SET value_adjustment = value_adjustment -- 60.0% PERFEITO
WHERE name = 'Elite Alpha';

UPDATE booster_types 
SET value_adjustment = LEAST(
    ROUND(value_adjustment * (158.9 / 70.0), 2),
    999999.99
)
WHERE name = 'Elite Beta';

UPDATE booster_types 
SET value_adjustment = LEAST(
    ROUND(value_adjustment * (194.1 / 70.0), 2),
    999999.99
)
WHERE name = 'Elite Gamma';

-- WHALE TIER: Convergência final
UPDATE booster_types 
SET value_adjustment = value_adjustment -- 41.5% estrutural
WHERE name = 'Whale Alpha';

UPDATE booster_types 
SET value_adjustment = LEAST(
    ROUND(value_adjustment * (108.0 / 74.0), 2),
    999999.99
)
WHERE name = 'Whale Beta';

UPDATE booster_types 
SET value_adjustment = ROUND(value_adjustment * (127.8 / 74.0), 2)
WHERE name = 'Whale Gamma';

-- VERIFICATION
SELECT 
    name,
    ROUND(value_adjustment::numeric, 2) as adj,
    price_brl,
    CASE 
        WHEN name = 'Elite Alpha' THEN '✅ 60%'
        WHEN name = 'Whale Alpha' THEN '⚠️ 41%'
        WHEN name LIKE '%Beta' AND price_brl <= 1.00 THEN '⚠️ GODMODE'
        WHEN name LIKE '%Alpha' AND price_brl <= 0.50 THEN '⚠️ GODMODE'
        ELSE 'TARGET <75%'
    END as status
FROM booster_types
ORDER BY price_brl, name;

-- EXPECTED ROUND 13 (FINAL):
-- Básico: ~72% (com godmode 0.0001% - spikes aceitos)
-- Padrão: ~74% (com godmode 0.0001% - spikes aceitos)
-- Premium: ~72% (SEM godmode)
-- Elite Alpha: ~60% ✅
-- Elite Beta/Gamma: ~70%
-- Whale Alpha: ~41% (estrutural)
-- Whale Beta/Gamma: ~74%
--
-- ✅ 14/15 boosters abaixo de 75%
-- ✅ Whale Alpha único outlier estrutural (41%)
-- ✅ Godmodes APENAS em tiers baratos (aceitável)
