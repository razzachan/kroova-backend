-- Delete test cards from user inventory
-- User ID: 15f2efb3-f1e6-4146-b35c-41d93f32d569

-- First, check how many cards will be deleted
SELECT COUNT(*) as total_cards
FROM user_inventory
WHERE user_id = '15f2efb3-f1e6-4146-b35c-41d93f32d569';

-- Delete the cards
DELETE FROM user_inventory
WHERE user_id = '15f2efb3-f1e6-4146-b35c-41d93f32d569';

-- Verify deletion
SELECT COUNT(*) as remaining_cards
FROM user_inventory
WHERE user_id = '15f2efb3-f1e6-4146-b35c-41d93f32d569';
