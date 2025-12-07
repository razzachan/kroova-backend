-- =========================================================================
-- ROUND 6 - CONVERGÊNCIA FORÇADA PARA 66%
-- =========================================================================
-- Usando médias dos últimos 2 rounds para estabilizar variance
--
-- Round 4: 134.4, 127.3, 139.8, 81.3, 83.0, 83.7, 109.1, 144.2, 119.3, 59.9, 168.0, 244.1, 40.5, 332.3, 98.6
-- Round 5: 137.2, 135.7, 140.6, 79.7, 85.1, 82.8, 110.3, 166.5, 115.3, 58.3, 167.2, 226.8, 42.1, 343.5, 99.0
-- Média:   135.8, 131.5, 140.2, 80.5, 84.1, 83.3, 109.7, 155.4, 117.3, 59.1, 167.6, 235.5, 41.3, 337.9, 98.8
--
-- Cálculo para 66% usando média estabilizada:
-- Basic Alpha: 806.69 * (135.8/66) = 1659.84
-- Basic Beta: 764.15 * (131.5/66) = 1522.65
-- Basic Gamma: 977.65 * (140.2/66) = 2075.13
-- Standard Alpha: 7.27 * (80.5/66) = 8.87
-- Standard Beta: 9.92 * (84.1/66) = 12.64
-- Standard Gamma: 10.93 * (83.3/66) = 13.80
-- Premium Alpha: 28.05 * (109.7/66) = 46.62
-- Premium Beta: 503.19 * (155.4/66) = 1183.60
-- Premium Gamma: 57.88 * (117.3/66) = 102.86
-- Elite Alpha: 0.18 * (59.1/66) = 0.16
-- Elite Beta: 165.00 * (167.6/66) = 419.09
-- Elite Gamma: 2631.69 * (235.5/66) = 9396.98
-- Whale Alpha: 0.01 * (41.3/66) = 0.01 (mínimo)
-- Whale Beta: 9818.30 * (337.9/66) = 50258.79
-- Whale Gamma: 4.14 * (98.8/66) = 6.20
-- =========================================================================

UPDATE booster_types
SET value_adjustment = CASE 
    WHEN name = 'Básico Alpha' THEN 1659.84
    WHEN name = 'Básico Beta' THEN 1522.65
    WHEN name = 'Básico Gamma' THEN 2075.13
    WHEN name = 'Padrão Alpha' THEN 8.87
    WHEN name = 'Padrão Beta' THEN 12.64
    WHEN name = 'Padrão Gamma' THEN 13.80
    WHEN name = 'Premium Alpha' THEN 46.62
    WHEN name = 'Premium Beta' THEN 1183.60
    WHEN name = 'Premium Gamma' THEN 102.86
    WHEN name = 'Elite Alpha' THEN 0.16
    WHEN name = 'Elite Beta' THEN 419.09
    WHEN name = 'Elite Gamma' THEN 9396.98
    WHEN name = 'Whale Alpha' THEN 0.01
    WHEN name = 'Whale Beta' THEN 50258.79
    WHEN name = 'Whale Gamma' THEN 6.20
    ELSE value_adjustment
END;

SELECT name, ROUND(value_adjustment::numeric, 2) as adj, price_brl FROM booster_types ORDER BY price_brl, name;
