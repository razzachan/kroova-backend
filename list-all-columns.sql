-- ============================================================================
-- SCRIPT SIMPLES: Listar todas as colunas das tabelas principais
-- ============================================================================

-- BOOSTER_TYPES
SELECT 'booster_types' as table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'booster_types'
ORDER BY ordinal_position;

-- CARDS_BASE
SELECT 'cards_base' as table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'cards_base'
ORDER BY ordinal_position;

-- BOOSTER_OPENINGS
SELECT 'booster_openings' as table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'booster_openings'
ORDER BY ordinal_position;

-- CARDS_INSTANCES
SELECT 'cards_instances' as table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'cards_instances'
ORDER BY ordinal_position;

-- MARKETPLACE
SELECT 'marketplace' as table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'marketplace'
ORDER BY ordinal_position;
