-- ============================================================================
-- REBALANCEAMENTO: GODMODE E LEGENDARY ULTRA RAROS
-- Mantém 70% RTP mas com chances realistas de TCG físico
-- ============================================================================

-- BÁSICO (R$ 0.50) - 5 cartas - RTP 70%
-- Godmode: 0.02% | Legendary: 0.3% (ULTRA RARO)
-- ----------------------------------------------------------------------------
DELETE FROM booster_slot_config WHERE booster_type_id IN (SELECT id FROM booster_types WHERE name LIKE 'Básico%');

INSERT INTO booster_slot_config (booster_type_id, slot_position, slot_name, rarity_weights, description)
SELECT id, 1, 'common_guaranteed', '{"trash": 0.60, "meme": 0.39, "viral": 0.01}'::jsonb, 'Slot 1: Common'
FROM booster_types WHERE name LIKE 'Básico%';

INSERT INTO booster_slot_config (booster_type_id, slot_position, slot_name, rarity_weights, description)
SELECT id, unnest(ARRAY[2, 3]), 'common', '{"trash": 0.75, "meme": 0.24, "viral": 0.01}'::jsonb, 'Slots 2-3'
FROM booster_types WHERE name LIKE 'Básico%';

INSERT INTO booster_slot_config (booster_type_id, slot_position, slot_name, rarity_weights, description)
SELECT id, unnest(ARRAY[4, 5]), 'wildcard', '{"trash": 0.70, "meme": 0.28, "viral": 0.017, "legendary": 0.003, "godmode": 0.0002}'::jsonb, 'Slots 4-5: Wildcards'
FROM booster_types WHERE name LIKE 'Básico%';

-- PADRÃO (R$ 1.00) - 5 cartas - RTP 70%
-- Godmode: 0.1% | Legendary: 1% (MUITO RARO)
-- ----------------------------------------------------------------------------
DELETE FROM booster_slot_config WHERE booster_type_id IN (SELECT id FROM booster_types WHERE name LIKE 'Padrão%');

INSERT INTO booster_slot_config (booster_type_id, slot_position, slot_name, rarity_weights, description)
SELECT id, 1, 'uncommon_guaranteed', '{"meme": 0.55, "viral": 0.43, "legendary": 0.019, "godmode": 0.001}'::jsonb, 'Slot 1: Uncommon'
FROM booster_types WHERE name LIKE 'Padrão%';

INSERT INTO booster_slot_config (booster_type_id, slot_position, slot_name, rarity_weights, description)
SELECT id, unnest(ARRAY[2, 3]), 'common_improved', '{"trash": 0.50, "meme": 0.47, "viral": 0.03}'::jsonb, 'Slots 2-3'
FROM booster_types WHERE name LIKE 'Padrão%';

INSERT INTO booster_slot_config (booster_type_id, slot_position, slot_name, rarity_weights, description)
SELECT id, unnest(ARRAY[4, 5]), 'wildcard', '{"trash": 0.45, "meme": 0.45, "viral": 0.09, "legendary": 0.009, "godmode": 0.001}'::jsonb, 'Slots 4-5'
FROM booster_types WHERE name LIKE 'Padrão%';

-- PREMIUM (R$ 2.00) - 5 cartas - RTP 70%
-- Godmode: 0.5% | Legendary: 3% (RARO)
-- ----------------------------------------------------------------------------
DELETE FROM booster_slot_config WHERE booster_type_id IN (SELECT id FROM booster_types WHERE name LIKE 'Premium%');

INSERT INTO booster_slot_config (booster_type_id, slot_position, slot_name, rarity_weights, description)
SELECT id, 1, 'rare_guaranteed', '{"viral": 0.85, "legendary": 0.14, "godmode": 0.01}'::jsonb, 'Slot 1: Rare garantido'
FROM booster_types WHERE name LIKE 'Premium%';

INSERT INTO booster_slot_config (booster_type_id, slot_position, slot_name, rarity_weights, description)
SELECT id, 2, 'uncommon_guaranteed', '{"meme": 0.50, "viral": 0.47, "legendary": 0.03}'::jsonb, 'Slot 2'
FROM booster_types WHERE name LIKE 'Premium%';

INSERT INTO booster_slot_config (booster_type_id, slot_position, slot_name, rarity_weights, description)
SELECT id, unnest(ARRAY[3, 4, 5]), 'wildcard_premium', '{"meme": 0.35, "viral": 0.60, "legendary": 0.045, "godmode": 0.005}'::jsonb, 'Slots 3-5'
FROM booster_types WHERE name LIKE 'Premium%';

-- ELITE (R$ 5.00) - 6 cartas - RTP 70%
-- Godmode: 2% | Legendary: 15% (INCOMUM)
-- ----------------------------------------------------------------------------
DELETE FROM booster_slot_config WHERE booster_type_id IN (SELECT id FROM booster_types WHERE name LIKE 'Elite%');

INSERT INTO booster_slot_config (booster_type_id, slot_position, slot_name, rarity_weights, description)
SELECT id, 1, 'legendary_slot', '{"viral": 0.30, "legendary": 0.68, "godmode": 0.02}'::jsonb, 'Slot 1: Legendary slot (68%)'
FROM booster_types WHERE name LIKE 'Elite%';

INSERT INTO booster_slot_config (booster_type_id, slot_position, slot_name, rarity_weights, description)
SELECT id, 2, 'rare_guaranteed', '{"viral": 0.75, "legendary": 0.24, "godmode": 0.01}'::jsonb, 'Slot 2: Rare'
FROM booster_types WHERE name LIKE 'Elite%';

INSERT INTO booster_slot_config (booster_type_id, slot_position, slot_name, rarity_weights, description)
SELECT id, unnest(ARRAY[3, 4]), 'uncommon_improved', '{"meme": 0.10, "viral": 0.75, "legendary": 0.14, "godmode": 0.01}'::jsonb, 'Slots 3-4'
FROM booster_types WHERE name LIKE 'Elite%';

INSERT INTO booster_slot_config (booster_type_id, slot_position, slot_name, rarity_weights, description)
SELECT id, unnest(ARRAY[5, 6]), 'wildcard_elite', '{"viral": 0.60, "legendary": 0.38, "godmode": 0.02}'::jsonb, 'Slots 5-6'
FROM booster_types WHERE name LIKE 'Elite%';

-- WHALE (R$ 10.00) - 7 cartas - RTP 70%
-- Godmode: 8% | Legendary: 50% (COMUM LEGENDARY, RARO GODMODE)
-- ----------------------------------------------------------------------------
DELETE FROM booster_slot_config WHERE booster_type_id IN (SELECT id FROM booster_types WHERE name LIKE 'Whale%');

INSERT INTO booster_slot_config (booster_type_id, slot_position, slot_name, rarity_weights, description)
SELECT id, unnest(ARRAY[1, 2]), 'legendary_premium', '{"legendary": 0.92, "godmode": 0.08}'::jsonb, 'Slots 1-2: Legendary premium (8% godmode)'
FROM booster_types WHERE name LIKE 'Whale%';

INSERT INTO booster_slot_config (booster_type_id, slot_position, slot_name, rarity_weights, description)
SELECT id, unnest(ARRAY[3, 4, 5]), 'legendary_guaranteed', '{"legendary": 0.94, "godmode": 0.06}'::jsonb, 'Slots 3-5: Legendary (6% godmode)'
FROM booster_types WHERE name LIKE 'Whale%';

INSERT INTO booster_slot_config (booster_type_id, slot_position, slot_name, rarity_weights, description)
SELECT id, unnest(ARRAY[6, 7]), 'wildcard_whale', '{"legendary": 0.90, "godmode": 0.10}'::jsonb, 'Slots 6-7: (10% godmode)'
FROM booster_types WHERE name LIKE 'Whale%';

-- ============================================================================
-- VERIFICAÇÃO
-- ============================================================================
SELECT 
  bt.name,
  bt.price_brl,
  bt.cards_per_booster,
  COUNT(bsc.id) as slots
FROM booster_types bt
LEFT JOIN booster_slot_config bsc ON bsc.booster_type_id = bt.id
GROUP BY bt.id, bt.name, bt.price_brl, bt.cards_per_booster
ORDER BY bt.price_brl;

-- ============================================================================
-- ANÁLISE DE CHANCES REAIS
-- ============================================================================

-- BÁSICO: Chance de godmode em 1 booster = 1 - (0.9998^5) = 0.1% ≈ 1 em 1000
-- PADRÃO: Chance de godmode em 1 booster = 0.3% ≈ 1 em 333
-- PREMIUM: Chance de godmode em 1 booster = 2.5% ≈ 1 em 40
-- ELITE: Chance de godmode em 1 booster = 11% ≈ 1 em 9
-- WHALE: Chance de godmode em 1 booster = 44% (média 0.5 godmode por booster)

-- BÁSICO: Chance de legendary = 1.5% ≈ 1 em 67
-- PADRÃO: Chance de legendary = 5% ≈ 1 em 20
-- PREMIUM: Chance de legendary = 15% ≈ 1 em 7
-- ELITE: Chance de legendary = 68% (quase garantido 1 legendary)
-- WHALE: Chance de legendary = 100% (média 3-4 legendary por booster)

-- ============================================================================
-- ✅ REBALANCEADO! Godmode agora é ULTRA RARO
-- ============================================================================
