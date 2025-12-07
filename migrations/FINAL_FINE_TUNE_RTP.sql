-- =========================================================================
-- FINE TUNE FINAL - TARGET 60-72% RTP (STRICT)
-- =========================================================================
-- REGRAS ESTRITAS:
-- ✅ Aceitável: 60% ≤ RTP ≤ 72%
-- ❌ Inaceitável: RTP < 60% ou RTP > 72%
--
-- SIMULATION RESULTS (após ajuste anterior):
-- Basic Alpha: 137.5% ❌ → target 70%, ajustar 1.96×
-- Basic Beta: 128.2% ❌ → target 70%, ajustar 1.83×
-- Basic Gamma: 136.0% ❌ → target 70%, ajustar 1.94×
-- Standard Alpha: 79.0% ❌ (>72%) → target 70%, ajustar 1.13×
-- Standard Beta: 79.8% ❌ (>72%) → target 70%, ajustar 1.14×
-- Standard Gamma: 80.1% ❌ (>72%) → target 70%, ajustar 1.14×
-- Premium Alpha: 105.2% ❌ → target 70%, ajustar 1.50×
-- Premium Beta: 223.9% ❌ → target 70%, ajustar 3.20×
-- Premium Gamma: 111.6% ❌ → target 70%, ajustar 1.59×
-- Elite Alpha: 59.4% ❌ (<60%) → target 65%, ajustar 0.91×
-- Elite Beta: 161.6% ❌ → target 70%, ajustar 2.31×
-- Elite Gamma: 233.7% ❌ → target 70%, ajustar 3.34×
-- Whale Alpha: 41.8% ❌ (<60%) → target 65%, ajustar 0.64×
-- Whale Beta: 293.7% ❌ → target 70%, ajustar 4.20×
-- Whale Gamma: 87.5% ❌ (>72%) → target 70%, ajustar 1.25×
-- =========================================================================

UPDATE booster_types
SET value_adjustment = CASE 
    -- BASIC TIER - Reduzir para 70%
    WHEN name = 'Básico Alpha' THEN 29.67 * (137.5 / 70.0)  -- 58.31
    WHEN name = 'Básico Beta' THEN 28.62 * (128.2 / 70.0)   -- 52.41
    WHEN name = 'Básico Gamma' THEN 30.06 * (136.0 / 70.0)  -- 58.37
    
    -- STANDARD TIER - Quase perfeito, ajuste leve
    WHEN name = 'Padrão Alpha' THEN 3.70 * (79.0 / 70.0)    -- 4.18
    WHEN name = 'Padrão Beta' THEN 3.77 * (79.8 / 70.0)     -- 4.30
    WHEN name = 'Padrão Gamma' THEN 4.26 * (80.1 / 70.0)    -- 4.87
    
    -- PREMIUM TIER - Reduzir variance
    WHEN name = 'Premium Alpha' THEN 2.92 * (105.2 / 70.0)  -- 4.39
    WHEN name = 'Premium Beta' THEN 4.29 * (223.9 / 70.0)   -- 13.72 (spike raro OK)
    WHEN name = 'Premium Gamma' THEN 4.01 * (111.6 / 70.0)  -- 6.39
    
    -- ELITE TIER - Ajustar para 60-72% range
    WHEN name = 'Elite Alpha' THEN 0.24 * (59.4 / 65.0)     -- 0.22 (target 65%)
    WHEN name = 'Elite Beta' THEN 2.58 * (161.6 / 70.0)     -- 5.96
    WHEN name = 'Elite Gamma' THEN 10.98 * (233.7 / 70.0)   -- 36.66
    
    -- WHALE TIER - Ajustar para 60-72% range
    WHEN name = 'Whale Alpha' THEN 0.07 * (41.8 / 65.0)     -- 0.05 (target 65%)
    WHEN name = 'Whale Beta' THEN 15.19 * (293.7 / 70.0)    -- 63.76
    WHEN name = 'Whale Gamma' THEN 0.93 * (87.5 / 70.0)     -- 1.16
    
    ELSE value_adjustment
END;

-- Verification
SELECT 
    name,
    ROUND(value_adjustment::numeric, 2) as adjustment,
    price_brl,
    CASE 
        WHEN price_brl = 0.50 THEN 'Básico'
        WHEN price_brl = 1.00 THEN 'Padrão'
        WHEN price_brl = 2.00 THEN 'Premium'
        WHEN price_brl = 5.00 THEN 'Elite'
        WHEN price_brl = 10.00 THEN 'Whale'
    END as tier
FROM booster_types
ORDER BY price_brl, name;
