-- Verificar se o trigger existe
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_apply_tier_cap';

-- Verificar se a função existe
SELECT 
    proname as function_name,
    prosrc as function_code
FROM pg_proc 
WHERE proname = 'apply_tier_liquidity_cap';

-- Verificar schema de cards_instances
SELECT 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'cards_instances'
AND column_name IN ('id', 'liquidity_brl', 'base_id', 'owner_id', 'edition_id', 'skin')
ORDER BY ordinal_position;

-- Verificar últimas 5 cartas inseridas
SELECT 
    id,
    liquidity_brl,
    skin
FROM cards_instances
ORDER BY id DESC
LIMIT 5;
