-- ============================================================================
-- FASE 5: EXPANDIR TABELA booster_types PARA 15 TIPOS
-- ============================================================================

-- Adicionar coluna pack_archetype aos boosters
ALTER TABLE booster_types 
ADD COLUMN IF NOT EXISTS pack_archetype text 
CHECK (pack_archetype IN ('alpha', 'beta', 'gamma'));

-- Limpar boosters existentes (vamos recriar do zero)
DELETE FROM booster_types;

-- Inserir os 15 novos tipos de boosters (5 tiers × 3 archetypes)

-- =============== TIER 1: R$ 0.50 (Básico) ===============
INSERT INTO booster_types (
  tier,
  name_key,
  name_display,
  pack_archetype,
  price_brl,
  price_crypto,
  cards_per_pack,
  description,
  value_adjustment,
  is_active
) VALUES
  (
    'basic',
    'basic_alpha',
    'Básico Alpha',
    'alpha',
    0.50,
    0.0001,
    5,
    '🔴 Booster agressivo focado em cartas de ataque, caos e instabilidade digital. Contém 5 cartas com chance de viral e legendary de combate.',
    2.74, -- valor inicial, será recalibrado
    true
  ),
  (
    'basic',
    'basic_beta',
    'Básico Beta',
    'beta',
    0.50,
    0.0001,
    5,
    '🔵 Booster de suporte com cartas de influência psicológica e manipulação social. Contém 5 cartas com foco em controle e redes.',
    2.74,
    true
  ),
  (
    'basic',
    'basic_gamma',
    'Básico Gamma',
    'gamma',
    0.50,
    0.0001,
    5,
    '🟢 Booster técnico-econômico com cartas de dados, algoritmos e mercado. Contém 5 cartas com mecânicas complexas.',
    2.74,
    true
  ),

-- =============== TIER 2: R$ 1.00 (Padrão) ===============
  (
    'standard',
    'standard_alpha',
    'Padrão Alpha',
    'alpha',
    1.00,
    0.0002,
    5,
    '🔴 Booster agressivo aprimorado com maior chance de cartas de alta destruição e poder bruto.',
    2.39,
    true
  ),
  (
    'standard',
    'standard_beta',
    'Padrão Beta',
    'beta',
    1.00,
    0.0002,
    5,
    '🔵 Booster de suporte aprimorado com cartas de manipulação avançada e impacto social.',
    2.39,
    true
  ),
  (
    'standard',
    'standard_gamma',
    'Padrão Gamma',
    'gamma',
    1.00,
    0.0002,
    5,
    '🟢 Booster técnico-econômico aprimorado com cartas de estratégias de mercado e dados.',
    2.39,
    true
  ),

-- =============== TIER 3: R$ 2.00 (Premium) ===============
  (
    'premium',
    'premium_alpha',
    'Premium Alpha',
    'alpha',
    2.00,
    0.0004,
    5,
    '🔴 Booster agressivo premium com alta probabilidade de viral e legendary de combate extremo.',
    0.77,
    true
  ),
  (
    'premium',
    'premium_beta',
    'Premium Beta',
    'beta',
    2.00,
    0.0004,
    5,
    '🔵 Booster de suporte premium com legendary de controle psicológico e manipulação de massas.',
    0.77,
    true
  ),
  (
    'premium',
    'premium_gamma',
    'Premium Gamma',
    'gamma',
    2.00,
    0.0004,
    5,
    '🟢 Booster técnico-econômico premium com legendary de algoritmos avançados e economia complexa.',
    0.77,
    true
  ),

-- =============== TIER 4: R$ 5.00 (Elite) ===============
  (
    'elite',
    'elite_alpha',
    'Elite Alpha',
    'alpha',
    5.00,
    0.001,
    5,
    '🔴 Booster agressivo elite com foco em legendary high e godmode de destruição massiva.',
    0.36,
    true
  ),
  (
    'elite',
    'elite_beta',
    'Elite Beta',
    'beta',
    5.00,
    0.001,
    5,
    '🔵 Booster de suporte elite com legendary high de controle total e godmode psicológico.',
    0.36,
    true
  ),
  (
    'elite',
    'elite_gamma',
    'Elite Gamma',
    'gamma',
    5.00,
    0.001,
    5,
    '🟢 Booster técnico-econômico elite com legendary high de mercado avançado e godmode econômico.',
    0.36,
    true
  ),

-- =============== TIER 5: R$ 10.00 (Whale) ===============
  (
    'whale',
    'whale_alpha',
    'Whale Alpha',
    'alpha',
    10.00,
    0.002,
    5,
    '🔴 Booster agressivo definitivo com altíssima chance de legendary high e godmode de caos absoluto.',
    0.28,
    true
  ),
  (
    'whale',
    'whale_beta',
    'Whale Beta',
    'beta',
    10.00,
    0.002,
    5,
    '🔵 Booster de suporte definitivo com altíssima chance de legendary high e godmode de controle supremo.',
    0.28,
    true
  ),
  (
    'whale',
    'whale_gamma',
    'Whale Gamma',
    'gamma',
    10.00,
    0.002,
    5,
    '🟢 Booster técnico-econômico definitivo com altíssima chance de legendary high e godmode econômico.',
    0.28,
    true
  );

-- Verificar boosters criados
SELECT 
  tier,
  name_display,
  pack_archetype,
  price_brl,
  cards_per_pack,
  value_adjustment,
  is_active
FROM booster_types
ORDER BY 
  CASE tier
    WHEN 'basic' THEN 1
    WHEN 'standard' THEN 2
    WHEN 'premium' THEN 3
    WHEN 'elite' THEN 4
    WHEN 'whale' THEN 5
  END,
  pack_archetype;

-- ============================================================================
-- RESULTADO ESPERADO:
-- - 15 tipos de boosters criados (5 tiers × 3 archetypes)
-- - Cada booster tem archetype, preço, descrição e value_adjustment inicial
-- - Valores de value_adjustment serão recalibrados após testes
-- ============================================================================
