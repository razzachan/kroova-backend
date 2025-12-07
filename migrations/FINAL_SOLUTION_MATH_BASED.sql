-- ===========================================================================
-- SOLUÇÃO DEFINITIVA: CALIBRAÇÃO MATEMÁTICA PARA 65% RTP TARGET
-- ===========================================================================
-- Estratégia: Calcular value_adjustment baseado no valor MÉDIO esperado
-- para atingir exatamente 65% RTP (meio do range 62-72%)

-- FÓRMULA: value_adjustment = (preço_booster × 0.65) / valor_médio_esperado
-- 
-- Valores médios esperados (com distribuições corretas):
-- Básico: 60% trash (0.02) + 40% meme (0.10) = 0.056 avg
-- Padrão: 35% trash (0.02) + 40% meme (0.10) + 18% viral (0.50) + 7% leg (2.00) = 0.311 avg
-- Premium: 30% trash (0.02) + 25% meme (0.10) + 34% viral (0.50) + 10% leg (2.00) + 0.1% god (5.00) = 0.441 avg
-- Elite: 20% trash (0.02) + 12% meme (0.10) + 46% viral (0.50) + 18% leg (2.00) + 0.2% god (5.00) = 0.616 avg
-- Whale: 0% trash + 0% meme + 55% viral (0.50) + 32% leg (2.00) + 8.5% god (5.00) = 1.340 avg

-- TARGET RTP = 65%
-- Básico: R$ 0.50 × 0.65 = R$ 0.325 target → value_adj = 0.056 / 0.325 = 0.17
-- Padrão: R$ 1.00 × 0.65 = R$ 0.650 target → value_adj = 0.311 / 0.650 = 0.48
-- Premium: R$ 2.00 × 0.65 = R$ 1.300 target → value_adj = 0.441 / 1.300 = 0.34
-- Elite: R$ 5.00 × 0.65 = R$ 3.250 target → value_adj = 0.616 / 3.250 = 0.19
-- Whale: R$ 10.00 × 0.65 = R$ 6.500 target → value_adj = 1.340 / 6.500 = 0.21

UPDATE booster_types SET value_adjustment = 0.17 WHERE name LIKE 'Básico%';
UPDATE booster_types SET value_adjustment = 0.48 WHERE name LIKE 'Padrão%';
UPDATE booster_types SET value_adjustment = 0.34 WHERE name LIKE 'Premium%';
UPDATE booster_types SET value_adjustment = 0.19 WHERE name LIKE 'Elite%';
UPDATE booster_types SET value_adjustment = 0.21 WHERE name LIKE 'Whale%';

-- Backup dos valores antigos para rollback se necessário
-- Básico: 3.0, Padrão: 1.5, Premium: 1.0, Elite: 0.9, Whale: 1.3

SELECT 
  name,
  value_adjustment as new_value,
  price_brl,
  ROUND(price_brl * 0.65, 2) as target_return
FROM booster_types
ORDER BY CASE 
  WHEN name LIKE 'Básico%' THEN 1
  WHEN name LIKE 'Padrão%' THEN 2
  WHEN name LIKE 'Premium%' THEN 3
  WHEN name LIKE 'Elite%' THEN 4
  WHEN name LIKE 'Whale%' THEN 5
END;
