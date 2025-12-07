-- ============================================================================
-- FASE 3: CLASSIFICAR CARTAS EM PACK ARCHETYPES (Alpha/Beta/Gamma)
-- ============================================================================

-- Atribuir pack_archetype baseado no archetype atual
UPDATE cards_base
SET pack_archetype = CASE
  -- 🔴 ALPHA - AGRESSIVO/CAÓTICO (75 cartas)
  WHEN archetype IN (
    'Explosão',
    'Estrondo', 
    'Tempestade',
    'Impulso',
    'Corrida',
    'Surto',
    'Catalisador'
  ) THEN 'alpha'
  
  -- 🔵 BETA - SUPORTE/PSICOLÓGICO (184 cartas)
  WHEN archetype IN (
    'Influência',
    'Preguiça',
    'Consumo',
    'Sinal',
    'Vibração',
    'Onda',
    'Pulso',
    'Eco'
  ) THEN 'beta'
  
  -- 🟢 GAMMA - TÉCNICO/ECONÔMICO (95 cartas)
  WHEN archetype IN (
    'Ganância',
    'Informação',
    'Nexo',
    'Farol',
    'Emissor',
    'Oráculo',
    'Coroa',
    'Primordial',
    'Totem'
  ) THEN 'gamma'
  
  -- Default: Cartas sem archetype → distribuir em beta (mais comum)
  ELSE 'beta'
END;

-- Verificar distribuição por archetype
SELECT 
  pack_archetype,
  COUNT(*) as total_cartas,
  COUNT(CASE WHEN rarity = 'trash' THEN 1 END) as trash,
  COUNT(CASE WHEN rarity = 'meme' THEN 1 END) as meme,
  COUNT(CASE WHEN rarity = 'viral' THEN 1 END) as viral,
  COUNT(CASE WHEN rarity = 'legendary' THEN 1 END) as legendary,
  COUNT(CASE WHEN rarity = 'godmode' THEN 1 END) as godmode
FROM cards_base
GROUP BY pack_archetype
ORDER BY pack_archetype;

-- Verificar cartas sem archetype (devem ter recebido 'beta' por default)
SELECT 
  name,
  rarity,
  archetype,
  pack_archetype,
  base_liquidity_brl
FROM cards_base
WHERE archetype IS NULL
ORDER BY rarity, base_liquidity_brl DESC;

-- ============================================================================
-- RESULTADO ESPERADO:
-- alpha: ~75 cartas (agressivas/caóticas)
-- beta:  ~184 cartas (suporte/psicológicas) + cartas sem archetype
-- gamma: ~95 cartas (técnicas/econômicas)
-- ============================================================================
