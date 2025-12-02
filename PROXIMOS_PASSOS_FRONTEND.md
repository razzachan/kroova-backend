# 🚀 INTEGRAÇÃO FRONTEND - AÇÃO IMEDIATA

## ✅ BACKEND 100% PRONTO
- RTP: 72% (margem 28%)
- Pity: Legendary (20 packs), Godmode (150 packs)
- Função: `open_booster_pack_with_pity()`
- Liquidez ajustada em 354 cartas

---

## 🎯 PRÓXIMOS 3 PASSOS

### PASSO 1: Atualizar API Route (5min)
**Arquivo:** `frontend/app/api/v1/booster-packs/open/route.ts`

```typescript
// Linha ~36, trocar de:
const { data, error } = await supabase.rpc('open_booster_pack', {...})

// Para:
const { data, error } = await supabase.rpc('open_booster_pack_with_pity', {
  p_pack_id: pack_id,
  p_user_id: user_id,
  p_pack_tier: 'standard' // Fixo por enquanto
});
```

### PASSO 2: Criar Componente de Pity Dual (15min)
**Arquivo:** `frontend/components/PityProgressDual.tsx` (CRIAR NOVO)

```tsx
'use client';

export function PityProgressDual({ legendary, godmode }: { legendary: number; godmode: number }) {
  return (
    <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800 space-y-4">
      {/* Legendary: 0-20 */}
      <div>
        <div className="flex justify-between mb-2">
          <span className="text-sm font-bold text-purple-400">⭐ Legendary</span>
          <span className="text-xs text-purple-300">{legendary}/20</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
            style={{ width: `${(legendary/20)*100}%` }}
          />
        </div>
      </div>

      {/* Godmode: 0-150 */}
      <div>
        <div className="flex justify-between mb-2">
          <span className="text-sm font-bold text-yellow-400">👑 Godmode</span>
          <span className="text-xs text-yellow-300">{godmode}/150</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 transition-all duration-500"
            style={{ width: `${(godmode/150)*100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
```

### PASSO 3: Atualizar página boosters (20min)
**Arquivo:** `frontend/app/boosters/page.tsx`

**3.1 - Adicionar estados (linha ~50):**
```typescript
const [pityLegendary, setPityLegendary] = useState(0);
const [pityGodmode, setPityGodmode] = useState(0);
```

**3.2 - Carregar pity status (adicionar em `loadData()` linha ~140):**
```typescript
// Dentro do Promise.allSettled, adicionar:
api.get('/wallets?select=pity_legendary_counter,pity_godmode_counter')

// Processar resposta:
if (pityRes.status === 'fulfilled') {
  const pityData = unwrap(pityRes.value.data);
  setPityLegendary(pityData.pity_legendary_counter || 0);
  setPityGodmode(pityData.pity_godmode_counter || 0);
}
```

**3.3 - Substituir PityBar (linha ~600):**
```tsx
{/* Trocar <PityBar current={pityCount} max={pityMax} /> por: */}
<PityProgressDual legendary={pityLegendary} godmode={pityGodmode} />
```

**3.4 - Detectar pity trigger (adicionar após receber cartas):**
```typescript
// Após setRevealedCards(cards), adicionar:
const hasPity = cards.some(c => c.is_pity_reward);
if (hasPity) {
  // 🎉 Som especial
  cardAudio.play('legendary_reveal');
  
  // Flash visual
  document.body.style.animation = 'flash 0.5s';
  setTimeout(() => { document.body.style.animation = ''; }, 500);
}
```

---

## 🎨 VISUAL FINAL

```
┌─────────────────────────────────────────┐
│  🎁 ABRIR BOOSTERS                       │
├─────────────────────────────────────────┤
│                                          │
│  ⭐ Legendary    [████████░░]  16/20     │
│  👑 Godmode     [██░░░░░░░░░]  30/150    │
│                                          │
│  [ABRIR PACK STANDARD - R$ 0.50]  🎲     │
│                                          │
│  Saldo: R$ 25.50                         │
└─────────────────────────────────────────┘
```

---

## ✅ VALIDAÇÃO

Após implementar, testar:

1. **Abrir 1 pack normal**
   - ✓ Counters incrementam (+1 cada)
   - ✓ Cartas aparecem normalmente

2. **Forçar pity legendary** (SQL Editor):
   ```sql
   UPDATE wallets SET pity_legendary_counter = 20 
   WHERE user_id = 'SEU_USER_ID';
   ```
   - ✓ Próximo pack garante legendary
   - ✓ Counter reseta para 0

3. **Forçar pity godmode** (SQL Editor):
   ```sql
   UPDATE wallets SET pity_godmode_counter = 150 
   WHERE user_id = 'SEU_USER_ID';
   ```
   - ✓ Próximo pack garante godmode
   - ✓ Counter reseta para 0

---

## 🐛 TROUBLESHOOTING

**Erro: "function open_booster_pack_with_pity does not exist"**
→ Rodar `FIX_RTP_MULTIPLIERS_V2.sql` no Supabase SQL Editor

**Pity não atualiza**
→ Verificar se wallet tem as colunas: `pity_legendary_counter`, `pity_godmode_counter`

**RTP diferente de 72%**
→ Verificar se liquidez foi ajustada (rodar query de verificação)

---

## 📊 MÉTRICAS ESPERADAS

- **RTP**: ~72% (±3% por variância estatística)
- **Legendary**: 1 a cada 20 packs (5%)
- **Godmode**: 1 a cada 150 packs (0.67%)
- **Margem**: 28% (R$ 0.14 por pack de R$ 0.50)

---

**Tempo total estimado:** 40 minutos
**Complexidade:** Baixa (só integração, backend pronto)
**Impacto:** Alto (sistema de pity funcionando 100%)
