📋 **INSTRUÇÕES PARA APLICAR MIGRATION**

## Passo 1: Acessar Supabase SQL Editor

1. Abra https://supabase.com/dashboard
2. Selecione o projeto `mmcytphoeyxeylvaqjgr`
3. Clique em "SQL Editor" no menu lateral

## Passo 2: Copiar e executar o SQL

Copie TODO o conteúdo do arquivo:
`c:\Kroova\supabase\migrations\20251204_add_mystery_box_booster_bonus.sql`

Cole no SQL Editor e clique em **RUN**

## Passo 3: Verificar resultado

Após executar, você deve ver:

```
=== BOOSTER TYPES COM BONUS CONFIGURADO ===

name                    | tier_price | bonus_chance_percent | drop_rate           | avg_cost_per_booster
------------------------|------------|----------------------|---------------------|---------------------
Booster Bronze          | 0.50       | 2.00                 | 1 em 50.0 boosters  | R$ 0.01
Booster Silver          | 1.00       | 3.00                 | 1 em 33.3 boosters  | R$ 0.03
Booster Gold            | 2.00       | 4.00                 | 1 em 25.0 boosters  | R$ 0.08
Booster Platinum        | 5.00       | 5.00                 | 1 em 20.0 boosters  | R$ 0.25
Booster Diamond         | 10.00      | 6.00                 | 1 em 16.7 boosters  | R$ 0.60
```

## Campos criados:

✅ `booster_types.mystery_box_bonus_chance` - Probabilidade de bonus (2-6%)
✅ `mystery_box_instances.source_type` - Origem (purchase ou booster_bonus)
✅ `mystery_box_bonus_drops` - Tabela de tracking de drops

## Deployment

Após confirmar que o SQL foi aplicado com sucesso, execute:

```bash
cd c:\Kroova\frontend
vercel --prod --yes
```

🎉 O sistema de Mystery Box Bonus estará ativo!
