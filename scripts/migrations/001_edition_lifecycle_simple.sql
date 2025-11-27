-- =====================================================
-- KROOVA EDITION LIFECYCLE MANAGEMENT
-- Sprint 1: Backend Foundation (SIMPLIFIED)
-- =====================================================

-- 1. Tabela principal de edicoes
CREATE TABLE IF NOT EXISTS edition_configs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  launch_date TIMESTAMPTZ NOT NULL,
  sunset_date TIMESTAMPTZ,
  status TEXT NOT NULL CHECK (status IN ('design', 'pre-launch', 'active', 'winding-down', 'legacy')) DEFAULT 'active',
  base_liquidity JSONB NOT NULL,
  skin_multipliers JSONB NOT NULL,
  godmode_multiplier DECIMAL NOT NULL DEFAULT 10,
  godmode_probability DECIMAL NOT NULL DEFAULT 0.01,
  rtp_target DECIMAL NOT NULL,
  jackpot_hard_cap DECIMAL NOT NULL DEFAULT 0.15,
  total_boosters_sold INTEGER DEFAULT 0,
  total_revenue DECIMAL DEFAULT 0,
  total_jackpots_paid DECIMAL DEFAULT 0,
  theme_colors JSONB,
  lore_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Metricas diarias por edicao
CREATE TABLE IF NOT EXISTS edition_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  edition_id TEXT NOT NULL REFERENCES edition_configs(id),
  date DATE NOT NULL,
  boosters_sold INTEGER DEFAULT 0,
  revenue DECIMAL DEFAULT 0,
  current_rtp DECIMAL,
  jackpot_payout_pct DECIMAL,
  marketplace_volume DECIMAL DEFAULT 0,
  recycle_volume DECIMAL DEFAULT 0,
  cards_generated JSONB,
  skins_generated JSONB,
  godmodes_awarded INTEGER DEFAULT 0,
  cap_alerts INTEGER DEFAULT 0,
  fraud_flags INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(edition_id, date)
);

CREATE INDEX IF NOT EXISTS idx_edition_metrics_edition_date ON edition_metrics(edition_id, date DESC);

-- 3. Eventos de edicao
CREATE TABLE IF NOT EXISTS edition_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  edition_id TEXT NOT NULL REFERENCES edition_configs(id),
  event_type TEXT NOT NULL,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_edition_events_edition ON edition_events(edition_id, created_at DESC);

-- 4. Atualizar booster_types
ALTER TABLE booster_types ADD COLUMN IF NOT EXISTS edition_id TEXT;
ALTER TABLE booster_types ADD COLUMN IF NOT EXISTS price_multiplier DECIMAL DEFAULT 1.0;

CREATE INDEX IF NOT EXISTS idx_booster_types_edition ON booster_types(edition_id);

-- 5. Atualizar cards_base
ALTER TABLE cards_base ADD COLUMN IF NOT EXISTS edition_id TEXT;
CREATE INDEX IF NOT EXISTS idx_cards_base_edition ON cards_base(edition_id);

-- 6. Atualizar cards_instances
ALTER TABLE cards_instances ADD COLUMN IF NOT EXISTS edition_id TEXT;
ALTER TABLE cards_instances ADD COLUMN IF NOT EXISTS skin TEXT DEFAULT 'default';
ALTER TABLE cards_instances ADD COLUMN IF NOT EXISTS is_godmode BOOLEAN DEFAULT FALSE;
ALTER TABLE cards_instances ADD COLUMN IF NOT EXISTS liquidity_brl DECIMAL(10,2);

CREATE INDEX IF NOT EXISTS idx_cards_instances_edition ON cards_instances(edition_id);
CREATE INDEX IF NOT EXISTS idx_cards_instances_godmode ON cards_instances(is_godmode) WHERE is_godmode = TRUE;

-- 7. Tabela de pity tracking
CREATE TABLE IF NOT EXISTS user_pity_counter (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  edition_id TEXT NOT NULL REFERENCES edition_configs(id),
  counter INTEGER DEFAULT 0,
  last_reset_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, edition_id)
);

CREATE INDEX IF NOT EXISTS idx_pity_counter_user ON user_pity_counter(user_id);

-- 8. Funcao para verificar hard cap
CREATE OR REPLACE FUNCTION check_edition_hard_cap(p_edition_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_total_revenue DECIMAL;
  v_total_jackpots DECIMAL;
  v_hard_cap DECIMAL;
  v_payout_pct DECIMAL;
BEGIN
  SELECT total_revenue, total_jackpots_paid, jackpot_hard_cap
  INTO v_total_revenue, v_total_jackpots, v_hard_cap
  FROM edition_configs WHERE id = p_edition_id;
  
  IF v_total_revenue = 0 THEN
    RETURN TRUE;
  END IF;
  
  v_payout_pct := v_total_jackpots / v_total_revenue;
  
  IF v_payout_pct >= v_hard_cap THEN
    INSERT INTO edition_events (edition_id, event_type, description, metadata)
    VALUES (p_edition_id, 'cap_reached', 'Hard cap atingido', 
            jsonb_build_object('payout_pct', v_payout_pct, 'hard_cap', v_hard_cap));
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 9. Funcao para atualizar edition metrics
CREATE OR REPLACE FUNCTION update_edition_metrics()
RETURNS TRIGGER AS $$
DECLARE
  v_edition_id TEXT;
  v_price DECIMAL;
BEGIN
  SELECT bt.edition_id, bt.price_brl INTO v_edition_id, v_price
  FROM booster_types bt WHERE bt.id = NEW.booster_type_id;
  
  IF v_edition_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  INSERT INTO edition_metrics (edition_id, date, boosters_sold, revenue)
  VALUES (v_edition_id, CURRENT_DATE, 1, v_price)
  ON CONFLICT (edition_id, date) DO UPDATE SET
    boosters_sold = edition_metrics.boosters_sold + 1,
    revenue = edition_metrics.revenue + EXCLUDED.revenue;
  
  UPDATE edition_configs SET
    total_boosters_sold = total_boosters_sold + 1,
    total_revenue = total_revenue + v_price,
    updated_at = NOW()
  WHERE id = v_edition_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_edition_metrics ON booster_openings;
CREATE TRIGGER trigger_update_edition_metrics
AFTER INSERT ON booster_openings
FOR EACH ROW EXECUTE FUNCTION update_edition_metrics();

-- 10. Funcao para incrementar pity counter
CREATE OR REPLACE FUNCTION increment_pity_counter(p_user_id UUID, p_edition_id TEXT)
RETURNS INTEGER AS $$
DECLARE
  v_current_counter INTEGER;
BEGIN
  INSERT INTO user_pity_counter (user_id, edition_id, counter, updated_at)
  VALUES (p_user_id, p_edition_id, 1, NOW())
  ON CONFLICT (user_id, edition_id) DO UPDATE SET
    counter = user_pity_counter.counter + 1,
    updated_at = NOW()
  RETURNING counter INTO v_current_counter;
  
  RETURN v_current_counter;
END;
$$ LANGUAGE plpgsql;

-- 11. Funcao para resetar pity counter
CREATE OR REPLACE FUNCTION reset_pity_counter(p_user_id UUID, p_edition_id TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE user_pity_counter SET
    counter = 0,
    last_reset_at = NOW(),
    updated_at = NOW()
  WHERE user_id = p_user_id AND edition_id = p_edition_id;
END;
$$ LANGUAGE plpgsql;

-- 12. Seed ED01
INSERT INTO edition_configs (
  id, name, description, launch_date, status,
  base_liquidity, skin_multipliers,
  godmode_multiplier, godmode_probability,
  rtp_target, jackpot_hard_cap, theme_colors, lore_summary
) VALUES (
  'ED01',
  'Colapso da Interface',
  'Primeira edicao oficial do universo Kroova.',
  '2026-03-01 00:00:00+00',
  'active',
  '{"trash":0.01,"meme":0.05,"viral":0.20,"legendary":1.00,"epica":2.00}'::jsonb,
  '{"default":1.0,"neon":1.5,"glow":2.0,"glitch":3.0,"ghost":4.0,"holo":6.0,"dark":10.0}'::jsonb,
  10, 0.01, 0.30, 0.15,
  '{"primary":"#FF006D","secondary":"#00F0FF","value":"#FFC700"}'::jsonb,
  'Quando a interface cai, quem sobrevive e quem sabe negociar.'
) ON CONFLICT (id) DO UPDATE SET
  base_liquidity = EXCLUDED.base_liquidity,
  skin_multipliers = EXCLUDED.skin_multipliers,
  updated_at = NOW();

-- 13. Atualizar cards_base existentes
UPDATE cards_base SET edition_id = 'ED01' WHERE edition_id IS NULL;

-- 14. Atualizar booster_types existentes
UPDATE booster_types SET edition_id = 'ED01' WHERE edition_id IS NULL;

-- 15. Deletar e recriar booster_types
DELETE FROM booster_types WHERE edition_id = 'ED01';

INSERT INTO booster_types (name, edition_id, price_brl, price_multiplier, cards_per_booster, rarity_distribution) VALUES
('Basico', 'ED01', 0.50, 1.0, 5, '{"trash":60,"meme":25,"viral":10,"legendary":4,"epica":1}'::jsonb),
('Padrao', 'ED01', 1.00, 2.0, 5, '{"trash":60,"meme":25,"viral":10,"legendary":4,"epica":1}'::jsonb),
('Premium', 'ED01', 2.00, 4.0, 5, '{"trash":60,"meme":25,"viral":10,"legendary":4,"epica":1}'::jsonb),
('Elite', 'ED01', 5.00, 10.0, 5, '{"trash":55,"meme":28,"viral":12,"legendary":4,"epica":1}'::jsonb),
('Whale', 'ED01', 10.00, 20.0, 5, '{"trash":50,"meme":30,"viral":14,"legendary":5,"epica":1}'::jsonb),
('Pack Viral', 'ED01', 2.25, 1.0, 5, '{"trash":55,"meme":28,"viral":12,"legendary":4,"epica":1}'::jsonb),
('Pack Lendario', 'ED01', 4.00, 1.0, 5, '{"trash":50,"meme":30,"viral":14,"legendary":5,"epica":1}'::jsonb),
('Pack Epico', 'ED01', 9.00, 1.0, 5, '{"trash":45,"meme":30,"viral":16,"legendary":7,"epica":2}'::jsonb),
('Pack Colecionador', 'ED01', 16.00, 1.0, 5, '{"trash":40,"meme":30,"viral":18,"legendary":9,"epica":3}'::jsonb);
