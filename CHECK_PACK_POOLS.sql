-- Verificar se pack_card_pools tem dados
SELECT 
  pack_id,
  COUNT(*) as total_cards,
  COUNT(CASE WHEN is_exclusive THEN 1 END) as exclusive_cards
FROM pack_card_pools
GROUP BY pack_id
ORDER BY pack_id;

-- Verificar distribuição de raridades por pack
SELECT 
  pcp.pack_id,
  cb.rarity,
  COUNT(*) as card_count
FROM pack_card_pools pcp
JOIN cards_base cb ON cb.id = pcp.card_base_id
GROUP BY pcp.pack_id, cb.rarity
ORDER BY pcp.pack_id, cb.rarity;

-- Verificar se há cartas no pack ED01_ALPHA especificamente
SELECT COUNT(*) as total_alpha_cards
FROM pack_card_pools
WHERE pack_id = 'ED01_ALPHA';
