-- ============================================================================
-- KROOVA: CORREÇÃO COMPLETA DO SISTEMA DE BOOSTERS
-- Data: 2024-12-03
-- ============================================================================
-- 
-- PROBLEMAS IDENTIFICADOS:
-- 1. Jackpot Hard Cap = R$0.15 (quebra multiplicadores 500x)
-- 2. Godmode = 0% em todos boosters (legendary drops desabilitados)
-- 3. Coluna pack_id não existe (boosters não sabem de qual pack dropar)
-- 4. 13 boosters obsoletos sem estrutura Alpha/Beta/Gamma
-- 5. Tabela raspadinhas não existe (jackpots não funcionam)
--
-- ============================================================================

-- ============================================================================
-- PARTE 1: CORRIGIR JACKPOT HARD CAP (CRÍTICO)
-- ============================================================================

UPDATE edition_configs 
SET jackpot_hard_cap = 500.00,
    updated_at = NOW()
WHERE id = 'ED01';

COMMENT ON COLUMN edition_configs.jackpot_hard_cap IS 
  'Hard cap de jackpot em BRL. ED01: R$500 permite multiplicadores até 500x em boosters de R$1';

-- ============================================================================
-- PARTE 2: ADICIONAR COLUNA pack_id
-- ============================================================================

ALTER TABLE booster_types 
ADD COLUMN IF NOT EXISTS pack_id TEXT;

CREATE INDEX IF NOT EXISTS idx_booster_types_pack_id 
ON booster_types(pack_id);

COMMENT ON COLUMN booster_types.pack_id IS 
  'Identificador do pack (ED01_ALPHA, ED01_BETA, ED01_GAMMA). Define qual card pool será usado.';

-- ============================================================================
-- PARTE 3: LIMPAR BOOSTERS OBSOLETOS
-- ============================================================================

-- Backup dos IDs antes de deletar (para logs)
DO $$
DECLARE
  booster_record RECORD;
BEGIN
  RAISE NOTICE 'Deletando boosters obsoletos:';
  FOR booster_record IN 
    SELECT id, name, price_brl FROM booster_types WHERE edition_id = 'ED01'
  LOOP
    RAISE NOTICE '  - % (R$ %)', booster_record.name, booster_record.price_brl;
  END LOOP;
END $$;

-- Deletar todos boosters ED01 (vamos recriar estrutura correta)
DELETE FROM booster_types WHERE edition_id = 'ED01';

-- ============================================================================
-- PARTE 4: CRIAR 15 BOOSTERS (5 TIERS × 3 PACKS)
-- ============================================================================

-- Função helper para criar distribuições de raridade com godmode
CREATE OR REPLACE FUNCTION create_rarity_distribution(
  p_trash INT,
  p_meme INT,
  p_viral INT,
  p_legendary INT,
  p_epica INT,
  p_godmode NUMERIC
) RETURNS JSONB AS $$
BEGIN
  RETURN jsonb_build_object(
    'trash', p_trash,
    'meme', p_meme,
    'viral', p_viral,
    'legendary', p_legendary,
    'epica', p_epica,
    'godmode', p_godmode
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PACK ALPHA (Memes Clássicos) - ED01_ALPHA
-- ============================================================================

-- Básico Alpha (R$0.50) - Tier 1
INSERT INTO booster_types (id, name, edition_id, pack_id, price_brl, cards_per_booster, price_multiplier, rarity_distribution)
VALUES (
  gen_random_uuid(),
  'Básico Alpha',
  'ED01',
  'ED01_ALPHA',
  0.50,
  5,
  1,
  create_rarity_distribution(60, 28, 8, 4, 0, 0.3)
);

-- Padrão Alpha (R$1.00) - Tier 2
INSERT INTO booster_types (id, name, edition_id, pack_id, price_brl, cards_per_booster, price_multiplier, rarity_distribution)
VALUES (
  gen_random_uuid(),
  'Padrão Alpha',
  'ED01',
  'ED01_ALPHA',
  1.00,
  5,
  2,
  create_rarity_distribution(55, 28, 12, 5, 0, 0.5)
);

-- Premium Alpha (R$2.00) - Tier 3
INSERT INTO booster_types (id, name, edition_id, pack_id, price_brl, cards_per_booster, price_multiplier, rarity_distribution)
VALUES (
  gen_random_uuid(),
  'Premium Alpha',
  'ED01',
  'ED01_ALPHA',
  2.00,
  5,
  4,
  create_rarity_distribution(50, 27, 15, 7, 1, 0.7)
);

-- Elite Alpha (R$5.00) - Tier 4
INSERT INTO booster_types (id, name, edition_id, pack_id, price_brl, cards_per_booster, price_multiplier, rarity_distribution)
VALUES (
  gen_random_uuid(),
  'Elite Alpha',
  'ED01',
  'ED01_ALPHA',
  5.00,
  5,
  10,
  create_rarity_distribution(40, 30, 18, 10, 2, 0.8)
);

-- Whale Alpha (R$10.00) - Tier 5
INSERT INTO booster_types (id, name, edition_id, pack_id, price_brl, cards_per_booster, price_multiplier, rarity_distribution)
VALUES (
  gen_random_uuid(),
  'Whale Alpha',
  'ED01',
  'ED01_ALPHA',
  10.00,
  5,
  20,
  create_rarity_distribution(30, 30, 22, 15, 3, 1.0)
);

-- ============================================================================
-- PACK BETA (Viralidade Explosiva) - ED01_BETA
-- ============================================================================

-- Básico Beta (R$0.50) - Tier 1
INSERT INTO booster_types (id, name, edition_id, pack_id, price_brl, cards_per_booster, price_multiplier, rarity_distribution)
VALUES (
  gen_random_uuid(),
  'Básico Beta',
  'ED01',
  'ED01_BETA',
  0.50,
  5,
  1,
  create_rarity_distribution(60, 28, 8, 4, 0, 0.3)
);

-- Padrão Beta (R$1.00) - Tier 2
INSERT INTO booster_types (id, name, edition_id, pack_id, price_brl, cards_per_booster, price_multiplier, rarity_distribution)
VALUES (
  gen_random_uuid(),
  'Padrão Beta',
  'ED01',
  'ED01_BETA',
  1.00,
  5,
  2,
  create_rarity_distribution(55, 28, 12, 5, 0, 0.5)
);

-- Premium Beta (R$2.00) - Tier 3
INSERT INTO booster_types (id, name, edition_id, pack_id, price_brl, cards_per_booster, price_multiplier, rarity_distribution)
VALUES (
  gen_random_uuid(),
  'Premium Beta',
  'ED01',
  'ED01_BETA',
  2.00,
  5,
  4,
  create_rarity_distribution(50, 27, 15, 7, 1, 0.7)
);

-- Elite Beta (R$5.00) - Tier 4
INSERT INTO booster_types (id, name, edition_id, pack_id, price_brl, cards_per_booster, price_multiplier, rarity_distribution)
VALUES (
  gen_random_uuid(),
  'Elite Beta',
  'ED01',
  'ED01_BETA',
  5.00,
  5,
  10,
  create_rarity_distribution(40, 30, 18, 10, 2, 0.8)
);

-- Whale Beta (R$10.00) - Tier 5
INSERT INTO booster_types (id, name, edition_id, pack_id, price_brl, cards_per_booster, price_multiplier, rarity_distribution)
VALUES (
  gen_random_uuid(),
  'Whale Beta',
  'ED01',
  'ED01_BETA',
  10.00,
  5,
  20,
  create_rarity_distribution(30, 30, 22, 15, 3, 1.0)
);

-- ============================================================================
-- PACK GAMMA (Cultura Digital) - ED01_GAMMA
-- ============================================================================

-- Básico Gamma (R$0.50) - Tier 1
INSERT INTO booster_types (id, name, edition_id, pack_id, price_brl, cards_per_booster, price_multiplier, rarity_distribution)
VALUES (
  gen_random_uuid(),
  'Básico Gamma',
  'ED01',
  'ED01_GAMMA',
  0.50,
  5,
  1,
  create_rarity_distribution(60, 28, 8, 4, 0, 0.3)
);

-- Padrão Gamma (R$1.00) - Tier 2
INSERT INTO booster_types (id, name, edition_id, pack_id, price_brl, cards_per_booster, price_multiplier, rarity_distribution)
VALUES (
  gen_random_uuid(),
  'Padrão Gamma',
  'ED01',
  'ED01_GAMMA',
  1.00,
  5,
  2,
  create_rarity_distribution(55, 28, 12, 5, 0, 0.5)
);

-- Premium Gamma (R$2.00) - Tier 3
INSERT INTO booster_types (id, name, edition_id, pack_id, price_brl, cards_per_booster, price_multiplier, rarity_distribution)
VALUES (
  gen_random_uuid(),
  'Premium Gamma',
  'ED01',
  'ED01_GAMMA',
  2.00,
  5,
  4,
  create_rarity_distribution(50, 27, 15, 7, 1, 0.7)
);

-- Elite Gamma (R$5.00) - Tier 4
INSERT INTO booster_types (id, name, edition_id, pack_id, price_brl, cards_per_booster, price_multiplier, rarity_distribution)
VALUES (
  gen_random_uuid(),
  'Elite Gamma',
  'ED01',
  'ED01_GAMMA',
  5.00,
  5,
  10,
  create_rarity_distribution(40, 30, 18, 10, 2, 0.8)
);

-- Whale Gamma (R$10.00) - Tier 5
INSERT INTO booster_types (id, name, edition_id, pack_id, price_brl, cards_per_booster, price_multiplier, rarity_distribution)
VALUES (
  gen_random_uuid(),
  'Whale Gamma',
  'ED01',
  'ED01_GAMMA',
  10.00,
  5,
  20,
  create_rarity_distribution(30, 30, 22, 15, 3, 1.0)
);

-- ============================================================================
-- PARTE 5: CRIAR TABELA RASPADINHAS (JACKPOTS)
-- ============================================================================

CREATE TABLE IF NOT EXISTS raspadinhas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booster_type_id UUID NOT NULL REFERENCES booster_types(id) ON DELETE CASCADE,
  tier TEXT NOT NULL, -- 'grand', 'major', 'minor'
  multiplier INTEGER NOT NULL, -- 500x, 100x, 10x, etc
  probability NUMERIC(12,10) NOT NULL, -- 0.00001 = 0.001%
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_booster_tier UNIQUE(booster_type_id, tier)
);

CREATE INDEX IF NOT EXISTS idx_raspadinhas_booster_type 
ON raspadinhas(booster_type_id);

COMMENT ON TABLE raspadinhas IS 
  'Sistema de jackpots tipo raspadinha/slot machine. Multiplicadores aplicados ao price_brl do booster.';

-- ============================================================================
-- PARTE 6: POPULAR RASPADINHAS COM CONFIGURAÇÕES PADRÃO
-- ============================================================================

-- Função para criar raspadinhas para um booster
CREATE OR REPLACE FUNCTION create_raspadinhas_for_booster(
  p_booster_id UUID,
  p_grand_mult INT,
  p_grand_prob NUMERIC,
  p_major_mult INT,
  p_major_prob NUMERIC,
  p_minor_mult INT,
  p_minor_prob NUMERIC
) RETURNS VOID AS $$
BEGIN
  INSERT INTO raspadinhas (booster_type_id, tier, multiplier, probability)
  VALUES 
    (p_booster_id, 'grand', p_grand_mult, p_grand_prob),
    (p_booster_id, 'major', p_major_mult, p_major_prob),
    (p_booster_id, 'minor', p_minor_mult, p_minor_prob);
END;
$$ LANGUAGE plpgsql;

-- Popular raspadinhas para cada tier (baseado em ECONOMY_BALANCE_ED01.md)
DO $$
DECLARE
  booster_record RECORD;
BEGIN
  FOR booster_record IN 
    SELECT id, name, price_brl FROM booster_types WHERE edition_id = 'ED01'
  LOOP
    -- Básico (R$0.50-1.00): Grand 500x, Major 100x, Minor 10x
    IF booster_record.price_brl <= 1.00 THEN
      PERFORM create_raspadinhas_for_booster(
        booster_record.id,
        500, 0.00001,  -- Grand: 0.001%
        100, 0.0002,   -- Major: 0.02%
        10, 0.005      -- Minor: 0.5%
      );
      
    -- Premium (R$2.00): Grand 400x, Major 80x, Minor 10x
    ELSIF booster_record.price_brl <= 2.00 THEN
      PERFORM create_raspadinhas_for_booster(
        booster_record.id,
        400, 0.00002,  -- Grand: 0.002%
        80, 0.0003,    -- Major: 0.03%
        10, 0.006      -- Minor: 0.6%
      );
      
    -- Elite (R$5.00): Grand 200x, Major 50x, Minor 8x
    ELSIF booster_record.price_brl <= 5.00 THEN
      PERFORM create_raspadinhas_for_booster(
        booster_record.id,
        200, 0.00005,  -- Grand: 0.005%
        50, 0.0005,    -- Major: 0.05%
        8, 0.008       -- Minor: 0.8%
      );
      
    -- Whale (R$10.00): Grand 100x, Major 30x, Minor 5x
    ELSE
      PERFORM create_raspadinhas_for_booster(
        booster_record.id,
        100, 0.0001,   -- Grand: 0.01%
        30, 0.001,     -- Major: 0.1%
        5, 0.01        -- Minor: 1%
      );
    END IF;
    
    RAISE NOTICE 'Raspadinhas criadas para: % (R$ %)', 
      booster_record.name, booster_record.price_brl;
  END LOOP;
END $$;

-- ============================================================================
-- PARTE 7: VALIDAÇÃO
-- ============================================================================

-- Verificar contagem de boosters
DO $$
DECLARE
  booster_count INT;
BEGIN
  SELECT COUNT(*) INTO booster_count FROM booster_types WHERE edition_id = 'ED01';
  
  IF booster_count != 15 THEN
    RAISE EXCEPTION 'ERRO: Esperado 15 boosters, encontrado %', booster_count;
  END IF;
  
  RAISE NOTICE '✅ 15 boosters criados corretamente';
END $$;

-- Verificar contagem de raspadinhas
DO $$
DECLARE
  raspadinha_count INT;
BEGIN
  SELECT COUNT(*) INTO raspadinha_count FROM raspadinhas;
  
  IF raspadinha_count != 45 THEN
    RAISE EXCEPTION 'ERRO: Esperado 45 raspadinhas (15 boosters × 3 tiers), encontrado %', raspadinha_count;
  END IF;
  
  RAISE NOTICE '✅ 45 raspadinhas criadas corretamente';
END $$;

-- Verificar godmode ativado
DO $$
DECLARE
  godmode_zero_count INT;
BEGIN
  SELECT COUNT(*) INTO godmode_zero_count 
  FROM booster_types 
  WHERE edition_id = 'ED01' 
    AND (rarity_distribution->>'godmode')::NUMERIC = 0;
  
  IF godmode_zero_count > 0 THEN
    RAISE EXCEPTION 'ERRO: % boosters ainda com godmode = 0%%', godmode_zero_count;
  END IF;
  
  RAISE NOTICE '✅ Godmode ativado em todos os boosters';
END $$;

-- Verificar pack_id preenchido
DO $$
DECLARE
  null_pack_count INT;
BEGIN
  SELECT COUNT(*) INTO null_pack_count 
  FROM booster_types 
  WHERE edition_id = 'ED01' 
    AND pack_id IS NULL;
  
  IF null_pack_count > 0 THEN
    RAISE EXCEPTION 'ERRO: % boosters sem pack_id', null_pack_count;
  END IF;
  
  RAISE NOTICE '✅ Todos boosters vinculados a packs (Alpha/Beta/Gamma)';
END $$;

-- Verificar jackpot hard cap
DO $$
DECLARE
  hard_cap NUMERIC;
BEGIN
  SELECT jackpot_hard_cap INTO hard_cap 
  FROM edition_configs 
  WHERE id = 'ED01';
  
  IF hard_cap < 500 THEN
    RAISE EXCEPTION 'ERRO: Jackpot hard cap ainda muito baixo: R$ %', hard_cap;
  END IF;
  
  RAISE NOTICE '✅ Jackpot hard cap corrigido: R$ %', hard_cap;
END $$;

-- Relatório final
SELECT 
  pack_id,
  name,
  price_brl,
  price_multiplier,
  (rarity_distribution->>'godmode')::NUMERIC as godmode_pct,
  (SELECT COUNT(*) FROM raspadinhas WHERE booster_type_id = bt.id) as raspadinhas_count
FROM booster_types bt
WHERE edition_id = 'ED01'
ORDER BY pack_id, price_brl;

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================
