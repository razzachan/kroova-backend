-- ============================================================================
-- PASSO 2: Criar tabela raspadinhas
-- Execute este SQL no Supabase Dashboard > SQL Editor DEPOIS do passo 1
-- ============================================================================

CREATE TABLE IF NOT EXISTS raspadinhas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booster_type_id UUID NOT NULL REFERENCES booster_types(id) ON DELETE CASCADE,
  tier TEXT NOT NULL, -- 'grand', 'major', 'minor'
  multiplier INTEGER NOT NULL, -- 500x, 100x, 10x
  probability NUMERIC(12,10) NOT NULL, -- 0.00001 = 0.001%
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_booster_tier UNIQUE(booster_type_id, tier)
);

CREATE INDEX IF NOT EXISTS idx_raspadinhas_booster_type 
ON raspadinhas(booster_type_id);

COMMENT ON TABLE raspadinhas IS 
  'Sistema de jackpots tipo slot machine. Multiplicadores aplicados ao price_brl do booster.';

-- Verificar
SELECT * FROM raspadinhas LIMIT 1;
