-- Função para retornar estatísticas reais do usuário sobre boosters
CREATE OR REPLACE FUNCTION get_user_booster_stats(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'total_boosters_opened', COALESCE(COUNT(DISTINCT bo.id), 0),
    'total_spent_brl', COALESCE(SUM(bo.paid_brl), 0),
    'legendary_drops', COALESCE(
      (SELECT COUNT(*) 
       FROM user_cards uc
       JOIN cards_base cb ON cb.id = uc.card_base_id
       WHERE uc.user_id = p_user_id 
       AND cb.rarity = 'legendary'
       AND uc.obtained_from_booster_opening_id IS NOT NULL), 0
    ),
    'godmode_drops', COALESCE(
      (SELECT COUNT(*) 
       FROM user_cards uc
       JOIN cards_base cb ON cb.id = uc.card_base_id
       WHERE uc.user_id = p_user_id 
       AND cb.rarity = 'godmode'
       AND uc.obtained_from_booster_opening_id IS NOT NULL), 0
    )
  )
  INTO v_result
  FROM booster_openings bo
  WHERE bo.user_id = p_user_id
  AND bo.opened_at IS NOT NULL;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
