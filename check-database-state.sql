-- ============================================================================
-- DIAGNÓSTICO: VERIFICAR ESTADO ATUAL DA DATABASE
-- ============================================================================

-- 1. Verificar colunas existentes em cards_base
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'cards_base'
ORDER BY ordinal_position;

-- 2. Verificar quantos boosters existem
SELECT COUNT(*) as total_boosters
FROM booster_types;

-- 3. Verificar distribuição de raridades
SELECT rarity, COUNT(*) as total,
       ROUND(MIN(base_liquidity_brl)::numeric, 4) as min_price,
       ROUND(MAX(base_liquidity_brl)::numeric, 4) as max_price
FROM cards_base
GROUP BY rarity
ORDER BY 
  CASE rarity 
    WHEN 'trash' THEN 1
    WHEN 'meme' THEN 2
    WHEN 'viral' THEN 3
    WHEN 'legendary' THEN 4
    WHEN 'godmode' THEN 5
  END;

-- 4. Verificar se treatment_config existe
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('card_treatments', 'treatment_config');

-- 5. Listar todos os boosters atuais
SELECT id, name, price_brl
FROM booster_types
ORDER BY price_brl;
