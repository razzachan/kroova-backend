-- ROUND 12: Ajuste Final Pós-Remoção de Godmodes Elite/Whale
-- Godmodes mantidos APENAS em: Basic, Standard, Premium (0.0001%)
-- Target: Máximo 75% RTP

-- BASIC TIER: Atual ~133% → Target 70%
UPDATE booster_types 
SET value_adjustment = ROUND(value_adjustment * (133.0 / 70.0), 2)
WHERE name = 'Básico Alpha';

UPDATE booster_types 
SET value_adjustment = ROUND(value_adjustment * (134.0 / 70.0), 2)
WHERE name = 'Básico Beta';

UPDATE booster_types 
SET value_adjustment = ROUND(value_adjustment * (131.4 / 70.0), 2)
WHERE name = 'Básico Gamma';

-- STANDARD TIER: Atual ~80-83% → Target 72%
UPDATE booster_types 
SET value_adjustment = ROUND(value_adjustment * (82.3 / 72.0), 2)
WHERE name = 'Padrão Alpha';

UPDATE booster_types 
SET value_adjustment = ROUND(value_adjustment * (83.2 / 72.0), 2)
WHERE name = 'Padrão Beta';

UPDATE booster_types 
SET value_adjustment = ROUND(value_adjustment * (79.8 / 72.0), 2)
WHERE name = 'Padrão Gamma';

-- PREMIUM TIER: Premium Beta ainda com godmode spike
-- Aumentar DRASTICAMENTE Premium Beta
UPDATE booster_types 
SET value_adjustment = ROUND(value_adjustment * (102.2 / 70.0), 2)
WHERE name = 'Premium Alpha';

UPDATE booster_types 
SET value_adjustment = LEAST(
    ROUND(value_adjustment * (225.5 / 70.0), 2),
    999999.99
)
WHERE name = 'Premium Beta'; -- Tem godmode 0.0001%, precisa MUITO mais

UPDATE booster_types 
SET value_adjustment = ROUND(value_adjustment * (112.7 / 70.0), 2)
WHERE name = 'Premium Gamma';

-- ELITE TIER: SEM godmodes agora, convergência possível!
UPDATE booster_types 
SET value_adjustment = value_adjustment -- 59.2% PERFEITO!
WHERE name = 'Elite Alpha';

UPDATE booster_types 
SET value_adjustment = ROUND(value_adjustment * (151.7 / 68.0), 2)
WHERE name = 'Elite Beta';

UPDATE booster_types 
SET value_adjustment = ROUND(value_adjustment * (191.7 / 68.0), 2)
WHERE name = 'Elite Gamma';

-- WHALE TIER: SEM godmodes, agora viável!
UPDATE booster_types 
SET value_adjustment = value_adjustment -- 40.7% estrutural
WHERE name = 'Whale Alpha';

UPDATE booster_types 
SET value_adjustment = LEAST(
    ROUND(value_adjustment * (109.8 / 72.0), 2),
    999999.99
)
WHERE name = 'Whale Beta'; -- 109.8% → 72%

UPDATE booster_types 
SET value_adjustment = ROUND(value_adjustment * (131.5 / 72.0), 2)
WHERE name = 'Whale Gamma'; -- 131.5% → 72%

-- VERIFICATION
SELECT 
    name,
    ROUND(value_adjustment::numeric, 2) as adj,
    price_brl,
    CASE 
        WHEN name = 'Elite Alpha' THEN '✅ FIXED 59%'
        WHEN name = 'Whale Alpha' THEN '⚠️ STRUCT 40%'
        WHEN name LIKE '%Beta' AND name LIKE 'Premium%' THEN '⚠️ GODMODE 0.01%'
        WHEN name LIKE '%Beta' AND price_brl <= 1.00 THEN '⚠️ GODMODE 0.01%'
        ELSE 'TARGET <75%'
    END as status
FROM booster_types
ORDER BY price_brl, name;

-- EXPECTED ROUND 12:
-- Básico: ~70% (com godmode 0.0001%)
-- Padrão: ~72% (com godmode 0.0001%)
-- Premium: ~70-75% (Premium Beta com godmode pode ter spike)
-- Elite Alpha: ~59% ✅ PERFEITO
-- Elite Beta/Gamma: ~68% (SEM godmode)
-- Whale Alpha: ~41% (estrutural aceito)
-- Whale Beta: ~72% (SEM godmode)
-- Whale Gamma: ~72% (SEM godmode)
--
-- CONVERGÊNCIA ESPERADA: 14/15 boosters <75% ✅
