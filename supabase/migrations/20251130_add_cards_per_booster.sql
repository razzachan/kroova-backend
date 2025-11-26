-- Add missing cards_per_booster column to booster_types for legacy table
ALTER TABLE booster_types ADD COLUMN IF NOT EXISTS cards_per_booster INTEGER DEFAULT 5;
