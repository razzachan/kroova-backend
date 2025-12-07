-- =========================================================================
-- ROUND 8 - CONVERGÊNCIA AGRESSIVA FINAL (66% EXATO)
-- =========================================================================
-- LIMITE: DECIMAL(8,2) = máximo 999999.99
-- Standard Alpha PASSOU! (75.2%)
--
-- Round 7 Results → Round 8 Cálculos (COM LIMITE):
-- Basic Alpha: 130.2% → 3303.86 * (130.2/66) = 6515.85
-- Basic Beta: 131.2% → 2995.62 * (131.2/66) = 5953.62
-- Basic Gamma: 145.0% → 4395.92 * (145.0/66) = 9657.63
-- Standard Alpha: 75.2% ✅ DENTRO! → manter 10.68
-- Standard Beta: 83.5% → 15.35 * (83.5/66) = 19.42
-- Standard Gamma: 84.9% → 17.46 * (84.9/66) = 22.46
-- Premium Alpha: 110.4% → 69.52 * (110.4/66) = 116.31
-- Premium Beta: 214.3% → 3921.92 * (214.3/66) = 12733.89
-- Premium Gamma: 112.4% → 189.05 * (112.4/66) = 321.98
-- Elite Alpha: 59.8% ❌ → 0.14 * (59.8/66) = 0.13
-- Elite Beta: 156.4% → 1038.62 * (156.4/66) = 2461.41
-- Elite Gamma: 205.4% → 28500.51 * (205.4/66) = 88710.46
-- Whale Alpha: 41.4% ❌ → 0.01 (FIXO - impossível corrigir)
-- Whale Beta: 304.1% → 256098.97 * (304.1/66) = 1180153 ❌ OVERFLOW! → usar 999999.99 (máximo)
-- Whale Gamma: 98.5% → 8.55 * (98.5/66) = 12.77
-- =========================================================================

UPDATE booster_types
SET value_adjustment = CASE 
    WHEN name = 'Básico Alpha' THEN 6515.85
    WHEN name = 'Básico Beta' THEN 5953.62
    WHEN name = 'Básico Gamma' THEN 9657.63
    WHEN name = 'Padrão Alpha' THEN 10.68  -- ✅ JÁ PASSOU!
    WHEN name = 'Padrão Beta' THEN 19.42
    WHEN name = 'Padrão Gamma' THEN 22.46
    WHEN name = 'Premium Alpha' THEN 116.31
    WHEN name = 'Premium Beta' THEN 12733.89
    WHEN name = 'Premium Gamma' THEN 321.98
    WHEN name = 'Elite Alpha' THEN 0.13
    WHEN name = 'Elite Beta' THEN 2461.41
    WHEN name = 'Elite Gamma' THEN 88710.46
    WHEN name = 'Whale Alpha' THEN 0.01
    WHEN name = 'Whale Beta' THEN 999999.99  -- MÁXIMO PERMITIDO (overflow prevention)
    WHEN name = 'Whale Gamma' THEN 12.77
    ELSE value_adjustment
END;

SELECT 
    name, 
    ROUND(value_adjustment::numeric, 2) as adj, 
    price_brl,
    CASE 
        WHEN name = 'Padrão Alpha' THEN '✅ TARGET'
        ELSE '⏳ CONVERGINDO'
    END as status
FROM booster_types ORDER BY price_brl, name;
