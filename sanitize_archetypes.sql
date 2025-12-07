-- ============================================================================
-- SANITIZAR FORMATO DA COLUNA ARCHETYPE
-- ============================================================================
-- Remove valores inválidos e padroniza formato dos archetypes
-- ============================================================================

-- 1. Verificar valores atuais
SELECT 
  archetype,
  COUNT(*) as qtd_cards
FROM cards_base
GROUP BY archetype
ORDER BY archetype;

-- 2. Remover valores genéricos/inválidos
UPDATE cards_base
SET archetype = NULL
WHERE archetype IN ('text', 'NULL', '');

-- 3. Padronizar formato e remover espaços
UPDATE cards_base
SET archetype = TRIM(archetype)
WHERE archetype IS NOT NULL;

-- 4. Remover caracteres especiais e acentos (manter português BR)
UPDATE cards_base
SET archetype = 
  CASE 
    -- Normalizar archetypes em português BR
    WHEN archetype LIKE '%influ%ncia%' THEN 'Influência'
    WHEN archetype LIKE '%pregui%' THEN 'Preguiça'
    WHEN archetype LIKE '%informa%' THEN 'Informação'
    WHEN archetype LIKE '%gan%ncia%' THEN 'Ganância'
    
    -- Traduzir inglês → português BR
    WHEN LOWER(archetype) = 'prime' THEN 'Primordial'
    WHEN LOWER(archetype) IN ('impulse', 'impulso') THEN 'Impulso'
    WHEN LOWER(archetype) = 'emitter' OR LOWER(archetype) = 'emissor' THEN 'Emissor'
    WHEN LOWER(archetype) = 'beacon' OR LOWER(archetype) = 'farol' THEN 'Farol'
    WHEN LOWER(archetype) = 'nexus' OR LOWER(archetype) = 'nexo' THEN 'Nexo'
    WHEN LOWER(archetype) = 'oracle' OR LOWER(archetype) = 'oráculo' THEN 'Oráculo'
    WHEN LOWER(archetype) = 'crown' OR LOWER(archetype) = 'coroa' THEN 'Coroa'
    WHEN LOWER(archetype) = 'wave' OR LOWER(archetype) = 'onda' THEN 'Onda'
    WHEN LOWER(archetype) = 'vibe' OR LOWER(archetype) = 'vibração' THEN 'Vibração'
    WHEN LOWER(archetype) = 'echo' OR LOWER(archetype) = 'eco' THEN 'Eco'
    WHEN LOWER(archetype) = 'pulse' OR LOWER(archetype) = 'pulso' THEN 'Pulso'
    WHEN LOWER(archetype) = 'greed' OR LOWER(archetype) = 'ganância' THEN 'Ganância'
    WHEN LOWER(archetype) = 'sloth' OR LOWER(archetype) = 'preguiça' THEN 'Preguiça'
    WHEN LOWER(archetype) = 'influence' OR LOWER(archetype) = 'influência' THEN 'Influência'
    WHEN LOWER(archetype) = 'signal' OR LOWER(archetype) = 'sinal' THEN 'Sinal'
    WHEN LOWER(archetype) IN ('blast', 'explosão') THEN 'Explosão'
    WHEN LOWER(archetype) IN ('boom', 'estrondo') THEN 'Estrondo'
    WHEN LOWER(archetype) IN ('catalyst', 'catalisador') THEN 'Catalisador'
    WHEN LOWER(archetype) IN ('rush', 'corrida') THEN 'Corrida'
    WHEN LOWER(archetype) IN ('storm', 'tempestade') THEN 'Tempestade'
    WHEN LOWER(archetype) IN ('surge', 'onda de choque') THEN 'Surto'
    WHEN LOWER(archetype) IN ('totem') THEN 'Totem'
    WHEN LOWER(archetype) = 'consumo' THEN 'Consumo'
    WHEN LOWER(archetype) = 'informação' THEN 'Informação'
    
    ELSE INITCAP(archetype)  -- Capitalizar primeira letra
  END
WHERE archetype IS NOT NULL;

-- 5. Verificar resultado final
SELECT 
  archetype,
  COUNT(*) as qtd_cards
FROM cards_base
GROUP BY archetype
ORDER BY archetype;

-- ============================================================================
-- RESULTADO ESPERADO:
-- - Valores 'text', 'NULL' removidos
-- - Todos archetypes em português BR com acentuação correta
-- - Capitalização adequada (primeira letra maiúscula)
-- - Archetypes em inglês traduzidos para português
-- ============================================================================
