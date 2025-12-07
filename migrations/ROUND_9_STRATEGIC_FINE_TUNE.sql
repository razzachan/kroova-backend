-- ROUND 9: Ajuste Fino Cirúrgico com Targets Tier-Specific
-- Estratégia: Pequenos ajustes conservadores mantendo valores próximos do alvo
-- Target máximo: 75% RTP em qualquer tier

-- BASIC TIER (Target: 65-75% RTP)
-- Atual: 135-141% → Reduzir ~45%
UPDATE booster_types 
SET value_adjustment = ROUND(value_adjustment * 1.85, 2)
WHERE name IN ('Básico Alpha', 'Básico Beta', 'Básico Gamma');

-- STANDARD TIER (Target: 60-70% RTP) ✅ JÁ MUITO PRÓXIMO!
-- Atual: 78-87% → Ajuste mínimo +10-15%
UPDATE booster_types 
SET value_adjustment = ROUND(value_adjustment * 1.12, 2)
WHERE name = 'Padrão Alpha'; -- 77.9% → ~69.5%

UPDATE booster_types 
SET value_adjustment = ROUND(value_adjustment * 1.25, 2)
WHERE name = 'Padrão Beta'; -- 86.7% → ~69.4%

UPDATE booster_types 
SET value_adjustment = ROUND(value_adjustment * 1.20, 2)
WHERE name = 'Padrão Gamma'; -- 83.2% → ~69.3%

-- PREMIUM TIER (Target: 58-68% RTP)
-- Atual: 105-191% → Ajuste significativo mas seguro
UPDATE booster_types 
SET value_adjustment = ROUND(value_adjustment * 1.55, 2)
WHERE name = 'Premium Alpha'; -- 104.7% → ~67.5%

UPDATE booster_types 
SET value_adjustment = ROUND(value_adjustment * 2.85, 2)
WHERE name = 'Premium Beta'; -- 190.9% → ~67.0%

UPDATE booster_types 
SET value_adjustment = ROUND(value_adjustment * 1.75, 2)
WHERE name = 'Premium Gamma'; -- 119.7% → ~68.4%

-- ELITE TIER (Target: 55-65% RTP)
-- Elite Alpha: 58.8% → MANTER! Já está dentro do range
-- Elite Beta: 140.5% → Reduzir ~55%
-- Elite Gamma: 179.1% → Reduzir ~65%

-- Elite Alpha: NÃO MEXER (58.8% está perfeito para este tier)
-- Apenas garantir não fica abaixo de 0.13
UPDATE booster_types 
SET value_adjustment = GREATEST(value_adjustment, 0.13)
WHERE name = 'Elite Alpha';

UPDATE booster_types 
SET value_adjustment = ROUND(value_adjustment * 2.30, 2)
WHERE name = 'Elite Beta'; -- 140.5% → ~61.1%

UPDATE booster_types 
SET value_adjustment = ROUND(value_adjustment * 2.85, 2)
WHERE name = 'Elite Gamma'; -- 179.1% → ~62.8%

-- WHALE TIER (Target: 55-70% RTP)
-- Whale Alpha: 40.5% → Impossível estruturalmente atingir 55%
-- Whale Beta: 306.1% → Reduzir drasticamente mas com segurança
-- Whale Gamma: 87.7% → Já próximo! Ajuste pequeno

-- Whale Alpha: ESTRUTURALMENTE IMPOSSÍVEL > 55%
-- Aceitar 40-50% como range realista para este booster específico
UPDATE booster_types 
SET value_adjustment = GREATEST(value_adjustment, 0.01)
WHERE name = 'Whale Alpha';

-- Whale Beta: Reduzir com segurança sem atingir limite
UPDATE booster_types 
SET value_adjustment = LEAST(
    ROUND(value_adjustment * 4.85, 2),
    999999.99
)
WHERE name = 'Whale Beta'; -- 306.1% → ~63.1% (se não estourar limite)

UPDATE booster_types 
SET value_adjustment = ROUND(value_adjustment * 1.28, 2)
WHERE name = 'Whale Gamma'; -- 87.7% → ~68.5%

-- VERIFICATION
SELECT 
    name,
    value_adjustment,
    CASE 
        WHEN name LIKE 'Básico%' THEN '65-75%'
        WHEN name LIKE 'Padrão%' THEN '60-70%'
        WHEN name LIKE 'Premium%' THEN '58-68%'
        WHEN name LIKE 'Elite%' THEN '55-65%'
        WHEN name LIKE 'Whale%' THEN '55-70%'
    END as target_range
FROM booster_types
ORDER BY 
    price_brl,
    name;

-- EXPECTED RESULTS AFTER ROUND 9:
-- ✅ Básico: 65-75%
-- ✅ Padrão: 69-70% (muito próximo!)
-- ✅ Premium: 67-68%
-- ✅ Elite Alpha: 58.8% (aceito para este tier)
-- ✅ Elite Beta/Gamma: 61-63%
-- ⚠️ Whale Alpha: 40-50% (ESTRUTURALMENTE IMPOSSÍVEL > 55%)
-- ✅ Whale Beta: 63-65% (se não estourar limite)
-- ✅ Whale Gamma: 68-70%

-- RESULTADO ESPERADO: 14/15 boosters dentro de targets realistas
-- Whale Alpha permanece outlier aceito (pool de cartas não permite > 55%)
