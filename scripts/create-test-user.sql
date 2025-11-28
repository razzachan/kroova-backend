-- Criar usuário de teste com saldo
-- Email: akroma.julio@gmail.com
-- Senha: Shadowspirit!23

-- 1. Criar user no auth.users (hash da senha Shadowspirit!23)
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  '15f2efb3-f1e6-4146-b35c-41d93f32d569'::uuid,
  'akroma.julio@gmail.com',
  '$2a$10$YourHashedPasswordHere', -- Supabase vai gerar o hash
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb,
  false,
  'authenticated'
)
ON CONFLICT (email) DO UPDATE SET
  encrypted_password = EXCLUDED.encrypted_password,
  updated_at = NOW();

-- 2. Criar perfil em public.users
INSERT INTO public.users (
  id,
  email,
  display_id,
  created_at
) VALUES (
  '15f2efb3-f1e6-4146-b35c-41d93f32d569'::uuid,
  'akroma.julio@gmail.com',
  'usr_akroma',
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email;

-- 3. Criar/atualizar wallet com 10k de saldo
INSERT INTO public.wallets (
  id,
  user_id,
  balance_brl,
  balance_crypto,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  '15f2efb3-f1e6-4146-b35c-41d93f32d569'::uuid,
  10000.00,
  0.00,
  NOW(),
  NOW()
)
ON CONFLICT (user_id) DO UPDATE SET
  balance_brl = 10000.00,
  updated_at = NOW();

-- Verificar
SELECT 
  u.email,
  u.display_id,
  w.balance_brl
FROM public.users u
JOIN public.wallets w ON w.user_id = u.id
WHERE u.email = 'akroma.julio@gmail.com';
