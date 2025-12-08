-- ==========================================================================
-- SISTEMA DE PRÊMIOS SEPARADO - SLOT MACHINE COM JACKPOTS
-- ==========================================================================
-- OBJETIVO: Separar completamente prêmio de booster (gambling) do valor 
--           de mercado das cartas (trading)
--
-- PROBLEMA RESOLVIDO:
--   - Antes: liquidity_brl servia para prêmio E mercado (conflito!)
--   - Agora: booster_prizes.prize_amount_brl para prêmio
--           cards_base.base_liquidity_brl para mercado (fixo)
--
-- PSICOLOGIA SLOT MACHINE:
--   - 60% aberturas: 20-50% RTP (loss, cria desejo)
--   - 30% aberturas: 60-90% RTP (near even)
--   - 9% aberturas: 100-150% RTP (small win)
--   - 1% aberturas: 500-1000% RTP (JACKPOT! 🎰)
--
-- HOUSE EDGE: 60-65% (RTP médio 35-40%)
-- ==========================================================================

BEGIN;

-- ==========================================================================
-- TABELA: booster_prizes
-- ==========================================================================
-- Registra PRÊMIO em BRL de cada abertura de booster
-- Permite rastrear RTP real, jackpots, estatísticas

CREATE TABLE IF NOT EXISTS booster_prizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- RELACIONAMENTOS
  opening_id UUID NOT NULL REFERENCES booster_openings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  booster_type_id UUID NOT NULL REFERENCES booster_types(id) ON DELETE CASCADE,
  
  -- PRÊMIO
  prize_amount_brl NUMERIC(12,2) NOT NULL CHECK (prize_amount_brl >= 0),
  booster_cost_brl NUMERIC(12,2) NOT NULL CHECK (booster_cost_brl > 0),
  rtp_percentage NUMERIC(6,2) NOT NULL CHECK (rtp_percentage >= 0),
  
  -- CLASSIFICAÇÃO (para analytics)
  prize_tier TEXT NOT NULL CHECK (
    prize_tier IN ('loss', 'near_even', 'small_win', 'jackpot')
  ),
  
  -- METADATA (quais cartas foram dropadas - para auditoria)
  cards_summary JSONB NOT NULL,
  
  -- TIMESTAMPS
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_booster_prizes_user ON booster_prizes(user_id);
CREATE INDEX IF NOT EXISTS idx_booster_prizes_opening ON booster_prizes(opening_id);
CREATE INDEX IF NOT EXISTS idx_booster_prizes_rtp ON booster_prizes(rtp_percentage DESC);
CREATE INDEX IF NOT EXISTS idx_booster_prizes_tier ON booster_prizes(prize_tier);
CREATE INDEX IF NOT EXISTS idx_booster_prizes_created ON booster_prizes(created_at DESC);

-- Índice composto para leaderboards (maiores jackpots)
CREATE INDEX IF NOT EXISTS idx_booster_prizes_jackpots 
  ON booster_prizes(prize_tier, prize_amount_brl DESC) 
  WHERE prize_tier = 'jackpot';

-- ==========================================================================
-- TABELA: jackpot_pool (OPCIONAL - FASE 2)
-- ==========================================================================
-- Pool acumulado de jackpot progressivo
-- X% de cada compra alimenta o pool
-- Quando alguém ganha, recebe o pool acumulado

CREATE TABLE IF NOT EXISTS jackpot_pool (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- POOL ATUAL
  current_pool_brl NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (current_pool_brl >= 0),
  
  -- ESTATÍSTICAS
  total_contributed_brl NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_paid_out_brl NUMERIC(12,2) NOT NULL DEFAULT 0,
  last_winner_user_id UUID REFERENCES users(id),
  last_win_amount_brl NUMERIC(12,2),
  last_win_at TIMESTAMPTZ,
  
  -- TIMESTAMPS
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Inicializar pool com R$ 0.00
INSERT INTO jackpot_pool (current_pool_brl, total_contributed_brl, total_paid_out_brl)
VALUES (0, 0, 0)
ON CONFLICT DO NOTHING;

-- ==========================================================================
-- VIEWS: Analytics e Gamification
-- ==========================================================================

-- VIEW: Estatísticas de RTP por usuário
CREATE OR REPLACE VIEW user_rtp_stats AS
SELECT 
  user_id,
  COUNT(*) as total_openings,
  SUM(booster_cost_brl) as total_spent_brl,
  SUM(prize_amount_brl) as total_won_brl,
  ROUND(AVG(rtp_percentage), 2) as avg_rtp_percentage,
  MAX(prize_amount_brl) as biggest_win_brl,
  SUM(CASE WHEN prize_tier = 'jackpot' THEN 1 ELSE 0 END) as jackpot_count,
  SUM(CASE WHEN prize_tier = 'loss' THEN 1 ELSE 0 END) as loss_count
FROM booster_prizes
GROUP BY user_id;

-- VIEW: Leaderboard de maiores jackpots (últimos 30 dias)
CREATE OR REPLACE VIEW jackpot_leaderboard AS
SELECT 
  bp.id,
  bp.user_id,
  u.display_id,
  u.name,
  bp.prize_amount_brl,
  bp.booster_cost_brl,
  bp.rtp_percentage,
  bt.name as booster_name,
  bp.created_at
FROM booster_prizes bp
JOIN users u ON bp.user_id = u.id
JOIN booster_types bt ON bp.booster_type_id = bt.id
WHERE bp.prize_tier = 'jackpot'
  AND bp.created_at > now() - INTERVAL '30 days'
ORDER BY bp.prize_amount_brl DESC
LIMIT 100;

-- VIEW: Estatísticas globais de RTP
CREATE OR REPLACE VIEW global_rtp_stats AS
SELECT 
  COUNT(*) as total_openings,
  SUM(booster_cost_brl) as total_spent_brl,
  SUM(prize_amount_brl) as total_prizes_brl,
  ROUND(AVG(rtp_percentage), 2) as avg_rtp_percentage,
  ROUND((SUM(prize_amount_brl) / NULLIF(SUM(booster_cost_brl), 0)) * 100, 2) as actual_rtp_percentage,
  MAX(prize_amount_brl) as biggest_jackpot_brl,
  
  -- Distribuição por tier
  SUM(CASE WHEN prize_tier = 'loss' THEN 1 ELSE 0 END) as loss_count,
  SUM(CASE WHEN prize_tier = 'near_even' THEN 1 ELSE 0 END) as near_even_count,
  SUM(CASE WHEN prize_tier = 'small_win' THEN 1 ELSE 0 END) as small_win_count,
  SUM(CASE WHEN prize_tier = 'jackpot' THEN 1 ELSE 0 END) as jackpot_count,
  
  -- Percentuais
  ROUND((SUM(CASE WHEN prize_tier = 'loss' THEN 1 ELSE 0 END)::NUMERIC / COUNT(*)) * 100, 2) as loss_percentage,
  ROUND((SUM(CASE WHEN prize_tier = 'near_even' THEN 1 ELSE 0 END)::NUMERIC / COUNT(*)) * 100, 2) as near_even_percentage,
  ROUND((SUM(CASE WHEN prize_tier = 'small_win' THEN 1 ELSE 0 END)::NUMERIC / COUNT(*)) * 100, 2) as small_win_percentage,
  ROUND((SUM(CASE WHEN prize_tier = 'jackpot' THEN 1 ELSE 0 END)::NUMERIC / COUNT(*)) * 100, 2) as jackpot_percentage
FROM booster_prizes;

-- ==========================================================================
-- FUNCTIONS: Helper functions
-- ==========================================================================

-- Função para calcular prize_tier baseado no RTP
CREATE OR REPLACE FUNCTION calculate_prize_tier(rtp NUMERIC)
RETURNS TEXT AS $$
BEGIN
  IF rtp < 60 THEN
    RETURN 'loss';
  ELSIF rtp < 100 THEN
    RETURN 'near_even';
  ELSIF rtp < 300 THEN
    RETURN 'small_win';
  ELSE
    RETURN 'jackpot';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ==========================================================================
-- COMENTÁRIOS
-- ==========================================================================

COMMENT ON TABLE booster_prizes IS 'Registra prêmios em BRL de aberturas de boosters, separado do valor de mercado das cartas';
COMMENT ON COLUMN booster_prizes.prize_amount_brl IS 'Valor em BRL que o jogador GANHOU (adicionado à carteira)';
COMMENT ON COLUMN booster_prizes.booster_cost_brl IS 'Quanto o jogador PAGOU pelo booster';
COMMENT ON COLUMN booster_prizes.rtp_percentage IS 'Return to Player % = (prize / cost) * 100';
COMMENT ON COLUMN booster_prizes.prize_tier IS 'Classificação: loss (<60%), near_even (60-99%), small_win (100-299%), jackpot (300%+)';
COMMENT ON COLUMN booster_prizes.cards_summary IS 'JSONB com IDs das cartas dropadas (para auditoria)';

COMMENT ON TABLE jackpot_pool IS 'Pool acumulado de jackpot progressivo (opcional)';
COMMENT ON COLUMN jackpot_pool.current_pool_brl IS 'Valor atual do pool disponível para próximo winner';

COMMIT;

-- ==========================================================================
-- VERIFICAÇÃO
-- ==========================================================================
SELECT 
  'TABELAS CRIADAS' as status,
  COUNT(*) as count
FROM information_schema.tables 
WHERE table_name IN ('booster_prizes', 'jackpot_pool');

SELECT 
  'VIEWS CRIADAS' as status,
  COUNT(*) as count
FROM information_schema.views
WHERE table_name IN ('user_rtp_stats', 'jackpot_leaderboard', 'global_rtp_stats');

SELECT 
  'INDICES CRIADOS' as status,
  COUNT(*) as count
FROM pg_indexes
WHERE tablename = 'booster_prizes';
