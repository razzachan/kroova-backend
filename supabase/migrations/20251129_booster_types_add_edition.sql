-- Patch booster_types to ensure edition_id column exists remotely
-- Safe, idempotent operations for already-patched environments.

ALTER TABLE booster_types ADD COLUMN IF NOT EXISTS edition_id TEXT;
UPDATE booster_types SET edition_id = COALESCE(edition_id, 'EDITION_01');
ALTER TABLE booster_types ALTER COLUMN edition_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_booster_types_edition ON booster_types(edition_id);
