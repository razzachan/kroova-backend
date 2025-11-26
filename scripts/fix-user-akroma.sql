-- ============================================
-- KROOVA - Criar usuário completo para akroma.julio@gmail.com
-- Execute no Supabase Dashboard > SQL Editor
-- ============================================

DO $$
DECLARE
  user_uuid UUID;
BEGIN
  -- Buscar o UUID do usuário no auth.users
  SELECT id INTO user_uuid 
  FROM auth.users 
  WHERE email = 'akroma.julio@gmail.com';
  
  IF user_uuid IS NULL THEN
    RAISE EXCEPTION 'Usuário akroma.julio@gmail.com não encontrado! Faça login no site primeiro.';
  END IF;
  
  RAISE NOTICE 'Usuário encontrado: %', user_uuid;
  
  -- 1. Deletar registros antigos se existirem
  DELETE FROM users WHERE id = user_uuid;
  DELETE FROM wallets WHERE user_id = user_uuid;
  
  -- 2. Criar registro na tabela users
  INSERT INTO users (id, display_id, email, name)
  VALUES (user_uuid, 'akroma', 'akroma.julio@gmail.com', 'Akroma Julio');
  
  RAISE NOTICE '✓ Registro users criado';
  
  -- 3. Criar wallet
  INSERT INTO wallets (user_id, balance_brl, balance_crypto)
  VALUES (user_uuid, 10000.00, 0);
  
  RAISE NOTICE '✓ Wallet criada com R$ 10.000,00';
  
END $$;

-- Verificar resultado completo
SELECT 
  au.id as auth_user_id,
  au.email as auth_email,
  au.created_at as conta_criada_em,
  u.id as users_id,
  u.display_id,
  u.email as users_email,
  u.name,
  w.balance_brl,
  w.balance_crypto,
  (SELECT COUNT(*) FROM cards_instances WHERE owner_id = au.id) as total_cartas
FROM auth.users au
LEFT JOIN users u ON au.id = u.id
LEFT JOIN wallets w ON au.id = w.user_id
WHERE au.email = 'akroma.julio@gmail.com';
