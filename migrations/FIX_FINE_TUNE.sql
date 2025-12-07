-- AJUSTE FINO baseado nos resultados:
-- Whale: 72.6% ✅ (1.66 está PERFEITO, manter)
-- Básico: 33.3% → precisa ~2X maior (0.54 → 0.27)
-- Padrão: 46.5% → precisa ~1.5X maior (1.00 → 0.67)
-- Premium: 9.2% → sem virals, precisa ~7X maior (1.20 → 0.17)
-- Elite: 492% → GODMODE BUG, mas ignore e ajuste para ~2X (1.34 → 2.70)

UPDATE booster_types SET value_adjustment = 0.30 WHERE name LIKE 'Básico%';   -- dobrar RTP (33% → 66%)
UPDATE booster_types SET value_adjustment = 0.70 WHERE name LIKE 'Padrão%';   -- aumentar 1.4X (46% → 65%)
UPDATE booster_types SET value_adjustment = 0.80 WHERE name LIKE 'Premium%';  -- aumentar muito (9% → 63%)
UPDATE booster_types SET value_adjustment = 1.80 WHERE name LIKE 'Elite%';    -- aumentar (ignorando godmode outlier)
UPDATE booster_types SET value_adjustment = 1.66 WHERE name LIKE 'Whale%';    -- MANTER (72.6% perfeito!)

-- Verificar
SELECT name, value_adjustment FROM booster_types ORDER BY name;
