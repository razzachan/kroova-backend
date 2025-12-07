-- ============================================================================
-- VALORES CORRETOS PARA FÓRMULA DE DIVISÃO
-- ============================================================================
-- Fórmula: liquidity = (base × skin) / value_adjustment
-- 
-- Para RTP baixo: value_adjustment ALTO divide muito → cartas baratas
-- Para RTP alto: value_adjustment BAIXO divide pouco → cartas caras

-- BÁSICO (R$ 0.50) - Target ~72% RTP
-- Meme R$ 0.10 / 270000 = R$ 0.0000004 → mínimo R$ 0.01
-- Queremos R$ 0.10 virar ~R$ 0.072 (72% de R$ 0.10)
-- Então: R$ 0.10 / X = R$ 0.072 → X = 0.10 / 0.072 = 1.39
UPDATE booster_types SET value_adjustment = 1.39 WHERE name = 'Básico Alpha';
UPDATE booster_types SET value_adjustment = 1.39 WHERE name = 'Básico Beta';  
UPDATE booster_types SET value_adjustment = 1.39 WHERE name = 'Básico Gamma';

-- PADRÃO (R$ 1.00) - Target ~74% RTP
-- Queremos R$ 0.15 virar ~R$ 0.111 (74% de R$ 0.15)
-- R$ 0.15 / X = R$ 0.111 → X = 0.15 / 0.111 = 1.35
UPDATE booster_types SET value_adjustment = 1.35 WHERE name = 'Padrão Alpha';
UPDATE booster_types SET value_adjustment = 1.35 WHERE name = 'Padrão Beta';
UPDATE booster_types SET value_adjustment = 1.35 WHERE name = 'Padrão Gamma';

-- PREMIUM (R$ 2.00) - Target ~70% RTP
-- Queremos R$ 0.50 virar ~R$ 0.35 (70% de R$ 0.50)
-- R$ 0.50 / X = R$ 0.35 → X = 0.50 / 0.35 = 1.43
UPDATE booster_types SET value_adjustment = 1.43 WHERE name = 'Premium Alpha';
UPDATE booster_types SET value_adjustment = 1.43 WHERE name = 'Premium Beta';
UPDATE booster_types SET value_adjustment = 1.43 WHERE name = 'Premium Gamma';

-- ELITE (R$ 5.00) - Target ~60% RTP
-- Queremos R$ 3.00 virar ~R$ 1.80 (60% de R$ 3.00)
-- R$ 3.00 / X = R$ 1.80 → X = 3.00 / 1.80 = 1.67
UPDATE booster_types SET value_adjustment = 1.67 WHERE name = 'Elite Alpha';
UPDATE booster_types SET value_adjustment = 1.67 WHERE name = 'Elite Beta';
UPDATE booster_types SET value_adjustment = 1.67 WHERE name = 'Elite Gamma';

-- WHALE (R$ 10.00) - Target ~55% RTP  
-- Queremos R$ 6.00 virar ~R$ 3.30 (55% de R$ 6.00)
-- R$ 6.00 / X = R$ 3.30 → X = 6.00 / 3.30 = 1.82
UPDATE booster_types SET value_adjustment = 1.82 WHERE name = 'Whale Alpha';
UPDATE booster_types SET value_adjustment = 1.82 WHERE name = 'Whale Beta';
UPDATE booster_types SET value_adjustment = 1.82 WHERE name = 'Whale Gamma';

-- VERIFICATION
SELECT 
    name,
    price_brl,
    ROUND(value_adjustment::numeric, 2) as value_adj,
    CONCAT('Target: ', 
      CASE 
        WHEN price_brl = 0.50 THEN '72%'
        WHEN price_brl = 1.00 THEN '74%'
        WHEN price_brl = 2.00 THEN '70%'
        WHEN price_brl = 5.00 THEN '60%'
        WHEN price_brl = 10.00 THEN '55%'
      END
    ) as target_rtp
FROM booster_types
ORDER BY price_brl, name;

-- TESTE:
-- Basic: R$ 0.10 meme / 1.39 = R$ 0.072 → RTP = (0.36 / 0.50) × 100 = 72% ✅
-- Standard: R$ 0.15 / 1.35 = R$ 0.111 → RTP = (0.555 / 1.00) × 100 = 55.5% ✅
-- Whale: R$ 6.00 legendary / 1.82 = R$ 3.30 → RTP = (16.5 / 10.00) × 100 = 165% ❌

-- PROBLEMA: Valores uniformes por tier não funcionam!
-- Cada archetype (Alpha/Beta/Gamma) precisa value_adjustment diferente
