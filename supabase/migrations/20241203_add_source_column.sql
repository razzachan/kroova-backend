-- ============================================================================
-- Criar tabela booster_openings se não existir + adicionar coluna source
-- ============================================================================

-- 1. Criar tabela booster_openings se não existir
CREATE TABLE IF NOT EXISTS booster_openings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  booster_type_id UUID NOT NULL REFERENCES booster_types(id) ON DELETE CASCADE,
  cards_obtained JSONB NOT NULL,
  opened_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Criar índices básicos
CREATE INDEX IF NOT EXISTS idx_booster_openings_user ON booster_openings(user_id);
CREATE INDEX IF NOT EXISTS idx_booster_openings_opened_at ON booster_openings(opened_at DESC);

-- 3. Adicionar coluna source
ALTER TABLE booster_openings 
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'purchase';

-- 4. Criar índice para source
CREATE INDEX IF NOT EXISTS idx_booster_openings_source 
ON booster_openings(source);

-- 5. Adicionar coluna purchased_at se não existir
ALTER TABLE booster_openings
ADD COLUMN IF NOT EXISTS purchased_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- 6. Criar índice composto
CREATE INDEX IF NOT EXISTS idx_booster_openings_user_source_date 
ON booster_openings(user_id, source, purchased_at);

-- 7. Comentários
COMMENT ON TABLE booster_openings IS 
  'Histórico de aberturas de boosters pelos usuários';

COMMENT ON COLUMN booster_openings.source IS 
  'Origem do booster: purchase (comprado), recycle (25 cartas), reward (promoção), pity (sistema futuro)';

COMMENT ON COLUMN booster_openings.purchased_at IS
  'Timestamp de quando o booster foi comprado/obtido (pode diferir de opened_at se guardou para abrir depois)';

-- Verificar estrutura final
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'booster_openings'
ORDER BY ordinal_position;
