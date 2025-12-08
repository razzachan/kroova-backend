-- ==========================================================================
-- ITERAÇÃO 2 - AJUSTE BASEADO EM 3 AMOSTRAS PÓS-DEPLOY (2025-12-07 09:45-09:57)
-- ==========================================================================
-- Objetivo: Corrigir value_adjustments para atingir RTP 62-72%
-- Método: novo = atual × (média_observada / 67)
--
-- RESULTADOS DA ITERAÇÃO 1 (com values 0.37/2.07/1.80/1.24/1.17):
-- Básico:  46.8% RTP (target 62-72%) → multiplicar por 0.70
-- Padrão:  41.5% RTP (target 62-72%) → multiplicar por 0.62
-- Premium: 83.3% RTP (target 62-72%) → multiplicar por 1.24
-- Elite:   31.1% RTP (target 62-72%) → multiplicar por 0.46
-- Whale:   43.5% RTP (target 62-72%) → multiplicar por 0.65
-- ==========================================================================

BEGIN;

-- Básico: 0.37 → 0.26 (redução de 30% para aumentar RTP de 46.8% → 67%)
UPDATE booster_types 
SET value_adjustment = 0.26 
WHERE name LIKE 'Básico%';

-- Padrão: 2.07 → 1.28 (redução de 38% para aumentar RTP de 41.5% → 67%)
UPDATE booster_types 
SET value_adjustment = 1.28 
WHERE name LIKE 'Padrão%';

-- Premium: 1.80 → 2.23 (aumento de 24% para reduzir RTP de 83.3% → 67%)
UPDATE booster_types 
SET value_adjustment = 2.23 
WHERE name LIKE 'Premium%';

-- Elite: 1.24 → 0.57 (redução de 54% para aumentar RTP de 31.1% → 67%)
UPDATE booster_types 
SET value_adjustment = 0.57 
WHERE name LIKE 'Elite%';

-- Whale: 1.17 → 0.76 (redução de 35% para aumentar RTP de 43.5% → 67%)
UPDATE booster_types 
SET value_adjustment = 0.76 
WHERE name LIKE 'Whale%';

-- Verificar valores atualizados
SELECT 
  name,
  value_adjustment,
  CASE 
    WHEN name LIKE 'Básico%' THEN '0.26 (era 0.37)'
    WHEN name LIKE 'Padrão%' THEN '1.28 (era 2.07)'
    WHEN name LIKE 'Premium%' THEN '2.23 (era 1.80)'
    WHEN name LIKE 'Elite%' THEN '0.57 (era 1.24)'
    WHEN name LIKE 'Whale%' THEN '0.76 (era 1.17)'
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
-- RESUMO DAS MUDANÇAS (ITERAÇÃO 2)
-- ==========================================================================
-- Básico:  0.37 → 0.26 (-30%) para subir RTP de 46.8% → ~67%
-- Padrão:  2.07 → 1.28 (-38%) para subir RTP de 41.5% → ~67%
-- Premium: 1.80 → 2.23 (+24%) para baixar RTP de 83.3% → ~67%
-- Elite:   1.24 → 0.57 (-54%) para subir RTP de 31.1% → ~67%
-- Whale:   1.17 → 0.76 (-35%) para subir RTP de 43.5% → ~67%
--
-- OBSERVAÇÕES:
-- - Elite teve RTP muito baixo (31.1%) - necessita redução agressiva
-- - Whale com distribuição errada (5 virais, 0 legendaries) - mas value_adjustment corrigirá
-- - Premium teve spike de 130% em 1 amostra (2 legendaries) mas média ok
-- ==========================================================================
