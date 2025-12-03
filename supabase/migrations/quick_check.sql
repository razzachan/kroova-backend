-- Verificação rápida do estado atual
SELECT 'BOOSTERS:' as check_type, COUNT(*)::text as result FROM booster_types WHERE edition_id = 'ED01'
UNION ALL
SELECT 'RASPADINHAS:', COUNT(*)::text FROM raspadinhas;

-- Mostrar boosters
SELECT pack_id, name, price_brl, 
       (rarity_distribution->>'godmode')::numeric as godmode_pct,
       price_multiplier
FROM booster_types 
WHERE edition_id = 'ED01'
ORDER BY pack_id, price_brl;

-- Mostrar amostra de raspadinhas
SELECT bt.name, r.tier, r.multiplier, r.probability
FROM raspadinhas r
JOIN booster_types bt ON bt.id = r.booster_type_id
WHERE bt.edition_id = 'ED01'
ORDER BY bt.price_brl, r.multiplier DESC
LIMIT 15;
