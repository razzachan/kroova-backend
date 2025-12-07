-- ============================================================================
-- AJUSTE FINO FINAL - Baseado em 50 boosters cada
-- ============================================================================
-- Teste de validação com 50 boosters:
-- Elite: 77.7% RTP (7.7% acima, outlier 1235%)
-- Whale: 80.5% RTP (10.5% acima, outlier 492%)
--
-- AJUSTES FINAIS:
-- Elite: 0.39 → 0.35 (77.7% → 70%)
-- Whale: 0.42 → 0.37 (80.5% → 70%)
-- ============================================================================

-- Elite: 0.39 → 0.35
UPDATE booster_types
SET value_adjustment = 0.35
WHERE price_brl = 5.00;

-- Whale: 0.42 → 0.37
UPDATE booster_types
SET value_adjustment = 0.37
WHERE price_brl = 10.00;

-- Verificação
SELECT 
  name,
  price_brl,
  value_adjustment,
  CASE 
    WHEN price_brl = 5.00 THEN '70% esperado (era 77.7%)'
    WHEN price_brl = 10.00 THEN '70% esperado (era 80.5%)'
  END as expected_rtp
FROM booster_types
WHERE price_brl IN (5.00, 10.00)
ORDER BY price_brl;
