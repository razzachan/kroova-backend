-- ============================================================================
-- CORRIGIR VALORES MÍNIMOS - NENHUMA CARTA VALE MENOS QUE R$ 0.01
-- ============================================================================

-- 1. Verificar cartas com valor < R$ 0.01
SELECT 
  name, 
  rarity,
  base_liquidity_brl,
  archetype
FROM cards_base
WHERE base_liquidity_brl < 0.01
ORDER BY base_liquidity_brl;

-- 2. Ajustar todas cartas trash para mínimo R$ 0.01
UPDATE cards_base
SET base_liquidity_brl = CASE
  WHEN base_liquidity_brl < 0.01 THEN 0.01
  WHEN base_liquidity_brl < 0.012 THEN 0.011
  WHEN base_liquidity_brl < 0.015 THEN 0.013
  ELSE base_liquidity_brl
END
WHERE rarity = 'trash';

-- 3. Verificar resultado
SELECT 
  rarity,
  COUNT(*) as qtd,
  MIN(base_liquidity_brl) as min_valor,
  MAX(base_liquidity_brl) as max_valor,
  AVG(base_liquidity_brl) as media
FROM cards_base
GROUP BY rarity
ORDER BY 
  CASE rarity
    WHEN 'trash' THEN 1
    WHEN 'meme' THEN 2
    WHEN 'viral' THEN 3
    WHEN 'legendary' THEN 4
    WHEN 'godmode' THEN 5
  END;

-- ============================================================================
-- RESULTADO ESPERADO:
-- - Todas cartas trash valem entre R$ 0.01 e R$ 0.02
-- - Nenhuma carta no sistema vale menos que R$ 0.01
-- ============================================================================
