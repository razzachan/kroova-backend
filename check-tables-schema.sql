-- Verificar colunas da tabela booster_types
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'booster_types'
ORDER BY ordinal_position;

-- Verificar colunas da tabela cards_base
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'cards_base'
ORDER BY ordinal_position;

-- Verificar colunas da tabela booster_openings
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'booster_openings'
ORDER BY ordinal_position;

-- Verificar colunas da tabela cards_instances
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'cards_instances'
ORDER BY ordinal_position;

-- Verificar colunas da tabela marketplace
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'marketplace'
ORDER BY ordinal_position;

-- Verificar colunas da tabela users
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users'
ORDER BY ordinal_position;
