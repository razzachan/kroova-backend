-- ============================================================================
-- AJUSTE ELITE E WHALE - Iteração 3
-- ============================================================================
-- Teste 2 de 30 boosters:
-- Elite: 149.0% RTP (MUITO ALTO, teve outlier 1576%)
-- Whale: 115.0% RTP (ALTO, teve outlier 584%)
--
-- AJUSTES:
-- Elite: 0.70 → 0.33 (149% → 70%)
-- Whale: 0.35 → 0.21 (115% → 70%)
-- ============================================================================

-- Elite: 0.70 → 0.33
UPDATE booster_types
SET value_adjustment = 0.33
WHERE price_brl = 5.00;

-- Whale: 0.35 → 0.21
UPDATE booster_types
SET value_adjustment = 0.21
WHERE price_brl = 10.00;

-- Verificação
SELECT 
  name,
  price_brl,
  value_adjustment,
  CASE 
    WHEN price_brl = 5.00 THEN '70% esperado (era 149%)'
    WHEN price_brl = 10.00 THEN '70% esperado (era 115%)'
  END as expected_rtp
FROM booster_types
WHERE price_brl IN (5.00, 10.00)
ORDER BY price_brl;
