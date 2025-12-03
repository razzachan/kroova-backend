-- Alterar colunas de scores para NUMERIC com 1 casa decimal
-- Permite valores como 14.5, 37.8, etc para máxima variação

ALTER TABLE public.cards_base 
  ALTER COLUMN influence_score TYPE NUMERIC(4,1),
  ALTER COLUMN rarity_score TYPE NUMERIC(4,1);

-- Verificar alteração
SELECT 
  column_name,
  data_type,
  numeric_precision,
  numeric_scale
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'cards_base'
  AND column_name IN ('influence_score', 'rarity_score');

