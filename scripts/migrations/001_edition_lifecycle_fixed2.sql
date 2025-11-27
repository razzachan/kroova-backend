-- =====================================================
-- KROOVA EDITION LIFECYCLE MANAGEMENT
-- Sprint 1: Backend Foundation
-- =====================================================

-- 1. Tabela principal de edições
CREATE TABLE IF NOT EXISTS edition_configs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Datas
  launch_date TIMESTAMPTZ NOT NULL,
  sunset_date TIMESTAMPTZ,
  
  -- Status
  status TEXT NOT NULL CHECK (status IN ('design', 'pre-launch', 'active', 'winding-down', 'legacy')) DEFAULT 'active',
  
  -- Economia (IMUTÁVEL após launch)
  base_liquidity JSONB NOT NULL,
  skin_multipliers JSONB NOT NULL,
  godmode_multiplier DECIMAL NOT NULL DEFAULT 10,
  godmode_probability DECIMAL NOT NULL DEFAULT 0.01,
  
  -- Targets
  rtp_target DECIMAL NOT NULL,
  jackpot_hard_cap DECIMAL NOT NULL DEFAULT 0.15,
  
  -- Tracking
  total_boosters_sold INTEGER DEFAULT 0,
  total_revenue DECIMAL DEFAULT 0,
  total_jackpots_paid DECIMAL DEFAULT 0,
  
  -- Metadata
  theme_colors JSONB,
  lore_summary TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Métricas diárias por edição
CREATE TABLE IF NOT EXISTS edition_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  edition_id TEXT NOT NULL REFERENCES edition_configs(id),
  date DATE NOT NULL,
  
  -- Vendas
  boosters_sold INTEGER DEFAULT 0,
  revenue DECIMAL DEFAULT 0,
  
  -- Economia
  current_rtp DECIMAL,
  jackpot_payout_pct DECIMAL,
  marketplace_volume DECIMAL DEFAULT 0,
  recycle_volume DECIMAL DEFAULT 0,
  
  -- Distribuição
  cards_generated JSONB,
  skins_generated JSONB,
  godmodes_awarded INTEGER DEFAULT 0,
  
  -- Alertas
  cap_alerts INTEGER DEFAULT 0,
  fraud_flags INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(edition_id, date)
);

CREATE INDEX IF NOT EXISTS idx_edition_metrics_edition_date ON edition_metrics(edition_id, date DESC);

-- 3. Eventos de edição
CREATE TABLE IF NOT EXISTS edition_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  edition_id TEXT NOT NULL REFERENCES edition_configs(id),
  event_type TEXT NOT NULL,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_edition_events_edition ON edition_events(edition_id, created_at DESC);

-- 4. Atualizar booster_types para suportar price multiplier
ALTER TABLE booster_types ADD COLUMN IF NOT EXISTS edition_id TEXT;
ALTER TABLE booster_types ADD COLUMN IF NOT EXISTS price_multiplier DECIMAL DEFAULT 1.0;

-- Adicionar FK depois de popular edition_configs
-- ALTER TABLE booster_types ADD CONSTRAINT fk_edition FOREIGN KEY (edition_id) REFERENCES edition_configs(id);

CREATE INDEX IF NOT EXISTS idx_booster_types_edition ON booster_types(edition_id);

-- 5. Atualizar cards_base para edition_id
ALTER TABLE cards_base ADD COLUMN IF NOT EXISTS edition_id TEXT;
CREATE INDEX IF NOT EXISTS idx_cards_base_edition ON cards_base(edition_id);

-- 6. Atualizar cards_instances para herdar edition_id e adicionar campos novos
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

-- 8. Função para verificar hard cap
CREATE OR REPLACE FUNCTION check_edition_hard_cap(p_edition_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_total_revenue DECIMAL;
  v_total_jackpots DECIMAL;
  v_hard_cap DECIMAL;
  v_payout_pct DECIMAL;
BEGIN
  SELECT 
    total_revenue,
    total_jackpots_paid,
    jackpot_hard_cap
  INTO 
    v_total_revenue,
    v_total_jackpots,
    v_hard_cap
  FROM edition_configs
  WHERE id = p_edition_id;
  
  IF v_total_revenue = 0 THEN
    RETURN TRUE; -- Sem receita ainda, pode continuar
  END IF;
  
  v_payout_pct := v_total_jackpots / v_total_revenue;
  
  IF v_payout_pct >= v_hard_cap THEN
    -- Log alerta
    INSERT INTO edition_events (edition_id, event_type, description, metadata)
    VALUES (
      p_edition_id,
      'cap_reached',
      'Hard cap atingido - Godmode bloqueado',
      jsonb_build_object('payout_pct', v_payout_pct, 'hard_cap', v_hard_cap)
    );
    
    RETURN FALSE; -- Bloqueia Godmode
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 9. Função para atualizar edition metrics
CREATE OR REPLACE FUNCTION update_edition_metrics()
RETURNS TRIGGER AS $$
DECLARE
  v_edition_id TEXT;
  v_price DECIMAL;
BEGIN
  -- Buscar edition_id e price do booster_type
  SELECT bt.edition_id, bt.price_brl
  INTO v_edition_id, v_price
  FROM booster_types bt
  WHERE bt.id = NEW.booster_type_id;
  
  IF v_edition_id IS NULL THEN
    RETURN NEW; -- Skip se não tem edition_id
  END IF;
  
  -- Atualizar métricas diárias
  INSERT INTO edition_metrics (edition_id, date, boosters_sold, revenue)
  VALUES (v_edition_id, CURRENT_DATE, 1, v_price)
  ON CONFLICT (edition_id, date) DO UPDATE SET
    boosters_sold = edition_metrics.boosters_sold + 1,
    revenue = edition_metrics.revenue + EXCLUDED.revenue;
  
  -- Atualizar totais da edição
  UPDATE edition_configs
  SET 
    total_boosters_sold = total_boosters_sold + 1,
    total_revenue = total_revenue + v_price,
    updated_at = NOW()
  WHERE id = v_edition_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar métricas após cada booster opening
DROP TRIGGER IF EXISTS trigger_update_edition_metrics ON booster_openings;
CREATE TRIGGER trigger_update_edition_metrics
AFTER INSERT ON booster_openings
FOR EACH ROW
EXECUTE FUNCTION update_edition_metrics();

-- 10. Função para incrementar pity counter
CREATE OR REPLACE FUNCTION increment_pity_counter(p_user_id UUID, p_edition_id TEXT)
RETURNS INTEGER AS $$
DECLARE
  v_current_counter INTEGER;
BEGIN
  -- Inserir ou atualizar counter
  INSERT INTO user_pity_counter (user_id, edition_id, counter, updated_at)
  VALUES (p_user_id, p_edition_id, 1, NOW())
  ON CONFLICT (user_id, edition_id) DO UPDATE SET
    counter = user_pity_counter.counter + 1,
    updated_at = NOW()
  RETURNING counter INTO v_current_counter;
  
  RETURN v_current_counter;
END;
$$ LANGUAGE plpgsql;

-- 11. Função para resetar pity counter
CREATE OR REPLACE FUNCTION reset_pity_counter(p_user_id UUID, p_edition_id TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE user_pity_counter
  SET 
    counter = 0,
    last_reset_at = NOW(),
    updated_at = NOW()
  WHERE user_id = p_user_id AND edition_id = p_edition_id;
END;
$$ LANGUAGE plpgsql;

-- 12. Seed ED01
INSERT INTO edition_configs (
  id,
  name,
  description,
  launch_date,
  status,
  base_liquidity,
  skin_multipliers,
  godmode_multiplier,
  godmode_probability,
  rtp_target,
  jackpot_hard_cap,
  theme_colors,
  lore_summary
) VALUES (
  'ED01',
  'Colapso da Interface',
  'Primeira edição oficial do universo Kroova. Entidades que vazaram da camada digital para o mundo real.',
  '2026-03-01 00:00:00+00',
  'active',
  '{"trash":0.01,"meme":0.05,"viral":0.20,"legendary":1.00,"epica":2.00}'::jsonb,
  '{"default":1.0,"neon":1.5,"glow":2.0,"glitch":3.0,"ghost":4.0,"holo":6.0,"dark":10.0}'::jsonb,
  10,
  0.01,
  0.30,
  0.15,
  '{"primary":"#FF006D","secondary":"#00F0FF","value":"#FFC700"}'::jsonb,
  'Quando a interface cai, quem sobrevive é quem sabe negociar.'
)
ON CONFLICT (id) DO UPDATE SET
  base_liquidity = EXCLUDED.base_liquidity,
  skin_multipliers = EXCLUDED.skin_multipliers,
  updated_at = NOW();

-- 13. Atualizar cards_base existentes com edition_id
UPDATE cards_base SET edition_id = 'ED01' WHERE edition_id IS NULL;

-- 14. Atualizar booster_types existentes
UPDATE booster_types SET edition_id = 'ED01' WHERE edition_id IS NULL;

-- 15. Deletar booster_types antigos e criar novos (5 tiers)
DELETE FROM booster_types WHERE edition_id = 'ED01';

INSERT INTO booster_types (
  id, name, edition_id, price_brl, price_multiplier, cards_per_booster,
  rarity_distribution, badge_emoji, color_primary, color_secondary
) VALUES
  -- Tier 1: Básico (R$ 0.50, multiplier 1x)
  (
    'ed01-basico',
    'Básico',
    'ED01',
    0.50,
    1.0,
    '{"trash":60,"meme":25,"viral":10,"legendary":4,"epica":1}'::jsonb,
    '🎴',
    '#555555',
    '#888888'
  ),
  
  -- Tier 2: Padrão (R$ 1.00, multiplier 2x)
  (
    'ed01-padrao',
    'Padrão',
    'ED01',
    1.00,
    2.0,
    '{"trash":60,"meme":25,"viral":10,"legendary":4,"epica":1}'::jsonb,
    '💎',
    '#00F0FF',
    '#3AFAFF'
  ),
  
  -- Tier 3: Premium (R$ 2.00, multiplier 4x)
  (
    'ed01-premium',
    'Premium',
    'ED01',
    2.00,
    4.0,
    '{"trash":60,"meme":25,"viral":10,"legendary":4,"epica":1}'::jsonb,
    '⚡',
    '#9B59B6',
    '#AF7AC5'
  ),
  
  -- Tier 4: Elite (R$ 5.00, multiplier 10x)
  (
    'ed01-elite',
    'Elite',
    'ED01',
    5.00,
    10.0,
    '{"trash":55,"meme":28,"viral":12,"legendary":4,"epica":1}'::jsonb,
    '👑',
    '#FFC700',
    '#FFD84D'
  ),
  
  -- Tier 5: Whale (R$ 10.00, multiplier 20x)
  (
    'ed01-whale',
    'Whale',
    'ED01',
    10.00,
    20.0,
    '{"trash":50,"meme":30,"viral":14,"legendary":5,"epica":1}'::jsonb,
    '🔥',
    '#FF006D',
    '#FF2E85'
  ),
  
  -- Pacotes com desconto
  (
    'ed01-pack-viral',
    'Pack Viral',
    'ED01',
    2.25,
    1.0,
    5,
    '{"trash":55,"meme":28,"viral":12,"legendary":4,"epica":1}'::jsonb,
    '💎',
    '#00F0FF',
    '#3AFAFF'
  ),
  
  (
    'ed01-pack-lendario',
    'Pack Lendário',
    'ED01',
    4.00,
    1.0,
    5,
    '{"trash":50,"meme":30,"viral":14,"legendary":5,"epica":1}'::jsonb,
    '⚡',
    '#9B59B6',
    '#AF7AC5'
  ),
  
  (
    'ed01-pack-epico',
    'Pack Épico',
    'ED01',
    9.00,
    1.0,
    5,
    '{"trash":45,"meme":30,"viral":16,"legendary":7,"epica":2}'::jsonb,
    '👑',
    '#FFC700',
    '#FFD84D'
  ),
  
  (
    'ed01-pack-colecionador',
    'Pack Colecionador',
    'ED01',
    16.00,
    1.0,
    5,
    '{"trash":40,"meme":30,"viral":18,"legendary":9,"epica":3}'::jsonb,
    '🔥',
    '#FF006D',
    '#FF2E85'
  );

-- 16. Comentários e documentação
COMMENT ON TABLE edition_configs IS 'Configuração imutável de cada edição KROOVA';
COMMENT ON TABLE edition_metrics IS 'Métricas diárias agregadas por edição';
COMMENT ON TABLE user_pity_counter IS 'Tracking de pity system (100 boosters = godmode garantido)';
COMMENT ON COLUMN booster_types.price_multiplier IS 'Multiplicador de liquidez baseado no preço (1x = R$ 0.50, 20x = R$ 10.00)';
COMMENT ON COLUMN cards_instances.is_godmode IS 'Status especial (3ª camada): multiplica liquidez por 10x';
COMMENT ON COLUMN cards_instances.skin IS 'Visual variant: default, neon, glow, glitch, ghost, holo, dark';
COMMENT ON COLUMN cards_instances.liquidity_brl IS 'Valor final: base_liquidity × skin_multiplier × price_multiplier × godmode_multiplier';

-- =====================================================
-- QUERIES ÚTEIS
-- =====================================================

-- Ver todas edições
-- SELECT * FROM edition_configs;

-- Ver métricas da semana
-- SELECT * FROM edition_metrics WHERE edition_id = 'ED01' AND date >= CURRENT_DATE - INTERVAL '7 days';

-- Ver hard cap status
-- SELECT 
--   id,
--   total_revenue,
--   total_jackpots_paid,
--   (total_jackpots_paid / NULLIF(total_revenue, 0)) * 100 AS payout_pct,
--   jackpot_hard_cap * 100 AS hard_cap_pct
-- FROM edition_configs
-- WHERE id = 'ED01';

-- Ver pity counters próximos do limite
-- SELECT * FROM user_pity_counter WHERE counter >= 90;

-- Verificar se pode dar godmode
-- SELECT check_edition_hard_cap('ED01');







