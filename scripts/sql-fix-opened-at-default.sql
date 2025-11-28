-- FIX: Remover DEFAULT da coluna opened_at em booster_openings
-- Executar no Supabase Dashboard > SQL Editor

-- 1. Remover DEFAULT now()
ALTER TABLE booster_openings 
ALTER COLUMN opened_at DROP DEFAULT;

-- 2. Verificar resultado
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'booster_openings' 
  AND column_name = 'opened_at';

-- Resultado esperado: column_default = null
