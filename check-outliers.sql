-- ============================================================================
-- DIAGNÓSTICO: ENCONTRAR CARTAS OUTLIERS NOS POOLS
-- ============================================================================

-- 1. Top 10 cartas mais caras por archetype
SELECT pack_archetype, rarity, sub_rarity, name, 
       ROUND(base_liquidity_brl::numeric, 2) as price
FROM cards_base
WHERE pack_archetype = 'beta'
ORDER BY base_liquidity_brl DESC
LIMIT 20;

-- 2. Distribuição de preços por archetype e rarity
SELECT pack_archetype, rarity,
       COUNT(*) as total,
       ROUND(MIN(base_liquidity_brl)::numeric, 4) as min_price,
       ROUND(AVG(base_liquidity_brl)::numeric, 4) as avg_price,
       ROUND(MAX(base_liquidity_brl)::numeric, 4) as max_price,
       ROUND(STDDEV(base_liquidity_brl)::numeric, 4) as stddev
FROM cards_base
GROUP BY pack_archetype, rarity
ORDER BY pack_archetype, 
  CASE rarity 
    WHEN 'trash' THEN 1
    WHEN 'meme' THEN 2
    WHEN 'viral' THEN 3
    WHEN 'legendary' THEN 4
    WHEN 'godmode' THEN 5
  END;

-- 3. Contar cartas por archetype
SELECT pack_archetype, COUNT(*) as total
FROM cards_base
GROUP BY pack_archetype
ORDER BY pack_archetype;
