-- =========================================================================
-- ROUND 5 - TODOS ENTRE 60-72% (OBRIGATÓRIO)
-- =========================================================================
-- TARGET: 66% (centro do range) para garantir que ninguém saia de 60-72%
--
-- RESULTADOS ROUND 4:
-- Basic Alpha: 134.4% → target 66%, calc 396.00 * (134.4/66) = 806.69
-- Basic Beta: 127.3% → target 66%, calc 396.47 * (127.3/66) = 764.15
-- Basic Gamma: 139.8% → target 66%, calc 461.74 * (139.8/66) = 977.65
-- Standard Alpha: 81.3% → target 66%, calc 5.90 * (81.3/66) = 7.27
-- Standard Beta: 83.0% → target 66%, calc 7.88 * (83.0/66) = 9.92
-- Standard Gamma: 83.7% → target 66%, calc 8.62 * (83.7/66) = 10.93
-- Premium Alpha: 109.1% → target 66%, calc 16.97 * (109.1/66) = 28.05
-- Premium Beta: 144.2% → target 66%, calc 230.17 * (144.2/66) = 503.19
-- Premium Gamma: 119.3% → target 66%, calc 32.03 * (119.3/66) = 57.88
-- Elite Alpha: 59.9% ❌ (<60%) → target 66%, calc 0.20 * (59.9/66) = 0.18
-- Elite Beta: 168.0% → target 66%, calc 64.84 * (168.0/66) = 165.00
-- Elite Gamma: 244.1% → target 66%, calc 711.49 * (244.1/66) = 2631.69
-- Whale Alpha: 40.5% ❌ (<60%) → target 66%, calc 0.01 * (40.5/66) = 0.01 (mínimo)
-- Whale Beta: 332.3% → target 66%, calc 1950.32 * (332.3/66) = 9818.30
-- Whale Gamma: 98.6% → target 66%, calc 2.77 * (98.6/66) = 4.14
-- =========================================================================

UPDATE booster_types
SET value_adjustment = CASE 
    -- BASIC TIER - TARGET 66%
    WHEN name = 'Básico Alpha' THEN 806.69
    WHEN name = 'Básico Beta' THEN 764.15
    WHEN name = 'Básico Gamma' THEN 977.65
    
    -- STANDARD TIER - TARGET 66%
    WHEN name = 'Padrão Alpha' THEN 7.27
    WHEN name = 'Padrão Beta' THEN 9.92
    WHEN name = 'Padrão Gamma' THEN 10.93
    
    -- PREMIUM TIER - TARGET 66%
    WHEN name = 'Premium Alpha' THEN 28.05
    WHEN name = 'Premium Beta' THEN 503.19
    WHEN name = 'Premium Gamma' THEN 57.88
    
    -- ELITE TIER - TARGET 66%
    WHEN name = 'Elite Alpha' THEN 0.18
    WHEN name = 'Elite Beta' THEN 165.00
    WHEN name = 'Elite Gamma' THEN 2631.69
    
    -- WHALE TIER - TARGET 66%
    WHEN name = 'Whale Alpha' THEN 0.01  -- mínimo possível
    WHEN name = 'Whale Beta' THEN 9818.30
    WHEN name = 'Whale Gamma' THEN 4.14
    
    ELSE value_adjustment
END;

SELECT 
    name,
    ROUND(value_adjustment::numeric, 2) as adjustment,
    price_brl,
    CASE 
        WHEN ROUND(value_adjustment::numeric, 2) BETWEEN 60 AND 72 THEN '✅ NO TARGET'
        ELSE '⚠️ FORA'
    END as status
FROM booster_types
ORDER BY price_brl, name;
