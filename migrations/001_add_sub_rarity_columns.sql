-- ============================================================================
-- FASE 1: ADICIONAR NOVAS COLUNAS À TABELA cards_base
-- ============================================================================

-- 1. Adicionar coluna sub_rarity
ALTER TABLE cards_base 
ADD COLUMN IF NOT EXISTS sub_rarity text 
CHECK (sub_rarity IN ('low', 'mid', 'high'));

-- 2. Adicionar coluna pack_archetype (Alpha/Beta/Gamma)
ALTER TABLE cards_base 
ADD COLUMN IF NOT EXISTS pack_archetype text 
CHECK (pack_archetype IN ('alpha', 'beta', 'gamma'));

-- 3. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_cards_base_sub_rarity ON cards_base(sub_rarity);
CREATE INDEX IF NOT EXISTS idx_cards_base_pack_archetype ON cards_base(pack_archetype);
CREATE INDEX IF NOT EXISTS idx_cards_base_rarity_sub ON cards_base(rarity, sub_rarity);

-- 4. Verificar estrutura
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'cards_base'
ORDER BY ordinal_position;

-- ============================================================================
-- RESULTADO ESPERADO:
-- - Colunas sub_rarity e pack_archetype adicionadas
-- - Índices criados para queries eficientes
-- ============================================================================
