-- =========================================================================
-- ALTER COLUMN value_adjustment - EXPANDIR LIMITE
-- =========================================================================
-- Mudar de DECIMAL(4,2) para DECIMAL(8,2) para suportar valores até 999999.99
-- Necessário para boosters baratos (Basic) que precisam de divisor maior
-- =========================================================================

ALTER TABLE booster_types 
ALTER COLUMN value_adjustment TYPE DECIMAL(8,2);

-- Verificar a alteração
SELECT 
    column_name, 
    data_type, 
    numeric_precision, 
    numeric_scale
FROM information_schema.columns
WHERE table_name = 'booster_types' 
AND column_name = 'value_adjustment';
