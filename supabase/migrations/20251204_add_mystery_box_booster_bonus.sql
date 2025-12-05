-- ============================================================================
-- MYSTERY BOX BOOSTER BONUS SYSTEM
-- ============================================================================
-- 
-- CONCEITO:
-- - Ao abrir booster, existe chance de ganhar Mystery Box GRÁTIS como bônus
-- - Probabilidade escala com tier do booster (2% Bronze → 6% Diamond)
-- - Mystery Box do mesmo tier do booster
-- - Não afeta as 5 cartas (é extra/bônus adicional)
-- 
-- PROBABILIDADES POR TIER:
-- - Bronze (R$ 0.50):   2% → Custo médio R$ 0.01/booster
-- - Silver (R$ 1.00):   3% → Custo médio R$ 0.03/booster
-- - Gold (R$ 2.00):     4% → Custo médio R$ 0.08/booster
-- - Platinum (R$ 5.00): 5% → Custo médio R$ 0.25/booster
-- - Diamond (R$ 10.00): 6% → Custo médio R$ 0.60/booster
-- ============================================================================

-- PASSO 1: Adicionar campo mystery_box_bonus_chance em booster_types
-- ============================================================================

ALTER TABLE booster_types 
ADD COLUMN IF NOT EXISTS mystery_box_bonus_chance DECIMAL(5,2) DEFAULT 0.0;

COMMENT ON COLUMN booster_types.mystery_box_bonus_chance IS
  'Probabilidade (0-100) de ganhar Mystery Box grátis como bônus ao abrir este booster.';

-- PASSO 2: Atualizar booster_types com as probabilidades progressivas
-- ============================================================================

-- Bronze tier → 2% chance
UPDATE booster_types
SET mystery_box_bonus_chance = 2.0
WHERE price_brl = 0.50;

-- Silver tier → 3% chance
UPDATE booster_types
SET mystery_box_bonus_chance = 3.0
WHERE price_brl = 1.00;

-- Gold tier → 4% chance
UPDATE booster_types
SET mystery_box_bonus_chance = 4.0
WHERE price_brl = 2.00;

-- Platinum tier → 5% chance
UPDATE booster_types
SET mystery_box_bonus_chance = 5.0
WHERE price_brl = 5.00;

-- Diamond tier → 6% chance
UPDATE booster_types
SET mystery_box_bonus_chance = 6.0
WHERE price_brl = 10.00;

-- PASSO 3: Adicionar campo source_type em mystery_box_instances
-- ============================================================================

ALTER TABLE mystery_box_instances
ADD COLUMN IF NOT EXISTS source_type TEXT DEFAULT 'purchase' CHECK (source_type IN ('purchase', 'booster_bonus'));

COMMENT ON COLUMN mystery_box_instances.source_type IS
  'Origem da Mystery Box: purchase = compra direta, booster_bonus = bônus ao abrir booster.';

-- PASSO 4: Criar tabela de tracking de bonus drops
-- ============================================================================

CREATE TABLE IF NOT EXISTS mystery_box_bonus_drops (
  drop_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  opening_id UUID NOT NULL REFERENCES booster_openings(id),
  instance_id UUID NOT NULL REFERENCES mystery_box_instances(instance_id),
  booster_tier_price DECIMAL(10,2) NOT NULL,
  mystery_box_tier TEXT NOT NULL,
  bonus_chance_used DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mystery_box_bonus_drops_user ON mystery_box_bonus_drops(user_id);
CREATE INDEX IF NOT EXISTS idx_mystery_box_bonus_drops_opening ON mystery_box_bonus_drops(opening_id);
CREATE INDEX IF NOT EXISTS idx_mystery_box_bonus_drops_created ON mystery_box_bonus_drops(created_at DESC);

COMMENT ON TABLE mystery_box_bonus_drops IS
  'Histórico de Mystery Boxes ganhas como bônus ao abrir boosters. Usado para analytics e tracking.';

-- PASSO 5: Verificação
-- ============================================================================

SELECT 
  '=== BOOSTER TYPES COM BONUS CONFIGURADO ===' as info;

SELECT 
  name,
  price_brl as tier_price,
  mystery_box_bonus_chance as bonus_chance_percent,
  CONCAT('1 em ', ROUND(100.0 / mystery_box_bonus_chance, 1), ' boosters') as drop_rate,
  CONCAT('R$ ', ROUND(price_brl * mystery_box_bonus_chance / 100.0, 2)) as avg_cost_per_booster
FROM booster_types
WHERE mystery_box_bonus_chance > 0
ORDER BY price_brl;

SELECT 
  '=== SIMULAÇÃO: CUSTO ESPERADO EM 100 BOOSTERS ===' as info;

SELECT 
  name,
  price_brl as tier_price,
  mystery_box_bonus_chance as bonus_chance,
  ROUND(mystery_box_bonus_chance) as expected_drops_per_100,
  CONCAT('R$ ', price_brl * ROUND(mystery_box_bonus_chance)) as total_cost_per_100
FROM booster_types
WHERE mystery_box_bonus_chance > 0
ORDER BY price_brl;
