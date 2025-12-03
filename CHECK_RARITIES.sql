-- Verificar quais raridades existem na edição ED01
SELECT 
  rarity,
  COUNT(*) as card_count
FROM cards_base
WHERE edition_id = 'ED01'
GROUP BY rarity
ORDER BY rarity;

-- Ver exemplos de cartas
SELECT id, name, rarity, display_id
FROM cards_base
WHERE edition_id = 'ED01'
LIMIT 10;
