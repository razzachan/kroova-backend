-- ============================================================================
-- AJUSTE ULTRA FINO - Convergindo para 70%
-- ============================================================================
-- Teste 8 (50 boosters):
-- Elite: 75.3% RTP (apenas 5.3% acima, outlier 771%)
-- Whale: 87.6% RTP (17.6% acima, outlier 1321%)
--
-- AJUSTES:
-- Elite: 0.37 → 0.34 (75.3% → 70%)
-- Whale: 0.31 → 0.25 (87.6% → 70%)
-- ============================================================================

-- Elite: 0.37 → 0.34
UPDATE booster_types
SET value_adjustment = 0.34
WHERE price_brl = 5.00;

-- Whale: 0.31 → 0.25
UPDATE booster_types
SET value_adjustment = 0.25
WHERE price_brl = 10.00;

-- Verificação
SELECT 
  name,
  price_brl,
  value_adjustment,
  CASE 
    WHEN price_brl = 5.00 THEN '70% esperado (era 75.3%)'
    WHEN price_brl = 10.00 THEN '70% esperado (era 87.6%)'
  END as expected_rtp
FROM booster_types
WHERE price_brl IN (5.00, 10.00)
ORDER BY price_brl;
