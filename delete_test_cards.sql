-- ============================================================================
-- DELETAR TODAS AS CARTAS DE TESTE DA CONTA
-- ============================================================================
-- User ID: 15f2efb3-f1e6-4146-b35c-41d93f32d569
-- Remove todas as cartas obtidas durante os testes de calibração
-- ============================================================================

-- Verificar quantas cartas existem antes de deletar
SELECT 
  COUNT(*) as total_cards,
  COUNT(DISTINCT base_id) as unique_cards
FROM cards_instances
WHERE owner_id = '15f2efb3-f1e6-4146-b35c-41d93f32d569';

-- DELETAR todas as cartas da conta
DELETE FROM cards_instances
WHERE owner_id = '15f2efb3-f1e6-4146-b35c-41d93f32d569';

-- Deletar os booster_openings criados nos testes
DELETE FROM booster_openings
WHERE user_id = '15f2efb3-f1e6-4146-b35c-41d93f32d569';

-- Verificar que está vazio
SELECT 
  COUNT(*) as remaining_cards
FROM cards_instances
WHERE owner_id = '15f2efb3-f1e6-4146-b35c-41d93f32d569';

SELECT 
  COUNT(*) as remaining_openings
FROM booster_openings
WHERE user_id = '15f2efb3-f1e6-4146-b35c-41d93f32d569';

-- ============================================================================
-- RESULTADO ESPERADO:
-- - Todas as ~5500 cartas de teste deletadas (1100 boosters × 5 cartas)
-- - Todos os booster_openings deletados
-- - Saldo permanece intacto (não foi descontado durante testes)
-- ============================================================================
