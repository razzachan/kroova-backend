-- ==========================================================================
-- ITERAÇÃO 3 - AJUSTE FINAL (2025-12-07 10:04-10:08)
-- ==========================================================================
-- RESULTADOS DA ITERAÇÃO 2 (com values 0.26/1.28/2.23/0.57/0.76):
-- Básico:  66.7% RTP ✅ TARGET ATINGIDO! (manter 0.26)
-- Padrão:  55.3% RTP (6.5%-152% variância) → multiplicar por 0.83
-- Premium: 57.2% RTP → multiplicar por 0.85
-- Elite:   103.5% RTP (muito alto) → multiplicar por 1.54
-- Whale:   74.6% RTP → multiplicar por 1.11
-- ==========================================================================

BEGIN;

-- Básico: MANTER 0.26 ✅ (66.7% RTP - dentro do target!)

-- Padrão: 1.28 → 1.06 (redução de 17% para subir RTP de 55.3% → 67%)
UPDATE booster_types 
SET value_adjustment = 1.06 
WHERE name LIKE 'Padrão%';

-- Premium: 2.23 → 1.90 (redução de 15% para subir RTP de 57.2% → 67%)
UPDATE booster_types 
SET value_adjustment = 1.90 
WHERE name LIKE 'Premium%';

-- Elite: 0.57 → 0.88 (aumento de 54% para reduzir RTP de 103.5% → 67%)
UPDATE booster_types 
SET value_adjustment = 0.88 
WHERE name LIKE 'Elite%';

-- Whale: 0.76 → 0.84 (aumento de 11% para reduzir RTP de 74.6% → 67%)
UPDATE booster_types 
SET value_adjustment = 0.84 
WHERE name LIKE 'Whale%';

-- Verificar valores finais
SELECT 
  name,
  value_adjustment,
  CASE 
    WHEN name LIKE 'Básico%' THEN '0.26 ✅ MANTIDO'
    WHEN name LIKE 'Padrão%' THEN '1.06 (era 1.28)'
    WHEN name LIKE 'Premium%' THEN '1.90 (era 2.23)'
    WHEN name LIKE 'Elite%' THEN '0.88 (era 0.57)'
    WHEN name LIKE 'Whale%' THEN '0.84 (era 0.76)'
    ELSE 'N/A'
  END as esperado
FROM booster_types
WHERE name LIKE 'Básico%' 
   OR name LIKE 'Padrão%' 
   OR name LIKE 'Premium%' 
   OR name LIKE 'Elite%' 
   OR name LIKE 'Whale%'
ORDER BY 
  CASE 
    WHEN name LIKE 'Básico%' THEN 1
    WHEN name LIKE 'Padrão%' THEN 2
    WHEN name LIKE 'Premium%' THEN 3
    WHEN name LIKE 'Elite%' THEN 4
    WHEN name LIKE 'Whale%' THEN 5
  END,
  name;

COMMIT;

-- ==========================================================================
-- RESUMO ITERAÇÃO 3
-- ==========================================================================
-- Básico:  0.26 MANTIDO ✅ (66.7% RTP validado)
-- Padrão:  1.28 → 1.06 (-17%) para subir RTP de 55.3% → ~67%
-- Premium: 2.23 → 1.90 (-15%) para subir RTP de 57.2% → ~67%
-- Elite:   0.57 → 0.88 (+54%) para baixar RTP de 103.5% → ~67%
-- Whale:   0.76 → 0.84 (+11%) para baixar RTP de 74.6% → ~67%
--
-- CONVERGÊNCIA ESPERADA:
-- Com estes valores, esperamos:
-- - Básico: ~67% (validado)
-- - Padrão: ~67% (com menos variância)
-- - Premium: ~67%
-- - Elite: ~67%
-- - Whale: ~67%
--
-- Após esta iteração, devemos ter 4-5 tiers validados.
-- ==========================================================================
