-- Check cashback status for your user
SELECT 
  ci.id,
  cb.name as card_name,
  cb.rarity,
  ci.prize_amount_brl,
  ci.prize_redeemed,
  CASE 
    WHEN ci.prize_redeemed THEN '✅ RESGATADO'
    ELSE '💰 DISPONÍVEL'
  END as status
FROM cards_instances ci
JOIN cards_base cb ON ci.base_id = cb.id
WHERE ci.owner_id = '42e41c9f-d474-4574-a893-b30cc0bac97a'
  AND ci.prize_amount_brl IS NOT NULL
ORDER BY ci.prize_redeemed ASC, ci.prize_amount_brl DESC
LIMIT 20;

-- Total disponível vs resgatado
SELECT 
  COUNT(*) as total_cards,
  SUM(CASE WHEN prize_redeemed = false THEN 1 ELSE 0 END) as cards_disponiveis,
  SUM(CASE WHEN prize_redeemed = true THEN 1 ELSE 0 END) as cards_resgatadas,
  SUM(CASE WHEN prize_redeemed = false THEN prize_amount_brl ELSE 0 END) as cashback_disponivel,
  SUM(CASE WHEN prize_redeemed = true THEN prize_amount_brl ELSE 0 END) as cashback_resgatado,
  SUM(prize_amount_brl) as cashback_total
FROM cards_instances
WHERE owner_id = '42e41c9f-d474-4574-a893-b30cc0bac97a'
  AND prize_amount_brl IS NOT NULL;
