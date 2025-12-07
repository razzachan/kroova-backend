-- ============================================================================
-- MIGRATION PARCIAL: 001 a 004 (Boosters já existem, pular 005)
-- ============================================================================

BEGIN;

-- ============================================================================
-- FASE 1: ADICIONAR COLUNAS (migration 001)
-- ============================================================================
ALTER TABLE cards_base 
ADD COLUMN IF NOT EXISTS sub_rarity text 
CHECK (sub_rarity IN ('low', 'mid', 'high'));

ALTER TABLE cards_base 
ADD COLUMN IF NOT EXISTS pack_archetype text 
CHECK (pack_archetype IN ('alpha', 'beta', 'gamma'));

CREATE INDEX IF NOT EXISTS idx_cards_base_sub_rarity ON cards_base(sub_rarity);
CREATE INDEX IF NOT EXISTS idx_cards_base_pack_archetype ON cards_base(pack_archetype);
CREATE INDEX IF NOT EXISTS idx_cards_base_rarity_sub ON cards_base(rarity, sub_rarity);

-- ============================================================================
-- FASE 2: CLASSIFICAR SUB-RARITIES (migration 002)
-- ============================================================================

-- 2.1: Classificar trash (R$ 0.01 - 0.02)
UPDATE cards_base
SET sub_rarity = CASE 
  WHEN base_liquidity_brl >= 0.01 AND base_liquidity_brl < 0.011 THEN 'low'
  WHEN base_liquidity_brl >= 0.011 AND base_liquidity_brl < 0.015 THEN 'mid'
  WHEN base_liquidity_brl >= 0.015 AND base_liquidity_brl <= 0.02 THEN 'high'
END
WHERE rarity = 'trash';

-- 2.2: Classificar meme (R$ 0.02 - 0.25)
UPDATE cards_base
SET sub_rarity = CASE 
  WHEN base_liquidity_brl >= 0.02 AND base_liquidity_brl < 0.08 THEN 'low'
  WHEN base_liquidity_brl >= 0.08 AND base_liquidity_brl < 0.15 THEN 'mid'
  WHEN base_liquidity_brl >= 0.15 AND base_liquidity_brl <= 0.25 THEN 'high'
END
WHERE rarity = 'meme';

-- 2.3: Classificar viral (R$ 0.25 - 1.20)
UPDATE cards_base
SET sub_rarity = CASE 
  WHEN base_liquidity_brl >= 0.25 AND base_liquidity_brl < 0.45 THEN 'low'
  WHEN base_liquidity_brl >= 0.45 AND base_liquidity_brl < 0.75 THEN 'mid'
  WHEN base_liquidity_brl >= 0.75 AND base_liquidity_brl <= 1.20 THEN 'high'
END
WHERE rarity = 'viral' 
  AND base_liquidity_brl >= 0.25 
  AND base_liquidity_brl <= 1.20;

-- 2.4: RECLASSIFICAR viral < 0.25 como meme high
UPDATE cards_base
SET rarity = 'meme', 
    sub_rarity = 'high'
WHERE rarity = 'viral' 
  AND base_liquidity_brl < 0.25;

-- 2.5: RECLASSIFICAR viral > 1.20 como legendary low
UPDATE cards_base
SET rarity = 'legendary', 
    sub_rarity = 'low',
    base_liquidity_brl = GREATEST(base_liquidity_brl, 1.20)
WHERE rarity = 'viral' 
  AND base_liquidity_brl > 1.20;

-- 2.6: Classificar legendary (R$ 1.20 - 10.00)
UPDATE cards_base
SET sub_rarity = CASE 
  WHEN base_liquidity_brl >= 1.20 AND base_liquidity_brl < 2.50 THEN 'low'
  WHEN base_liquidity_brl >= 2.50 AND base_liquidity_brl < 5.00 THEN 'mid'
  WHEN base_liquidity_brl >= 5.00 AND base_liquidity_brl <= 10.00 THEN 'high'
END
WHERE rarity = 'legendary';

-- 2.7: FIX para legendary fora do range
UPDATE cards_base
SET base_liquidity_brl = 1.20,
    sub_rarity = 'low'
WHERE rarity = 'legendary' 
  AND base_liquidity_brl < 1.20;

UPDATE cards_base
SET base_liquidity_brl = 10.00,
    sub_rarity = 'high'
WHERE rarity = 'legendary' 
  AND base_liquidity_brl > 10.00;

-- 2.8: Classificar godmode (R$ 60 - 130)
UPDATE cards_base
SET sub_rarity = CASE 
  WHEN base_liquidity_brl < 75 THEN 'low'
  WHEN base_liquidity_brl >= 75 AND base_liquidity_brl < 110 THEN 'mid'
  WHEN base_liquidity_brl >= 110 THEN 'high'
END
WHERE rarity = 'godmode';

-- 2.9: AJUSTAR valores godmode para faixas definidas
UPDATE cards_base
SET base_liquidity_brl = CASE sub_rarity
  WHEN 'low' THEN 60.00
  WHEN 'mid' THEN 90.00
  WHEN 'high' THEN 130.00
END
WHERE rarity = 'godmode';

-- ============================================================================
-- FASE 3: CLASSIFICAR ARCHETYPES (migration 003)
-- ============================================================================

-- 3.1: ALPHA (Agressivo/Caótico) - 7 archetypes
UPDATE cards_base
SET pack_archetype = 'alpha'
WHERE archetype IN (
  'Explosão', 'Estrondo', 'Tempestade', 'Impulso', 
  'Corrida', 'Surto', 'Catalisador'
);

-- 3.2: BETA (Suporte/Psicológico) - 8 archetypes
UPDATE cards_base
SET pack_archetype = 'beta'
WHERE archetype IN (
  'Influência', 'Preguiça', 'Consumo', 'Sinal', 
  'Vibração', 'Onda', 'Pulso', 'Eco'
);

-- 3.3: GAMMA (Técnico/Econômico) - 9 archetypes
UPDATE cards_base
SET pack_archetype = 'gamma'
WHERE archetype IN (
  'Ganância', 'Informação', 'Nexo', 'Farol', 
  'Emissor', 'Oráculo', 'Coroa', 'Primordial', 'Totem'
);

-- 3.4: Default para beta (cartas sem archetype definido)
UPDATE cards_base
SET pack_archetype = 'beta'
WHERE pack_archetype IS NULL;

-- ============================================================================
-- FASE 4: CRIAR SISTEMA DE TREATMENTS (migration 004)
-- ============================================================================

-- 4.1: Criar tabela card_treatments
CREATE TABLE IF NOT EXISTS card_treatments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  card_id uuid NOT NULL,
  treatment_name text NOT NULL,
  applied_at timestamp DEFAULT now()
);

-- 4.2: Criar tabela treatment_config
CREATE TABLE IF NOT EXISTS treatment_config (
  id serial PRIMARY KEY,
  name text UNIQUE NOT NULL,
  display_name text NOT NULL,
  probability float NOT NULL CHECK (probability >= 0 AND probability <= 100),
  market_multiplier float NOT NULL DEFAULT 1.0,
  visual_effects jsonb,
  archetype_weight jsonb,
  min_rarity text,
  created_at timestamp DEFAULT now()
);

-- 4.3: Inserir 9 treatments configurados
INSERT INTO treatment_config (
  name, display_name, probability, market_multiplier, 
  visual_effects, archetype_weight, min_rarity
) VALUES 
  ('standard', 'Padrão', 70.0, 1.0, 
   '{"border": "normal", "shine": false}', 
   '{"alpha": 1.0, "beta": 1.0, "gamma": 1.0}', 'trash'),
  
  ('glitch', 'Glitch', 15.0, 1.2, 
   '{"border": "glitch", "animation": "static", "overlay": "scan_lines"}', 
   '{"alpha": 2.0, "beta": 1.5, "gamma": 1.0}', 'trash'),
  
  ('holo', 'Holográfico', 8.0, 1.5, 
   '{"border": "holo", "shine": true, "rainbow": true}', 
   '{"alpha": 1.0, "beta": 1.5, "gamma": 1.0}', 'meme'),
  
  ('dark', 'Dark Mode', 4.0, 1.8, 
   '{"border": "dark", "glow": "red", "shadow": "deep"}', 
   '{"alpha": 3.0, "beta": 1.0, "gamma": 0.5}', 'meme'),
  
  ('spectral', 'Espectral', 1.5, 2.0, 
   '{"border": "spectral", "ghosting": true, "transparency": 0.7}', 
   '{"alpha": 0.5, "beta": 3.0, "gamma": 1.0}', 'viral'),
  
  ('primal', 'Primal', 1.0, 2.5, 
   '{"border": "primal", "texture": "stone", "particles": "fire"}', 
   '{"alpha": 3.0, "beta": 0.5, "gamma": 0.5}', 'viral'),
  
  ('corrupted', 'Corrompido', 0.3, 3.0, 
   '{"border": "corrupted", "distortion": true, "color_shift": "purple"}', 
   '{"alpha": 2.0, "beta": 0.5, "gamma": 2.0}', 'legendary'),
  
  ('void_holo', 'Void Holo', 0.15, 3.5, 
   '{"border": "void", "shine": true, "particles": "void_energy", "animation": "float"}', 
   '{"alpha": 0.5, "beta": 1.0, "gamma": 3.0}', 'legendary'),
  
  ('legendary_glitch', 'Legendary Glitch', 0.05, 4.0, 
   '{"border": "legendary_glitch", "animation": "reality_break", "overlay": "matrix"}', 
   '{"alpha": 3.0, "beta": 1.0, "gamma": 2.0}', 'legendary')
ON CONFLICT (name) DO NOTHING;

-- 4.4: Criar índice para treatment_config
CREATE INDEX IF NOT EXISTS idx_treatment_config_name ON treatment_config(name);

-- ============================================================================
-- VERIFICAÇÕES FINAIS
-- ============================================================================

-- Verificar distribuição de sub_rarities
SELECT rarity, sub_rarity, COUNT(*) as total, 
       ROUND(AVG(base_liquidity_brl)::numeric, 4) as avg_price
FROM cards_base
GROUP BY rarity, sub_rarity
ORDER BY 
  CASE rarity 
    WHEN 'trash' THEN 1
    WHEN 'meme' THEN 2
    WHEN 'viral' THEN 3
    WHEN 'legendary' THEN 4
    WHEN 'godmode' THEN 5
  END,
  CASE sub_rarity
    WHEN 'low' THEN 1
    WHEN 'mid' THEN 2
    WHEN 'high' THEN 3
  END;

-- Verificar distribuição de archetypes
SELECT pack_archetype, COUNT(*) as total
FROM cards_base
GROUP BY pack_archetype
ORDER BY pack_archetype;

-- Verificar treatments configurados
SELECT name, display_name, probability, market_multiplier
FROM treatment_config
ORDER BY probability DESC;

COMMIT;

-- ============================================================================
-- FIM DA MIGRATION PARCIAL
-- ============================================================================
