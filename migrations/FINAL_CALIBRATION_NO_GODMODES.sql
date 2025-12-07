-- =========================================================================
-- FINAL RTP CALIBRATION - 0.1% GODMODE JACKPOT SYSTEM
-- =========================================================================
-- Godmode probability adjusted to 0.1% (0.001) in Basic/Standard/Premium
-- to maintain jackpot excitement while controlling variance for 70% RTP target
--
-- Formula: new_adjustment = current × (actual_RTP / 70.0)
--
-- SIMULATION RESULTS (0.1% godmode jackpot):
-- Basic Alpha: 141.4% → needs 2.02× increase
-- Basic Beta: 142.3% → needs 2.03× increase  
-- Basic Gamma: 137.1% → needs 1.96× increase
-- Standard Alpha: 82.4% → needs 1.18× increase
-- Standard Beta: 85.5% → needs 1.22× increase
-- Standard Gamma: 82.8% → needs 1.18× increase
-- Premium Alpha: 104.2% → needs 1.49× increase
-- Premium Beta: 183.2% → needs 2.62× increase (rare jackpot spike acceptable)
-- Premium Gamma: 119.0% → needs 1.70× increase
-- Elite Alpha: 60.1% → needs 0.86× increase
-- Elite Beta: 161.5% → needs 2.31× increase
-- Elite Gamma: 254.4% → needs 3.63× increase
-- Whale Alpha: 41.6% → needs 0.59× increase
-- Whale Beta: 309.1% → needs 4.41× increase
-- Whale Gamma: 97.3% → needs 1.39× increase
-- =========================================================================

UPDATE booster_types
SET value_adjustment = CASE 
    -- BASIC TIER (R$ 0.50) - 0.1% godmode jackpot, controlled variance
    WHEN name = 'Básico Alpha' THEN 14.69 * (141.4 / 70.0)  -- 29.69
    WHEN name = 'Básico Beta' THEN 14.08 * (142.3 / 70.0)   -- 28.61
    WHEN name = 'Básico Gamma' THEN 15.35 * (137.1 / 70.0)  -- 30.06
    
    -- STANDARD TIER (R$ 1.00) - Near target with rare jackpot possibility
    WHEN name = 'Padrão Alpha' THEN 3.14 * (82.4 / 70.0)    -- 3.70
    WHEN name = 'Padrão Beta' THEN 3.09 * (85.5 / 70.0)     -- 3.77
    WHEN name = 'Padrão Gamma' THEN 3.60 * (82.8 / 70.0)    -- 4.26
    
    -- PREMIUM TIER (R$ 2.00) - Jackpot excitement maintained
    WHEN name = 'Premium Alpha' THEN 1.96 * (104.2 / 70.0)  -- 2.92
    WHEN name = 'Premium Beta' THEN 1.64 * (183.2 / 70.0)   -- 4.29
    WHEN name = 'Premium Gamma' THEN 2.36 * (119.0 / 70.0)  -- 4.01
    
    -- ELITE TIER (R$ 5.00) - Higher godmode probability
    WHEN name = 'Elite Alpha' THEN 0.28 * (60.1 / 70.0)     -- 0.24
    WHEN name = 'Elite Beta' THEN 1.12 * (161.5 / 70.0)     -- 2.58
    WHEN name = 'Elite Gamma' THEN 3.02 * (254.4 / 70.0)    -- 10.98
    
    -- WHALE TIER (R$ 10.00) - Premium godmode access
    WHEN name = 'Whale Alpha' THEN 0.11 * (41.6 / 70.0)     -- 0.07
    WHEN name = 'Whale Beta' THEN 3.44 * (309.1 / 70.0)     -- 15.19
    WHEN name = 'Whale Gamma' THEN 0.67 * (97.3 / 70.0)     -- 0.93
    
    ELSE value_adjustment
END;

-- Verification query
SELECT 
    name,
    ROUND(value_adjustment::numeric, 2) as new_adjustment,
    price_brl
FROM booster_types
ORDER BY price_brl, name;
