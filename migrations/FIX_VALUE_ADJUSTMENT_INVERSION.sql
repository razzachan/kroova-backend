-- ============================================================================
-- FIX VALUE_ADJUSTMENT INVERSION - URGENTE
-- ============================================================================
-- A fórmula foi corrigida de MULTIPLICAÇÃO para DIVISÃO
-- Valores precisam ser INVERTIDOS para manter o RTP target

-- ANTES: liquidity = base × skin × adjustment (ERRADO)
-- AGORA: liquidity = (base × skin) / adjustment (CORRETO)

-- Para manter o mesmo RTP, invertemos: novo_adj = 1 / antigo_adj

-- BÁSICO (R$ 0.50) - Antes: 260k-280k → Agora: 1/260k = 0.0000038
UPDATE booster_types SET value_adjustment = (1.0 / 270000.00) WHERE name = 'Básico Alpha';   -- ~0.0000037
UPDATE booster_types SET value_adjustment = (1.0 / 260000.00) WHERE name = 'Básico Beta';    -- ~0.0000038
UPDATE booster_types SET value_adjustment = (1.0 / 280000.00) WHERE name = 'Básico Gamma';   -- ~0.0000036

-- PADRÃO (R$ 1.00) - Antes: 22-70 → Agora: 1/22 = 0.045
UPDATE booster_types SET value_adjustment = (1.0 / 22.00) WHERE name = 'Padrão Alpha';    -- ~0.045
UPDATE booster_types SET value_adjustment = (1.0 / 70.00) WHERE name = 'Padrão Beta';     -- ~0.014
UPDATE booster_types SET value_adjustment = (1.0 / 50.00) WHERE name = 'Padrão Gamma';    -- ~0.020

-- PREMIUM (R$ 2.00) - Antes: 1950-999999 → Agora: 1/1950 = 0.0005
UPDATE booster_types SET value_adjustment = (1.0 / 1950.00) WHERE name = 'Premium Alpha';    -- ~0.0005
UPDATE booster_types SET value_adjustment = (1.0 / 999999.99) WHERE name = 'Premium Beta';   -- ~0.000001
UPDATE booster_types SET value_adjustment = (1.0 / 20000.00) WHERE name = 'Premium Gamma';   -- ~0.00005

-- ELITE (R$ 5.00) - Antes: 0.12-999999 → Agora: 1/0.12 = 8.33
UPDATE booster_types SET value_adjustment = (1.0 / 0.12) WHERE name = 'Elite Alpha';      -- ~8.33 (alta = RTP baixo ✅)
UPDATE booster_types SET value_adjustment = (1.0 / 999999.99) WHERE name = 'Elite Beta';  -- ~0.000001
UPDATE booster_types SET value_adjustment = (1.0 / 999999.99) WHERE name = 'Elite Gamma'; -- ~0.000001

-- WHALE (R$ 10.00) - Antes: 0.01-999999 → Agora: 1/0.01 = 100
UPDATE booster_types SET value_adjustment = (1.0 / 0.01) WHERE name = 'Whale Alpha';      -- 100 (RTP baixíssimo ✅)
UPDATE booster_types SET value_adjustment = (1.0 / 999999.99) WHERE name = 'Whale Beta';  -- ~0.000001
UPDATE booster_types SET value_adjustment = (1.0 / 220.00) WHERE name = 'Whale Gamma';    -- ~0.0045

-- VERIFICATION
SELECT 
    name,
    price_brl,
    ROUND(value_adjustment::numeric, 8) as value_adj,
    CASE 
        WHEN value_adjustment > 1.0 THEN '🔽 DIVIDE (reduz valor)'
        WHEN value_adjustment < 0.01 THEN '🔼 DIVIDE MUITO (reduz muito)'
        ELSE '⚖️ DIVIDE POUCO'
    END as effect
FROM booster_types
ORDER BY price_brl, name;

-- TESTE COM LEGENDARY R$ 5.00:
-- Elite Alpha: R$ 5.00 / 8.33 = R$ 0.60 ✅
-- Whale Alpha: R$ 5.00 / 100 = R$ 0.05 ✅
-- Premium Alpha: R$ 5.00 / 0.0005 = R$ 10000 ❌ (Beta/Gamma perto de zero OK)
