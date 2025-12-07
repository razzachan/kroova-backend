-- MEIO TERMO: 3X os valores originais
UPDATE booster_types SET value_adjustment = 0.51 WHERE name LIKE 'Básico%';
UPDATE booster_types SET value_adjustment = 1.44 WHERE name LIKE 'Padrão%';
UPDATE booster_types SET value_adjustment = 1.02 WHERE name LIKE 'Premium%';
UPDATE booster_types SET value_adjustment = 0.57 WHERE name LIKE 'Elite%';
UPDATE booster_types SET value_adjustment = 0.63 WHERE name LIKE 'Whale%';

SELECT name, value_adjustment FROM booster_types ORDER BY name;
