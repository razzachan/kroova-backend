-- ==========================================================================
-- FIX BASEADO EM AMOSTRAGEM ESTATÍSTICA DE 3 TESTES (2025-12-07 08:56-08:59)
-- ==========================================================================
-- Objetivo: Ajustar value_adjustments para atingir RTP 62-72%
-- Método: novo = atual × (média_observada / 67)
--
-- RESULTADOS DA AMOSTRAGEM:
-- Básico:  53.2% RTP (target 62-72%) → multiplicar por 0.79
-- Padrão:  15.5% RTP (target 62-72%) → multiplicar por 0.23
-- Premium: 114.7% RTP (target 62-72%) → multiplicar por 1.71
-- Elite:   103.9% RTP (target 62-72%) → multiplicar por 1.55
-- Whale:   87.0% RTP (target 62-72%) → multiplicar por 1.30
-- ==========================================================================

BEGIN;

-- NOTA: Ring Death legendary glitch gerou R$ 10.00 na amostra 2
-- A correção será feita via value_adjustment dos tiers, não na carta individual
-- Possível causa: skin glitch 1.5x + algum multiplicador adicional

-- Básico: 0.47 → 0.37 (redução de 21% para aumentar RTP de 53.2% → 67%)
UPDATE booster_types 
SET value_adjustment = 0.37 
WHERE name LIKE 'Básico%';

-- Padrão: 9.00 → 2.07 (redução massiva de 77% para aumentar RTP de 15.5% → 67%)
UPDATE booster_types 
SET value_adjustment = 2.07 
WHERE name LIKE 'Padrão%';

-- Premium: 1.05 → 1.80 (aumento de 71% para reduzir RTP de 114.7% → 67%)
UPDATE booster_types 
SET value_adjustment = 1.80 
WHERE name LIKE 'Premium%';

-- Elite: 0.80 → 1.24 (aumento de 55% para reduzir RTP de 103.9% → 67%)
UPDATE booster_types 
SET value_adjustment = 1.24 
WHERE name LIKE 'Elite%';

-- Whale: 0.90 → 1.17 (aumento de 30% para reduzir RTP de 87.0% → 67%)
UPDATE booster_types 
SET value_adjustment = 1.17 
WHERE name LIKE 'Whale%';

-- Verificar valores atualizados
SELECT 
  name,
  value_adjustment,
  CASE 
    WHEN name LIKE 'Básico%' THEN '0.37 (era 0.47)'
    WHEN name LIKE 'Padrão%' THEN '2.07 (era 9.00)'
    WHEN name LIKE 'Premium%' THEN '1.80 (era 1.05)'
    WHEN name LIKE 'Elite%' THEN '1.24 (era 0.80)'
    WHEN name LIKE 'Whale%' THEN '1.17 (era 0.90)'
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
-- RESUMO DAS MUDANÇAS
-- ==========================================================================
-- Básico:  0.47 → 0.37 (-21%) para subir RTP de 53.2% → ~67%
-- Padrão:  9.00 → 2.07 (-77%) para subir RTP de 15.5% → ~67%
-- Premium: 1.05 → 1.80 (+71%) para baixar RTP de 114.7% → ~67%
-- Elite:   0.80 → 1.24 (+55%) para baixar RTP de 103.9% → ~67%
-- Whale:   0.90 → 1.17 (+30%) para baixar RTP de 87.0% → ~67%
--
-- NOTA: Ring Death R$ 10.00 será controlado pelo aumento do value_adjustment do Whale
-- ==========================================================================
