-- ============================================================================
-- FASE 4: CRIAR TABELA DE TREATMENTS (Efeitos Visuais)
-- ============================================================================

-- Criar tabela de treatments aplicados a card instances
CREATE TABLE IF NOT EXISTS card_treatments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_instance_id uuid NOT NULL REFERENCES cards_instances(id) ON DELETE CASCADE,
  treatment text NOT NULL CHECK (treatment IN (
    'standard',
    'glitch',
    'holo',
    'dark',
    'spectral',
    'primal',
    'corrupted',
    'void_holo',
    'legendary_glitch'
  )),
  treatment_probability numeric(6,5) NOT NULL, -- probabilidade de drop (ex: 0.00050)
  market_multiplier numeric(5,2) NOT NULL DEFAULT 1.0, -- multiplicador de valor de mercado
  applied_at timestamptz NOT NULL DEFAULT now(),
  
  UNIQUE(card_instance_id) -- cada card instance tem apenas 1 treatment
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_card_treatments_instance ON card_treatments(card_instance_id);
CREATE INDEX IF NOT EXISTS idx_card_treatments_treatment ON card_treatments(treatment);

-- Criar tabela de configuração de treatments (metadata)
CREATE TABLE IF NOT EXISTS treatment_config (
  treatment text PRIMARY KEY CHECK (treatment IN (
    'standard',
    'glitch',
    'holo',
    'dark',
    'spectral',
    'primal',
    'corrupted',
    'void_holo',
    'legendary_glitch'
  )),
  display_name text NOT NULL,
  description text,
  base_probability numeric(6,5) NOT NULL,
  market_multiplier numeric(5,2) NOT NULL,
  min_rarity text CHECK (min_rarity IN ('trash', 'meme', 'viral', 'legendary', 'godmode')),
  alpha_weight numeric(3,1) DEFAULT 1.0, -- peso em boosters alpha (1.0 = normal, 3.0 = 3x mais chance)
  beta_weight numeric(3,1) DEFAULT 1.0,
  gamma_weight numeric(3,1) DEFAULT 1.0,
  visual_effect jsonb, -- metadados do efeito visual (cor, animação, etc)
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Inserir configurações dos 9 treatments
INSERT INTO treatment_config (
  treatment, 
  display_name, 
  description,
  base_probability, 
  market_multiplier, 
  min_rarity,
  alpha_weight,
  beta_weight,
  gamma_weight,
  visual_effect
) VALUES
  (
    'standard',
    'Standard',
    'Versão padrão da carta sem efeitos especiais',
    0.70000,
    1.0,
    'trash',
    1.0, 1.0, 1.0,
    '{"effect": "none"}'::jsonb
  ),
  (
    'glitch',
    'Glitch',
    'Efeito de glitch digital e corrupção de pixels',
    0.15000,
    1.2,
    'trash',
    3.0, 2.0, 1.0,
    '{"effect": "glitch", "color": "#ff00ff", "intensity": "medium"}'::jsonb
  ),
  (
    'holo',
    'Holográfico',
    'Acabamento holográfico tradicional com efeito rainbow',
    0.08000,
    1.4,
    'meme',
    1.0, 3.0, 2.0,
    '{"effect": "holographic", "color": "rainbow", "shimmer": true}'::jsonb
  ),
  (
    'dark',
    'Dark',
    'Versão sombria da carta com paleta escura',
    0.04000,
    1.6,
    'meme',
    2.0, 3.0, 2.0,
    '{"effect": "dark", "color": "#1a0033", "shadow": "deep"}'::jsonb
  ),
  (
    'spectral',
    'Spectral',
    'Efeito fantasmagórico semi-transparente',
    0.01500,
    1.8,
    'viral',
    2.0, 3.0, 1.0,
    '{"effect": "spectral", "opacity": 0.7, "glow": "#00ffff"}'::jsonb
  ),
  (
    'primal',
    'Primal',
    'Versão origem da carta em seu estado mais puro',
    0.01000,
    2.0,
    'viral',
    2.0, 1.0, 3.0,
    '{"effect": "primal", "color": "#gold", "aura": true}'::jsonb
  ),
  (
    'corrupted',
    'Corrupted',
    'Totalmente corrompida por vírus digital',
    0.00300,
    2.5,
    'legendary',
    3.0, 1.0, 1.0,
    '{"effect": "corrupted", "color": "#ff0000", "distortion": "high"}'::jsonb
  ),
  (
    'void_holo',
    'Void Holo',
    'Holográfico negro do vazio',
    0.00150,
    3.0,
    'legendary',
    3.0, 1.0, 2.0,
    '{"effect": "void_holographic", "color": "#000000", "shimmer": "inverted"}'::jsonb
  ),
  (
    'legendary_glitch',
    'Legendary Glitch',
    'Ultra raro glitch animado de singularidade',
    0.00050,
    4.0,
    'legendary',
    3.0, 1.0, 3.0,
    '{"effect": "legendary_glitch", "animation": "extreme", "color": "#ff00ff", "particles": true}'::jsonb
  );

-- Verificar configurações inseridas
SELECT 
  treatment,
  display_name,
  base_probability,
  market_multiplier,
  min_rarity,
  CONCAT('α:', alpha_weight, ' β:', beta_weight, ' γ:', gamma_weight) as weights
FROM treatment_config
ORDER BY base_probability DESC;

-- ============================================================================
-- RESULTADO ESPERADO:
-- - Tabela card_treatments criada (vazia, será populada ao abrir boosters)
-- - Tabela treatment_config criada com 9 treatments configurados
-- - Cada treatment tem probabilidade, multiplicador e pesos por archetype
-- ============================================================================
