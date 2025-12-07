-- ============================================================================
-- AJUSTE MANUAL FINAL - VALORES REALISTAS
-- ============================================================================
-- Aceitar que boosters baratos terão RTP ~100-120% (impossível baixar mais)
-- Focar em ajustar os tiers caros onde há mais margem
-- ============================================================================

BEGIN;

-- TARGET: 70% RTP em TODOS os tiers
-- Formula: new_value = current × (actual_RTP / 70.0)

-- BASIC (R$ 0.50): Atual ~128-143%, Target 70%
UPDATE booster_types SET value_adjustment = 8.0 * (128.5 / 70.0) WHERE name = 'Básico Alpha';    -- 14.69
UPDATE booster_types SET value_adjustment = 7.5 * (131.4 / 70.0) WHERE name = 'Básico Beta';     -- 14.08
UPDATE booster_types SET value_adjustment = 7.5 * (143.3 / 70.0) WHERE name = 'Básico Gamma';    -- 15.35

-- STANDARD (R$ 1.00): Atual ~78-86%, Target 70%
UPDATE booster_types SET value_adjustment = 2.8 * (78.5 / 70.0) WHERE name = 'Padrão Alpha';     -- 3.14
UPDATE booster_types SET value_adjustment = 2.5 * (86.5 / 70.0) WHERE name = 'Padrão Beta';      -- 3.09
UPDATE booster_types SET value_adjustment = 3.0 * (84.1 / 70.0) WHERE name = 'Padrão Gamma';     -- 3.60

-- PREMIUM (R$ 2.00): Atual ~105-118%, Target 70%
UPDATE booster_types SET value_adjustment = 1.3 * (105.5 / 70.0) WHERE name = 'Premium Alpha';   -- 1.96
UPDATE booster_types SET value_adjustment = 1.0 * (114.5 / 70.0) WHERE name = 'Premium Beta';    -- 1.64
UPDATE booster_types SET value_adjustment = 1.4 * (118.0 / 70.0) WHERE name = 'Premium Gamma';   -- 2.36

-- ELITE (R$ 5.00): Atual 57%-264%, Target 70%
UPDATE booster_types SET value_adjustment = 0.35 * (57.0 / 70.0) WHERE name = 'Elite Alpha';     -- 0.29
UPDATE booster_types SET value_adjustment = 0.50 * (157.0 / 70.0) WHERE name = 'Elite Beta';     -- 1.12
UPDATE booster_types SET value_adjustment = 0.80 * (264.0 / 70.0) WHERE name = 'Elite Gamma';    -- 3.02

-- WHALE (R$ 10.00): Atual 40%-343%, Target 70%
UPDATE booster_types SET value_adjustment = 0.20 * (40.1 / 70.0) WHERE name = 'Whale Alpha';     -- 0.11
UPDATE booster_types SET value_adjustment = 0.70 * (343.8 / 70.0) WHERE name = 'Whale Beta';     -- 3.44
UPDATE booster_types SET value_adjustment = 0.50 * (94.1 / 70.0) WHERE name = 'Whale Gamma';     -- 0.67

SELECT name, 
       ROUND(value_adjustment::numeric, 2) as adjustment, 
       price_brl
FROM booster_types
ORDER BY price_brl, name;

COMMIT;

-- ============================================================================
-- EXPECTATIVA: 70% RTP em TODOS os 15 boosters
-- Variância ainda será alta em Elite/Whale Beta/Gamma devido aos godmodes
-- ============================================================================
