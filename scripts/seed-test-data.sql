-- ============================================
-- KROOVA - Seed de Dados para Teste
-- Execute no Supabase Dashboard > SQL Editor
-- ============================================

-- Limpar dados existentes (cuidado em produção!)
-- DELETE FROM market_listings;
-- DELETE FROM user_inventory;
-- DELETE FROM cards_instances;
-- DELETE FROM transactions;
-- DELETE FROM booster_openings;

-- ========================================
-- 1. BOOSTER TYPES (Tipos de Pacotes)
-- ========================================
INSERT INTO booster_types (name, edition_id, price_brl, rarity_distribution, cards_per_booster)
VALUES 
  ('Booster Básico', 'edition-01', 25.00, '{"trash": 50, "meme": 30, "viral": 15, "legendary": 4, "godmode": 1}'::jsonb, 5),
  ('Booster Premium', 'edition-01', 75.00, '{"trash": 30, "meme": 30, "viral": 25, "legendary": 12, "godmode": 3}'::jsonb, 10),
  ('Booster Lendário', 'edition-01', 250.00, '{"trash": 20, "meme": 25, "viral": 30, "legendary": 20, "godmode": 5}'::jsonb, 15)
ON CONFLICT DO NOTHING;

-- ========================================
-- 2. CARDS BASE (Cartas Template - Edição 01)
-- ========================================
INSERT INTO cards_base (display_id, name, rarity, edition_id, base_liquidity_brl, description, metadata)
VALUES 
  -- Trash (comuns)
  ('card-001', 'Guerreiro Novato', 'trash', 'edition-01', 5.00, 'Sem habilidade especial', '{"energy": 2, "attack": 2, "defense": 2, "type": "creature", "artist": "Cesar Yudi"}'::jsonb),
  ('card-002', 'Arqueiro Ágil', 'trash', 'edition-01', 5.00, 'Atacante: Pode atacar diretamente', '{"energy": 3, "attack": 3, "defense": 1, "type": "creature", "artist": "Cesar Yudi"}'::jsonb),
  ('card-003', 'Mago Aprendiz', 'meme', 'edition-01', 10.00, 'Defensor: +1 defesa ao bloquear', '{"energy": 2, "attack": 1, "defense": 3, "type": "creature", "artist": "Cesar Yudi"}'::jsonb),
  ('card-004', 'Escudo de Luz', 'meme', 'edition-01', 10.00, 'Sua criatura ganha +0/+3 até o fim do turno', '{"energy": 1, "type": "spell", "artist": "Cesar Yudi"}'::jsonb),
  ('card-005', 'Golpe Rápido', 'meme', 'edition-01', 10.00, 'Causa 3 de dano a uma criatura', '{"energy": 2, "type": "spell", "artist": "Cesar Yudi"}'::jsonb),
  
  -- Viral (raras)
  ('card-006', 'Cavaleiro do Reino', 'viral', 'edition-01', 50.00, 'Vigilância: Não vira ao atacar', '{"energy": 4, "attack": 4, "defense": 4, "type": "creature", "artist": "Cesar Yudi"}'::jsonb),
  ('card-007', 'Feiticeira das Sombras', 'viral', 'edition-01', 50.00, 'Ao entrar: Destrua uma criatura com custo 3 ou menos', '{"energy": 5, "attack": 5, "defense": 3, "type": "creature", "artist": "Cesar Yudi"}'::jsonb),
  ('card-008', 'Espada Flamejante', 'viral', 'edition-01', 50.00, 'Criatura equipada ganha +3/+0 e Ímpeto', '{"energy": 3, "type": "artifact", "artist": "Cesar Yudi"}'::jsonb),
  
  -- Legendary (épicas)
  ('card-009', 'Dragão Ancião', 'legendary', 'edition-01', 250.00, 'Voar, Ímpeto. Ao atacar: causa 3 de dano ao oponente', '{"energy": 7, "attack": 7, "defense": 7, "type": "creature", "artist": "Cesar Yudi"}'::jsonb),
  ('card-010', 'Portal Dimensional', 'legendary', 'edition-01', 250.00, 'Procure até 3 cartas no seu deck e adicione à mão', '{"energy": 6, "type": "spell", "artist": "Cesar Yudi"}'::jsonb),
  
  -- Godmode (lendárias)
  ('card-011', 'Kroova, o Guardião', 'godmode', 'edition-01', 2500.00, 'Imortal. Não pode ser destruído. Regenera ao fim do turno', '{"energy": 10, "attack": 10, "defense": 10, "type": "creature", "artist": "Cesar Yudi"}'::jsonb),
  ('card-012', 'Apocalipse', 'godmode', 'edition-01', 2500.00, 'Destrói todas as cartas no campo. Não pode ser cancelado', '{"energy": 8, "type": "spell", "artist": "Cesar Yudi"}'::jsonb)
ON CONFLICT (display_id) DO UPDATE SET
  name = EXCLUDED.name,
  rarity = EXCLUDED.rarity,
  base_liquidity_brl = EXCLUDED.base_liquidity_brl,
  description = EXCLUDED.description,
  metadata = EXCLUDED.metadata;

-- ========================================
-- 3. CARDS INSTANCES (Cartas Mintadas)
-- ========================================
-- Criar algumas instâncias de cartas sem dono (para marketplace)
INSERT INTO cards_instances (base_id, owner_id, skin, minted_at)
SELECT 
  cb.id,
  NULL,
  'default',
  NOW()
FROM cards_base cb
WHERE cb.display_id IN ('card-001', 'card-002', 'card-003', 'card-006', 'card-007', 'card-008', 'card-009', 'card-010', 'card-011', 'card-012');

-- ========================================
-- 4. MARKET LISTINGS (Cartas no Marketplace)
-- ========================================
-- Criar um usuário sistema temporário para ser o vendedor
DO $$
DECLARE
  system_user_id UUID;
  card_rec RECORD;
BEGIN
  -- Verificar se já existe um usuário sistema
  SELECT id INTO system_user_id FROM users WHERE email = 'system@kroova.com';
  
  -- Se não existe, criar
  IF system_user_id IS NULL THEN
    INSERT INTO users (display_id, email, name)
    VALUES ('SYSTEM', 'system@kroova.com', 'Sistema Kroova')
    RETURNING id INTO system_user_id;
    
    INSERT INTO wallets (user_id, balance_brl)
    VALUES (system_user_id, 999999.00);
  END IF;
  
  -- Atribuir as cartas ao usuário sistema
  UPDATE cards_instances 
  SET owner_id = system_user_id 
  WHERE owner_id IS NULL;
  
  -- Criar listings no marketplace (limite 8 cartas)
  FOR card_rec IN (
    SELECT ci.id as instance_id, cb.display_id, cb.base_liquidity_brl
    FROM cards_instances ci
    JOIN cards_base cb ON ci.base_id = cb.id
    WHERE ci.owner_id = system_user_id
    LIMIT 8
  ) LOOP
    INSERT INTO market_listings (seller_id, card_instance_id, price_brl, status)
    VALUES (system_user_id, card_rec.instance_id, card_rec.base_liquidity_brl, 'active');
  END LOOP;
END $$;

-- ========================================
-- 5. Verificação dos Dados
-- ========================================
SELECT 'Booster Types' AS tabela, COUNT(*) AS total FROM booster_types
UNION ALL
SELECT 'Cards Base' AS tabela, COUNT(*) AS total FROM cards_base
UNION ALL
SELECT 'Cards Instances' AS tabela, COUNT(*) AS total FROM cards_instances
UNION ALL
SELECT 'Market Listings' AS tabela, COUNT(*) AS total FROM market_listings;

-- Ver cartas no marketplace com detalhes
SELECT 
  ml.id AS listing_id,
  cb.name AS card_name,
  cb.rarity,
  ml.price_brl,
  cb.display_id
FROM market_listings ml
JOIN cards_instances ci ON ml.card_instance_id = ci.id
JOIN cards_base cb ON ci.base_id = cb.id
WHERE ml.status = 'active'
ORDER BY ml.price_brl DESC;
