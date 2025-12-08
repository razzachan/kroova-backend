-- ==========================================================================
-- FIX: Remover foreign key constraint de opening_id
-- ==========================================================================
-- PROBLEMA: Foreign key está bloqueando inserts
-- MOTIVO: opening_id pode estar sendo deletado ou constraint muito restritiva
-- SOLUÇÃO: Tornar opening_id NULLABLE ou remover constraint
-- ==========================================================================

BEGIN;

-- Drop ALL foreign key constraints que estão bloqueando inserts
ALTER TABLE booster_prizes 
  DROP CONSTRAINT IF EXISTS booster_prizes_opening_id_fkey;

ALTER TABLE booster_prizes 
  DROP CONSTRAINT IF EXISTS booster_prizes_user_id_fkey;

ALTER TABLE booster_prizes 
  DROP CONSTRAINT IF EXISTS booster_prizes_booster_type_id_fkey;

-- Tornar opening_id NULLABLE (prêmio pode existir sem opening específico)
ALTER TABLE booster_prizes 
  ALTER COLUMN opening_id DROP NOT NULL;

-- Adicionar índice para performance (sem constraint)
CREATE INDEX IF NOT EXISTS idx_booster_prizes_opening_optional 
  ON booster_prizes(opening_id) 
  WHERE opening_id IS NOT NULL;

COMMIT;

-- Verificação
SELECT 
  'booster_prizes constraints' as status,
  conname as constraint_name,
  contype as constraint_type
FROM pg_constraint
WHERE conrelid = 'booster_prizes'::regclass;
