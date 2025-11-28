-- Fix booster_openings schema to match KROOVA_DB_SCHEMA.md

-- Check if cards_obtained column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'booster_openings' 
        AND column_name = 'cards_obtained'
    ) THEN
        -- Add cards_obtained column (JSONB)
        ALTER TABLE booster_openings 
        ADD COLUMN cards_obtained JSONB DEFAULT '[]'::jsonb;
        
        RAISE NOTICE 'Column cards_obtained added successfully';
    ELSE
        RAISE NOTICE 'Column cards_obtained already exists';
    END IF;
END $$;

-- Ensure opened_at column exists (if not)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'booster_openings' 
        AND column_name = 'opened_at'
    ) THEN
        ALTER TABLE booster_openings 
        ADD COLUMN opened_at TIMESTAMP WITH TIME ZONE;
        
        RAISE NOTICE 'Column opened_at added successfully';
    ELSE
        RAISE NOTICE 'Column opened_at already exists';
    END IF;
END $$;

-- Display current schema
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'booster_openings'
ORDER BY ordinal_position;
