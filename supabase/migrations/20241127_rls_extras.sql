-- RLS extras (recreated version) for booster_openings and transactions
ALTER TABLE booster_openings ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='User views own booster openings' AND tablename='booster_openings') THEN
    EXECUTE 'CREATE POLICY "User views own booster openings" ON booster_openings FOR SELECT USING (auth.uid() = user_id)';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='User views own transactions' AND tablename='transactions') THEN
    EXECUTE 'CREATE POLICY "User views own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id)';
  END IF;
END $$;

-- Inserts/updates permanecem restritos a service role (não adicionar políticas públicas aqui)