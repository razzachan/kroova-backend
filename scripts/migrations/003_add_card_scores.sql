-- Add influence_score and rarity_score to cards_base
-- These represent the visual metrics on the card (0-100)

ALTER TABLE cards_base 
ADD COLUMN IF NOT EXISTS influence_score INTEGER CHECK (influence_score >= 0 AND influence_score <= 100),
ADD COLUMN IF NOT EXISTS rarity_score INTEGER CHECK (rarity_score >= 0 AND rarity_score <= 100);

-- Create indexes for filtering/sorting
CREATE INDEX IF NOT EXISTS idx_cards_base_influence ON cards_base(influence_score);
CREATE INDEX IF NOT EXISTS idx_cards_base_rarity_score ON cards_base(rarity_score);

COMMENT ON COLUMN cards_base.influence_score IS 'Influência Social (0-100) - mostrado no coração superior esquerdo';
COMMENT ON COLUMN cards_base.rarity_score IS 'Raridade/Power (0-100) - mostrado no hexágono superior direito';
