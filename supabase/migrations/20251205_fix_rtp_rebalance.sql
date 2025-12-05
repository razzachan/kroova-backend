-- ============================================================================
-- FIX RTP: REBALANCE RARITY DISTRIBUTIONS TO TARGET 60% RTP
-- ============================================================================
-- 
-- PROBLEMA ATUAL:
-- - Tier Básico: RTP 117% (deveria ser 60%)
-- - Tier Padrão: RTP 104% (deveria ser 60%)
-- - Tier Premium: RTP 218% (deveria ser 60%) ← GODMODE 1% matando
-- - Tier Elite: RTP 274% (deveria ser 60%) ← GODMODE 4% matando
-- - Tier Whale: RTP 306% (deveria ser 60%) ← GODMODE 10% matando
-- 
-- CAUSA RAIZ:
-- - Cartas godmode têm liquidez base R$ 82 (média)
-- - Com 10x multiplier = R$ 820 por carta
-- - 10% de chance = R$ 82 de valor esperado POR CARTA
-- - Em booster de R$ 10 com 5 cartas = R$ 410 só de godmode
-- 
-- SOLUÇÃO:
-- 1. Reduzir DRASTICAMENTE % de godmode (10% → 0.2%)
-- 2. Ajustar value_adjustment de cada tier
-- 3. Manter progressão: tiers caros = melhor chance de raro
-- 
-- META: RTP 60% em todos os tiers (margem ±5%)
-- ============================================================================

-- PASSO 1: TIER BÁSICO (R$ 0.50) - RTP 117% → 60%
-- ============================================================================
-- Reduzir value_adjustment de 0.93 → 0.48
-- Manter 0% godmode (tier iniciante não tem godmode)

UPDATE booster_types
SET 
  value_adjustment = 0.48,
  rarity_distribution = jsonb_build_object(
    'trash', 50.0,
    'meme', 38.0,
    'viral', 9.0,
    'legendary', 3.0,
    'godmode', 0.0
  )
WHERE price_brl = 0.50;

-- PASSO 2: TIER PADRÃO (R$ 1.00) - RTP 104% → 60%
-- ============================================================================
-- Reduzir value_adjustment de 0.91 → 0.52
-- Manter 0% godmode

UPDATE booster_types
SET 
  value_adjustment = 0.52,
  rarity_distribution = jsonb_build_object(
    'trash', 40.0,
    'meme', 35.0,
    'viral', 18.0,
    'legendary', 7.0,
    'godmode', 0.0
  )
WHERE price_brl = 1.00;

-- PASSO 3: TIER PREMIUM (R$ 2.00) - RTP 218% → 60%
-- ============================================================================
-- Godmode 1% → 0.1% (10x menos)
-- value_adjustment 0.75 → 0.25 (compensar godmode + geral)

UPDATE booster_types
SET 
  value_adjustment = 0.25,
  rarity_distribution = jsonb_build_object(
    'trash', 25.0,
    'meme', 30.0,
    'viral', 34.0,
    'legendary', 10.0,
    'godmode', 0.1
  )
WHERE price_brl = 2.00;

-- PASSO 4: TIER ELITE (R$ 5.00) - RTP 274% → 60%
-- ============================================================================
-- Godmode 4% → 0.2% (20x menos)
-- value_adjustment 0.72 → 0.18

UPDATE booster_types
SET 
  value_adjustment = 0.18,
  rarity_distribution = jsonb_build_object(
    'trash', 12.0,
    'meme', 20.0,
    'viral', 46.0,
    'legendary', 18.0,
    'godmode', 0.2
  )
WHERE price_brl = 5.00;

-- PASSO 5: TIER WHALE (R$ 10.00) - RTP 306% → 60%
-- ============================================================================
-- Godmode 10% → 0.5% (20x menos, mas ainda melhor que Elite)
-- value_adjustment 0.68 → 0.15

UPDATE booster_types
SET 
  value_adjustment = 0.15,
  rarity_distribution = jsonb_build_object(
    'trash', 3.0,
    'meme', 0.0,
    'viral', 55.0,
    'legendary', 32.0,
    'godmode', 0.5
  )
WHERE price_brl = 10.00;

-- ============================================================================
-- VERIFICAÇÃO PÓS-AJUSTE
-- ============================================================================

SELECT 
  '=== DISTRIBUIÇÕES ATUALIZADAS ===' as info;

SELECT 
  name,
  price_brl,
  value_adjustment,
  rarity_distribution
FROM booster_types
ORDER BY price_brl;

-- ============================================================================
-- GODMODE AGORA É ULTRA-RARO (como deveria ser)
-- ============================================================================
-- 
-- Tier Premium (R$ 2): 0.1% = 1 a cada 1000 cartas = 1 a cada 200 boosters
-- Tier Elite (R$ 5): 0.2% = 1 a cada 500 cartas = 1 a cada 100 boosters
-- Tier Whale (R$ 10): 0.5% = 1 a cada 200 cartas = 1 a cada 40 boosters
-- 
-- Com R$ 82 de liquidez base × 10x multiplier = R$ 820 por godmode
-- Isso mantém godmode como JACKPOT raro, não prêmio comum
-- ============================================================================
