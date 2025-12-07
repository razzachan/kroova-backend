-- ============================================================================
-- AJUSTE FINAL DEFINITIVO - Baseado em 230 boosters por tier
-- ============================================================================
-- PROBLEMA: Godmodes criam outliers extremos (755%-1568%) causando variância alta
-- SOLUÇÃO: Usar média de TODOS os testes (7 rodadas, 230 boosters cada)
--
-- ELITE (230 boosters em 7 testes):
--   30.2%, 54.4%, 69.3%, 104.2%, 77.7%, 56.6%
--   MÉDIA GERAL: 65.4% RTP
--   Ajuste: 0.35 → 0.37
--
-- WHALE (230 boosters em 7 testes):
--   68.6%, 37.6%, 58.7%, 132.6%, 115.0%, 80.5%, 96.6%
--   MÉDIA GERAL: 84.2% RTP
--   Ajuste: 0.37 → 0.31
--
-- INVESTIMENTO TOTAL: ~R$ 3.450 em testes
-- ============================================================================

-- Elite: 0.35 → 0.37
UPDATE booster_types
SET value_adjustment = 0.37
WHERE price_brl = 5.00;

-- Whale: 0.37 → 0.31
UPDATE booster_types
SET value_adjustment = 0.31
WHERE price_brl = 10.00;

-- Verificação
SELECT 
  name,
  price_brl,
  value_adjustment,
  CASE 
    WHEN price_brl = 5.00 THEN '70% esperado (média 230 boosters: 65.4%)'
    WHEN price_brl = 10.00 THEN '70% esperado (média 230 boosters: 84.2%)'
  END as expected_rtp
FROM booster_types
WHERE price_brl IN (5.00, 10.00)
ORDER BY price_brl;

-- ============================================================================
-- RESUMO FINAL DE TODOS OS TIERS
-- ============================================================================
SELECT 
  CASE 
    WHEN price_brl = 0.50 THEN 'Básico'
    WHEN price_brl = 1.00 THEN 'Padrão'
    WHEN price_brl = 2.00 THEN 'Premium'
    WHEN price_brl = 5.00 THEN 'Elite'
    WHEN price_brl = 10.00 THEN 'Whale'
  END as tier,
  price_brl,
  value_adjustment,
  CASE 
    WHEN price_brl = 0.50 THEN '69.4% ✅'
    WHEN price_brl = 1.00 THEN '72.5% ✅'
    WHEN price_brl = 2.00 THEN '65.7% ✅'
    WHEN price_brl = 5.00 THEN '70% (esperado)'
    WHEN price_brl = 10.00 THEN '70% (esperado)'
  END as rtp_status
FROM booster_types
WHERE price_brl IN (0.50, 1.00, 2.00, 5.00, 10.00)
ORDER BY price_brl;
