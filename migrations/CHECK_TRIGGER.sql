-- Verificar se o trigger existe
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'trigger_apply_tier_cap';

-- Verificar a função
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'apply_tier_liquidity_cap';
