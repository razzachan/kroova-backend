-- ============================================================================
-- AJUSTE ELITE E WHALE - Iteração 4
-- ============================================================================
-- Teste 3 de 30 boosters:
-- Elite: 54.4% RTP (baixo, teve outlier 246%)
-- Whale: 37.6% RTP (muito baixo, teve outlier 129%)
--
-- AJUSTES:
-- Elite: 0.33 → 0.42 (54.4% → 70%)
-- Whale: 0.21 → 0.39 (37.6% → 70%)
-- ============================================================================

-- Elite: 0.33 → 0.42
UPDATE booster_types
SET value_adjustment = 0.42
WHERE price_brl = 5.00;

-- Whale: 0.21 → 0.39
UPDATE booster_types
SET value_adjustment = 0.39
WHERE price_brl = 10.00;

-- Verificação
SELECT 
  name,
  price_brl,
  value_adjustment,
  CASE 
    WHEN price_brl = 5.00 THEN '70% esperado (era 54.4%)'
    WHEN price_brl = 10.00 THEN '70% esperado (era 37.6%)'
  END as expected_rtp
FROM booster_types
WHERE price_brl IN (5.00, 10.00)
ORDER BY price_brl;
