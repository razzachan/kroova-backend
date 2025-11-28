-- Verificar schema e tabela existente
SELECT 
  schemaname,
  tablename
FROM pg_tables
WHERE tablename LIKE '%booster%' OR tablename LIKE '%opening%';

-- Verificar colunas da tabela (pode estar em schema diferente)
SELECT 
  table_schema,
  table_name,
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name LIKE '%booster%opening%' OR table_name = 'booster_openings';
