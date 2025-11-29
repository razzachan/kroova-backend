# 🔍 AUDITORIA PRODUÇÃO LOCAL vs DEPLOYED - 29 NOV 2025

## 📊 STATUS ATUAL

### ✅ **Ambiente Local (ATUALIZADO)**
- **Frontend:** Next.js 16.0.4 | React 19.2.0
- **Backend:** Node.js 20+ | TypeScript | Fastify
- **Database:** Supabase Cloud (via CLI)
- **Deploy:** Railway (backend) | Vercel (frontend - DESATUALIZADO)

### ⚠️ **Vercel Deploy DEFASADO**
**Último deploy:** Várias horas atrás  
**Status:** Código local tem features NÃO deployadas

---

## 🎯 ANÁLISE: FLUXO DE COMPRA MÚLTIPLA DE BOOSTERS

### **PROBLEMA IDENTIFICADO: Compra Múltipla Abre Apenas 1**

#### Comportamento Atual (`frontend/app/boosters/page.tsx`)

```typescript
async function handlePurchase(boosterId: string, quantity: number = 1) {
  // 1. Compra N boosters
  const res = await api.post('/boosters/purchase', {
    booster_type_id: boosterId,
    quantity: quantity,  // ✅ Backend cria N registros
    currency: 'brl'
  });
  
  // 2. Backend retorna { boosters: [], opening_id: string }
  const data = unwrap(res.data);
  
  // ⚠️ PROBLEMA: Só abre o PRIMEIRO booster
  if (data?.opening_id) {
    await handleOpen(data.opening_id);  // Abre só 1
  }
}
```

#### O Que Acontece no Backend (`src/modules/booster/booster.service.ts`)

```typescript
async purchase(userId, booster_type_id, quantity, currency) {
  // Cria N registros em booster_openings
  const openings = [];
  for (let i = 0; i < quantity; i++) {
    const opening = await admin.from("booster_openings").insert({
      user_id: userId,
      booster_type_id,
      cards_obtained: [],
      opened_at: null  // ✅ FECHADO (sealed pack)
    });
    openings.push(opening);
  }
  
  return {
    boosters: openings,  // ✅ Retorna TODOS
    total_paid,
    unit_price_brl,
    currency
  };
}
```

**✅ Backend ESTÁ CORRETO:** Cria N boosters fechados  
**❌ Frontend ESTÁ INCOMPLETO:** Abre só o primeiro

---

## 🎁 SEALED PACKS (Pacotes Fechados)

### ✅ **JÁ TEMOS SUPORTE NO BACKEND!**

**Tabela:** `booster_openings`
- **`opened_at: null`** = Booster FECHADO (sealed)
- **`opened_at: timestamp`** = Booster ABERTO

```sql
-- Buscar boosters fechados do usuário
SELECT * FROM booster_openings
WHERE user_id = 'xxx'
  AND opened_at IS NULL;
```

### ❌ **FALTA NO FRONTEND:**
1. **Página/seção para listar sealed packs**
2. **Escolher QUAL booster abrir** (não só o último comprado)
3. **Opção de "guardar para depois"**

---

## 🔧 MELHORIAS NECESSÁRIAS

### **1. Fluxo de Compra Múltipla (CRÍTICO)**

**Problema:** Usuário compra 10 boosters → só abre 1  
**Solução:** 3 opções de UX

#### **Opção A: Abrir Todos em Sequência (Atual Adaptado)**
```typescript
async function handlePurchase(boosterId: string, quantity: number = 1) {
  const res = await api.post('/boosters/purchase', {
    booster_type_id: boosterId,
    quantity,
    currency: 'brl'
  });
  
  const data = unwrap(res.data);
  
  // Abre todos os boosters em sequência
  for (const booster of data.boosters) {
    await handleOpen(booster.id);
    // Aguarda animação completa antes de próximo
  }
}
```

#### **Opção B: Perguntar ao Usuário (RECOMENDADO)**
```typescript
async function handlePurchase(boosterId: string, quantity: number = 1) {
  const res = await api.post('/boosters/purchase', { ... });
  const data = unwrap(res.data);
  
  // Modal de escolha
  if (quantity === 1) {
    await handleOpen(data.boosters[0].id);
  } else {
    showModal({
      title: `Você comprou ${quantity} boosters!`,
      options: [
        { label: 'Abrir Todos Agora', action: () => openAll(data.boosters) },
        { label: 'Abrir Depois', action: () => router.push('/inventory?tab=sealed') }
      ]
    });
  }
}
```

#### **Opção C: Sempre Guardar no Inventário**
```typescript
async function handlePurchase(boosterId: string, quantity: number = 1) {
  const res = await api.post('/boosters/purchase', { ... });
  
  // Sempre redireciona para sealed packs
  alert(`✅ ${quantity} booster(s) adicionado(s) ao seu inventário!`);
  router.push('/inventory?tab=sealed');
}
```

---

### **2. Inventário de Sealed Packs (NOVO)**

**Criar:** `frontend/app/inventory/sealed-packs.tsx`

```typescript
interface SealedPack {
  id: string;
  booster_type_id: string;
  created_at: string;
  booster_types: {
    name: string;
    edition_id: string;
    cards_per_booster: number;
  };
}

async function loadSealedPacks() {
  const res = await api.get('/boosters/sealed');
  const packs = unwrap<SealedPack[]>(res.data);
  return packs;
}

function SealedPacksGrid({ packs }) {
  return (
    <div className="grid grid-cols-4 gap-4">
      {packs.map(pack => (
        <div key={pack.id} className="booster-card sealed">
          <img src={`/boosters/${pack.booster_types.name}.png`} />
          <button onClick={() => openPack(pack.id)}>
            🎁 ABRIR AGORA
          </button>
        </div>
      ))}
    </div>
  );
}
```

**Backend endpoint necessário:**
```typescript
// src/http/routes/booster.routes.ts
fastify.get('/sealed', async (req) => {
  const { userId } = req.user;
  const { data } = await supabase
    .from('booster_openings')
    .select('*, booster_types(*)')
    .eq('user_id', userId)
    .is('opened_at', null)
    .order('created_at', { ascending: false });
  
  return { ok: true, data };
});
```

---

### **3. Abas no Inventário**

```
📁 Inventário
  ├── 🃏 Cartas Abertas (atual)
  └── 🎁 Pacotes Fechados (NOVO)
```

---

## 📝 INCONSISTÊNCIAS DE DOCUMENTAÇÃO

### **1. Next.js Version**
- ❌ `FRONTEND_SETUP.md`: Next.js **14**
- ✅ `package.json`: Next.js **16.0.4**
- ✅ `FRONTEND_FEATURES.md`: Next.js **15** (mais próximo)

**Correção:** Atualizar todos os docs para **Next.js 16 + React 19**

### **2. Pity System**
- ❌ `ECONOMIC_ADJUSTMENTS.md`: Godmode garantido em **180 boosters**
- ✅ `src/config/edition.ts`: **50 boosters** = **3 boosters grátis**

**Atual (LOCAL):**
```typescript
pityEnabled: true,
pityThresholds: [50],
pityRewardType: 'free_booster',
pityRewardQuantity: 3
```

**Documentação desatualizada diz:** "180 boosters = 1 Godmode"  
**Realidade no código:** "50 boosters = 3 boosters grátis"

### **3. Deploy URLs**
- ❌ Vários docs: `kroova-backend`, `kroova.gg`
- ✅ Realidade: `krouva` (novo branding)

---

## 🚀 ROADMAP DE CORREÇÕES

### **Sprint 1: Fluxo de Compra (URGENTE)**
- [ ] Implementar modal de escolha (abrir agora vs depois)
- [ ] Backend: endpoint `/boosters/sealed`
- [ ] Frontend: suporte para abrir lista de boosters

### **Sprint 2: Sealed Packs Inventory**
- [ ] Nova aba "Pacotes Fechados" no inventário
- [ ] Grid visual de boosters não abertos
- [ ] Botão "Abrir" por booster individual
- [ ] Contador: "Você tem X boosters fechados"

### **Sprint 3: Documentação**
- [ ] Atualizar `FRONTEND_SETUP.md` → Next.js 16
- [ ] Corrigir `ECONOMIC_ADJUSTMENTS.md` → Pity 50 = 3 boosters
- [ ] Atualizar URLs kroova → krouva
- [ ] Criar `SEALED_PACKS_SPEC.md`

### **Sprint 4: Deploy Vercel**
- [ ] Build local: `cd frontend && npm run build`
- [ ] Deploy: `vercel --prod`
- [ ] Validar features em produção
- [ ] Atualizar `DEPLOY_STATUS.md`

---

## 🎮 EXPERIÊNCIA DO USUÁRIO (Current vs Ideal)

### **Atual (LOCAL)**
```
1. Usuário compra 10 boosters
2. Sistema abre 1 booster automaticamente
3. Os outros 9 ficam "perdidos" no banco
4. Usuário não vê os 9 boosters restantes
5. ❌ PÉSSIMA UX
```

### **Ideal (PRÓXIMO)**
```
1. Usuário compra 10 boosters
2. Modal: "Abrir agora ou guardar?"
3a. Se "Agora": abre todos em sequência (com checkpoints a cada 10)
3b. Se "Guardar": vai para Inventário > Pacotes Fechados
4. Usuário pode abrir 1 por 1 quando quiser
5. ✅ CONTROLE TOTAL
```

---

## 🔒 SEGURANÇA: Sealed Packs

### ✅ **Já Implementado (Backend)**
- RLS protege `booster_openings.user_id`
- Impossível abrir booster de outro usuário
- `opened_at: null` marca sealed
- Ao abrir: `opened_at` vira timestamp

### ⚠️ **Validação Necessária**
```typescript
// Backend: booster.service.ts
async open(userId: string, boosterOpeningId: string) {
  const opening = await supabase
    .from('booster_openings')
    .select()
    .eq('id', boosterOpeningId)
    .eq('user_id', userId)  // ✅ Ownership check
    .is('opened_at', null)  // ✅ Not yet opened
    .single();
  
  if (!opening) {
    throw new Error('Booster não encontrado ou já aberto');
  }
  
  // Gera cartas...
}
```

---

## 📊 MÉTRICAS A MONITORAR

### **Sealed Packs Abandono**
```sql
-- Boosters comprados mas nunca abertos (>7 dias)
SELECT 
  user_id,
  COUNT(*) as abandoned_packs,
  MIN(created_at) as oldest_pack
FROM booster_openings
WHERE opened_at IS NULL
  AND created_at < NOW() - INTERVAL '7 days'
GROUP BY user_id
HAVING COUNT(*) >= 5;
```

**Alerta:** Usuário com 5+ packs fechados há 7+ dias = possível churn

### **Conversão Compra → Abertura**
```sql
-- Taxa de abertura nas primeiras 24h
SELECT 
  COUNT(*) FILTER (WHERE opened_at IS NOT NULL) * 100.0 / COUNT(*) as open_rate_24h
FROM booster_openings
WHERE created_at >= NOW() - INTERVAL '24 hours';
```

**Meta:** > 80% abrem em 24h

---

## 🏁 CONCLUSÃO

### **Problemas Críticos:**
1. ❌ Frontend não lida com compra múltipla (abre só 1)
2. ❌ Sealed packs invisíveis no inventário
3. ❌ Vercel deploy desatualizado
4. ❌ Documentação inconsistente (Next.js 14 vs 16, Pity 180 vs 50)

### **Pontos Fortes:**
1. ✅ Backend JÁ tem suporte completo a sealed packs
2. ✅ Segurança RLS protege ownership
3. ✅ Código local bem estruturado
4. ✅ Pity system funcionando (50 boosters = 3 grátis)

### **Próximo Passo Imediato:**
```bash
# 1. Implementar modal de escolha no frontend
# 2. Criar endpoint /boosters/sealed
# 3. Adicionar aba "Pacotes Fechados" no inventário
# 4. Deploy no Vercel
cd frontend
npm run build
vercel --prod
```

---

**Auditoria realizada em:** 29 NOV 2025  
**Ambiente:** Local (Supabase Cloud + Railway backend + Vercel frontend)  
**Status:** ⚠️ Código local > Produção deployed
