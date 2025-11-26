-- 🌱 KROOVA Database Seeds
-- Dados iniciais para desenvolvimento

-- ============================================
-- 1. BOOSTER TYPES (Edição 01)
-- ============================================

INSERT INTO booster_types (
  id,
  name,
  edition_id,
  price_brl,
  price_crypto,
  rarity_distribution,
  cards_per_booster
) VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    'Booster Urbano',
    'ED01',
    0.50,
    NULL,
    '{"trash": 70.85, "meme": 20, "viral": 8, "legendary": 1, "godmode": 0.15}'::jsonb,
    5
  );

-- ============================================
-- 2. CARDS BASE (Exemplos da Edição 01)
-- ============================================

INSERT INTO cards_base (
  id,
  display_id,
  name,
  description,
  rarity,
  archetype,
  base_liquidity_brl,
  base_liquidity_crypto,
  edition_id,
  image_url,
  metadata
) VALUES
  (
    '10000000-0000-0000-0000-000000000001',
    'KRV-001',
    'Crocodile Trader',
    'Reptiliano que manipula mercados como quem troca peles.',
    'legendary',
    'Ganância Digital',
    5.00,
    NULL,
    'ED01',
    NULL,
    '{"rarity_value": 88, "trend": 92, "influence": 87}'::jsonb
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    'KRV-002',
    'Influencer Specter',
    'Aparece só quando ninguém olha — e cresce quando ignorado.',
    'legendary',
    'Influência Fantasma',
    4.50,
    NULL,
    'ED01',
    NULL,
    '{"rarity_value": 85, "trend": 90, "influence": 95}'::jsonb
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    'KRV-003',
    'Bug Prophet',
    'Mensagens corrompidas que viram profecias auto-realizáveis.',
    'viral',
    'Erro Sagrado',
    1.50,
    NULL,
    'ED01',
    NULL,
    '{"rarity_value": 72, "trend": 78, "influence": 80}'::jsonb
  ),
  (
    '10000000-0000-0000-0000-000000000004',
    'KRV-004',
    'Feed Oracle',
    'Ela sabe o que você quer antes de você desejar.',
    'legendary',
    'Deusa da Recomendação',
    6.00,
    NULL,
    'ED01',
    NULL,
    '{"rarity_value": 92, "trend": 95, "influence": 98}'::jsonb
  ),
  (
    '10000000-0000-0000-0000-000000000005',
    'KRV-005',
    'Click Parasite',
    'Vive grudado na sua curiosidade e monetiza seu impulso.',
    'meme',
    'Computação Biológica',
    0.50,
    NULL,
    'ED01',
    NULL,
    '{"rarity_value": 45, "trend": 65, "influence": 55}'::jsonb
  ),
  (
    '10000000-0000-0000-0000-000000000006',
    'KRV-006',
    'Scroll Zombie',
    'Morto-vivo digital que rola infinitamente.',
    'trash',
    'Preguiça Digital',
    0.10,
    NULL,
    'ED01',
    NULL,
    '{"rarity_value": 15, "trend": 30, "influence": 25}'::jsonb
  );

-- ============================================
-- 3. USUÁRIO DE TESTE (Desenvolvimento)
-- ============================================

-- Nota: Em produção, usuários são criados via Supabase Auth
-- Este é apenas para testes locais

INSERT INTO users (
  id,
  display_id,
  email,
  name,
  cpf,
  cpf_verified
) VALUES
  (
    '20000000-0000-0000-0000-000000000001',
    'usr_dev001',
    'dev@krouva.local', -- transição de marca
    'Dev User',
    '00000000000',
    TRUE
  );

-- ============================================
-- 4. WALLET DO USUÁRIO DE TESTE
-- ============================================

INSERT INTO wallets (
  id,
  user_id,
  balance_brl,
  balance_crypto
) VALUES
  (
    '30000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    100.00,
    0.00000000
  );

-- ============================================
-- FIM DOS SEEDS
-- ============================================
