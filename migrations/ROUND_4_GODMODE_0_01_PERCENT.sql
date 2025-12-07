-- =========================================================================
-- ROUND 4 - GODMODE 0.01% (1 EM 10,000)
-- =========================================================================
-- Reduzido godmode de 0.1% para 0.01% para eliminar spikes extremos
-- Agora variância controlada, podemos convergir para 60-72%
--
-- RESULTADOS ROUND 3 (com godmode 0.01%):
-- Basic Alpha: 129.2% → target 68%, calc 208.41 * (129.2/68) = 396.00
-- Basic Beta: 131.6% → target 68%, calc 204.76 * (131.6/68) = 396.47
-- Basic Gamma: 153.2% → target 68%, calc 204.96 * (153.2/68) = 461.74
-- Standard Alpha: 82.0% → target 70%, calc 5.04 * (82.0/70) = 5.90
-- Standard Beta: 88.4% → target 70%, calc 6.24 * (88.4/70) = 7.88
-- Standard Gamma: 82.4% → target 70%, calc 7.33 * (82.4/70) = 8.62
-- Premium Alpha: 100.8% → target 68%, calc 11.45 * (100.8/68) = 16.97
-- Premium Beta: 175.3% → target 68%, calc 89.28 * (175.3/68) = 230.17
-- Premium Gamma: 115.6% → target 68%, calc 18.84 * (115.6/68) = 32.03
-- Elite Alpha: 58.0% → target 62%, calc 0.21 * (58.0/62) = 0.20
-- Elite Beta: 155.7% → target 68%, calc 28.32 * (155.7/68) = 64.84
-- Elite Gamma: 176.5% → target 68%, calc 274.13 * (176.5/68) = 711.49
-- Whale Alpha: 40.8% → target 62%, calc 0.02 * (40.8/62) = 0.01
-- Whale Beta: 288.9% → target 68%, calc 459.03 * (288.9/68) = 1950.32
-- Whale Gamma: 96.4% → target 70%, calc 2.01 * (96.4/70) = 2.77
-- =========================================================================

UPDATE booster_types
SET value_adjustment = CASE 
    -- BASIC TIER
    WHEN name = 'Básico Alpha' THEN 396.00
    WHEN name = 'Básico Beta' THEN 396.47
    WHEN name = 'Básico Gamma' THEN 461.74
    
    -- STANDARD TIER
    WHEN name = 'Padrão Alpha' THEN 5.90
    WHEN name = 'Padrão Beta' THEN 7.88
    WHEN name = 'Padrão Gamma' THEN 8.62
    
    -- PREMIUM TIER
    WHEN name = 'Premium Alpha' THEN 16.97
    WHEN name = 'Premium Beta' THEN 230.17
    WHEN name = 'Premium Gamma' THEN 32.03
    
    -- ELITE TIER
    WHEN name = 'Elite Alpha' THEN 0.20
    WHEN name = 'Elite Beta' THEN 64.84
    WHEN name = 'Elite Gamma' THEN 711.49
    
    -- WHALE TIER
    WHEN name = 'Whale Alpha' THEN 0.01
    WHEN name = 'Whale Beta' THEN 1950.32
    WHEN name = 'Whale Gamma' THEN 2.77
    
    ELSE value_adjustment
END;

SELECT 
    name,
    ROUND(value_adjustment::numeric, 2) as adjustment,
    price_brl
FROM booster_types
ORDER BY price_brl, name;
