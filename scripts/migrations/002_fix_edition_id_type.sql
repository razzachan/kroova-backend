-- Fix edition_id type mismatch

-- 1. Verificar tipo atual
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'booster_types' AND column_name = 'edition_id';

-- 2. Se for UUID, alterar para TEXT
ALTER TABLE booster_types ALTER COLUMN edition_id TYPE TEXT;

-- 3. Verificar tipo em cards_base tambem
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'cards_base' AND column_name = 'edition_id';

-- 4. Se for UUID, alterar para TEXT
ALTER TABLE cards_base ALTER COLUMN edition_id TYPE TEXT;

-- 5. Confirmar que os valores estao corretos
SELECT name, edition_id FROM booster_types LIMIT 3;
