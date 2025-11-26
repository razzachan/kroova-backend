-- Check RLS status for all tables
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('users', 'wallets', 'user_inventory', 'cards_instances', 'market_listings', 'transactions', 'booster_openings')
ORDER BY tablename;

-- Check existing policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
