-- Check all cards with prize_amount_brl column (even if 0.00)
SELECT 
  ci.id,
  cb.name as card_name,
  cb.rarity,
  ci.prize_amount_brl,
  ci.prize_redeemed
FROM cards_instances ci
JOIN cards_base cb ON ci.base_id = cb.id
WHERE ci.prize_amount_brl IS NOT NULL
ORDER BY ci.id DESC
LIMIT 50;
