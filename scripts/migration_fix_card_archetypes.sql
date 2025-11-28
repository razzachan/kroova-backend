-- Kroova Migration: Normalize archetype values to canonical set
-- Canonical: Ganância, Influência, Impulso, Informação, Consumo, Preguiça
-- Idempotent: only changes rows whose lower(archetype) is not already canonical

BEGIN;

-- Standardize spacing and common mojibake/ascii variants to canonical forms
UPDATE cards_base SET archetype = 'Ganância'
WHERE lower(trim(archetype)) IN (
  'ganância','ganãncia','ganâcia','ganancia','ganância '
);

UPDATE cards_base SET archetype = 'Influência'
WHERE lower(trim(archetype)) IN (
  'influência','influÃªncia','influencia','influência '
);

UPDATE cards_base SET archetype = 'Impulso'
WHERE lower(trim(archetype)) IN (
  'impulso','impulÃ§o','impul so'
);

UPDATE cards_base SET archetype = 'Informação'
WHERE lower(trim(archetype)) IN (
  'informação','informaçao','informacao','informaçÃ£o'
);

UPDATE cards_base SET archetype = 'Consumo'
WHERE lower(trim(archetype)) IN (
  'consumo','consûmo'
);

UPDATE cards_base SET archetype = 'Preguiça'
WHERE lower(trim(archetype)) IN (
  'preguiça','preguicÃ£','preguica','pregui ça','preguiÃ§a'
);

COMMIT;

-- Verification query (optional):
-- SELECT archetype, COUNT(*) FROM cards_base GROUP BY archetype ORDER BY archetype;