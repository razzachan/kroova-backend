
-- ============================================================================
-- SISTEMA DE SLOTS KROOVA - EXECUÇÃO COMPLETA
-- Gerado automaticamente em 2025-12-10 10:13:06.084563
-- ============================================================================

-- PASSO 1: Criar tabelas
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS booster_slot_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booster_type_id UUID NOT NULL REFERENCES booster_types(id) ON DELETE CASCADE,
  slot_position INT NOT NULL,
  slot_name TEXT NOT NULL,
  rarity_weights JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(booster_type_id, slot_position)
);

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

CREATE INDEX IF NOT EXISTS idx_slot_config_booster ON booster_slot_config(booster_type_id);
CREATE INDEX IF NOT EXISTS idx_pity_tracker_user ON booster_pity_tracker(user_id);
CREATE INDEX IF NOT EXISTS idx_pity_tracker_user_booster ON booster_pity_tracker(user_id, booster_type_id);

-- PASSO 2: Configurar BÁSICO (R$ 0.50) - 5 cartas
-- ----------------------------------------------------------------------------
INSERT INTO booster_slot_config (booster_type_id, slot_position, slot_name, rarity_weights, description)
SELECT id, 1, 'common_guaranteed', '{"trash": 0.70, "meme": 0.28, "viral": 0.02}'::jsonb, 'Slot 1: Common garantido'
FROM booster_types WHERE name LIKE 'Básico%'
ON CONFLICT (booster_type_id, slot_position) DO UPDATE SET rarity_weights = EXCLUDED.rarity_weights;

INSERT INTO booster_slot_config (booster_type_id, slot_position, slot_name, rarity_weights, description)
SELECT id, unnest(ARRAY[2, 3]), 'common', '{"trash": 0.85, "meme": 0.15}'::jsonb, 'Slots 2-3: Commons'
FROM booster_types WHERE name LIKE 'Básico%'
ON CONFLICT (booster_type_id, slot_position) DO UPDATE SET rarity_weights = EXCLUDED.rarity_weights;

INSERT INTO booster_slot_config (booster_type_id, slot_position, slot_name, rarity_weights, description)
SELECT id, unnest(ARRAY[4, 5]), 'wildcard', '{"trash": 0.75, "meme": 0.20, "viral": 0.04, "legendary": 0.009, "godmode": 0.001}'::jsonb, 'Slots 4-5: Wildcards'
FROM booster_types WHERE name LIKE 'Básico%'
ON CONFLICT (booster_type_id, slot_position) DO UPDATE SET rarity_weights = EXCLUDED.rarity_weights;

-- PASSO 3: Configurar PADRÃO (R$ 1.00) - 5 cartas
-- ----------------------------------------------------------------------------
INSERT INTO booster_slot_config (booster_type_id, slot_position, slot_name, rarity_weights, description)
SELECT id, 1, 'uncommon_guaranteed', '{"meme": 0.50, "viral": 0.40, "legendary": 0.09, "godmode": 0.01}'::jsonb, 'Slot 1: Uncommon garantido'
FROM booster_types WHERE name LIKE 'Padrão%'
ON CONFLICT (booster_type_id, slot_position) DO UPDATE SET rarity_weights = EXCLUDED.rarity_weights;

INSERT INTO booster_slot_config (booster_type_id, slot_position, slot_name, rarity_weights, description)
SELECT id, unnest(ARRAY[2, 3]), 'common_improved', '{"trash": 0.60, "meme": 0.35, "viral": 0.05}'::jsonb, 'Slots 2-3: Common melhorado'
FROM booster_types WHERE name LIKE 'Padrão%'
ON CONFLICT (booster_type_id, slot_position) DO UPDATE SET rarity_weights = EXCLUDED.rarity_weights;

INSERT INTO booster_slot_config (booster_type_id, slot_position, slot_name, rarity_weights, description)
SELECT id, unnest(ARRAY[4, 5]), 'wildcard', '{"trash": 0.50, "meme": 0.35, "viral": 0.12, "legendary": 0.025, "godmode": 0.005}'::jsonb, 'Slots 4-5: Wildcards'
FROM booster_types WHERE name LIKE 'Padrão%'
ON CONFLICT (booster_type_id, slot_position) DO UPDATE SET rarity_weights = EXCLUDED.rarity_weights;

-- PASSO 4: Configurar PREMIUM (R$ 2.00) - 5 cartas
-- ----------------------------------------------------------------------------
INSERT INTO booster_slot_config (booster_type_id, slot_position, slot_name, rarity_weights, description)
SELECT id, 1, 'rare_guaranteed', '{"viral": 0.70, "legendary": 0.25, "godmode": 0.05}'::jsonb, 'Slot 1: Rare garantido'
FROM booster_types WHERE name LIKE 'Premium%'
ON CONFLICT (booster_type_id, slot_position) DO UPDATE SET rarity_weights = EXCLUDED.rarity_weights;

INSERT INTO booster_slot_config (booster_type_id, slot_position, slot_name, rarity_weights, description)
SELECT id, 2, 'uncommon_guaranteed', '{"meme": 0.40, "viral": 0.50, "legendary": 0.10}'::jsonb, 'Slot 2: Uncommon melhorado'
FROM booster_types WHERE name LIKE 'Premium%'
ON CONFLICT (booster_type_id, slot_position) DO UPDATE SET rarity_weights = EXCLUDED.rarity_weights;

INSERT INTO booster_slot_config (booster_type_id, slot_position, slot_name, rarity_weights, description)
SELECT id, unnest(ARRAY[3, 4, 5]), 'wildcard_premium', '{"meme": 0.30, "viral": 0.45, "legendary": 0.20, "godmode": 0.05}'::jsonb, 'Slots 3-5: Wildcards premium'
FROM booster_types WHERE name LIKE 'Premium%'
ON CONFLICT (booster_type_id, slot_position) DO UPDATE SET rarity_weights = EXCLUDED.rarity_weights;

-- PASSO 5: Configurar ELITE (R$ 5.00) - 6 cartas
-- ----------------------------------------------------------------------------
INSERT INTO booster_slot_config (booster_type_id, slot_position, slot_name, rarity_weights, description)
SELECT id, 1, 'legendary_guaranteed', '{"legendary": 0.80, "godmode": 0.20}'::jsonb, 'Slot 1: Legendary garantido'
FROM booster_types WHERE name LIKE 'Elite%'
ON CONFLICT (booster_type_id, slot_position) DO UPDATE SET rarity_weights = EXCLUDED.rarity_weights;

INSERT INTO booster_slot_config (booster_type_id, slot_position, slot_name, rarity_weights, description)
SELECT id, 2, 'rare_guaranteed', '{"viral": 0.60, "legendary": 0.35, "godmode": 0.05}'::jsonb, 'Slot 2: Rare garantido'
FROM booster_types WHERE name LIKE 'Elite%'
ON CONFLICT (booster_type_id, slot_position) DO UPDATE SET rarity_weights = EXCLUDED.rarity_weights;

INSERT INTO booster_slot_config (booster_type_id, slot_position, slot_name, rarity_weights, description)
SELECT id, unnest(ARRAY[3, 4]), 'uncommon_improved', '{"viral": 0.30, "legendary": 0.60, "godmode": 0.10}'::jsonb, 'Slots 3-4: Uncommon melhorado'
FROM booster_types WHERE name LIKE 'Elite%'
ON CONFLICT (booster_type_id, slot_position) DO UPDATE SET rarity_weights = EXCLUDED.rarity_weights;

INSERT INTO booster_slot_config (booster_type_id, slot_position, slot_name, rarity_weights, description)
SELECT id, unnest(ARRAY[5, 6]), 'wildcard_elite', '{"viral": 0.20, "legendary": 0.50, "godmode": 0.30}'::jsonb, 'Slots 5-6: Wildcards elite'
FROM booster_types WHERE name LIKE 'Elite%'
ON CONFLICT (booster_type_id, slot_position) DO UPDATE SET rarity_weights = EXCLUDED.rarity_weights;

-- PASSO 6: Configurar WHALE (R$ 10.00) - 7 cartas
-- ----------------------------------------------------------------------------
INSERT INTO booster_slot_config (booster_type_id, slot_position, slot_name, rarity_weights, description)
SELECT id, unnest(ARRAY[1, 2]), 'godmode_premium', '{"legendary": 0.60, "godmode": 0.40}'::jsonb, 'Slots 1-2: Godmode premium'
FROM booster_types WHERE name LIKE 'Whale%'
ON CONFLICT (booster_type_id, slot_position) DO UPDATE SET rarity_weights = EXCLUDED.rarity_weights;

INSERT INTO booster_slot_config (booster_type_id, slot_position, slot_name, rarity_weights, description)
SELECT id, unnest(ARRAY[3, 4, 5]), 'legendary_guaranteed', '{"legendary": 0.85, "godmode": 0.15}'::jsonb, 'Slots 3-5: Legendary garantido'
FROM booster_types WHERE name LIKE 'Whale%'
ON CONFLICT (booster_type_id, slot_position) DO UPDATE SET rarity_weights = EXCLUDED.rarity_weights;

INSERT INTO booster_slot_config (booster_type_id, slot_position, slot_name, rarity_weights, description)
SELECT id, unnest(ARRAY[6, 7]), 'wildcard_whale', '{"legendary": 0.50, "godmode": 0.50}'::jsonb, 'Slots 6-7: Wildcards whale'
FROM booster_types WHERE name LIKE 'Whale%'
ON CONFLICT (booster_type_id, slot_position) DO UPDATE SET rarity_weights = EXCLUDED.rarity_weights;

-- PASSO 7: Atualizar quantidade de cartas
-- ----------------------------------------------------------------------------
UPDATE booster_types SET cards_per_booster = 5 WHERE name LIKE 'Básico%' OR name LIKE 'Padrão%' OR name LIKE 'Premium%';
UPDATE booster_types SET cards_per_booster = 6 WHERE name LIKE 'Elite%';
UPDATE booster_types SET cards_per_booster = 7 WHERE name LIKE 'Whale%';

-- PASSO 8: Verificação
-- ----------------------------------------------------------------------------
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
-- ✅ CONCLUÍDO! Sistema de slots configurado.
-- ============================================================================
