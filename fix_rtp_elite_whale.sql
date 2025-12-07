-- ============================================================================
-- FIX RTP FINAL - ELITE E WHALE
-- ============================================================================
-- Baseado em teste de 100 boosters/tier (500 total, R$ 1850)
--
-- RESULTADOS:
-- ✅ Básico   (R$ 0.50): 69.4% RTP - OK
-- ✅ Padrão   (R$ 1.00): 72.5% RTP - OK
-- ✅ Premium  (R$ 2.00): 65.7% RTP - OK
-- ❌ Elite    (R$ 5.00): 98.9% RTP - MUITO ALTO (teve outlier 1386%)
-- ⚠️ Whale    (R$ 10.00): 62.7% RTP - BAIXO
-- ============================================================================

-- Elite: 0.42 → 0.30 (98.9% → 70%)
UPDATE booster_types
SET value_adjustment = 0.30
WHERE price_brl = 5.00;

-- Whale: 0.31 → 0.35 (62.7% → 70%)
UPDATE booster_types
SET value_adjustment = 0.35
WHERE price_brl = 10.00;

-- Verificação
SELECT 
  name,
  price_brl,
  value_adjustment,
  CASE 
    WHEN price_brl = 0.50 THEN '69.4% ✅'
    WHEN price_brl = 1.00 THEN '72.5% ✅'
    WHEN price_brl = 2.00 THEN '65.7% ✅'
    WHEN price_brl = 5.00 THEN '70% (esperado, era 98.9%)'
    WHEN price_brl = 10.00 THEN '70% (esperado, era 62.7%)'
  END as expected_rtp
FROM booster_types
WHERE price_brl IN (0.50, 1.00, 2.00, 5.00, 10.00)
ORDER BY price_brl;
