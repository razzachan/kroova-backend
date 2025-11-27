-- Adiciona cartas para o usuário akroma.julio@gmail.com
-- e cria listings no marketplace para outros verem

-- IDs conhecidos
-- akroma user_id: 15f2efb3-f1e6-4146-b35c-41d93f32d569
-- system seller_id: a64f7677-97a4-4b3f-8d06-4faf4ec7dc18

-- 1. Adiciona 3 cartas ao inventário do akroma (para ele ver na aba Cartas)
INSERT INTO cards_instances (base_id, owner_id, skin)
SELECT 
  cb.id,
  '15f2efb3-f1e6-4146-b35c-41d93f32d569',
  CASE 
    WHEN random() < 0.3 THEN 'neon'
    WHEN random() < 0.6 THEN 'glitch'
    ELSE 'default'
  END
FROM cards_base cb
WHERE cb.name IN ('Pixel Glitch', 'Meme Totem', 'Trend Catalyst')
LIMIT 3
ON CONFLICT DO NOTHING;

-- 2. Remove listings antigas do system seller
DELETE FROM market_listings 
WHERE seller_id = 'a64f7677-97a4-4b3f-8d06-4faf4ec7dc18';

-- 3. Remove cartas antigas do system seller
DELETE FROM cards_instances 
WHERE owner_id = 'a64f7677-97a4-4b3f-8d06-4faf4ec7dc18';

-- 4. Cria novas cartas para o system seller (marketplace)
WITH new_cards AS (
  INSERT INTO cards_instances (base_id, owner_id, skin)
  SELECT 
    cb.id,
    'a64f7677-97a4-4b3f-8d06-4faf4ec7dc18',
    (ARRAY['default', 'neon', 'glitch', 'ghost'])[floor(random() * 4 + 1)]
  FROM cards_base cb
  WHERE cb.name IN ('Pixel Glitch', 'Meme Totem', 'Trend Catalyst', 'Crown Signal')
  ORDER BY random()
  LIMIT 6
  RETURNING id, base_id
)
-- 5. Lista todas no marketplace
INSERT INTO market_listings (card_instance_id, seller_id, price_brl, status)
SELECT 
  nc.id,
  'a64f7677-97a4-4b3f-8d06-4faf4ec7dc18',
  cb.base_liquidity_brl * (0.8 + random() * 0.4), -- preço varia ±20%
  'active'
FROM new_cards nc
JOIN cards_base cb ON cb.id = nc.base_id;
