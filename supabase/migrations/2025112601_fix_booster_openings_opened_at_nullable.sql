-- 2025112601: Make opened_at nullable to allow creating unopened booster_openings
DO $$
DECLARE
  v_is_not_null boolean;
BEGIN
  SELECT (is_nullable = 'NO') INTO v_is_not_null
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'booster_openings'
    AND column_name = 'opened_at';

  IF v_is_not_null THEN
    ALTER TABLE public.booster_openings
      ALTER COLUMN opened_at DROP NOT NULL;
  END IF;
END $$;
