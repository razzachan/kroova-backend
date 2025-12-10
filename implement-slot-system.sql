-- ============================================================================
-- IMPLEMENTAÇÃO COMPLETA DO SLOT SYSTEM
-- Baseado em Star Wars Unlimited e Magic: The Gathering
-- ============================================================================

-- 1. CRIAR TABELA DE CONFIGURAÇÃO DE SLOTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS booster_slot_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booster_type_id UUID NOT NULL REFERENCES booster_types(id) ON DELETE CASCADE,
  slot_position INT NOT NULL, -- 1, 2, 3, 4, 5, 6, 7
  slot_name TEXT NOT NULL, -- 'guaranteed_rare', 'wildcard', 'common', etc
  rarity_weights JSONB NOT NULL, -- {"trash": 0.85, "meme": 0.15}
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(booster_type_id, slot_position)
);

-- 2. CRIAR TABELA DE PITY SYSTEM (Bad Luck Protection)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS booster_pity_tracker (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  booster_type_id UUID NOT NULL REFERENCES booster_types(id) ON DELETE CASCADE,
  boosters_opened_since_last_legendary INT DEFAULT 0,
  boosters_opened_since_last_godmode INT DEFAULT 0,
  total_boosters_opened INT DEFAULT 0,
  last_legendary_at TIMESTAMPTZ,
  last_godmode_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, booster_type_id)
);

-- 3. CRIAR ÍNDICES PARA PERFORMANCE
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_slot_config_booster ON booster_slot_config(booster_type_id);
CREATE INDEX IF NOT EXISTS idx_pity_tracker_user ON booster_pity_tracker(user_id);
CREATE INDEX IF NOT EXISTS idx_pity_tracker_user_booster ON booster_pity_tracker(user_id, booster_type_id);

-- ============================================================================
-- CONFIGURAÇÃO DOS SLOTS POR TIER (Balanceado para 70% RTP)
-- ============================================================================

-- BÁSICO (R$ 0.50) - 5 cartas - RTP Target: 70%
-- Valor esperado: R$ 0.35 por booster
-- ----------------------------------------------------------------------------
INSERT INTO booster_slot_config (booster_type_id, slot_position, slot_name, rarity_weights, description)
SELECT 
  bt.id,
  1,
  'common_guaranteed',
  '{"trash": 0.70, "meme": 0.28, "viral": 0.02}'::jsonb,
  'Slot 1: Common garantido com leve chance de upgrade'
FROM booster_types bt WHERE bt.name LIKE 'Básico%'
ON CONFLICT (booster_type_id, slot_position) DO UPDATE 
SET rarity_weights = EXCLUDED.rarity_weights;

INSERT INTO booster_slot_config (booster_type_id, slot_position, slot_name, rarity_weights, description)
SELECT 
  bt.id,
  2,
  'common',
  '{"trash": 0.85, "meme": 0.15}'::jsonb,
  'Slot 2-3: Commons puros'
FROM booster_types bt WHERE bt.name LIKE 'Básico%'
UNION ALL
SELECT 
  bt.id,
  3,
  'common',
  '{"trash": 0.85, "meme": 0.15}'::jsonb,
  'Slot 2-3: Commons puros'
FROM booster_types bt WHERE bt.name LIKE 'Básico%'
ON CONFLICT (booster_type_id, slot_position) DO UPDATE 
SET rarity_weights = EXCLUDED.rarity_weights;

INSERT INTO booster_slot_config (booster_type_id, slot_position, slot_name, rarity_weights, description)
SELECT 
  bt.id,
  4,
  'wildcard',
  '{"trash": 0.75, "meme": 0.20, "viral": 0.04, "legendary": 0.009, "godmode": 0.001}'::jsonb,
  'Slot 4-5: Wildcards com chance pequena de rare'
FROM booster_types bt WHERE bt.name LIKE 'Básico%'
UNION ALL
SELECT 
  bt.id,
  5,
  'wildcard',
  '{"trash": 0.75, "meme": 0.20, "viral": 0.04, "legendary": 0.009, "godmode": 0.001}'::jsonb,
  'Slot 4-5: Wildcards com chance pequena de rare'
FROM booster_types bt WHERE bt.name LIKE 'Básico%'
ON CONFLICT (booster_type_id, slot_position) DO UPDATE 
SET rarity_weights = EXCLUDED.rarity_weights;

-- PADRÃO (R$ 1.00) - 5 cartas - RTP Target: 70%
-- Valor esperado: R$ 0.70 por booster
-- ----------------------------------------------------------------------------
INSERT INTO booster_slot_config (booster_type_id, slot_position, slot_name, rarity_weights, description)
SELECT 
  bt.id,
  1,
  'uncommon_guaranteed',
  '{"meme": 0.50, "viral": 0.40, "legendary": 0.09, "godmode": 0.01}'::jsonb,
  'Slot 1: Uncommon/Rare garantido'
FROM booster_types bt WHERE bt.name LIKE 'Padrão%'
ON CONFLICT (booster_type_id, slot_position) DO UPDATE 
SET rarity_weights = EXCLUDED.rarity_weights;

INSERT INTO booster_slot_config (booster_type_id, slot_position, slot_name, rarity_weights, description)
SELECT 
  bt.id,
  2,
  'common_improved',
  '{"trash": 0.60, "meme": 0.35, "viral": 0.05}'::jsonb,
  'Slot 2-3: Common melhorado'
FROM booster_types bt WHERE bt.name LIKE 'Padrão%'
UNION ALL
SELECT 
  bt.id,
  3,
  'common_improved',
  '{"trash": 0.60, "meme": 0.35, "viral": 0.05}'::jsonb,
  'Slot 2-3: Common melhorado'
FROM booster_types bt WHERE bt.name LIKE 'Padrão%'
ON CONFLICT (booster_type_id, slot_position) DO UPDATE 
SET rarity_weights = EXCLUDED.rarity_weights;

INSERT INTO booster_slot_config (booster_type_id, slot_position, slot_name, rarity_weights, description)
SELECT 
  bt.id,
  4,
  'wildcard',
  '{"trash": 0.50, "meme": 0.35, "viral": 0.12, "legendary": 0.025, "godmode": 0.005}'::jsonb,
  'Slot 4-5: Wildcards com chances moderadas'
FROM booster_types bt WHERE bt.name LIKE 'Padrão%'
UNION ALL
SELECT 
  bt.id,
  5,
  'wildcard',
  '{"trash": 0.50, "meme": 0.35, "viral": 0.12, "legendary": 0.025, "godmode": 0.005}'::jsonb,
  'Slot 4-5: Wildcards com chances moderadas'
FROM booster_types bt WHERE bt.name LIKE 'Padrão%'
ON CONFLICT (booster_type_id, slot_position) DO UPDATE 
SET rarity_weights = EXCLUDED.rarity_weights;

-- PREMIUM (R$ 2.00) - 5 cartas - RTP Target: 70%
-- Valor esperado: R$ 1.40 por booster
-- ----------------------------------------------------------------------------
INSERT INTO booster_slot_config (booster_type_id, slot_position, slot_name, rarity_weights, description)
SELECT 
  bt.id,
  1,
  'rare_guaranteed',
  '{"viral": 0.70, "legendary": 0.25, "godmode": 0.05}'::jsonb,
  'Slot 1: Rare/Legendary garantido'
FROM booster_types bt WHERE bt.name LIKE 'Premium%'
ON CONFLICT (booster_type_id, slot_position) DO UPDATE 
SET rarity_weights = EXCLUDED.rarity_weights;

INSERT INTO booster_slot_config (booster_type_id, slot_position, slot_name, rarity_weights, description)
SELECT 
  bt.id,
  2,
  'uncommon_guaranteed',
  '{"meme": 0.40, "viral": 0.50, "legendary": 0.10}'::jsonb,
  'Slot 2: Uncommon melhorado'
FROM booster_types bt WHERE bt.name LIKE 'Premium%'
ON CONFLICT (booster_type_id, slot_position) DO UPDATE 
SET rarity_weights = EXCLUDED.rarity_weights;

INSERT INTO booster_slot_config (booster_type_id, slot_position, slot_name, rarity_weights, description)
SELECT 
  bt.id,
  3,
  'wildcard_premium',
  '{"meme": 0.30, "viral": 0.45, "legendary": 0.20, "godmode": 0.05}'::jsonb,
  'Slot 3-5: Wildcards premium'
FROM booster_types bt WHERE bt.name LIKE 'Premium%'
UNION ALL
SELECT 
  bt.id,
  4,
  'wildcard_premium',
  '{"meme": 0.30, "viral": 0.45, "legendary": 0.20, "godmode": 0.05}'::jsonb,
  'Slot 3-5: Wildcards premium'
FROM booster_types bt WHERE bt.name LIKE 'Premium%'
UNION ALL
SELECT 
  bt.id,
  5,
  'wildcard_premium',
  '{"meme": 0.30, "viral": 0.45, "legendary": 0.20, "godmode": 0.05}'::jsonb,
  'Slot 3-5: Wildcards premium'
FROM booster_types bt WHERE bt.name LIKE 'Premium%'
ON CONFLICT (booster_type_id, slot_position) DO UPDATE 
SET rarity_weights = EXCLUDED.rarity_weights;

-- ELITE (R$ 5.00) - 6 cartas - RTP Target: 70%
-- Valor esperado: R$ 3.50 por booster
-- ----------------------------------------------------------------------------
INSERT INTO booster_slot_config (booster_type_id, slot_position, slot_name, rarity_weights, description)
SELECT 
  bt.id,
  1,
  'legendary_guaranteed',
  '{"legendary": 0.80, "godmode": 0.20}'::jsonb,
  'Slot 1: Legendary/Godmode garantido'
FROM booster_types bt WHERE bt.name LIKE 'Elite%'
ON CONFLICT (booster_type_id, slot_position) DO UPDATE 
SET rarity_weights = EXCLUDED.rarity_weights;

INSERT INTO booster_slot_config (booster_type_id, slot_position, slot_name, rarity_weights, description)
SELECT 
  bt.id,
  2,
  'rare_guaranteed',
  '{"viral": 0.60, "legendary": 0.35, "godmode": 0.05}'::jsonb,
  'Slot 2: Rare garantido'
FROM booster_types bt WHERE bt.name LIKE 'Elite%'
ON CONFLICT (booster_type_id, slot_position) DO UPDATE 
SET rarity_weights = EXCLUDED.rarity_weights;

INSERT INTO booster_slot_config (booster_type_id, slot_position, slot_name, rarity_weights, description)
SELECT 
  bt.id,
  3,
  'uncommon_improved',
  '{"viral": 0.30, "legendary": 0.60, "godmode": 0.10}'::jsonb,
  'Slot 3-4: Uncommon melhorado'
FROM booster_types bt WHERE bt.name LIKE 'Elite%'
UNION ALL
SELECT 
  bt.id,
  4,
  'uncommon_improved',
  '{"viral": 0.30, "legendary": 0.60, "godmode": 0.10}'::jsonb,
  'Slot 3-4: Uncommon melhorado'
FROM booster_types bt WHERE bt.name LIKE 'Elite%'
ON CONFLICT (booster_type_id, slot_position) DO UPDATE 
SET rarity_weights = EXCLUDED.rarity_weights;

INSERT INTO booster_slot_config (booster_type_id, slot_position, slot_name, rarity_weights, description)
SELECT 
  bt.id,
  5,
  'wildcard_elite',
  '{"viral": 0.20, "legendary": 0.50, "godmode": 0.30}'::jsonb,
  'Slot 5-6: Wildcards elite'
FROM booster_types bt WHERE bt.name LIKE 'Elite%'
UNION ALL
SELECT 
  bt.id,
  6,
  'wildcard_elite',
  '{"viral": 0.20, "legendary": 0.50, "godmode": 0.30}'::jsonb,
  'Slot 5-6: Wildcards elite'
FROM booster_types bt WHERE bt.name LIKE 'Elite%'
ON CONFLICT (booster_type_id, slot_position) DO UPDATE 
SET rarity_weights = EXCLUDED.rarity_weights;

-- WHALE (R$ 10.00) - 7 cartas - RTP Target: 70%
-- Valor esperado: R$ 7.00 por booster
-- ----------------------------------------------------------------------------
INSERT INTO booster_slot_config (booster_type_id, slot_position, slot_name, rarity_weights, description)
SELECT 
  bt.id,
  1,
  'godmode_premium',
  '{"legendary": 0.60, "godmode": 0.40}'::jsonb,
  'Slot 1-2: Legendary/Godmode premium'
FROM booster_types bt WHERE bt.name LIKE 'Whale%'
UNION ALL
SELECT 
  bt.id,
  2,
  'godmode_premium',
  '{"legendary": 0.60, "godmode": 0.40}'::jsonb,
  'Slot 1-2: Legendary/Godmode premium'
FROM booster_types bt WHERE bt.name LIKE 'Whale%'
ON CONFLICT (booster_type_id, slot_position) DO UPDATE 
SET rarity_weights = EXCLUDED.rarity_weights;

INSERT INTO booster_slot_config (booster_type_id, slot_position, slot_name, rarity_weights, description)
SELECT 
  bt.id,
  3,
  'legendary_guaranteed',
  '{"legendary": 0.85, "godmode": 0.15}'::jsonb,
  'Slot 3-5: Legendary garantido'
FROM booster_types bt WHERE bt.name LIKE 'Whale%'
UNION ALL
SELECT 
  bt.id,
  4,
  'legendary_guaranteed',
  '{"legendary": 0.85, "godmode": 0.15}'::jsonb,
  'Slot 3-5: Legendary garantido'
FROM booster_types bt WHERE bt.name LIKE 'Whale%'
UNION ALL
SELECT 
  bt.id,
  5,
  'legendary_guaranteed',
  '{"legendary": 0.85, "godmode": 0.15}'::jsonb,
  'Slot 3-5: Legendary garantido'
FROM booster_types bt WHERE bt.name LIKE 'Whale%'
ON CONFLICT (booster_type_id, slot_position) DO UPDATE 
SET rarity_weights = EXCLUDED.rarity_weights;

INSERT INTO booster_slot_config (booster_type_id, slot_position, slot_name, rarity_weights, description)
SELECT 
  bt.id,
  6,
  'wildcard_whale',
  '{"legendary": 0.50, "godmode": 0.50}'::jsonb,
  'Slot 6-7: Wildcards whale (50/50)'
FROM booster_types bt WHERE bt.name LIKE 'Whale%'
UNION ALL
SELECT 
  bt.id,
  7,
  'wildcard_whale',
  '{"legendary": 0.50, "godmode": 0.50}'::jsonb,
  'Slot 6-7: Wildcards whale (50/50)'
FROM booster_types bt WHERE bt.name LIKE 'Whale%'
ON CONFLICT (booster_type_id, slot_position) DO UPDATE 
SET rarity_weights = EXCLUDED.rarity_weights;

-- ============================================================================
-- ATUALIZAR CARDS_PER_BOOSTER
-- ============================================================================
UPDATE booster_types SET cards_per_booster = 5 WHERE name LIKE 'Básico%' OR name LIKE 'Padrão%' OR name LIKE 'Premium%';
UPDATE booster_types SET cards_per_booster = 6 WHERE name LIKE 'Elite%';
UPDATE booster_types SET cards_per_booster = 7 WHERE name LIKE 'Whale%';

-- ============================================================================
-- VERIFICAÇÃO
-- ============================================================================
SELECT 
  bt.name,
  bt.price_brl,
  bt.cards_per_booster,
  COUNT(bsc.id) as slots_configurados
FROM booster_types bt
LEFT JOIN booster_slot_config bsc ON bsc.booster_type_id = bt.id
GROUP BY bt.id, bt.name, bt.price_brl, bt.cards_per_booster
ORDER BY bt.price_brl;

-- ============================================================================
-- FUNÇÃO HELPER: Weighted Random Selection
-- ============================================================================
CREATE OR REPLACE FUNCTION select_rarity_by_weight(weights JSONB)
RETURNS TEXT AS $$
DECLARE
  total_weight NUMERIC := 0;
  random_value NUMERIC;
  current_weight NUMERIC := 0;
  rarity_key TEXT;
  rarity_weight NUMERIC;
BEGIN
  -- Calculate total weight
  FOR rarity_key, rarity_weight IN 
    SELECT key, value::numeric FROM jsonb_each_text(weights)
  LOOP
    total_weight := total_weight + rarity_weight;
  END LOOP;

  -- Generate random value
  random_value := random() * total_weight;

  -- Select rarity based on weight
  FOR rarity_key, rarity_weight IN 
    SELECT key, value::numeric FROM jsonb_each_text(weights)
  LOOP
    current_weight := current_weight + rarity_weight;
    IF random_value <= current_weight THEN
      RETURN rarity_key;
    END IF;
  END LOOP;

  -- Fallback (should never happen)
  RETURN 'trash';
END;
$$ LANGUAGE plpgsql VOLATILE;

-- ============================================================================
-- ✅ SISTEMA DE SLOTS CONFIGURADO!
-- ============================================================================
-- Próximos passos:
-- 1. Implementar função de abertura de booster com slots
-- 2. Implementar pity system
-- 3. Implementar foil system (10% chance)
-- 4. Testar RTP real vs esperado
-- ============================================================================
