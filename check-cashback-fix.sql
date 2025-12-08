-- Check if DECIMAL(10,4) fix is working
-- Should see prize_amount_brl with 4 decimal places (e.g., 0.0010 for Básico)

SELECT 
  ci.id,
  cb.name as card_name,
  cb.rarity,
  ci.prize_amount_brl,
  ci.prize_redeemed,
  ci.liquidity_brl,
  u.email as owner_email
FROM cards_instances ci
JOIN cards_base cb ON ci.base_id = cb.id
JOIN users u ON ci.owner_id = u.id
WHERE ci.prize_amount_brl IS NOT NULL
  AND ci.prize_amount_brl > 0
ORDER BY ci.id DESC
LIMIT 20;
