-- ============================================================================
-- MIGRATION COMPLETA: FIX BOOSTER SYSTEM
-- Execute TUDO de uma vez no Supabase Dashboard > SQL Editor
-- ============================================================================

-- PARTE 1: Jackpot Hard Cap já foi corrigido via API ✅

-- PARTE 2: Limpar boosters obsoletos
DELETE FROM booster_types WHERE edition_id = 'ED01';

-- PARTE 3: Criar 15 boosters (5 tiers × 3 packs)

-- Função helper para criar distribuições
CREATE OR REPLACE FUNCTION create_rarity_dist(
  p_trash INT, p_meme INT, p_viral INT, p_legendary INT, p_epica INT, p_godmode NUMERIC
) RETURNS JSONB AS $$
BEGIN
  RETURN jsonb_build_object(
    'trash', p_trash, 'meme', p_meme, 'viral', p_viral,
    'legendary', p_legendary, 'epica', p_epica, 'godmode', p_godmode
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PACK ALPHA (Memes Clássicos)
-- ============================================================================

INSERT INTO booster_types (name, edition_id, pack_id, price_brl, cards_per_booster, price_multiplier, rarity_distribution) VALUES
('Básico Alpha', 'ED01', 'ED01_ALPHA', 0.50, 5, 1, create_rarity_dist(60, 28, 8, 4, 0, 0.3)),
('Padrão Alpha', 'ED01', 'ED01_ALPHA', 1.00, 5, 2, create_rarity_dist(55, 28, 12, 5, 0, 0.5)),
('Premium Alpha', 'ED01', 'ED01_ALPHA', 2.00, 5, 4, create_rarity_dist(50, 27, 15, 7, 1, 0.7)),
('Elite Alpha', 'ED01', 'ED01_ALPHA', 5.00, 5, 10, create_rarity_dist(40, 30, 18, 10, 2, 0.8)),
('Whale Alpha', 'ED01', 'ED01_ALPHA', 10.00, 5, 20, create_rarity_dist(30, 30, 22, 15, 3, 1.0));

-- ============================================================================
-- PACK BETA (Viralidade Explosiva)
-- ============================================================================

INSERT INTO booster_types (name, edition_id, pack_id, price_brl, cards_per_booster, price_multiplier, rarity_distribution) VALUES
('Básico Beta', 'ED01', 'ED01_BETA', 0.50, 5, 1, create_rarity_dist(60, 28, 8, 4, 0, 0.3)),
('Padrão Beta', 'ED01', 'ED01_BETA', 1.00, 5, 2, create_rarity_dist(55, 28, 12, 5, 0, 0.5)),
('Premium Beta', 'ED01', 'ED01_BETA', 2.00, 5, 4, create_rarity_dist(50, 27, 15, 7, 1, 0.7)),
('Elite Beta', 'ED01', 'ED01_BETA', 5.00, 5, 10, create_rarity_dist(40, 30, 18, 10, 2, 0.8)),
('Whale Beta', 'ED01', 'ED01_BETA', 10.00, 5, 20, create_rarity_dist(30, 30, 22, 15, 3, 1.0));

-- ============================================================================
-- PACK GAMMA (Cultura Digital)
-- ============================================================================

INSERT INTO booster_types (name, edition_id, pack_id, price_brl, cards_per_booster, price_multiplier, rarity_distribution) VALUES
('Básico Gamma', 'ED01', 'ED01_GAMMA', 0.50, 5, 1, create_rarity_dist(60, 28, 8, 4, 0, 0.3)),
('Padrão Gamma', 'ED01', 'ED01_GAMMA', 1.00, 5, 2, create_rarity_dist(55, 28, 12, 5, 0, 0.5)),
('Premium Gamma', 'ED01', 'ED01_GAMMA', 2.00, 5, 4, create_rarity_dist(50, 27, 15, 7, 1, 0.7)),
('Elite Gamma', 'ED01', 'ED01_GAMMA', 5.00, 5, 10, create_rarity_dist(40, 30, 18, 10, 2, 0.8)),
('Whale Gamma', 'ED01', 'ED01_GAMMA', 10.00, 5, 20, create_rarity_dist(30, 30, 22, 15, 3, 1.0));

-- ============================================================================
-- PARTE 4: Criar tabela raspadinhas
-- ============================================================================

CREATE TABLE IF NOT EXISTS raspadinhas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booster_type_id UUID NOT NULL REFERENCES booster_types(id) ON DELETE CASCADE,
  tier TEXT NOT NULL,
  multiplier INTEGER NOT NULL,
  probability NUMERIC(12,10) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_booster_tier UNIQUE(booster_type_id, tier)
);

CREATE INDEX IF NOT EXISTS idx_raspadinhas_booster_type ON raspadinhas(booster_type_id);

-- ============================================================================
-- PARTE 5: Popular raspadinhas
-- ============================================================================

DO $$
DECLARE
  booster_rec RECORD;
BEGIN
  FOR booster_rec IN 
    SELECT id, name, price_brl FROM booster_types WHERE edition_id = 'ED01'
  LOOP
    IF booster_rec.price_brl <= 1.00 THEN
      -- Básico/Padrão: Grand 500x, Major 100x, Minor 10x
      INSERT INTO raspadinhas (booster_type_id, tier, multiplier, probability) VALUES
        (booster_rec.id, 'grand', 500, 0.00001),
        (booster_rec.id, 'major', 100, 0.0002),
        (booster_rec.id, 'minor', 10, 0.005);
        
    ELSIF booster_rec.price_brl <= 2.00 THEN
      -- Premium: Grand 400x, Major 80x, Minor 10x
      INSERT INTO raspadinhas (booster_type_id, tier, multiplier, probability) VALUES
        (booster_rec.id, 'grand', 400, 0.00002),
        (booster_rec.id, 'major', 80, 0.0003),
        (booster_rec.id, 'minor', 10, 0.006);
        
    ELSIF booster_rec.price_brl <= 5.00 THEN
      -- Elite: Grand 200x, Major 50x, Minor 8x
      INSERT INTO raspadinhas (booster_type_id, tier, multiplier, probability) VALUES
        (booster_rec.id, 'grand', 200, 0.00005),
        (booster_rec.id, 'major', 50, 0.0005),
        (booster_rec.id, 'minor', 8, 0.008);
        
    ELSE
      -- Whale: Grand 100x, Major 30x, Minor 5x
      INSERT INTO raspadinhas (booster_type_id, tier, multiplier, probability) VALUES
        (booster_rec.id, 'grand', 100, 0.0001),
        (booster_rec.id, 'major', 30, 0.001),
        (booster_rec.id, 'minor', 5, 0.01);
    END IF;
    
    RAISE NOTICE 'Raspadinhas criadas: % (R$ %)', booster_rec.name, booster_rec.price_brl;
  END LOOP;
END $$;

-- ============================================================================
-- VERIFICAÇÃO FINAL
-- ============================================================================

-- Contar boosters
SELECT 
  pack_id,
  COUNT(*) as total,
  array_agg(name ORDER BY price_brl) as boosters
FROM booster_types
WHERE edition_id = 'ED01'
GROUP BY pack_id;

-- Contar raspadinhas
SELECT 
  bt.pack_id,
  bt.name,
  COUNT(r.id) as jackpots_count
FROM booster_types bt
LEFT JOIN raspadinhas r ON r.booster_type_id = bt.id
WHERE bt.edition_id = 'ED01'
GROUP BY bt.pack_id, bt.name, bt.price_brl
ORDER BY bt.pack_id, bt.price_brl;

-- Verificar godmode ativado
SELECT 
  name,
  price_brl,
  (rarity_distribution->>'godmode')::NUMERIC as godmode_pct
FROM booster_types
WHERE edition_id = 'ED01'
ORDER BY pack_id, price_brl;

SELECT '✅ MIGRATION COMPLETA!' as status;
