-- ============================================================================
-- AJUSTE WHALE FINAL
-- ============================================================================
-- Teste 4 de 30 boosters:
-- Elite: 69.3% RTP ✅ PERFEITO!
-- Whale: 58.7% RTP (levemente baixo)
--
-- AJUSTE:
-- Elite: 0.42 [MANTER] ✅
-- Whale: 0.39 → 0.46 (58.7% → 70%)
-- ============================================================================

-- Elite: MANTER em 0.42 ✅

-- Whale: 0.39 → 0.46
UPDATE booster_types
SET value_adjustment = 0.46
WHERE price_brl = 10.00;

-- Verificação
SELECT 
  name,
  price_brl,
  value_adjustment,
  CASE 
    WHEN price_brl = 5.00 THEN '69.3% ✅'
    WHEN price_brl = 10.00 THEN '70% esperado (era 58.7%)'
  END as expected_rtp
FROM booster_types
WHERE price_brl IN (5.00, 10.00)
ORDER BY price_brl;
