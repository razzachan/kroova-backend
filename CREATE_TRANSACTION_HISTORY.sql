-- CREATE TABLE transaction_history
-- Histórico de todas as transações financeiras dos usuários

CREATE TABLE IF NOT EXISTS transaction_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Tipo de transação
  type TEXT NOT NULL CHECK (type IN (
    'booster_purchase',      -- Compra de booster
    'sell_to_system',        -- Venda de cartas ao sistema
    'marketplace_sale',      -- Venda no marketplace
    'marketplace_purchase',  -- Compra no marketplace
    'recycle',              -- Reciclagem de 25 cartas
    'deposit',              -- Depósito de saldo
    'withdrawal'            -- Saque de saldo
  )),
  
  -- Valor da transação (positivo = crédito, negativo = débito)
  amount_brl DECIMAL(10, 2) NOT NULL,
  
  -- Saldo anterior e novo
  balance_before_brl DECIMAL(10, 2),
  balance_after_brl DECIMAL(10, 2),
  
  -- Detalhes específicos da transação (JSON flexível)
  details JSONB,
  -- Exemplos de details:
  -- booster_purchase: { "booster_pack_id": "ED01_ALPHA", "quantity": 1 }
  -- sell_to_system: { "cards_count": 5, "card_ids": [...] }
  -- marketplace_sale: { "card_id": "...", "buyer_id": "...", "listing_id": "..." }
  -- recycle: { "cards_recycled": 25, "booster_received": "ED01_BETA" }
  
  -- Status da transação
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  
  -- Referência externa (opcional)
  reference_id UUID,
  reference_type TEXT, -- 'booster_opening', 'listing', etc
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_transaction_history_user_id ON transaction_history(user_id);
CREATE INDEX IF NOT EXISTS idx_transaction_history_type ON transaction_history(type);
CREATE INDEX IF NOT EXISTS idx_transaction_history_created_at ON transaction_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transaction_history_user_created ON transaction_history(user_id, created_at DESC);

-- RLS Policies
ALTER TABLE transaction_history ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários só podem ver suas próprias transações
CREATE POLICY "Users can view own transactions"
  ON transaction_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Service role pode inserir (via backend)
CREATE POLICY "Service role can insert transactions"
  ON transaction_history
  FOR INSERT
  WITH CHECK (true); -- Será controlado pelo service role key

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_transaction_history_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_transaction_history_updated_at
  BEFORE UPDATE ON transaction_history
  FOR EACH ROW
  EXECUTE FUNCTION update_transaction_history_updated_at();

-- Comentários
COMMENT ON TABLE transaction_history IS 'Histórico completo de transações financeiras dos usuários';
COMMENT ON COLUMN transaction_history.type IS 'Tipo de transação: compra, venda, reciclagem, etc';
COMMENT ON COLUMN transaction_history.amount_brl IS 'Valor em BRL (positivo = crédito, negativo = débito)';
COMMENT ON COLUMN transaction_history.details IS 'Detalhes específicos da transação em formato JSON';
