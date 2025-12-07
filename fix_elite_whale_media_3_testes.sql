-- ============================================================================
-- AJUSTE FINAL ELITE E WHALE - Baseado em média de 3 testes
-- ============================================================================
-- A variância dos godmodes causa oscilações extremas (outliers 874%-1229%)
-- Solução: usar média dos últimos 3 testes para estabilizar
--
-- ELITE (30 boosters × 3 testes = 90 boosters):
--   Teste 3: 54.4% RTP (val_adj: 0.33)
--   Teste 4: 69.3% RTP ✅ (val_adj: 0.42)
--   Teste 5: 104.2% RTP (val_adj: 0.42)
--   MÉDIA: 75.9% RTP
--
-- WHALE (30 boosters × 3 testes = 90 boosters):
--   Teste 3: 37.6% RTP (val_adj: 0.21)
--   Teste 4: 58.7% RTP (val_adj: 0.39)
--   Teste 5: 132.6% RTP (val_adj: 0.46)
--   MÉDIA: 76.3% RTP
--
-- AJUSTES FINAIS:
-- Elite: 0.42 → 0.39 (75.9% média → 70%)
-- Whale: 0.46 → 0.42 (76.3% média → 70%)
-- ============================================================================

-- Elite: 0.42 → 0.39
UPDATE booster_types
SET value_adjustment = 0.39
WHERE price_brl = 5.00;

-- Whale: 0.46 → 0.42
UPDATE booster_types
SET value_adjustment = 0.42
WHERE price_brl = 10.00;

-- Verificação
SELECT 
  name,
  price_brl,
  value_adjustment,
  CASE 
    WHEN price_brl = 5.00 THEN '70% esperado (média de 3 testes: 75.9%)'
    WHEN price_brl = 10.00 THEN '70% esperado (média de 3 testes: 76.3%)'
  END as expected_rtp
FROM booster_types
WHERE price_brl IN (5.00, 10.00)
ORDER BY price_brl;
