-- =========================================================================
-- ROUND 7 - AJUSTE ULTRA-FINO (CONVERGÊNCIA FINAL)
-- =========================================================================
-- Standard tiers quase perfeitos (79-83%)
-- Target conservador: 66% exato
--
-- RESULTADOS Round 6:
-- Basic Alpha: 131.3% → 1659.84 * (131.3/66) = 3303.86
-- Basic Beta: 129.8% → 1522.65 * (129.8/66) = 2995.62
-- Basic Gamma: 139.8% → 2075.13 * (139.8/66) = 4395.92
-- Standard Alpha: 79.5% ✅ próximo! → 8.87 * (79.5/66) = 10.68
-- Standard Beta: 80.2% ✅ próximo! → 12.64 * (80.2/66) = 15.35
-- Standard Gamma: 83.5% ✅ próximo! → 13.80 * (83.5/66) = 17.46
-- Premium Alpha: 98.4% → 46.62 * (98.4/66) = 69.52
-- Premium Beta: 218.7% → 1183.60 * (218.7/66) = 3921.92
-- Premium Gamma: 121.3% → 102.86 * (121.3/66) = 189.05
-- Elite Alpha: 57.3% ❌ → 0.16 * (57.3/66) = 0.14
-- Elite Beta: 163.6% → 419.09 * (163.6/66) = 1038.62
-- Elite Gamma: 200.3% → 9396.98 * (200.3/66) = 28500.51
-- Whale Alpha: 41.9% ❌ → 0.01 (mínimo fixo)
-- Whale Beta: 336.5% → 50258.79 * (336.5/66) = 256098.97
-- Whale Gamma: 91.0% → 6.20 * (91.0/66) = 8.55
-- =========================================================================

UPDATE booster_types
SET value_adjustment = CASE 
    WHEN name = 'Básico Alpha' THEN 3303.86
    WHEN name = 'Básico Beta' THEN 2995.62
    WHEN name = 'Básico Gamma' THEN 4395.92
    WHEN name = 'Padrão Alpha' THEN 10.68
    WHEN name = 'Padrão Beta' THEN 15.35
    WHEN name = 'Padrão Gamma' THEN 17.46
    WHEN name = 'Premium Alpha' THEN 69.52
    WHEN name = 'Premium Beta' THEN 3921.92
    WHEN name = 'Premium Gamma' THEN 189.05
    WHEN name = 'Elite Alpha' THEN 0.14
    WHEN name = 'Elite Beta' THEN 1038.62
    WHEN name = 'Elite Gamma' THEN 28500.51
    WHEN name = 'Whale Alpha' THEN 0.01
    WHEN name = 'Whale Beta' THEN 256098.97
    WHEN name = 'Whale Gamma' THEN 8.55
    ELSE value_adjustment
END;

SELECT name, ROUND(value_adjustment::numeric, 2) as adj, price_brl FROM booster_types ORDER BY price_brl, name;
