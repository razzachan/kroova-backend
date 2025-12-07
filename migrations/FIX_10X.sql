-- SOLUÇÃO: MULTIPLICAR VALUE_ADJUSTMENTS POR 10X
-- Para compensar os skin multipliers altos (holo 2.5x, ghost 3x)

UPDATE booster_types SET value_adjustment = 1.7 WHERE name LIKE 'Básico%';
UPDATE booster_types SET value_adjustment = 4.8 WHERE name LIKE 'Padrão%';
UPDATE booster_types SET value_adjustment = 3.4 WHERE name LIKE 'Premium%';
UPDATE booster_types SET value_adjustment = 1.9 WHERE name LIKE 'Elite%';
UPDATE booster_types SET value_adjustment = 2.1 WHERE name LIKE 'Whale%';

SELECT name, value_adjustment FROM booster_types ORDER BY name;
