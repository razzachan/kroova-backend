-- ============================================================================
-- SEGUNDA RECALIBRAÇÃO - AJUSTES MAIS AGRESSIVOS
-- ============================================================================

BEGIN;

-- BASIC: Target 70%, Atual ~136%
UPDATE booster_types SET value_adjustment = 5.41 * (143.1 / 70.0) WHERE name = 'Básico Alpha';   -- 11.06
UPDATE booster_types SET value_adjustment = 5.07 * (134.5 / 70.0) WHERE name = 'Básico Beta';    -- 9.74
UPDATE booster_types SET value_adjustment = 5.26 * (131.9 / 70.0) WHERE name = 'Básico Gamma';   -- 9.91

-- STANDARD: Target 70%, Atual ~86%
UPDATE booster_types SET value_adjustment = 2.60 * (81.2 / 70.0) WHERE name = 'Padrão Alpha';    -- 3.02
UPDATE booster_types SET value_adjustment = 2.91 * (88.9 / 70.0) WHERE name = 'Padrão Beta';     -- 3.70
UPDATE booster_types SET value_adjustment = 2.82 * (86.9 / 70.0) WHERE name = 'Padrão Gamma';    -- 3.50

-- PREMIUM: Target 70%, Atual ~141%
UPDATE booster_types SET value_adjustment = 1.15 * (104.9 / 70.0) WHERE name = 'Premium Alpha';  -- 1.72
UPDATE booster_types SET value_adjustment = 1.67 * (198.9 / 70.0) WHERE name = 'Premium Beta';   -- 4.75
UPDATE booster_types SET value_adjustment = 1.31 * (118.9 / 70.0) WHERE name = 'Premium Gamma';  -- 2.23

-- ELITE: Target 70%, Atual muito variável (58%-271%)
UPDATE booster_types SET value_adjustment = 0.29 * (58.5 / 70.0) WHERE name = 'Elite Alpha';     -- 0.24
UPDATE booster_types SET value_adjustment = 0.78 * (157.1 / 70.0) WHERE name = 'Elite Beta';     -- 1.75
UPDATE booster_types SET value_adjustment = 1.03 * (271.6 / 70.0) WHERE name = 'Elite Gamma';    -- 4.00

-- WHALE: Target 70%, Atual muito variável (40%-297%)
UPDATE booster_types SET value_adjustment = 0.16 * (40.6 / 70.0) WHERE name = 'Whale Alpha';     -- 0.09
UPDATE booster_types SET value_adjustment = 1.04 * (297.0 / 70.0) WHERE name = 'Whale Beta';     -- 4.41
UPDATE booster_types SET value_adjustment = 0.41 * (95.4 / 70.0) WHERE name = 'Whale Gamma';     -- 0.56

SELECT name, 
       ROUND(value_adjustment::numeric, 2) as new_adjustment, 
       price_brl
FROM booster_types
ORDER BY price_brl, name;

COMMIT;
