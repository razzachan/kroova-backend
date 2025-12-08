-- Fix prize_amount_brl precision (was DECIMAL(10,2), truncating values < 0.01)
-- Need DECIMAL(10,4) to store values like 0.001 (Básico: R$0.50 * 1% / 5)

ALTER TABLE cards_instances
ALTER COLUMN prize_amount_brl TYPE DECIMAL(10, 4);

-- Update description
COMMENT ON COLUMN cards_instances.prize_amount_brl IS 'Cashback de 1% do custo do booster dividido por 5 cartas. Resgatável sem destruir a carta. Range: R$0.0010 (Básico) até R$0.1000 (Whale)';
