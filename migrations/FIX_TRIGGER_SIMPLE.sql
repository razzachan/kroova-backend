-- ===========================================================================
-- CRIAR TRIGGER DE CAP - VERSÃO SIMPLES (SEM TESTE)
-- ===========================================================================

-- Criar função
CREATE OR REPLACE FUNCTION apply_tier_liquidity_cap()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.liquidity_brl > 7.00 THEN
    NEW.liquidity_brl := 7.00;
  ELSIF NEW.liquidity_brl > 3.50 THEN
    NEW.liquidity_brl := 3.50;
  ELSIF NEW.liquidity_brl > 1.50 THEN
    NEW.liquidity_brl := 1.50;
  ELSIF NEW.liquidity_brl > 0.70 THEN
    NEW.liquidity_brl := 0.70;
  ELSIF NEW.liquidity_brl > 0.40 THEN
    NEW.liquidity_brl := 0.40;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Dropar trigger se existir
DROP TRIGGER IF EXISTS trigger_apply_tier_cap ON cards_instances;

-- Criar trigger
CREATE TRIGGER trigger_apply_tier_cap
  BEFORE INSERT ON cards_instances
  FOR EACH ROW
  EXECUTE FUNCTION apply_tier_liquidity_cap();

-- Confirmar criação
SELECT 
  'Trigger criado: ' || trigger_name as status
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_apply_tier_cap';
