-- ============================================================================
-- UPDATE open_mystery_box() - Nova distribuição 4 tiers (70% RTP)
-- ============================================================================

CREATE OR REPLACE FUNCTION open_mystery_box(
  p_instance_id UUID,
  p_user_id UUID
)
RETURNS TABLE (
  success BOOLEAN,
  prize_tier TEXT,
  prize_multiplier DECIMAL,
  prize_amount DECIMAL,
  message TEXT
) AS $$
DECLARE
  v_box_price DECIMAL;
  v_random_value DECIMAL;
  v_prize_tier TEXT;
  v_prize_multiplier DECIMAL;
  v_prize_amount DECIMAL;
  v_distribution JSONB;
  v_box_tier TEXT;
  v_cumulative_prob DECIMAL := 0;
BEGIN
  -- Verificar se a box existe e pertence ao usuário
  SELECT mbt.price_brl, mbt.prize_distribution, mbt.tier
  INTO v_box_price, v_distribution, v_box_tier
  FROM mystery_box_instances mbi
  JOIN mystery_box_types mbt ON mbi.box_id = mbt.box_id
  WHERE mbi.instance_id = p_instance_id
    AND mbi.user_id = p_user_id
    AND mbi.status = 'pending';

  IF v_box_price IS NULL THEN
    RETURN QUERY SELECT false, NULL::TEXT, NULL::DECIMAL, NULL::DECIMAL, 
      'Mystery Box não encontrada ou já foi aberta'::TEXT;
    RETURN;
  END IF;

  -- Gerar número aleatório (0-100)
  v_random_value := random() * 100;

  -- Determinar prêmio baseado na nova probabilidade (4 tiers)
  -- 3% = JACKPOT (25x)
  -- 12% = BIG (4x)
  -- 35% = MEDIUM (1.8x)
  -- 50% = LOSE (0.95x)
  
  IF v_random_value < 3 THEN
    -- 3% = JACKPOT (25x)
    v_prize_tier := 'jackpot';
    v_prize_multiplier := (v_distribution->'jackpot'->>'multiplier')::DECIMAL;
  ELSIF v_random_value < 15 THEN
    -- 12% = BIG WIN (4x)
    v_prize_tier := 'big';
    v_prize_multiplier := (v_distribution->'big'->>'multiplier')::DECIMAL;
  ELSIF v_random_value < 50 THEN
    -- 35% = MEDIUM (1.8x)
    v_prize_tier := 'medium';
    v_prize_multiplier := (v_distribution->'medium'->>'multiplier')::DECIMAL;
  ELSE
    -- 50% = LOSE (0.95x)
    v_prize_tier := 'lose';
    v_prize_multiplier := (v_distribution->'lose'->>'multiplier')::DECIMAL;
  END IF;

  v_prize_amount := v_box_price * v_prize_multiplier;

  -- Atualizar instância
  UPDATE mystery_box_instances
  SET 
    opened_at = NOW(),
    prize_tier = v_prize_tier,
    prize_multiplier = v_prize_multiplier,
    prize_amount_brl = v_prize_amount,
    status = 'opened',
    metadata = jsonb_build_object('random_value', v_random_value)
  WHERE instance_id = p_instance_id;

  -- Adicionar saldo ao usuário
  UPDATE users
  SET balance_brl = balance_brl + v_prize_amount
  WHERE id = p_user_id;

  -- Se for jackpot OU big, salvar no histórico (para feed)
  IF v_prize_tier IN ('jackpot', 'big') THEN
    INSERT INTO mystery_box_jackpots (instance_id, user_id, box_tier, prize_amount_brl, prize_multiplier)
    VALUES (p_instance_id, p_user_id, v_box_tier, v_prize_amount, v_prize_multiplier);
  END IF;

  -- Retornar resultado
  RETURN QUERY SELECT 
    true,
    v_prize_tier,
    v_prize_multiplier,
    v_prize_amount,
    (v_distribution->v_prize_tier->>'label')::TEXT;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION open_mystery_box IS
  'Abre uma Mystery Box com distribuição 50/35/12/3 (70% RTP). Determina prêmio aleatoriamente e credita no saldo.';
