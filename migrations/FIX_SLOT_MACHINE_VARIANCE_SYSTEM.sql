-- ==========================================================================
-- SISTEMA DE SLOT MACHINE - RTP COM VARIÂNCIA ALTA
-- ==========================================================================
-- CONCEITO: Jogador precisa poder GANHAR às vezes (jackpot) mas PERDER na maioria
-- 
-- RTP MÉDIO: ~67% (casa lucra 33%)
-- DISTRIBUIÇÃO POR ABERTURA:
--   - 60% aberturas: 20-50% RTP (perda, cria frustração e desejo)
--   - 30% aberturas: 60-90% RTP (quase empate)
--   - 9% aberturas: 100-150% RTP (vitória pequena, mantém engajamento)
--   - 1% aberturas: 200-500% RTP (JACKPOT! legendary com skin rara)
--
-- ESTRATÉGIA:
-- 1. AUMENTAR base_liquidity (especialmente legendary/godmode)
-- 2. AUMENTAR value_adjustment (para compensar e manter média 67%)
-- 3. Resultado: ALTA VARIÂNCIA com média controlada
-- ==========================================================================

BEGIN;

-- ==========================================================================
-- PASSO 1: AUMENTAR BASE_LIQUIDITY DAS CARTAS
-- ==========================================================================
-- Objetivo: Criar potencial de JACKPOT quando legendary/godmode dropa com skin rara

-- Godmode: R$ 1.50 → R$ 4.00 (com ghost 3x pode chegar a R$ 12+!)
UPDATE cards_base 
SET base_liquidity_brl = 4.00 
WHERE rarity = 'godmode';

-- Legendary: R$ 1.50 → R$ 3.00 (com ghost 3x pode chegar a R$ 9+!)
UPDATE cards_base 
SET base_liquidity_brl = 3.00 
WHERE rarity = 'legendary';

-- Viral: manter R$ 0.50 (ok para mid-tier)
-- Meme: manter R$ 0.15 (ok para filler)
-- Trash: manter R$ 0.02-0.05 (ok para loss padding)

-- ==========================================================================
-- PASSO 2: AUMENTAR VALUE_ADJUSTMENT PARA COMPENSAR
-- ==========================================================================
-- Com base_liquidity maior, precisamos dividir mais para manter média 67%
-- Multiplicadores baseados no aumento de base_liquidity

-- Básico: 0.26 → 0.50 (sem legendary, impacto pequeno)
UPDATE booster_types 
SET value_adjustment = 0.50 
WHERE name LIKE 'Básico%';

-- Padrão: 1.06 → 3.00 (7% chance legendary, precisa compensar muito)
UPDATE booster_types 
SET value_adjustment = 3.00 
WHERE name LIKE 'Padrão%';

-- Premium: 1.90 → 4.50 (10% legendary, potencial de spike alto)
UPDATE booster_types 
SET value_adjustment = 4.50 
WHERE name LIKE 'Premium%';

-- Elite: 0.88 → 2.50 (18% legendary, alto potencial)
UPDATE booster_types 
SET value_adjustment = 2.50 
WHERE name LIKE 'Elite%';

-- Whale: 0.84 → 3.00 (32% legendary + 8.5% godmode, JACKPOT TIER)
UPDATE booster_types 
SET value_adjustment = 3.00 
WHERE name LIKE 'Whale%';

-- ==========================================================================
-- VERIFICAÇÃO
-- ==========================================================================
SELECT 
  'CARTAS' as tipo,
  rarity,
  base_liquidity_brl,
  CASE 
    WHEN rarity = 'godmode' THEN '4.00 (era 1.50) - JACKPOT!'
    WHEN rarity = 'legendary' THEN '3.00 (era 1.50) - BIG WIN!'
    ELSE 'mantido'
  END as mudanca
FROM cards_base
WHERE rarity IN ('godmode', 'legendary', 'viral')
GROUP BY rarity, base_liquidity_brl
ORDER BY base_liquidity_brl DESC;

SELECT 
  'BOOSTERS' as tipo,
  name,
  value_adjustment,
  CASE 
    WHEN name LIKE 'Básico%' THEN '0.50 (era 0.26)'
    WHEN name LIKE 'Padrão%' THEN '3.00 (era 1.06)'
    WHEN name LIKE 'Premium%' THEN '4.50 (era 1.90)'
    WHEN name LIKE 'Elite%' THEN '2.50 (era 0.88)'
    WHEN name LIKE 'Whale%' THEN '3.00 (era 0.84)'
  END as mudanca
FROM booster_types
WHERE name LIKE 'Básico%' 
   OR name LIKE 'Padrão%' 
   OR name LIKE 'Premium%' 
   OR name LIKE 'Elite%' 
   OR name LIKE 'Whale%'
ORDER BY 
  CASE 
    WHEN name LIKE 'Básico%' THEN 1
    WHEN name LIKE 'Padrão%' THEN 2
    WHEN name LIKE 'Premium%' THEN 3
    WHEN name LIKE 'Elite%' THEN 4
    WHEN name LIKE 'Whale%' THEN 5
  END;

COMMIT;

-- ==========================================================================
-- EXEMPLOS DE RTP ESPERADO
-- ==========================================================================
-- Básico (R$ 0.50):
--   - Típico (trash+meme): R$ 0.10-0.20 = 20-40% RTP ❌ PERDA
--   - Sorte (3 meme): R$ 0.30 = 60% RTP ~ empate
--
-- Padrão (R$ 1.00):
--   - Típico (trash+meme): R$ 0.10-0.30 = 10-30% RTP ❌ PERDA
--   - Bom (1 viral): R$ 0.50 = 50% RTP ~ quase
--   - JACKPOT (1 legendary ghost): R$ 3.00 × 3 / 3.00 = R$ 3.00 = 300% RTP! 🎰
--
-- Whale (R$ 10.00):
--   - Típico (virals): R$ 3.00 = 30% RTP ❌ PERDA (frustra!)
--   - Bom (2 legendary): R$ 6.00 = 60% RTP ~ quase
--   - Ótimo (2 leg + 1 god): R$ 7.00-8.00 = 70-80% RTP ✅ VITÓRIA PEQUENA
--   - JACKPOT (godmode ghost): R$ 4.00 × 3 / 3.00 = R$ 4.00 × 2-3 cartas = 80-120% RTP! 🎰🎰🎰
-- ==========================================================================
