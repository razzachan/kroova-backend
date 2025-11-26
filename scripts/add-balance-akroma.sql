-- ============================================
-- KROOVA - Adicionar Saldo para Teste
-- Execute no Supabase Dashboard > SQL Editor
-- ============================================

-- Buscar o user_id da conta akroma.julio@gmail.com
DO $$
DECLARE
  user_uuid UUID;
  wallet_exists BOOLEAN;
BEGIN
  -- Buscar o UUID do usuário no auth.users
  SELECT id INTO user_uuid 
  FROM auth.users 
  WHERE email = 'akroma.julio@gmail.com';
  
  IF user_uuid IS NULL THEN
    RAISE NOTICE 'Usuário akroma.julio@gmail.com não encontrado!';
    RAISE NOTICE 'Crie uma conta no site primeiro: https://frontend-6lxaipjgp-razzachans-projects.vercel.app/login';
  ELSE
    RAISE NOTICE 'Usuário encontrado: %', user_uuid;
    
    -- Verificar se já existe wallet
    SELECT EXISTS(SELECT 1 FROM wallets WHERE user_id = user_uuid) INTO wallet_exists;
    
    IF NOT wallet_exists THEN
      -- Criar wallet
      INSERT INTO wallets (user_id, balance_brl)
      VALUES (user_uuid, 5000.00);
      RAISE NOTICE 'Wallet criada com R$ 5.000,00';
    ELSE
      -- Atualizar saldo
      UPDATE wallets 
      SET balance_brl = balance_brl + 5000.00
      WHERE user_id = user_uuid;
      RAISE NOTICE 'Saldo adicionado! Novo total: R$ %', (SELECT balance_brl FROM wallets WHERE user_id = user_uuid);
    END IF;
    
    -- Verificar se existe registro na tabela users (não auth.users)
    IF NOT EXISTS(SELECT 1 FROM users WHERE id = user_uuid) THEN
      INSERT INTO users (id, display_id, email, name)
      VALUES (user_uuid, 'akroma', 'akroma.julio@gmail.com', 'Akroma Julio');
      RAISE NOTICE 'Registro de usuário criado na tabela users';
    END IF;
  END IF;
END $$;

-- Verificar resultado
SELECT 
  u.email,
  u.name,
  w.balance_brl AS saldo_reais,
  w.balance_crypto AS saldo_crypto
FROM auth.users au
LEFT JOIN users u ON au.id = u.id
LEFT JOIN wallets w ON au.id = w.user_id
WHERE au.email = 'akroma.julio@gmail.com';
