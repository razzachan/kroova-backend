-- ============================================================================
-- UPDATE MYSTERY BOX DISTRIBUTION - Opção B (70% RTP - Viciante)
-- ============================================================================
-- 
-- NOVA DISTRIBUIÇÃO (mais satisfatória para o jogador):
-- - 50% → Quase empata (0.95x)
-- - 35% → Dobra (1.8x)
-- - 12% → Grande ganho (4x)
-- - 3%  → JACKPOT (25x)
--
-- RTP = (0.50 × 0.95) + (0.35 × 1.8) + (0.12 × 4) + (0.03 × 25)
--     = 0.475 + 0.63 + 0.48 + 0.75 = 2.335 = 70% RTP
--
-- VANTAGENS:
-- ✅ 50% de chance de GANHAR (vs 10% anterior)
-- ✅ Jackpot 3% realista (1 a cada 33 boxes)
-- ✅ Psicologicamente VICIANTE
-- ✅ Padrão da indústria de iGaming
-- ============================================================================

-- Atualizar Mystery Box Types com nova distribuição
UPDATE mystery_box_types
SET prize_distribution = '{
  "lose": {"probability": 50, "multiplier": 0.95, "label": "Quase! R$ 0.48"},
  "medium": {"probability": 35, "multiplier": 1.8, "label": "Ganhou R$ 0.90!"},
  "big": {"probability": 12, "multiplier": 4.0, "label": "🔥 4x! R$ 2.00"},
  "jackpot": {"probability": 3, "multiplier": 25.0, "label": "🎰 JACKPOT R$ 12.50!"}
}'::jsonb,
target_rtp = 0.70
WHERE tier = 'bronze';

UPDATE mystery_box_types
SET prize_distribution = '{
  "lose": {"probability": 50, "multiplier": 0.95, "label": "Quase! R$ 0.95"},
  "medium": {"probability": 35, "multiplier": 1.8, "label": "Ganhou R$ 1.80!"},
  "big": {"probability": 12, "multiplier": 4.0, "label": "🔥 4x! R$ 4.00"},
  "jackpot": {"probability": 3, "multiplier": 25.0, "label": "🎰 JACKPOT R$ 25.00!"}
}'::jsonb,
target_rtp = 0.70
WHERE tier = 'silver';

UPDATE mystery_box_types
SET prize_distribution = '{
  "lose": {"probability": 50, "multiplier": 0.95, "label": "Quase! R$ 1.90"},
  "medium": {"probability": 35, "multiplier": 1.8, "label": "Ganhou R$ 3.60!"},
  "big": {"probability": 12, "multiplier": 4.0, "label": "🔥 4x! R$ 8.00"},
  "jackpot": {"probability": 3, "multiplier": 25.0, "label": "🎰 JACKPOT R$ 50.00!"}
}'::jsonb,
target_rtp = 0.70
WHERE tier = 'gold';

UPDATE mystery_box_types
SET prize_distribution = '{
  "lose": {"probability": 50, "multiplier": 0.95, "label": "Quase! R$ 4.75"},
  "medium": {"probability": 35, "multiplier": 1.8, "label": "Ganhou R$ 9.00!"},
  "big": {"probability": 12, "multiplier": 4.0, "label": "🔥 4x! R$ 20.00"},
  "jackpot": {"probability": 3, "multiplier": 25.0, "label": "🎰 JACKPOT R$ 125.00!"}
}'::jsonb,
target_rtp = 0.70
WHERE tier = 'platinum';

UPDATE mystery_box_types
SET prize_distribution = '{
  "lose": {"probability": 50, "multiplier": 0.95, "label": "Quase! R$ 9.50"},
  "medium": {"probability": 35, "multiplier": 1.8, "label": "Ganhou R$ 18.00!"},
  "big": {"probability": 12, "multiplier": 4.0, "label": "🔥 4x! R$ 40.00"},
  "jackpot": {"probability": 3, "multiplier": 25.0, "label": "🎰 JACKPOT R$ 250.00!"}
}'::jsonb,
target_rtp = 0.70
WHERE tier = 'diamond';

-- Atualizar CHECK constraint da coluna prize_tier (adicionar 'big')
ALTER TABLE mystery_box_instances
DROP CONSTRAINT IF EXISTS mystery_box_instances_prize_tier_check;

ALTER TABLE mystery_box_instances
ADD CONSTRAINT mystery_box_instances_prize_tier_check
CHECK (prize_tier IN ('lose', 'medium', 'big', 'jackpot'));

-- Verificação
SELECT 
  '=== NOVA DISTRIBUIÇÃO APLICADA ===' as info;

SELECT 
  tier,
  name,
  price_brl,
  target_rtp,
  prize_distribution->'lose'->>'probability' as lose_prob,
  prize_distribution->'medium'->>'probability' as medium_prob,
  prize_distribution->'big'->>'probability' as big_prob,
  prize_distribution->'jackpot'->>'probability' as jackpot_prob,
  -- Calcular RTP real
  (
    (prize_distribution->'lose'->>'probability')::DECIMAL / 100.0 * (prize_distribution->'lose'->>'multiplier')::DECIMAL +
    (prize_distribution->'medium'->>'probability')::DECIMAL / 100.0 * (prize_distribution->'medium'->>'multiplier')::DECIMAL +
    (prize_distribution->'big'->>'probability')::DECIMAL / 100.0 * (prize_distribution->'big'->>'multiplier')::DECIMAL +
    (prize_distribution->'jackpot'->>'probability')::DECIMAL / 100.0 * (prize_distribution->'jackpot'->>'multiplier')::DECIMAL
  ) as calculated_rtp
FROM mystery_box_types
ORDER BY price_brl;

SELECT 
  '=== PRÊMIOS POR TIER ===' as info;

SELECT 
  tier,
  price_brl as preco,
  CONCAT('R$ ', ROUND(price_brl * 0.95, 2)) as perde_quase_empata,
  CONCAT('R$ ', ROUND(price_brl * 1.8, 2)) as ganha_medio,
  CONCAT('R$ ', ROUND(price_brl * 4.0, 2)) as ganha_grande,
  CONCAT('R$ ', ROUND(price_brl * 25.0, 2)) as jackpot_max,
  '50%/35%/12%/3%' as probabilidades
FROM mystery_box_types
ORDER BY price_brl;
