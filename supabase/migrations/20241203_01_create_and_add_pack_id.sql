-- ============================================================================
-- VERIFICAR E CRIAR ESTRUTURA COMPLETA
-- Execute este SQL completo no Supabase Dashboard
-- ============================================================================

-- 1. Criar extensão UUID se não existir
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Criar tabela booster_types se não existir
CREATE TABLE IF NOT EXISTS booster_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  edition_id TEXT NOT NULL,
  price_brl NUMERIC(12,2) NOT NULL,
  price_crypto NUMERIC(18,8),
  rarity_distribution JSONB NOT NULL,
  cards_per_booster INTEGER DEFAULT 5,
  price_multiplier NUMERIC(5,2) DEFAULT 1.0,
  guaranteed_cards JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Adicionar coluna pack_id
ALTER TABLE booster_types ADD COLUMN IF NOT EXISTS pack_id TEXT;

-- 4. Criar índices
CREATE INDEX IF NOT EXISTS idx_booster_types_edition ON booster_types(edition_id);
CREATE INDEX IF NOT EXISTS idx_booster_types_pack_id ON booster_types(pack_id);

-- 5. Verificar estrutura final
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'booster_types'
ORDER BY ordinal_position;

-- 6. Contar boosters existentes
SELECT 
    edition_id,
    COUNT(*) as total,
    array_agg(name) as names
FROM booster_types
GROUP BY edition_id;
