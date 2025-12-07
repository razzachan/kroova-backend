-- ===========================================================================
-- SOLUÇÃO DEFINITIVA: CAPPAR BASE_LIQUIDITY DIRETO NO BANCO
-- ===========================================================================
-- Como nem o código Next.js nem o trigger estão funcionando,
-- vamos cappar os valores BASE diretamente nas cartas.

-- ANÁLISE DO PROBLEMA:
-- - Padrão (R$ 1.00): Croco Trader legendary apareceu com R$ 24.88
-- - Isso significa base_liquidity_brl MUITO ALTO + skin multiplier
-- - Solução: Cappar base_liquidity por raridade

-- CAPS POR RARIDADE (considerando worst-case de skin 1.5x):
-- trash: max R$ 0.05 base (× 1.5 = R$ 0.075 final)
-- meme: max R$ 0.15 base (× 1.5 = R$ 0.225 final)  
-- viral: max R$ 0.50 base (× 1.5 = R$ 0.75 final → tier Padrão)
-- legendary: max R$ 2.00 base (× 1.5 = R$ 3.00 final → tier Elite)
-- godmode: max R$ 5.00 base (× 1.5 = R$ 7.50 final → tier Whale)

-- BACKUP antes de alterar
CREATE TABLE IF NOT EXISTS cards_base_backup_20251206 AS 
SELECT * FROM cards_base;

-- Aplicar CAPs
UPDATE cards_base 
SET base_liquidity_brl = LEAST(base_liquidity_brl, 0.05)
WHERE rarity = 'trash';

UPDATE cards_base 
SET base_liquidity_brl = LEAST(base_liquidity_brl, 0.15)
WHERE rarity = 'meme';

UPDATE cards_base 
SET base_liquidity_brl = LEAST(base_liquidity_brl, 0.50)
WHERE rarity = 'viral';

UPDATE cards_base 
SET base_liquidity_brl = LEAST(base_liquidity_brl, 2.00)
WHERE rarity = 'legendary';

UPDATE cards_base 
SET base_liquidity_brl = LEAST(base_liquidity_brl, 5.00)
WHERE rarity = 'godmode';

-- Verificar resultados
SELECT 
  rarity,
  COUNT(*) as total_cards,
  MIN(base_liquidity_brl) as min_value,
  MAX(base_liquidity_brl) as max_value,
  AVG(base_liquidity_brl) as avg_value
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
