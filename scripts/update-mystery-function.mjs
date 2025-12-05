import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mmcytphoeyxeylvaqjgr.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tY3l0cGhvZXl4ZXlsdmFxamdyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDExNDIyMCwiZXhwIjoyMDc5NjkwMjIwfQ.mPKc2a3A4kL1LUzX9BjTsaCz3OGAWLGIBYV0TSa20Fw';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateFunction() {
  console.log('🔧 Atualizando função open_mystery_box() para 4 tiers...\n');

  const newFunction = `
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
BEGIN
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

  v_random_value := random() * 100;

  -- Nova distribuição: 50/35/12/3
  IF v_random_value < 3 THEN
    v_prize_tier := 'jackpot';
    v_prize_multiplier := (v_distribution->'jackpot'->>'multiplier')::DECIMAL;
  ELSIF v_random_value < 15 THEN
    v_prize_tier := 'big';
    v_prize_multiplier := (v_distribution->'big'->>'multiplier')::DECIMAL;
  ELSIF v_random_value < 50 THEN
    v_prize_tier := 'medium';
    v_prize_multiplier := (v_distribution->'medium'->>'multiplier')::DECIMAL;
  ELSE
    v_prize_tier := 'lose';
    v_prize_multiplier := (v_distribution->'lose'->>'multiplier')::DECIMAL;
  END IF;

  v_prize_amount := v_box_price * v_prize_multiplier;

  UPDATE mystery_box_instances
  SET 
    opened_at = NOW(),
    prize_tier = v_prize_tier,
    prize_multiplier = v_prize_multiplier,
    prize_amount_brl = v_prize_amount,
    status = 'opened',
    metadata = jsonb_build_object('random_value', v_random_value)
  WHERE instance_id = p_instance_id;

  UPDATE users
  SET balance_brl = balance_brl + v_prize_amount
  WHERE id = p_user_id;

  IF v_prize_tier IN ('jackpot', 'big') THEN
    INSERT INTO mystery_box_jackpots (instance_id, user_id, box_tier, prize_amount_brl, prize_multiplier)
    VALUES (p_instance_id, p_user_id, v_box_tier, v_prize_amount, v_prize_multiplier);
  END IF;

  RETURN QUERY SELECT 
    true,
    v_prize_tier,
    v_prize_multiplier,
    v_prize_amount,
    (v_distribution->v_prize_tier->>'label')::TEXT;
END;
$$ LANGUAGE plpgsql;
  `;

  // Como não temos exec(), vou printar o SQL para você executar
  console.log('📋 Execute este SQL no Supabase Dashboard:\n');
  console.log('=' .repeat(80));
  console.log(newFunction);
  console.log('=' .repeat(80));
  console.log('\n✅ Copie e cole no SQL Editor do Supabase!');
}

updateFunction().catch(console.error);
