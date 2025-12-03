-- Adicionar coluna source para diferenciar origem dos boosters
-- Crítico para proteção econômica: boosters grátis não podem dar pity

ALTER TABLE booster_openings 
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'purchase';

-- Valores possíveis:
-- 'purchase': Comprado com dinheiro
-- 'recycle': Obtido via reciclagem de 25 cartas
-- 'reward': Obtido via recompensa/promoção
-- 'pity': Obtido via sistema de pity (futuro)

-- Comentário explicativo
COMMENT ON COLUMN booster_openings.source IS 'Origem do booster: purchase, recycle, reward, pity';

-- Criar índice para queries de analytics
CREATE INDEX IF NOT EXISTS idx_booster_openings_source 
ON booster_openings(source);

-- Criar índice composto para verificar reciclagens diárias
CREATE INDEX IF NOT EXISTS idx_booster_openings_user_source_date 
ON booster_openings(user_id, source, purchased_at);

-- Query de teste para verificar distribuição de sources
-- SELECT source, COUNT(*) as count, COUNT(*) * 100.0 / SUM(COUNT(*)) OVER () as percentage
-- FROM booster_openings
-- GROUP BY source
-- ORDER BY count DESC;
