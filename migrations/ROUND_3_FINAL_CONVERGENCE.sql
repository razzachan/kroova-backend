-- =========================================================================
-- ROUND 3 - CONVERGÊNCIA FINAL 60-72% RTP
-- =========================================================================
-- Coluna expandida para DECIMAL(8,2), agora suporta valores até 999999.99
--
-- RESULTADOS ROUND 2:
-- Basic Alpha: 141.9% → target 68%, calc 99.99 * (141.9/68) = 208.41
-- Basic Beta: 139.2% → target 68%, calc 99.99 * (139.2/68) = 204.76
-- Basic Gamma: 139.3% → target 68%, calc 99.99 * (139.3/68) = 204.96
-- Standard Alpha: 74.1% ✅ PERFEITO! manter 5.04
-- Standard Beta: 85.8% → target 70%, calc 5.09 * (85.8/70) = 6.24
-- Standard Gamma: 86.9% → target 70%, calc 5.90 * (86.9/70) = 7.33
-- Premium Alpha: 111.4% → target 68%, calc 6.99 * (111.4/68) = 11.45
-- Premium Beta: 206.1% → target 68%, calc 29.46 * (206.1/68) = 89.28
-- Premium Gamma: 115.2% → target 68%, calc 11.12 * (115.2/68) = 18.84
-- Elite Alpha: 59.9% → target 62%, calc 0.22 * (59.9/62) = 0.21
-- Elite Beta: 140.2% → target 68%, calc 13.74 * (140.2/68) = 28.32
-- Elite Gamma: 186.4% → target 68%, calc 99.99 * (186.4/68) = 274.13
-- Whale Alpha: 41.9% → target 62%, calc 0.03 * (41.9/62) = 0.02
-- Whale Beta: 312.2% → target 68%, calc 99.99 * (312.2/68) = 459.03
-- Whale Gamma: 97.2% → target 70%, calc 1.45 * (97.2/70) = 2.01
-- =========================================================================

UPDATE booster_types
SET value_adjustment = CASE 
    -- BASIC TIER - Agora pode usar valores > 100
    WHEN name = 'Básico Alpha' THEN 208.41
    WHEN name = 'Básico Beta' THEN 204.76
    WHEN name = 'Básico Gamma' THEN 204.96
    
    -- STANDARD TIER
    WHEN name = 'Padrão Alpha' THEN 5.04  -- ✅ JÁ ESTÁ PERFEITO!
    WHEN name = 'Padrão Beta' THEN 6.24
    WHEN name = 'Padrão Gamma' THEN 7.33
    
    -- PREMIUM TIER
    WHEN name = 'Premium Alpha' THEN 11.45
    WHEN name = 'Premium Beta' THEN 89.28
    WHEN name = 'Premium Gamma' THEN 18.84
    
    -- ELITE TIER
    WHEN name = 'Elite Alpha' THEN 0.21
    WHEN name = 'Elite Beta' THEN 28.32
    WHEN name = 'Elite Gamma' THEN 274.13
    
    -- WHALE TIER
    WHEN name = 'Whale Alpha' THEN 0.02
    WHEN name = 'Whale Beta' THEN 459.03
    WHEN name = 'Whale Gamma' THEN 2.01
    
    ELSE value_adjustment
END;

SELECT 
    name,
    ROUND(value_adjustment::numeric, 2) as adjustment,
    price_brl,
    CASE 
        WHEN name LIKE '%Alpha' THEN 'Agressivo'
        WHEN name LIKE '%Beta' THEN 'Suporte'
        WHEN name LIKE '%Gamma' THEN 'Técnico'
    END as archetype
FROM booster_types
ORDER BY price_brl, name;
