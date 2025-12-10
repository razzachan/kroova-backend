-- ============================================================================
-- AUDIT SCRIPT: Booster Rarity Distribution
-- Objetivo: Verificar distribuição atual de cartas por raridade e tier
-- ============================================================================

-- 1. CONTAGEM DE CARTAS POR RARIDADE
-- ----------------------------------------------------------------------------
SELECT 
  rarity,
  COUNT(*) as total_cards,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM cards_base
GROUP BY rarity
ORDER BY 
  CASE rarity
    WHEN 'godmode' THEN 1
    WHEN 'legendary' THEN 2
    WHEN 'viral' THEN 3
    WHEN 'meme' THEN 4
    WHEN 'trash' THEN 5
    ELSE 6
  END;

-- 2. CONTAGEM DE INSTÂNCIAS POR RARIDADE (em circulação)
-- ----------------------------------------------------------------------------
SELECT 
  cb.rarity,
  COUNT(ci.id) as total_instances,
  ROUND(COUNT(ci.id) * 100.0 / SUM(COUNT(ci.id)) OVER(), 2) as percentage,
  COUNT(DISTINCT ci.owner_id) as unique_owners
FROM cards_instances ci
JOIN cards_base cb ON ci.base_id = cb.id
WHERE ci.owner_id IS NOT NULL -- Apenas cartas com dono (não no marketplace)
GROUP BY cb.rarity
ORDER BY 
  CASE cb.rarity
    WHEN 'godmode' THEN 1
    WHEN 'legendary' THEN 2
    WHEN 'viral' THEN 3
    WHEN 'meme' THEN 4
    WHEN 'trash' THEN 5
    ELSE 6
  END;

-- 3. VERIFICAR CONFIGURAÇÃO ATUAL DE BOOSTER_TYPES
-- ----------------------------------------------------------------------------
SELECT 
  id,
  name,
  price_brl,
  cards_per_booster,
  guaranteed_cards,
  rarity_distribution,
  market_tier_filter,
  value_adjustment
FROM booster_types
ORDER BY price_brl ASC;

-- 4. HISTÓRICO DE ABERTURAS DE BOOSTERS (últimos 30 dias)
-- ----------------------------------------------------------------------------
SELECT 
  bt.name as booster_tier,
  COUNT(DISTINCT bo.id) as total_openings,
  COUNT(DISTINCT bo.user_id) as unique_users,
  ROUND(AVG(bt.price_brl), 2) as avg_price,
  ROUND(SUM(bt.price_brl), 2) as total_revenue
FROM booster_openings bo
JOIN booster_types bt ON bo.booster_type_id = bt.id
WHERE bo.opened_at >= NOW() - INTERVAL '30 days'
GROUP BY bt.name, bt.price_brl
ORDER BY bt.price_brl ASC;

-- 5. RARIDADE DAS CARTAS OBTIDAS EM ABERTURAS (últimos 30 dias)
-- ----------------------------------------------------------------------------
SELECT 
  cb.rarity,
  COUNT(*) as cards_obtained,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM booster_openings bo
JOIN cards_instances ci ON ci.minted_at BETWEEN bo.opened_at - INTERVAL '1 second' AND bo.opened_at + INTERVAL '5 seconds'
  AND ci.owner_id = bo.user_id
JOIN cards_base cb ON ci.base_id = cb.id
WHERE bo.opened_at >= NOW() - INTERVAL '30 days'
GROUP BY cb.rarity
ORDER BY 
  CASE cb.rarity
    WHEN 'godmode' THEN 1
    WHEN 'legendary' THEN 2
    WHEN 'viral' THEN 3
    WHEN 'meme' THEN 4
    WHEN 'trash' THEN 5
    ELSE 6
  END;

-- 6. MÉDIA DE RARIDADE POR TIER (últimos 30 dias)
-- ----------------------------------------------------------------------------
SELECT 
  bt.name as booster_tier,
  cb.rarity,
  COUNT(*) as cards_obtained,
  ROUND(COUNT(*) * 1.0 / COUNT(DISTINCT bo.id), 2) as avg_per_booster
FROM booster_openings bo
JOIN booster_types bt ON bo.booster_type_id = bt.id
JOIN cards_instances ci ON ci.minted_at BETWEEN bo.opened_at - INTERVAL '1 second' AND bo.opened_at + INTERVAL '5 seconds'
  AND ci.owner_id = bo.user_id
JOIN cards_base cb ON ci.base_id = cb.id
WHERE bo.opened_at >= NOW() - INTERVAL '30 days'
GROUP BY bt.name, cb.rarity
ORDER BY 
  bt.name,
  CASE cb.rarity
    WHEN 'godmode' THEN 1
    WHEN 'legendary' THEN 2
    WHEN 'viral' THEN 3
    WHEN 'meme' THEN 4
    WHEN 'trash' THEN 5
    ELSE 6
  END;

-- 7. VERIFICAR SE HÁ CARTAS GODMODE "DEMAIS" EM CIRCULAÇÃO
-- ----------------------------------------------------------------------------
SELECT 
  cb.name,
  cb.rarity,
  COUNT(ci.id) as instances_in_circulation,
  ROUND(AVG(cb.base_liquidity_brl), 4) as avg_base_value
FROM cards_base cb
LEFT JOIN cards_instances ci ON ci.base_id = cb.id AND ci.owner_id IS NOT NULL
WHERE cb.rarity = 'godmode'
GROUP BY cb.id, cb.name, cb.rarity, cb.base_liquidity_brl
ORDER BY instances_in_circulation DESC;

-- 8. VERIFICAR DISTRIBUIÇÃO DE RARIDADES E ARCHETYPES
-- ----------------------------------------------------------------------------
SELECT 
  cb.rarity,
  cb.archetype,
  COUNT(*) as total_cards
FROM cards_base cb
GROUP BY cb.rarity, cb.archetype
ORDER BY 
  CASE cb.rarity
    WHEN 'godmode' THEN 1
    WHEN 'legendary' THEN 2
    WHEN 'viral' THEN 3
    WHEN 'meme' THEN 4
    WHEN 'trash' THEN 5
    ELSE 6
  END,
  cb.skin;

-- 9. TOP 10 USUÁRIOS COM MAIS CARTAS GODMODE
-- ----------------------------------------------------------------------------
SELECT 
  u.id,
  u.name as username,
  COUNT(ci.id) as godmode_cards,
  ROUND(AVG(cb.base_liquidity_brl), 4) as avg_card_value
FROM users u
JOIN cards_instances ci ON ci.owner_id = u.id
JOIN cards_base cb ON ci.base_id = cb.id
WHERE cb.rarity = 'godmode'
GROUP BY u.id, u.name
ORDER BY godmode_cards DESC
LIMIT 10;

-- 10. VERIFICAR SE HÁ POOLS VAZIOS (sem cartas de determinada raridade)
-- ----------------------------------------------------------------------------
SELECT 
  bt.name as booster_tier,
  r.rarity,
  COUNT(cb.id) as available_cards
FROM booster_types bt
CROSS JOIN (
  SELECT UNNEST(ARRAY['trash', 'meme', 'viral', 'legendary', 'godmode']) as rarity
) r
LEFT JOIN cards_base cb ON cb.rarity = r.rarity
GROUP BY bt.name, r.rarity
HAVING COUNT(cb.id) = 0
ORDER BY bt.name, r.rarity;

-- 11. CÁLCULO DE RTP REAL (últimos 30 dias)
-- ----------------------------------------------------------------------------
-- Valor médio obtido vs preço pago
WITH booster_stats AS (
  SELECT 
    bt.name as booster_tier,
    bt.price_brl as booster_price,
    bo.id as opening_id,
    SUM(cb.base_liquidity_brl) as total_card_value
  FROM booster_openings bo
  JOIN booster_types bt ON bo.booster_type_id = bt.id
  JOIN cards_instances ci ON ci.minted_at BETWEEN bo.opened_at - INTERVAL '1 second' AND bo.opened_at + INTERVAL '5 seconds'
    AND ci.owner_id = bo.user_id
  JOIN cards_base cb ON ci.base_id = cb.id
  WHERE bo.opened_at >= NOW() - INTERVAL '30 days'
  GROUP BY bt.name, bt.price_brl, bo.id
)
SELECT 
  booster_tier,
  booster_price,
  COUNT(*) as total_openings,
  ROUND(AVG(total_card_value), 4) as avg_value_obtained,
  ROUND(AVG(total_card_value) / booster_price * 100, 2) as rtp_percentage,
  ROUND(MIN(total_card_value), 4) as min_value,
  ROUND(MAX(total_card_value), 4) as max_value
FROM booster_stats
GROUP BY booster_tier, booster_price
ORDER BY booster_price ASC;

-- 12. VERIFICAR ÚLTIMA ATUALIZAÇÃO DAS TABELAS CRÍTICAS
-- ----------------------------------------------------------------------------
SELECT 
  'cards_base' as table_name,
  COUNT(*) as total_records,
  'N/A' as last_operation
FROM cards_base
UNION ALL
SELECT 
  'booster_types' as table_name,
  COUNT(*) as total_records,
  'N/A' as last_operation
FROM booster_types
UNION ALL
SELECT 
  'cards_instances' as table_name,
  COUNT(*) as total_records,
  MAX(minted_at)::text as last_operation
FROM cards_instances
UNION ALL
SELECT 
  'booster_openings' as table_name,
  COUNT(*) as total_records,
  MAX(opened_at)::text as last_operation
FROM booster_openings;

-- ============================================================================
-- INSTRUÇÕES DE USO
-- ============================================================================
-- 1. Copie este script
-- 2. Execute no Supabase SQL Editor: https://supabase.com/dashboard/project/YOUR_PROJECT/sql
-- 3. Analise cada resultado para identificar problemas:
--    - Pools vazios (query 10)
--    - RTP muito baixo ou alto (query 11)
--    - Distribuição desproporcional (queries 1, 2, 6)
--    - Godmodes em excesso (query 7)
-- 4. Documente os findings no arquivo AUDIT_RESULTS.md
