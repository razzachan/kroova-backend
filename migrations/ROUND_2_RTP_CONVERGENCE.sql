-- =========================================================================
-- ROUND 2 - CONVERGIR PARA 60-72% RTP (DENTRO DO LIMITE DECIMAL(4,2))
-- =========================================================================
-- PROBLEMA: value_adjustment tem limite DECIMAL(4,2) = máximo 99.99
-- SOLUÇÃO: Usar valores menores e ajustar no código do backend
--
-- TARGET ESTRITO: 60% ≤ RTP ≤ 72%
--
-- RESULTADOS RODADA ANTERIOR:
-- Basic Alpha: 133.6% → usar valor max 99.99 (limite da coluna)
-- Basic Beta: 132.4% → usar valor max 99.99
-- Basic Gamma: 144.9% → usar valor max 99.99
-- Standard Alpha: 84.4% → target 70%, ajustar 1.21×
-- Standard Beta: 82.8% → target 70%, ajustar 1.18×
-- Standard Gamma: 84.8% → target 70%, ajustar 1.21×
-- Premium Alpha: 108.2% → target 68%, ajustar 1.59×
-- Premium Beta: 146.1% → target 68%, ajustar 2.15×
-- Premium Gamma: 118.3% → target 68%, ajustar 1.74×
-- Elite Alpha: 61.0% ✅ (dentro range!)
-- Elite Beta: 156.8% → target 68%, ajustar 2.31×
-- Elite Gamma: 265.5% → usar valor max 99.99
-- Whale Alpha: 40.6% → target 62%, ajustar 0.66×
-- Whale Beta: 368.5% → usar valor max 99.99
-- Whale Gamma: 87.2% → target 70%, ajustar 1.25×
--
-- NOTA: Basic tiers precisam de coluna maior ou lógica diferente no backend
-- =========================================================================

UPDATE booster_types
SET value_adjustment = CASE 
    -- BASIC TIER - Usando máximo permitido (99.99)
    WHEN name = 'Básico Alpha' THEN 99.99
    WHEN name = 'Básico Beta' THEN 99.99
    WHEN name = 'Básico Gamma' THEN 99.99
    
    -- STANDARD TIER
    WHEN name = 'Padrão Alpha' THEN 4.18 * (84.4 / 70.0)    -- 5.04
    WHEN name = 'Padrão Beta' THEN 4.30 * (82.8 / 70.0)     -- 5.09
    WHEN name = 'Padrão Gamma' THEN 4.87 * (84.8 / 70.0)    -- 5.90
    
    -- PREMIUM TIER
    WHEN name = 'Premium Alpha' THEN 4.39 * (108.2 / 68.0)  -- 6.99
    WHEN name = 'Premium Beta' THEN 13.72 * (146.1 / 68.0)  -- 29.46
    WHEN name = 'Premium Gamma' THEN 6.39 * (118.3 / 68.0)  -- 11.12
    
    -- ELITE TIER
    WHEN name = 'Elite Alpha' THEN 0.22  -- JÁ ESTÁ EM 61% ✅
    WHEN name = 'Elite Beta' THEN 5.96 * (156.8 / 68.0)     -- 13.74
    WHEN name = 'Elite Gamma' THEN 99.99  -- Máximo permitido
    
    -- WHALE TIER
    WHEN name = 'Whale Alpha' THEN 0.05 * (40.6 / 62.0)     -- 0.03
    WHEN name = 'Whale Beta' THEN 99.99  -- Máximo permitido
    WHEN name = 'Whale Gamma' THEN 1.16 * (87.2 / 70.0)     -- 1.45
    
    ELSE value_adjustment
END;

SELECT 
    name,
    ROUND(value_adjustment::numeric, 2) as adjustment,
    price_brl
FROM booster_types
ORDER BY price_brl, name;
