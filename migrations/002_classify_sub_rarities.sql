-- ============================================================================
-- FASE 2: CLASSIFICAR TODAS AS 366 CARTAS EM SUB-RARIDADES
-- ============================================================================

-- ETAPA 1: Atribuir sub_rarity baseado em base_liquidity_brl atual
UPDATE cards_base
SET sub_rarity = CASE
  -- TRASH: R$ 0.01 - R$ 0.02
  WHEN rarity = 'trash' THEN
    CASE
      WHEN base_liquidity_brl <= 0.011 THEN 'low'
      WHEN base_liquidity_brl <= 0.015 THEN 'mid'
      ELSE 'high'
    END
  
  -- MEME: R$ 0.02 - R$ 0.25
  WHEN rarity = 'meme' THEN
    CASE
      WHEN base_liquidity_brl <= 0.08 THEN 'low'
      WHEN base_liquidity_brl <= 0.15 THEN 'mid'
      ELSE 'high'
    END
  
  -- VIRAL: R$ 0.25 - R$ 1.20
  WHEN rarity = 'viral' THEN
    CASE
      WHEN base_liquidity_brl <= 0.45 THEN 'low'
      WHEN base_liquidity_brl <= 0.75 THEN 'mid'
      ELSE 'high'
    END
  
  -- LEGENDARY: R$ 1.20 - R$ 10.00
  WHEN rarity = 'legendary' THEN
    CASE
      WHEN base_liquidity_brl <= 2.50 THEN 'low'
      WHEN base_liquidity_brl <= 5.00 THEN 'mid'
      ELSE 'high'
    END
  
  -- GODMODE: R$ 60.00 - R$ 150.00
  WHEN rarity = 'godmode' THEN
    CASE
      WHEN base_liquidity_brl <= 80.00 THEN 'low'
      WHEN base_liquidity_brl <= 110.00 THEN 'mid'
      ELSE 'high'
    END
END;

-- ETAPA 2: Corrigir cartas fora do range esperado

-- 2A. Viral muito baratas (< R$ 0.25) → virar Meme high
UPDATE cards_base
SET rarity = 'meme',
    sub_rarity = 'high',
    base_liquidity_brl = GREATEST(base_liquidity_brl, 0.20)
WHERE rarity = 'viral' AND base_liquidity_brl < 0.25;

-- 2B. Viral muito caras (> R$ 1.20) → virar Legendary low
UPDATE cards_base
SET rarity = 'legendary',
    sub_rarity = 'low',
    base_liquidity_brl = GREATEST(base_liquidity_brl, 1.20)
WHERE rarity = 'viral' AND base_liquidity_brl > 1.20;

-- 2C. Legendary muito baratas (< R$ 1.20) → ajustar para mínimo
UPDATE cards_base
SET sub_rarity = 'low',
    base_liquidity_brl = 1.20
WHERE rarity = 'legendary' AND base_liquidity_brl < 1.20;

-- 2D. Godmode ajustado para ranges corretos
UPDATE cards_base
SET base_liquidity_brl = CASE
  WHEN sub_rarity = 'low' AND base_liquidity_brl < 60 THEN 60.00
  WHEN sub_rarity = 'mid' AND base_liquidity_brl < 80 THEN 90.00
  WHEN sub_rarity = 'high' AND base_liquidity_brl < 110 THEN 130.00
  ELSE base_liquidity_brl
END
WHERE rarity = 'godmode';

-- ETAPA 3: Verificar distribuição final
SELECT 
  rarity,
  sub_rarity,
  COUNT(*) as qtd_cartas,
  MIN(base_liquidity_brl) as min_valor,
  MAX(base_liquidity_brl) as max_valor,
  ROUND(AVG(base_liquidity_brl)::numeric, 3) as media
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

-- ============================================================================
-- RESULTADO ESPERADO:
-- trash-low:    ~60 cartas | R$ 0.01 - R$ 0.011
-- trash-mid:    ~60 cartas | R$ 0.011 - R$ 0.015
-- trash-high:   ~59 cartas | R$ 0.015 - R$ 0.02
-- meme-low:     ~43 cartas | R$ 0.02 - R$ 0.08
-- meme-mid:     ~44 cartas | R$ 0.08 - R$ 0.15
-- meme-high:    ~43 cartas | R$ 0.15 - R$ 0.25
-- viral-low:    ~12 cartas | R$ 0.25 - R$ 0.45
-- viral-mid:    ~12 cartas | R$ 0.45 - R$ 0.75
-- viral-high:   ~12 cartas | R$ 0.75 - R$ 1.20
-- legendary-low:  ~10 cartas | R$ 1.20 - R$ 2.50
-- legendary-mid:  ~10 cartas | R$ 2.50 - R$ 5.00
-- legendary-high:  ~9 cartas | R$ 5.00 - R$ 10.00
-- godmode-low:    1 carta | R$ 60.00
-- godmode-mid:    1 carta | R$ 90.00
-- godmode-high:   1 carta | R$ 130.00
-- ============================================================================
