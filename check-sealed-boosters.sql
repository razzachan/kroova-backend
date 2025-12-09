-- Verifica boosters não abertos (sealed) no banco
-- Para o usuário akroma.julio@gmail.com

SELECT 
  bi.id,
  bi.user_id,
  bi.booster_type_id,
  bi.purchased_at,
  bi.opened_at,
  bt.name as booster_name,
  bt.price_brl
FROM booster_instances bi
JOIN booster_types bt ON bi.booster_type_id = bt.id
WHERE bi.user_id = (
  SELECT id FROM auth.users WHERE email = 'akroma.julio@gmail.com'
)
AND bi.opened_at IS NULL
ORDER BY bi.purchased_at DESC
LIMIT 10;

-- Conta total
SELECT 
  COUNT(*) as total_sealed,
  user_id
FROM booster_instances
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'akroma.julio@gmail.com'
)
AND opened_at IS NULL
GROUP BY user_id;
