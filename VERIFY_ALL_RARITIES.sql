-- Verificar TODAS as raridades que deveriam existir
SELECT 
  rarity,
  COUNT(*) as card_count,
  COUNT(*) * 100.0 / SUM(COUNT(*)) OVER () as percentage
FROM cards_base
WHERE edition_id = 'ED01'
GROUP BY rarity
ORDER BY 
  CASE rarity
    WHEN 'trash' THEN 1
    WHEN 'meme' THEN 2
    WHEN 'viral' THEN 3
    WHEN 'legendary' THEN 4
    WHEN 'epica' THEN 5
    ELSE 6
  END;

-- Total de cartas na edição
SELECT COUNT(*) as total_cards FROM cards_base WHERE edition_id = 'ED01';

-- Verificar se há cartas com raridade NULL ou valores estranhos
SELECT DISTINCT rarity FROM cards_base WHERE edition_id = 'ED01';
