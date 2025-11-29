-- 20251129: Add purchased_at column to booster_openings table
-- This column tracks when the booster was purchased (vs opened_at which tracks when it was opened)
-- Allows for sealed pack inventory management

ALTER TABLE public.booster_openings 
  ADD COLUMN IF NOT EXISTS purchased_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create index for efficient queries on sealed packs
CREATE INDEX IF NOT EXISTS idx_booster_openings_purchased_at 
  ON public.booster_openings(purchased_at DESC);

-- Update existing records to have purchased_at = opened_at (for historical data)
UPDATE public.booster_openings 
SET purchased_at = COALESCE(opened_at, now()) 
WHERE purchased_at IS NULL;

-- Make purchased_at NOT NULL after backfilling
ALTER TABLE public.booster_openings 
  ALTER COLUMN purchased_at SET NOT NULL;

COMMENT ON COLUMN public.booster_openings.purchased_at IS 'Timestamp when the booster was purchased';
COMMENT ON COLUMN public.booster_openings.opened_at IS 'Timestamp when the booster was opened (NULL = sealed/unopened)';
