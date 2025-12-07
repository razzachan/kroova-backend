-- ===========================================================================
-- AJUSTAR VALUE_ADJUSTMENT PARA CONTROLAR RTP
-- ===========================================================================
-- Objetivo: Calibrar value_adjustment para atingir 62-72% RTP
-- 
-- CÁLCULO:
-- liquidity = (base_liquidity × skin_multiplier) / value_adjustment
-- 
-- Para legendary com base_liquidity = R$ 2.00:
-- - Padrão (R$ 1.00): legendary max R$ 0.70 → value_adj = 2.00 / 0.70 = 2.86
-- - Premium (R$ 2.00): legendary max R$ 1.50 → value_adj = 2.00 / 1.50 = 1.33
-- - Elite (R$ 5.00): legendary max R$ 3.50 → value_adj = 2.00 / 3.50 = 0.57
-- - Whale (R$ 10.00): legendary max R$ 7.00 → value_adj = 2.00 / 7.00 = 0.29

-- Para viral com base_liquidity = R$ 0.50:
-- - Básico (R$ 0.50): viral NÃO EXISTE (0%)
-- - Padrão (R$ 1.00): viral max R$ 0.70 → value_adj = 0.50 / 0.70 = 0.71
-- - Premium (R$ 2.00): viral max R$ 1.50 → value_adj = 0.50 / 1.50 = 0.33
-- - Elite (R$ 5.00): viral max R$ 3.50 → value_adj = 0.50 / 3.50 = 0.14
-- - Whale (R$ 10.00): viral max R$ 7.00 → value_adj = 0.50 / 7.00 = 0.07

-- MÉDIAS PONDERADAS (considerando distribuição de raridades):
-- Básico: 60% trash (0.02) + 40% meme (0.10) = avg R$ 0.052 → value_adj = 0.52 / 0.40 = 1.30
-- Padrão: 35% trash + 40% meme + 18% viral + 7% legendary = avg ~R$ 0.18 → value_adj = 0.18 / 0.70 = 0.26
-- Premium: mix → avg ~R$ 0.35 → value_adj = 0.35 / 1.50 = 0.23
-- Elite: 46% viral + 18% legendary → avg ~R$ 0.40 → value_adj = 0.40 / 3.50 = 0.11
-- Whale: 55% viral + 32% legendary → avg ~R$ 0.90 → value_adj = 0.90 / 7.00 = 0.13

UPDATE booster_types SET value_adjustment = 1.30 WHERE name LIKE 'Básico%';
UPDATE booster_types SET value_adjustment = 0.26 WHERE name LIKE 'Padrão%';
UPDATE booster_types SET value_adjustment = 0.23 WHERE name LIKE 'Premium%';
UPDATE booster_types SET value_adjustment = 0.11 WHERE name LIKE 'Elite%';
UPDATE booster_types SET value_adjustment = 0.13 WHERE name LIKE 'Whale%';

-- Verificar
SELECT 
  name,
  value_adjustment,
  rarity_distribution
FROM booster_types
ORDER BY 
  CASE 
    WHEN name LIKE 'Básico%' THEN 1
    WHEN name LIKE 'Padrão%' THEN 2
    WHEN name LIKE 'Premium%' THEN 3
    WHEN name LIKE 'Elite%' THEN 4
    WHEN name LIKE 'Whale%' THEN 5
  END,
  name;
