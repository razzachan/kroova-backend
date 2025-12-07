-- Verificar schema da tabela cards_instances
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'cards_instances'
ORDER BY ordinal_position;

-- Verificar se o trigger existe
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement,
    action_timing
FROM information_schema.triggers
WHERE event_object_table = 'cards_instances';

-- Testar trigger manualmente
DO $$
DECLARE
    test_value NUMERIC := 15.88;
BEGIN
    RAISE NOTICE 'Testando trigger com valor %', test_value;
    
    IF test_value > 7.00 THEN
        test_value := 7.00;
        RAISE NOTICE 'Cappado para %', test_value;
    ELSIF test_value > 3.50 THEN
        test_value := 3.50;
        RAISE NOTICE 'Cappado para %', test_value;
    END IF;
    
    RAISE NOTICE 'Valor final: %', test_value;
END $$;
