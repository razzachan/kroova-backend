-- ============================================================================
-- SISTEMA DE SLOTS - FILOSOFIA SWU/MTG (CORRETO)
-- Regra: EXATAMENTE 2 slots legendary/godmode | 3 slots NUNCA legendary
-- TODAS as tiers: 5 cartas (Whale também!)
-- ============================================================================

-- BÁSICO (R$ 0.50) - 5 cartas - RTP 70%
-- Slots 1-3: NUNCA legendary | Slots 4-5: wildcards
-- ----------------------------------------------------------------------------
DELETE FROM booster_slot_config WHERE booster_type_id IN (SELECT id FROM booster_types WHERE name LIKE 'Básico%');

-- Slots 1-3: COMMONS (NUNCA legendary/godmode)
INSERT INTO booster_slot_config (booster_type_id, slot_position, slot_name, rarity_weights, description)
SELECT id, unnest(ARRAY[1, 2, 3]), 'common_filler', '{"trash": 0.70, "meme": 0.28, "viral": 0.02}'::jsonb, 'Slots 1-3: Commons (NUNCA legendary)'
FROM booster_types WHERE name LIKE 'Básico%';

-- Slot 4: WILDCARD 1 (pode ter legendary)
INSERT INTO booster_slot_config (booster_type_id, slot_position, slot_name, rarity_weights, description)
SELECT id, 4, 'wildcard_1', '{"trash": 0.65, "meme": 0.30, "viral": 0.045, "legendary": 0.005}'::jsonb, 'Slot 4: Wildcard (0.5% legendary)'
FROM booster_types WHERE name LIKE 'Básico%';

-- Slot 5: WILDCARD 2 (pode ter legendary/godmode)
INSERT INTO booster_slot_config (booster_type_id, slot_position, slot_name, rarity_weights, description)
SELECT id, 5, 'wildcard_2', '{"trash": 0.60, "meme": 0.35, "viral": 0.048, "legendary": 0.0019, "godmode": 0.00001}'::jsonb, 'Slot 5: Wildcard (0.2% legendary, 0.001% godmode)'
FROM booster_types WHERE name LIKE 'Básico%';

-- PADRÃO (R$ 1.00) - 5 cartas - RTP 70%
-- Slots 1-3: NUNCA legendary | Slots 4-5: wildcards
-- ----------------------------------------------------------------------------
DELETE FROM booster_slot_config WHERE booster_type_id IN (SELECT id FROM booster_types WHERE name LIKE 'Padrão%');

-- Slots 1-3: COMMONS/UNCOMMONS (NUNCA legendary/godmode)
INSERT INTO booster_slot_config (booster_type_id, slot_position, slot_name, rarity_weights, description)
SELECT id, unnest(ARRAY[1, 2, 3]), 'common_uncommon', '{"trash": 0.55, "meme": 0.40, "viral": 0.05}'::jsonb, 'Slots 1-3: Commons/Uncommons (NUNCA legendary)'
FROM booster_types WHERE name LIKE 'Padrão%';

-- Slot 4: WILDCARD 1 (3% legendary)
INSERT INTO booster_slot_config (booster_type_id, slot_position, slot_name, rarity_weights, description)
SELECT id, 4, 'wildcard_1', '{"trash": 0.40, "meme": 0.45, "viral": 0.12, "legendary": 0.03}'::jsonb, 'Slot 4: Wildcard (3% legendary)'
FROM booster_types WHERE name LIKE 'Padrão%';

-- Slot 5: WILDCARD 2 (2% legendary, 0.01% godmode)
INSERT INTO booster_slot_config (booster_type_id, slot_position, slot_name, rarity_weights, description)
SELECT id, 5, 'wildcard_2', '{"trash": 0.35, "meme": 0.40, "viral": 0.239, "legendary": 0.02, "godmode": 0.0001}'::jsonb, 'Slot 5: Wildcard (2% legendary, 0.01% godmode)'
FROM booster_types WHERE name LIKE 'Padrão%';

-- PREMIUM (R$ 2.00) - 5 cartas - RTP 70%
-- Slots 1-3: NUNCA legendary | Slots 4-5: wildcards
-- ----------------------------------------------------------------------------
DELETE FROM booster_slot_config WHERE booster_type_id IN (SELECT id FROM booster_types WHERE name LIKE 'Premium%');

-- Slots 1-3: UNCOMMONS/RARES (NUNCA legendary/godmode)
INSERT INTO booster_slot_config (booster_type_id, slot_position, slot_name, rarity_weights, description)
SELECT id, unnest(ARRAY[1, 2, 3]), 'uncommon_rare', '{"meme": 0.40, "viral": 0.60}'::jsonb, 'Slots 1-3: Uncommons/Rares (NUNCA legendary)'
FROM booster_types WHERE name LIKE 'Premium%';

-- Slot 4: WILDCARD 1 (20% legendary)
INSERT INTO booster_slot_config (booster_type_id, slot_position, slot_name, rarity_weights, description)
SELECT id, 4, 'wildcard_1', '{"meme": 0.20, "viral": 0.60, "legendary": 0.20}'::jsonb, 'Slot 4: Wildcard (20% legendary)'
FROM booster_types WHERE name LIKE 'Premium%';

-- Slot 5: WILDCARD 2 (15% legendary, 0.5% godmode)
INSERT INTO booster_slot_config (booster_type_id, slot_position, slot_name, rarity_weights, description)
SELECT id, 5, 'wildcard_2', '{"viral": 0.645, "legendary": 0.15, "godmode": 0.005}'::jsonb, 'Slot 5: Wildcard (15% legendary, 0.5% godmode)'
FROM booster_types WHERE name LIKE 'Premium%';

-- ELITE (R$ 5.00) - 5 cartas - RTP 70%
-- Slots 1-3: NUNCA legendary | Slots 4-5: wildcards
-- ----------------------------------------------------------------------------
DELETE FROM booster_slot_config WHERE booster_type_id IN (SELECT id FROM booster_types WHERE name LIKE 'Elite%');

-- Slots 1-3: RARES (NUNCA legendary/godmode - só viral/meme)
INSERT INTO booster_slot_config (booster_type_id, slot_position, slot_name, rarity_weights, description)
SELECT id, unnest(ARRAY[1, 2, 3]), 'rare_filler', '{"meme": 0.10, "viral": 0.90}'::jsonb, 'Slots 1-3: Rares (NUNCA legendary)'
FROM booster_types WHERE name LIKE 'Elite%';

-- Slot 4: WILDCARD 1 (70% legendary, 3% godmode)
INSERT INTO booster_slot_config (booster_type_id, slot_position, slot_name, rarity_weights, description)
SELECT id, 4, 'wildcard_1', '{"viral": 0.27, "legendary": 0.70, "godmode": 0.03}'::jsonb, 'Slot 4: Wildcard (70% legendary, 3% godmode)'
FROM booster_types WHERE name LIKE 'Elite%';

-- Slot 5: WILDCARD 2 (60% legendary, 2% godmode)
INSERT INTO booster_slot_config (booster_type_id, slot_position, slot_name, rarity_weights, description)
SELECT id, 5, 'wildcard_2', '{"viral": 0.28, "legendary": 0.60, "godmode": 0.02}'::jsonb, 'Slot 5: Wildcard (60% legendary, 2% godmode)'
FROM booster_types WHERE name LIKE 'Elite%';

-- WHALE (R$ 10.00) - 5 cartas (MESMA quantidade!) - RTP 70%
-- Slots 1-3: NUNCA legendary | Slots 4-5: wildcards (% MUITO ALTAS!)
-- ----------------------------------------------------------------------------
DELETE FROM booster_slot_config WHERE booster_type_id IN (SELECT id FROM booster_types WHERE name LIKE 'Whale%');

-- Slots 1-3: RARES PREMIUM (NUNCA legendary/godmode - só viral)
INSERT INTO booster_slot_config (booster_type_id, slot_position, slot_name, rarity_weights, description)
SELECT id, unnest(ARRAY[1, 2, 3]), 'rare_premium', '{"viral": 1.00}'::jsonb, 'Slots 1-3: Rares premium (NUNCA legendary)'
FROM booster_types WHERE name LIKE 'Whale%';

-- Slot 4: WILDCARD 1 (85% legendary, 8% godmode)
INSERT INTO booster_slot_config (booster_type_id, slot_position, slot_name, rarity_weights, description)
SELECT id, 4, 'wildcard_1', '{"viral": 0.07, "legendary": 0.85, "godmode": 0.08}'::jsonb, 'Slot 4: Wildcard (85% legendary, 8% godmode)'
FROM booster_types WHERE name LIKE 'Whale%';

-- Slot 5: WILDCARD 2 (80% legendary, 7% godmode)
INSERT INTO booster_slot_config (booster_type_id, slot_position, slot_name, rarity_weights, description)
SELECT id, 5, 'wildcard_2', '{"viral": 0.13, "legendary": 0.80, "godmode": 0.07}'::jsonb, 'Slot 5: Wildcard (80% legendary, 7% godmode)'
FROM booster_types WHERE name LIKE 'Whale%';

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
-- ANÁLISE MATEMÁTICA CORRETA
-- ============================================================================

-- BÁSICO (R$ 0.50) - 5 cartas:
-- Slots 1-3: NUNCA legendary (só trash/meme/viral)
-- Slot 4: 0.5% legendary
-- Slot 5: 0.2% legendary + 0.001% godmode
-- Total: 0.7% legendary | 0.001% godmode por booster
-- Legendary: ~1 a cada 143 boosters | Godmode: ~1 a cada 100.000 boosters 🔥
-- Máximo de legendary por booster: 2 cartas

-- PADRÃO (R$ 1.00) - 5 cartas:
-- Slots 1-3: NUNCA legendary (só trash/meme/viral)
-- Slot 4: 3% legendary
-- Slot 5: 2% legendary + 0.01% godmode
-- Total: 5% legendary | 0.01% godmode por booster
-- Legendary: ~1 a cada 20 boosters | Godmode: ~1 a cada 10.000 boosters 🔥
-- Máximo de legendary por booster: 2 cartas

-- PREMIUM (R$ 2.00) - 5 cartas:
-- Slots 1-3: NUNCA legendary (só meme/viral)
-- Slot 4: 20% legendary
-- Slot 5: 15% legendary + 0.5% godmode
-- Total: 35% legendary | 0.5% godmode por booster
-- Legendary: ~1 a cada 3 boosters | Godmode: ~1 a cada 200 boosters 💎
-- Máximo de legendary por booster: 2 cartas

-- ELITE (R$ 5.00) - 5 cartas:
-- Slots 1-3: NUNCA legendary (só meme/viral)
-- Slot 4: 70% legendary + 3% godmode
-- Slot 5: 60% legendary + 2% godmode
-- Total: 130% legendary (média 1.3 por booster) | 5% godmode
-- Godmode: ~1 a cada 20 boosters ⚡
-- Máximo de legendary por booster: 2 cartas

-- WHALE (R$ 10.00) - 5 cartas:
-- Slots 1-3: NUNCA legendary (só viral)
-- Slot 4: 85% legendary + 8% godmode
-- Slot 5: 80% legendary + 7% godmode
-- Total: 165% legendary (média 1.65 por booster) | 15% godmode
-- Godmode: ~1 a cada 7 boosters 👑
-- Máximo de legendary por booster: 2 cartas

-- ============================================================================
-- ✅ SISTEMA CORRETO FILOSOFIA SWU:
-- ✅ TODAS as tiers: 5 cartas (incluindo Whale)
-- ✅ 3 slots: NUNCA legendary (só trash/meme/viral)
-- ✅ 2 slots wildcards: podem ter legendary/godmode
-- ✅ Máximo absoluto: 2 legendary por booster
-- ✅ Godmode compete com legendary no mesmo slot
-- ✅ Tiers mais caras: mesma estrutura, % maiores nos wildcards
-- ============================================================================
