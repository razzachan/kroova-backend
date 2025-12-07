-- ============================================================================
-- FIX ELITE FINAL
-- ============================================================================
-- Teste de 30 boosters Elite: 30.2% RTP (MUITO BAIXO)
-- Teste de 30 boosters Whale: 68.6% RTP ✅ (PERFEITO)
--
-- AJUSTE NECESSÁRIO:
-- Elite: 0.30 → 0.70 (30.2% → 70%)
-- Whale: 0.35 [MANTER] (68.6% ✅)
-- ============================================================================

-- Elite: 0.30 → 0.70
UPDATE booster_types
SET value_adjustment = 0.70
WHERE price_brl = 5.00;

-- Verificação
SELECT 
  name,
  price_brl,
  value_adjustment,
  CASE 
    WHEN price_brl = 5.00 THEN '70% esperado (era 30.2%)'
    WHEN price_brl = 10.00 THEN '68.6% ✅'
  END as expected_rtp
FROM booster_types
WHERE price_brl IN (5.00, 10.00)
ORDER BY price_brl;
