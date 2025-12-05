-- ============================================================================
-- Adicionar price_paid_brl em booster_openings para saber qual tier foi comprado
-- ============================================================================

-- 1. Adicionar coluna price_paid_brl
ALTER TABLE booster_openings 
ADD COLUMN IF NOT EXISTS price_paid_brl NUMERIC(12,2);

-- 2. Atualizar registros existentes com preço padrão (R$ 0.50)
UPDATE booster_openings 
SET price_paid_brl = 0.50 
WHERE price_paid_brl IS NULL;

-- 3. Tornar coluna NOT NULL após preencher valores
ALTER TABLE booster_openings 
ALTER COLUMN price_paid_brl SET NOT NULL;

-- 4. Adicionar índice para queries
CREATE INDEX IF NOT EXISTS idx_booster_openings_price 
ON booster_openings(price_paid_brl);

-- 5. Comentário
COMMENT ON COLUMN booster_openings.price_paid_brl IS 
  'Preço pago pelo booster (R$) - identifica o tier (0.50/1.00/2.00/5.00/10.00)';

-- Verificar estrutura
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'booster_openings'
AND column_name = 'price_paid_brl';
