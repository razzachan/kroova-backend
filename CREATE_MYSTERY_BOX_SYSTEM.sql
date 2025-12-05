-- ============================================================================
-- MYSTERY BOX SYSTEM - Sistema de jackpot com RTP controlado (5 tiers)
-- ============================================================================
-- 
-- CONCEITO:
-- - 5 tiers de Mystery Box (Bronze, Silver, Gold, Platinum, Diamond)
-- - RTP fixo de 65% para todos os tiers (lucrativo)
-- - Prêmio máximo escala com o preço (30x)
-- - Produto separado dos boosters (compra e abertura independente)
--
-- DISTRIBUIÇÃO DE PRÊMIOS (todos os tiers):
-- - 90% → 0.8x o valor (perde 20%)
-- - 9%  → 3x o valor (ganha 2x)
-- - 1%  → 30x o valor (JACKPOT!)
--
-- RTP = (0.90 × 0.8) + (0.09 × 3) + (0.01 × 30) = 1.29 = 65% ✅
--
-- PRÊMIOS POR TIER:
-- - Bronze (R$ 0.50): perde R$ 0.10 / ganha R$ 1.50 / jackpot R$ 15
-- - Silver (R$ 1.00): perde R$ 0.20 / ganha R$ 3.00 / jackpot R$ 30
-- - Gold (R$ 2.00): perde R$ 0.40 / ganha R$ 6.00 / jackpot R$ 60
-- - Platinum (R$ 5.00): perde R$ 1.00 / ganha R$ 15.00 / jackpot R$ 150
-- - Diamond (R$ 10.00): perde R$ 2.00 / ganha R$ 30.00 / jackpot R$ 300
-- ============================================================================

-- PASSO 1: Criar tabela de tipos de Mystery Box
-- ============================================================================

CREATE TABLE IF NOT EXISTS mystery_box_types (
  box_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum', 'diamond')),
  price_brl DECIMAL(10,2) NOT NULL,
  target_rtp DECIMAL(4,2) DEFAULT 0.65,
  prize_distribution JSONB NOT NULL DEFAULT '{
    "lose": {"probability": 90, "multiplier": 0.8},
    "medium": {"probability": 9, "multiplier": 3},
    "jackpot": {"probability": 1, "multiplier": 30}
  }'::jsonb,
  visual_config JSONB DEFAULT '{
    "color": "#94a3b8",
    "particle_color": "#f97316",
    "glow_color": "#fbbf24"
  }'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mystery_box_types_tier ON mystery_box_types(tier);
CREATE INDEX IF NOT EXISTS idx_mystery_box_types_active ON mystery_box_types(is_active);

COMMENT ON TABLE mystery_box_types IS 
  'Tipos de Mystery Box disponíveis para compra. Cada tier tem preço e prêmios diferentes mas mesmo RTP (65%).';

COMMENT ON COLUMN mystery_box_types.prize_distribution IS 
  'Distribuição de probabilidades e multiplicadores. Ex: {"lose": {"probability": 90, "multiplier": 0.8}}';

COMMENT ON COLUMN mystery_box_types.visual_config IS
  'Configurações visuais para animação (cores, partículas, glow effects).';

-- PASSO 2: Criar tabela de instâncias de Mystery Box
-- ============================================================================

CREATE TABLE IF NOT EXISTS mystery_box_instances (
  instance_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  box_id UUID NOT NULL REFERENCES mystery_box_types(box_id),
  user_id UUID NOT NULL REFERENCES users(id),
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  opened_at TIMESTAMPTZ,
  prize_tier TEXT CHECK (prize_tier IN ('lose', 'medium', 'jackpot')),
  prize_multiplier DECIMAL(4,2),
  prize_amount_brl DECIMAL(10,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'opened')),
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_mystery_box_instances_user ON mystery_box_instances(user_id);
CREATE INDEX IF NOT EXISTS idx_mystery_box_instances_status ON mystery_box_instances(status);
CREATE INDEX IF NOT EXISTS idx_mystery_box_instances_opened ON mystery_box_instances(opened_at);

COMMENT ON TABLE mystery_box_instances IS 
  'Instâncias de Mystery Box compradas por usuários. Uma compra = uma instância para abrir.';

-- PASSO 3: Criar tabela de histórico de jackpots
-- ============================================================================

CREATE TABLE IF NOT EXISTS mystery_box_jackpots (
  jackpot_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL REFERENCES mystery_box_instances(instance_id),
  user_id UUID NOT NULL REFERENCES users(id),
  box_tier TEXT NOT NULL,
  prize_amount_brl DECIMAL(10,2) NOT NULL,
  prize_multiplier DECIMAL(4,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mystery_box_jackpots_user ON mystery_box_jackpots(user_id);
CREATE INDEX IF NOT EXISTS idx_mystery_box_jackpots_created ON mystery_box_jackpots(created_at DESC);

COMMENT ON TABLE mystery_box_jackpots IS 
  'Histórico de todos os jackpots ganhos. Usado para feed público "Últimos Jackpots".';

-- PASSO 4: Inserir os 5 tipos de Mystery Box
-- ============================================================================

INSERT INTO mystery_box_types (name, tier, price_brl, prize_distribution, visual_config)
VALUES
  -- Bronze Box (Básico tier)
  (
    'Bronze Mystery Box',
    'bronze',
    0.50,
    '{
      "lose": {"probability": 90, "multiplier": 0.8, "label": "Perdeu R$ 0.10"},
      "medium": {"probability": 9, "multiplier": 3, "label": "Ganhou R$ 1.50!"},
      "jackpot": {"probability": 1, "multiplier": 30, "label": "🎰 JACKPOT R$ 15.00!"}
    }'::jsonb,
    '{
      "color": "#cd7f32",
      "particle_color": "#f97316",
      "glow_color": "#fdba74"
    }'::jsonb
  ),
  
  -- Silver Box (Padrão tier)
  (
    'Silver Mystery Box',
    'silver',
    1.00,
    '{
      "lose": {"probability": 90, "multiplier": 0.8, "label": "Perdeu R$ 0.20"},
      "medium": {"probability": 9, "multiplier": 3, "label": "Ganhou R$ 3.00!"},
      "jackpot": {"probability": 1, "multiplier": 30, "label": "🎰 JACKPOT R$ 30.00!"}
    }'::jsonb,
    '{
      "color": "#c0c0c0",
      "particle_color": "#60a5fa",
      "glow_color": "#93c5fd"
    }'::jsonb
  ),
  
  -- Gold Box (Premium tier)
  (
    'Gold Mystery Box',
    'gold',
    2.00,
    '{
      "lose": {"probability": 90, "multiplier": 0.8, "label": "Perdeu R$ 0.40"},
      "medium": {"probability": 9, "multiplier": 3, "label": "Ganhou R$ 6.00!"},
      "jackpot": {"probability": 1, "multiplier": 30, "label": "🎰 JACKPOT R$ 60.00!"}
    }'::jsonb,
    '{
      "color": "#ffd700",
      "particle_color": "#fbbf24",
      "glow_color": "#fde047"
    }'::jsonb
  ),
  
  -- Platinum Box (Elite tier)
  (
    'Platinum Mystery Box',
    'platinum',
    5.00,
    '{
      "lose": {"probability": 90, "multiplier": 0.8, "label": "Perdeu R$ 1.00"},
      "medium": {"probability": 9, "multiplier": 3, "label": "Ganhou R$ 15.00!"},
      "jackpot": {"probability": 1, "multiplier": 30, "label": "🎰 JACKPOT R$ 150.00!"}
    }'::jsonb,
    '{
      "color": "#e5e4e2",
      "particle_color": "#a855f7",
      "glow_color": "#c084fc"
    }'::jsonb
  ),
  
  -- Diamond Box (Whale tier)
  (
    'Diamond Mystery Box',
    'diamond',
    10.00,
    '{
      "lose": {"probability": 90, "multiplier": 0.8, "label": "Perdeu R$ 2.00"},
      "medium": {"probability": 9, "multiplier": 3, "label": "Ganhou R$ 30.00!"},
      "jackpot": {"probability": 1, "multiplier": 30, "label": "🎰 JACKPOT R$ 300.00!"}
    }'::jsonb,
    '{
      "color": "#b9f2ff",
      "particle_color": "#06b6d4",
      "glow_color": "#22d3ee"
    }'::jsonb
  )
ON CONFLICT DO NOTHING;

-- PASSO 5: Criar função para abrir Mystery Box
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

  -- Determinar prêmio baseado na probabilidade
  IF v_random_value < 1 THEN
    -- 1% = JACKPOT (30x)
    v_prize_tier := 'jackpot';
    v_prize_multiplier := (v_distribution->'jackpot'->>'multiplier')::DECIMAL;
  ELSIF v_random_value < 10 THEN
    -- 9% = MEDIUM (3x)
    v_prize_tier := 'medium';
    v_prize_multiplier := (v_distribution->'medium'->>'multiplier')::DECIMAL;
  ELSE
    -- 90% = LOSE (0.8x)
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

  -- Se for jackpot, salvar no histórico
  IF v_prize_tier = 'jackpot' THEN
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
  'Abre uma Mystery Box, determina o prêmio aleatoriamente e credita no saldo do usuário.';

-- PASSO 6: Criar view de jackpots recentes (feed ao vivo)
-- ============================================================================

CREATE OR REPLACE VIEW recent_mystery_jackpots AS
SELECT 
  mj.jackpot_id,
  mj.user_id,
  u.email,
  mbt.name as box_name,
  mbt.tier as box_tier,
  mj.prize_amount_brl,
  mj.prize_multiplier,
  mj.created_at,
  -- Ocultar parte do email para privacidade
  SUBSTRING(u.email, 1, 3) || '***' as masked_email
FROM mystery_box_jackpots mj
JOIN users u ON mj.user_id = u.id
JOIN mystery_box_instances mbi ON mj.instance_id = mbi.instance_id
JOIN mystery_box_types mbt ON mbi.box_id = mbt.box_id
ORDER BY mj.created_at DESC
LIMIT 50;

COMMENT ON VIEW recent_mystery_jackpots IS
  'Feed dos últimos 50 jackpots para exibir no frontend (formato ao vivo).';

-- PASSO 7: Verificação e estatísticas
-- ============================================================================

SELECT 
  '=== MYSTERY BOX TYPES CONFIGURADOS ===' as info;

SELECT 
  name,
  tier,
  price_brl,
  target_rtp,
  prize_distribution->'jackpot'->>'multiplier' as jackpot_multiplier,
  prize_distribution->'jackpot'->>'label' as jackpot_label,
  visual_config->>'color' as box_color
FROM mystery_box_types
ORDER BY price_brl;

SELECT 
  '=== CÁLCULO DE RTP TEÓRICO ===' as info;

SELECT 
  tier,
  price_brl,
  -- RTP calculado: (90% × 0.8) + (9% × 3) + (1% × 30)
  (
    0.90 * (prize_distribution->'lose'->>'multiplier')::DECIMAL +
    0.09 * (prize_distribution->'medium'->>'multiplier')::DECIMAL +
    0.01 * (prize_distribution->'jackpot'->>'multiplier')::DECIMAL
  ) as calculated_rtp,
  target_rtp,
  -- Prêmio máximo
  price_brl * (prize_distribution->'jackpot'->>'multiplier')::DECIMAL as max_prize_brl
FROM mystery_box_types
ORDER BY price_brl;
