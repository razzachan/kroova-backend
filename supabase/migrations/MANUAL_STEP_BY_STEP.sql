-- ============================================================================
-- EXECUTE ESTAS QUERIES UMA POR VEZ NO SUPABASE DASHBOARD
-- Copie e cole cada bloco separadamente e verifique o resultado
-- ============================================================================

-- PASSO 1: Verificar schema atual
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'booster_types' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- PASSO 2: Adicionar coluna pack_id (execute SOMENTE esta linha)
ALTER TABLE public.booster_types ADD COLUMN pack_id TEXT;

-- PASSO 3: Verificar se a coluna foi adicionada
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'booster_types' 
AND table_schema = 'public'
AND column_name = 'pack_id';

-- PASSO 4: Criar índice
CREATE INDEX idx_booster_types_pack_id ON public.booster_types(pack_id);

-- PASSO 5: Limpar boosters obsoletos
DELETE FROM public.booster_types WHERE edition_id = 'ED01';

-- PASSO 6: Verificar que limpou
SELECT COUNT(*) as total_ed01 FROM public.booster_types WHERE edition_id = 'ED01';

-- PASSO 7: Criar função helper
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

-- PASSO 8: Inserir ALPHA boosters (5 boosters)
INSERT INTO public.booster_types (name, edition_id, pack_id, price_brl, cards_per_booster, price_multiplier, rarity_distribution) VALUES
('Básico Alpha', 'ED01', 'ED01_ALPHA', 0.50, 5, 1, create_rarity_dist(60, 28, 8, 4, 0, 0.3)),
('Padrão Alpha', 'ED01', 'ED01_ALPHA', 1.00, 5, 2, create_rarity_dist(55, 28, 12, 5, 0, 0.5)),
('Premium Alpha', 'ED01', 'ED01_ALPHA', 2.00, 5, 4, create_rarity_dist(50, 27, 15, 7, 1, 0.7)),
('Elite Alpha', 'ED01', 'ED01_ALPHA', 5.00, 5, 10, create_rarity_dist(40, 30, 18, 10, 2, 0.8)),
('Whale Alpha', 'ED01', 'ED01_ALPHA', 10.00, 5, 20, create_rarity_dist(30, 30, 22, 15, 3, 1.0));

-- PASSO 9: Verificar ALPHA
SELECT name, pack_id, price_brl FROM public.booster_types WHERE pack_id = 'ED01_ALPHA' ORDER BY price_brl;

-- PASSO 10: Inserir BETA boosters (5 boosters)
INSERT INTO public.booster_types (name, edition_id, pack_id, price_brl, cards_per_booster, price_multiplier, rarity_distribution) VALUES
('Básico Beta', 'ED01', 'ED01_BETA', 0.50, 5, 1, create_rarity_dist(60, 28, 8, 4, 0, 0.3)),
('Padrão Beta', 'ED01', 'ED01_BETA', 1.00, 5, 2, create_rarity_dist(55, 28, 12, 5, 0, 0.5)),
('Premium Beta', 'ED01', 'ED01_BETA', 2.00, 5, 4, create_rarity_dist(50, 27, 15, 7, 1, 0.7)),
('Elite Beta', 'ED01', 'ED01_BETA', 5.00, 5, 10, create_rarity_dist(40, 30, 18, 10, 2, 0.8)),
('Whale Beta', 'ED01', 'ED01_BETA', 10.00, 5, 20, create_rarity_dist(30, 30, 22, 15, 3, 1.0));

-- PASSO 11: Inserir GAMMA boosters (5 boosters)
INSERT INTO public.booster_types (name, edition_id, pack_id, price_brl, cards_per_booster, price_multiplier, rarity_distribution) VALUES
('Básico Gamma', 'ED01', 'ED01_GAMMA', 0.50, 5, 1, create_rarity_dist(60, 28, 8, 4, 0, 0.3)),
('Padrão Gamma', 'ED01', 'ED01_GAMMA', 1.00, 5, 2, create_rarity_dist(55, 28, 12, 5, 0, 0.5)),
('Premium Gamma', 'ED01', 'ED01_GAMMA', 2.00, 5, 4, create_rarity_dist(50, 27, 15, 7, 1, 0.7)),
('Elite Gamma', 'ED01', 'ED01_GAMMA', 5.00, 5, 10, create_rarity_dist(40, 30, 18, 10, 2, 0.8)),
('Whale Gamma', 'ED01', 'ED01_GAMMA', 10.00, 5, 20, create_rarity_dist(30, 30, 22, 15, 3, 1.0));

-- PASSO 12: Verificar todos os 15 boosters
SELECT pack_id, COUNT(*) as total, array_agg(name ORDER BY price_brl) as boosters
FROM public.booster_types
WHERE edition_id = 'ED01'
GROUP BY pack_id;

-- PASSO 13: Criar tabela raspadinhas
CREATE TABLE IF NOT EXISTS public.raspadinhas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booster_type_id UUID NOT NULL REFERENCES public.booster_types(id) ON DELETE CASCADE,
  tier TEXT NOT NULL,
  multiplier INTEGER NOT NULL,
  probability NUMERIC(12,10) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_booster_tier UNIQUE(booster_type_id, tier)
);

CREATE INDEX IF NOT EXISTS idx_raspadinhas_booster_type ON public.raspadinhas(booster_type_id);

-- PASSO 14: Popular raspadinhas
DO $$
DECLARE
  booster_rec RECORD;
BEGIN
  FOR booster_rec IN 
    SELECT id, name, price_brl FROM public.booster_types WHERE edition_id = 'ED01'
  LOOP
    IF booster_rec.price_brl <= 1.00 THEN
      INSERT INTO public.raspadinhas (booster_type_id, tier, multiplier, probability) VALUES
        (booster_rec.id, 'grand', 500, 0.00001),
        (booster_rec.id, 'major', 100, 0.0002),
        (booster_rec.id, 'minor', 10, 0.005);
    ELSIF booster_rec.price_brl <= 2.00 THEN
      INSERT INTO public.raspadinhas (booster_type_id, tier, multiplier, probability) VALUES
        (booster_rec.id, 'grand', 400, 0.00002),
        (booster_rec.id, 'major', 80, 0.0003),
        (booster_rec.id, 'minor', 10, 0.006);
    ELSIF booster_rec.price_brl <= 5.00 THEN
      INSERT INTO public.raspadinhas (booster_type_id, tier, multiplier, probability) VALUES
        (booster_rec.id, 'grand', 200, 0.00005),
        (booster_rec.id, 'major', 50, 0.0005),
        (booster_rec.id, 'minor', 8, 0.008);
    ELSE
      INSERT INTO public.raspadinhas (booster_type_id, tier, multiplier, probability) VALUES
        (booster_rec.id, 'grand', 100, 0.0001),
        (booster_rec.id, 'major', 30, 0.001),
        (booster_rec.id, 'minor', 5, 0.01);
    END IF;
  END LOOP;
END $$;

-- PASSO 15: Verificar raspadinhas criadas
SELECT 
  bt.pack_id,
  bt.name,
  COUNT(r.id) as jackpots_count
FROM public.booster_types bt
LEFT JOIN public.raspadinhas r ON r.booster_type_id = bt.id
WHERE bt.edition_id = 'ED01'
GROUP BY bt.pack_id, bt.name, bt.price_brl
ORDER BY bt.pack_id, bt.price_brl;

-- ✅ COMPLETO!
