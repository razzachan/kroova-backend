-- APLICAR VALORES MATEMÁTICOS AGORA
UPDATE booster_types SET value_adjustment = 0.17 WHERE name LIKE 'Básico%';
UPDATE booster_types SET value_adjustment = 0.48 WHERE name LIKE 'Padrão%';
UPDATE booster_types SET value_adjustment = 0.34 WHERE name LIKE 'Premium%';
UPDATE booster_types SET value_adjustment = 0.19 WHERE name LIKE 'Elite%';
UPDATE booster_types SET value_adjustment = 0.21 WHERE name LIKE 'Whale%';

SELECT name, value_adjustment FROM booster_types ORDER BY name;
