-- SOLUÇÃO EMERGENCIAL: Reduzir godmode para que MESMO com ghost 3x fique OK
-- Problema: Godmode ghost saiu R$ 15.00 (esperado R$ 7.50)
-- Bug confirmado: value_adjustment e CAP não estão sendo aplicados em produção
-- 
-- Cálculo atual (COM BUG):
-- Godmode R$ 3.50 × ghost 3x = R$ 10.50 (sem divisão por value_adjustment!)
-- Mas saiu R$ 15.00... ainda pior!
--
-- SOLUÇÃO: Reduzir godmode para R$ 1.50
-- R$ 1.50 × ghost 3x = R$ 4.50 (aceitável sem CAP)
-- R$ 1.50 × dark 1.5x = R$ 2.25 (OK)
-- R$ 1.50 × default 1x = R$ 1.50 (OK)

UPDATE cards_base 
SET base_liquidity_brl = 1.50 
WHERE rarity = 'godmode';

-- Verificar
SELECT rarity, MAX(base_liquidity_brl) as max_base, MIN(base_liquidity_brl) as min_base
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
