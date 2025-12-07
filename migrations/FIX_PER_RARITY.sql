-- SOLUÇÃO: Aumentar value_adjustment das raridades ALTAS
-- Problema: legendaries dominam RTP (R$ 1.99-8.57)
-- Básico OK em 74.5%, mas legendaries/virais muito altos

-- ESTRATÉGIA:
-- trash/meme: OK (baixos)
-- viral: aumentar 3x (0.40 → ~0.13)
-- legendary: aumentar 8x (2.37 → ~0.30)
-- godmode: aumentar 10x

-- Modificar value_adjustment POR TIER para compensar raridades:
UPDATE booster_types SET value_adjustment = 0.51 WHERE name LIKE 'Básico%';   -- OK
UPDATE booster_types SET value_adjustment = 0.80 WHERE name LIKE 'Padrão%';   -- aumentar (tinha 10%)
UPDATE booster_types SET value_adjustment = 3.00 WHERE name LIKE 'Premium%';  -- legendary alto
UPDATE booster_types SET value_adjustment = 4.00 WHERE name LIKE 'Elite%';    -- legendary alto
UPDATE booster_types SET value_adjustment = 5.00 WHERE name LIKE 'Whale%';    -- legendary dark 8.57!

-- Verificar
SELECT name, value_adjustment FROM booster_types ORDER BY name;
