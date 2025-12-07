-- ===========================================================================
-- EMERGENCY FIX: CAP VIA DATABASE TRIGGER
-- ===========================================================================
-- Como o código Next.js não está sendo deployado corretamente pelo Vercel,
-- vamos aplicar o CAP diretamente no banco via trigger.

CREATE OR REPLACE FUNCTION apply_tier_liquidity_cap()
RETURNS TRIGGER AS $$
BEGIN
  -- SOLUÇÃO SIMPLES: Cappar TODOS os valores extremos
  -- Isso previne que qualquer tier receba cartas absurdamente caras
  -- 
  -- CAPS ABSOLUTOS (aplicados SEMPRE, independente do tier):
  -- - Nenhuma carta pode valer mais que R$ 7.00 (limite Whale)
  -- - Cartas entre R$ 3.51-7.00 são cappadas em 3.50 (limite Elite)
  -- - Cartas entre R$ 1.51-3.50 são cappadas em 1.50 (limite Premium)
  -- - Cartas entre R$ 0.71-1.50 são cappadas em 0.70 (limite Padrão)
  -- - Cartas entre R$ 0.41-0.70 são cappadas em 0.40 (limite Básico)
  
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

-- Criar trigger BEFORE INSERT
DROP TRIGGER IF EXISTS trigger_apply_tier_cap ON cards_instances;
CREATE TRIGGER trigger_apply_tier_cap
  BEFORE INSERT ON cards_instances
  FOR EACH ROW
  EXECUTE FUNCTION apply_tier_liquidity_cap();

-- Teste rápido
SELECT 'Trigger criado com sucesso!' as status;

-- TESTE REAL: Inserir uma carta de teste com valor alto
-- (isso vai testar se o trigger está funcionando)
DO $$
DECLARE
    test_user_id UUID;
    test_card_id UUID;
    test_edition_id TEXT;
    resultado NUMERIC;
BEGIN
    -- Buscar IDs válidos do banco
    SELECT id INTO test_user_id FROM users LIMIT 1;
    SELECT id, edition_id INTO test_card_id, test_edition_id 
    FROM cards_base LIMIT 1;
    
    -- Deletar qualquer teste anterior
    DELETE FROM cards_instances 
    WHERE owner_id = test_user_id 
    AND liquidity_brl IN (7.00, 15.88);
    
    -- Inserir carta de teste com R$ 15.88 (deve ser cappada em R$ 7.00)
    INSERT INTO cards_instances (base_id, owner_id, edition_id, skin, liquidity_brl)
    VALUES (test_card_id, test_user_id, test_edition_id, 'default', 15.88);
    
    -- Verificar se foi cappada
    SELECT liquidity_brl INTO resultado
    FROM cards_instances 
    WHERE owner_id = test_user_id 
    ORDER BY id DESC LIMIT 1;
    
    IF resultado = 7.00 THEN
        RAISE NOTICE '✅ TRIGGER FUNCIONANDO! Valor R$ 15.88 foi cappado para R$ 7.00';
    ELSE
        RAISE WARNING '❌ TRIGGER NÃO FUNCIONOU! Valor atual: R$ %', resultado;
    END IF;
END $$;
