-- ============================================================================
-- FORÇAR RECRIAÇÃO DA ESTRUTURA
-- ============================================================================

-- Verificar se pack_id já existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'booster_types' AND column_name = 'pack_id'
    ) THEN
        ALTER TABLE booster_types ADD COLUMN pack_id TEXT;
        RAISE NOTICE 'Coluna pack_id adicionada';
    ELSE
        RAISE NOTICE 'Coluna pack_id já existe';
    END IF;
END $$;

-- Forçar recriação do índice
DROP INDEX IF EXISTS idx_booster_types_pack_id;
CREATE INDEX idx_booster_types_pack_id ON booster_types(pack_id);

-- Verificar resultado
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'booster_types'
ORDER BY ordinal_position;

-- Mostrar boosters atuais
SELECT id, name, edition_id, price_brl, pack_id
FROM booster_types
LIMIT 5;
