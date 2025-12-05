-- ============================================================================
-- REBALANCEAMENTO DE RTP: Sub-tiers de raridade
-- ============================================================================
-- 
-- PROBLEMA: RTP muito baixo porque valores base das cartas são pequenos
-- SOLUÇÃO: Criar variações de preço dentro da mesma raridade baseado em:
--   - Número da carta (display_id)
--   - Popularidade do meme
--   - Arte/qualidade visual
--
-- Isso permite:
--   - Legendary "barata" (R$ 0.20) pode cair em tier básico
--   - Legendary "cara" (R$ 1.50) só cai em tiers altos
--   - Mantém raridade (4% legendary no básico ainda é raro!)
--   - Atinge RTP 70% sem inflar drop rates
-- ============================================================================

-- ANÁLISE ATUAL (valores médios reais):
-- trash: R$ 0.0086
-- meme: R$ 0.0473  
-- viral: R$ 0.1470
-- legendary: R$ 0.4450
-- godmode: R$ 1.40

-- RTP ATUAL COM ESSES VALORES:
-- Básico (0.50): 71% ✅ (perfeito!)
-- Padrão (1.00): 64% ⚠️ (precisa +9%)
-- Premium (2.00): 45% ❌ (precisa +56%)
-- Elite (5.00): 35% ❌ (precisa +100%)
-- Whale (10.00): 25% ❌ (precisa +180%)

-- ============================================================================
-- ESTRATÉGIA: Multiplicar valores base por faixa de display_id
-- ============================================================================

-- 1. Identificar faixas de cartas (por display_id ou outro critério)
-- Exemplo: cartas 1-50 = comum, 51-100 = incomum, 101-150 = raro, etc

-- 2. TRASH: multiplicar valores das faixas superiores
-- Faixa baixa (1-80): manter ~R$ 0.01 
-- Faixa alta (81-100): aumentar para R$ 0.03
UPDATE cards_base 
SET base_liquidity_brl = base_liquidity_brl * 3
WHERE rarity = 'trash' 
  AND edition_id = 'ED01'
  AND CAST(SUBSTRING(display_id FROM '[0-9]+') AS INTEGER) > 80;

-- 3. MEME: multiplicar valores das faixas superiores
-- Faixa baixa (1-60): manter ~R$ 0.04
-- Faixa média (61-80): aumentar para R$ 0.10 (2.5x)
-- Faixa alta (81-100): aumentar para R$ 0.20 (5x)
UPDATE cards_base 
SET base_liquidity_brl = base_liquidity_brl * 2.5
WHERE rarity = 'meme' 
  AND edition_id = 'ED01'
  AND CAST(SUBSTRING(display_id FROM '[0-9]+') AS INTEGER) BETWEEN 61 AND 80;

UPDATE cards_base 
SET base_liquidity_brl = base_liquidity_brl * 5
WHERE rarity = 'meme' 
  AND edition_id = 'ED01'
  AND CAST(SUBSTRING(display_id FROM '[0-9]+') AS INTEGER) > 80;

-- 4. VIRAL: multiplicar valores (importante para tiers médios)
-- Faixa baixa (1-50): manter ~R$ 0.15
-- Faixa média (51-80): aumentar para R$ 0.40 (2.7x)
-- Faixa alta (81-100): aumentar para R$ 0.80 (5.3x)
UPDATE cards_base 
SET base_liquidity_brl = base_liquidity_brl * 2.7
WHERE rarity = 'viral' 
  AND edition_id = 'ED01'
  AND CAST(SUBSTRING(display_id FROM '[0-9]+') AS INTEGER) BETWEEN 51 AND 80;

UPDATE cards_base 
SET base_liquidity_brl = base_liquidity_brl * 5.3
WHERE rarity = 'viral' 
  AND edition_id = 'ED01'
  AND CAST(SUBSTRING(display_id FROM '[0-9]+') AS INTEGER) > 80;

-- 5. LEGENDARY: criar sub-tiers (CRÍTICO para tiers altos)
-- Faixa baixa (1-40): manter ~R$ 0.45 (pode cair em Básico 4%)
-- Faixa média (41-70): aumentar para R$ 1.50 (3.4x) (foco Premium/Elite)
-- Faixa alta (71-100): aumentar para R$ 4.00 (9x) (foco Whale)
UPDATE cards_base 
SET base_liquidity_brl = base_liquidity_brl * 3.4
WHERE rarity = 'legendary' 
  AND edition_id = 'ED01'
  AND CAST(SUBSTRING(display_id FROM '[0-9]+') AS INTEGER) BETWEEN 41 AND 70;

UPDATE cards_base 
SET base_liquidity_brl = base_liquidity_brl * 9
WHERE rarity = 'legendary' 
  AND edition_id = 'ED01'
  AND CAST(SUBSTRING(display_id FROM '[0-9]+') AS INTEGER) > 70;

-- 6. GODMODE: criar sub-tiers (ULTRA RARO)
-- Faixa baixa (1-30): manter ~R$ 1.40 (pode cair em Premium 1%)
-- Faixa média (31-60): aumentar para R$ 5.00 (3.6x) (Elite/Whale)
-- Faixa alta (61-100): aumentar para R$ 15.00 (10.7x) (só Whale, jackpot!)
UPDATE cards_base 
SET base_liquidity_brl = base_liquidity_brl * 3.6
WHERE rarity = 'godmode' 
  AND edition_id = 'ED01'
  AND CAST(SUBSTRING(display_id FROM '[0-9]+') AS INTEGER) BETWEEN 31 AND 60;

UPDATE cards_base 
SET base_liquidity_brl = base_liquidity_brl * 10.7
WHERE rarity = 'godmode' 
  AND edition_id = 'ED01'
  AND CAST(SUBSTRING(display_id FROM '[0-9]+') AS INTEGER) > 60;

-- ============================================================================
-- RESULTADO ESPERADO (simulação):
-- ============================================================================
-- 
-- Básico (R$ 0.50): ~70% RTP
--   - 60% trash (~0.01) = R$ 0.03
--   - 28% meme (~0.05) = R$ 0.07
--   - 8% viral (~0.15) = R$ 0.06
--   - 4% legendary baixa (~0.45) = R$ 0.09
--   Total: ~R$ 0.35 (70% de 0.50)
--
-- Whale (R$ 10.00): ~70% RTP
--   - 30% trash (~0.02) = R$ 0.30
--   - 30% meme (~0.15) = R$ 2.25
--   - 22% viral alta (~0.70) = R$ 0.77
--   - 15% legendary alta (~3.50) = R$ 2.63
--   - 3% godmode média (~8.00) = R$ 1.20
--   Total: ~R$ 7.15 (71% de 10.00)
--
-- ============================================================================

-- Verificar mudanças
SELECT 
  rarity,
  CAST(SUBSTRING(display_id FROM '[0-9]+') AS INTEGER) as card_num,
  MIN(base_liquidity_brl) as min_value,
  AVG(base_liquidity_brl) as avg_value,
  MAX(base_liquidity_brl) as max_value,
  COUNT(*) as count
FROM cards_base
WHERE edition_id = 'ED01'
GROUP BY rarity, CAST(SUBSTRING(display_id FROM '[0-9]+') AS INTEGER) / 20
ORDER BY rarity, card_num;
