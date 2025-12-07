-- ============================================================================
-- RECALIBRAÇÃO DE VALUE_ADJUSTMENT BASEADO NA SIMULAÇÃO RTP
-- ============================================================================
-- Target: 70% RTP (médio entre 65-75%)
-- Formula: new_value = current × (actual_RTP / target_RTP)
-- ============================================================================

BEGIN;

UPDATE booster_types SET value_adjustment = 2.74 * (138.1 / 70.0) WHERE name = 'Básico Alpha';      -- 5.41
UPDATE booster_types SET value_adjustment = 2.74 * (129.6 / 70.0) WHERE name = 'Básico Beta';       -- 5.07
UPDATE booster_types SET value_adjustment = 2.74 * (134.5 / 70.0) WHERE name = 'Básico Gamma';      -- 5.27

UPDATE booster_types SET value_adjustment = 2.39 * (76.2 / 70.0) WHERE name = 'Padrão Alpha';    -- 2.60
UPDATE booster_types SET value_adjustment = 2.39 * (85.4 / 70.0) WHERE name = 'Padrão Beta';     -- 2.91
UPDATE booster_types SET value_adjustment = 2.39 * (82.7 / 70.0) WHERE name = 'Padrão Gamma';    -- 2.82

UPDATE booster_types SET value_adjustment = 0.77 * (104.2 / 70.0) WHERE name = 'Premium Alpha';    -- 1.15
UPDATE booster_types SET value_adjustment = 0.77 * (151.5 / 70.0) WHERE name = 'Premium Beta';     -- 1.67
UPDATE booster_types SET value_adjustment = 0.77 * (119.0 / 70.0) WHERE name = 'Premium Gamma';    -- 1.31

UPDATE booster_types SET value_adjustment = 0.36 * (57.1 / 70.0) WHERE name = 'Elite Alpha';       -- 0.29
UPDATE booster_types SET value_adjustment = 0.36 * (151.1 / 70.0) WHERE name = 'Elite Beta';       -- 0.78
UPDATE booster_types SET value_adjustment = 0.36 * (200.3 / 70.0) WHERE name = 'Elite Gamma';      -- 1.03

UPDATE booster_types SET value_adjustment = 0.28 * (40.8 / 70.0) WHERE name = 'Whale Alpha';       -- 0.16
UPDATE booster_types SET value_adjustment = 0.28 * (260.6 / 70.0) WHERE name = 'Whale Beta';       -- 1.04
UPDATE booster_types SET value_adjustment = 0.28 * (102.2 / 70.0) WHERE name = 'Whale Gamma';      -- 0.41

-- Verificar novos valores
SELECT name, 
       ROUND(value_adjustment::numeric, 2) as new_value_adjustment, 
       price_brl
FROM booster_types
ORDER BY price_brl, name;

COMMIT;

-- ============================================================================
-- PRÓXIMO PASSO: Rodar test-new-rtp-system.py novamente para validar
-- ============================================================================
