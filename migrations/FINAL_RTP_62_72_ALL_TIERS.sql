-- ============================================================================
-- CALIBRAÇÃO FINAL RTP 62-72% MÉDIA POR TIER (COM CAP POR TIER)
-- ============================================================================
-- Fórmula: liquidity = (base × skin) / value_adjustment
-- NOVO: liquidity = Math.min(calculatedLiquidity, MAX_BY_TIER)
-- 
-- LIMIAR: RTP médio entre Alpha/Beta/Gamma de cada tier = 62-72%
-- 
-- value_adjustment ALTO = RTP BAIXO (divide mais, cartas mais baratas)
-- value_adjustment BAIXO = RTP ALTO (divide menos, cartas mais caras)
--
-- CAPS POR TIER (implementado no código):
-- Básico: R$ 0.40 max/carta | Padrão: R$ 0.70 max/carta | Premium: R$ 1.50 max/carta
-- Elite: R$ 3.50 max/carta | Whale: R$ 7.00 max/carta

-- ============================================================================
-- BÁSICO (R$ 0.50) - RTP médio target: 67% - CAP R$ 0.40/carta
-- ============================================================================
-- Com CAP, podemos usar valor médio sem medo de outliers
UPDATE booster_types SET value_adjustment = 0.50 WHERE name = 'Básico Alpha';
UPDATE booster_types SET value_adjustment = 0.50 WHERE name = 'Básico Beta';  
UPDATE booster_types SET value_adjustment = 0.50 WHERE name = 'Básico Gamma';

-- ============================================================================
-- PADRÃO (R$ 1.00) - RTP médio target: 67% - CAP R$ 0.70/carta
-- ============================================================================
-- Com CAP, virais não explodem mais para R$ 2.16
UPDATE booster_types SET value_adjustment = 0.25 WHERE name = 'Padrão Alpha';
UPDATE booster_types SET value_adjustment = 0.25 WHERE name = 'Padrão Beta';
UPDATE booster_types SET value_adjustment = 0.25 WHERE name = 'Padrão Gamma';

-- ============================================================================
-- PREMIUM (R$ 2.00) - RTP médio target: 67% - CAP R$ 1.50/carta
-- ============================================================================
-- Com CAP, legendaries não explodem mais para R$ 2.08
UPDATE booster_types SET value_adjustment = 0.80 WHERE name = 'Premium Alpha';
UPDATE booster_types SET value_adjustment = 0.80 WHERE name = 'Premium Beta';
UPDATE booster_types SET value_adjustment = 0.80 WHERE name = 'Premium Gamma';

-- ============================================================================
-- ELITE (R$ 5.00) - RTP médio target: 67% - CAP R$ 3.50/carta
-- ============================================================================
-- Com CAP, godmodes não explodem mais para R$ 25.71!
UPDATE booster_types SET value_adjustment = 2.0 WHERE name = 'Elite Alpha';
UPDATE booster_types SET value_adjustment = 2.0 WHERE name = 'Elite Beta';
UPDATE booster_types SET value_adjustment = 2.0 WHERE name = 'Elite Gamma';

-- ============================================================================
-- WHALE (R$ 10.00) - RTP médio target: 67% - CAP R$ 7.00/carta
-- ============================================================================
-- Com CAP, skins raros (ghost 1.5x) não explodem mais
UPDATE booster_types SET value_adjustment = 0.50 WHERE name = 'Whale Alpha';
UPDATE booster_types SET value_adjustment = 0.50 WHERE name = 'Whale Beta';
UPDATE booster_types SET value_adjustment = 0.50 WHERE name = 'Whale Gamma';

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================
SELECT 
    SUBSTRING(name, 1, POSITION(' ' IN name) - 1) as tier,
    COUNT(*) as boosters,
    ROUND(AVG(value_adjustment)::numeric, 2) as avg_adjustment,
    CONCAT('Target: 62-72% RTP médio') as target
FROM booster_types
GROUP BY SUBSTRING(name, 1, POSITION(' ' IN name) - 1)
ORDER BY MIN(price_brl);

-- ============================================================================
-- LÓGICA DOS AJUSTES (baseado em 3 rodadas de testes)
-- ============================================================================
-- BÁSICO: 5.0→10% (mínimo R$ 0.01) → 1.5 (cartas mais caras) ✅
-- PADRÃO: 1.30→5.7% (mínimo R$ 0.01) → 1.15 (cartas mais caras) ✅
-- PREMIUM: 1.85→132.8% (2 legendaries) → 2.0 (controlar) ✅
-- ELITE: 2.70→39.3% (muito baixo) → 2.0 (meio termo entre 1.67 e 2.70) ✅
-- WHALE: 1.45→141.2% (2x Philanthro+) → 1.8 (controlar high-value) ✅
