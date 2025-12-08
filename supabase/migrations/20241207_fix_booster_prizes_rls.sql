-- ==========================================================================
-- FIX: Políticas RLS para tabela booster_prizes
-- ==========================================================================
-- PROBLEMA: Tabela criada mas sem políticas RLS
-- EFEITO: Service role key não consegue inserir registros
-- SOLUÇÃO: Desabilitar RLS (service role bypass RLS automaticamente)
--          OU criar política permissiva para service role
-- ==========================================================================

BEGIN;

-- Desabilitar RLS para booster_prizes
-- Service role key SEMPRE bypass RLS, então isso garante que inserts funcionem
ALTER TABLE booster_prizes DISABLE ROW LEVEL SECURITY;

-- Mesmo desabilitado, vamos criar políticas para acesso via anon key (futuras queries)
-- Isso permite que usuários vejam seus próprios prêmios via frontend

-- Política: Usuários podem VER seus próprios prêmios
CREATE POLICY "Users can view own prizes"
  ON booster_prizes
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Service role pode INSERIR (redundante com RLS desabilitado, mas documenta intenção)
-- CREATE POLICY "Service role can insert prizes"
--   ON booster_prizes
--   FOR INSERT
--   WITH CHECK (true);
-- ^ Não necessário pois service role bypass RLS

-- Comentários
COMMENT ON TABLE booster_prizes IS 'RLS DESABILITADO - Service role insere via backend. Usuários podem SELECT seus próprios prêmios.';

COMMIT;

-- Verificação
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'booster_prizes';

SELECT 
  policyname,
  cmd as command,
  roles
FROM pg_policies 
WHERE tablename = 'booster_prizes';
