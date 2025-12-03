-- ============================================================================
-- PASSO 1: Adicionar coluna pack_id
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- ============================================================================

-- Verificar qual schema tem a tabela booster_types
SELECT table_schema, table_name 
FROM information_schema.tables 
WHERE table_name = 'booster_types';

-- Se não aparecer nada, verificar todas as tabelas disponíveis
SELECT table_schema, table_name 
FROM information_schema.tables 
WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
ORDER BY table_name;

-- Adicionar coluna (ajuste o schema se necessário - provavelmente 'public')
ALTER TABLE public.booster_types ADD COLUMN IF NOT EXISTS pack_id TEXT;
CREATE INDEX IF NOT EXISTS idx_booster_types_pack_id ON public.booster_types(pack_id);
COMMENT ON COLUMN public.booster_types.pack_id IS 'Identificador do pack (ED01_ALPHA, ED01_BETA, ED01_GAMMA)';

-- Verificar se foi criado
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'booster_types' AND column_name = 'pack_id';
