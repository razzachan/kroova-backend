# ANÁLISE DE RISCO ECONÔMICO - KROOVA
**Data:** 2025-12-03  
**Status:** 🚨 CRÍTICO - Sistema pity NÃO implementado + Reciclagem pode quebrar RTP

---

## 🔴 PROBLEMA 1: PITY SYSTEM NÃO ESTÁ FUNCIONANDO

### Status Atual
```typescript
// frontend/app/api/v1/boosters/open/route.ts linha 239
return NextResponse.json({
  ok: true,
  data: {
    opening_id,
    cards: generatedCards,
    pity_counter: 0,  // ⚠️ HARDCODED - NÃO INCREMENTA
    godmode_awarded: false
  }
});
```

### O que DEVERIA existir:
✅ Tabela `user_stats_pity` ou `user_pity_counter` no banco  
✅ Consulta do contador antes de gerar cartas  
✅ Incremento do contador após cada booster sem godmode  
✅ Reset do contador quando godmode ocorre  
✅ Ajuste de probabilidade baseado no contador  

### O que REALMENTE existe:
❌ Contador sempre retorna 0  
❌ Probabilidade de godmode SEMPRE 1.0% (nunca aumenta)  
❌ Sistema de pity documentado mas não implementado  
❌ Legendary pity também não existe  

### Risco Atual: **BAIXO**
- **Por quê?** Sem pity, RTP é MENOR que o planejado
- Jogadores podem ter frustração (muitos boosters sem godmode)
- Mas financeiramente a casa ganha MAIS

---

## 🔴 PROBLEMA 2: GODMODE PITY PODE QUEBRAR RTP

### Cenário de Risco (quando implementado):
Documentação diz: **"100 boosters = godmode garantido"**

```
Booster Lendário = R$ 250
100 boosters Lendário = R$ 25.000 investidos
Pity no booster 99 = PRÓXIMO é godmode garantido
```

### Exploit Possível:
1. Usuário compra 99 boosters Micro (R$ 49,50)
2. Sistema incrementa pity counter até 99
3. Usuário compra 1 booster Lendário (R$ 250)
4. **GODMODE GARANTIDO em booster de 15 cartas**
5. Godmode multiplica 10x a primeira carta legendary (R$ 0,50 × 10 = R$ 5,00)

### Cálculo do Dano:
```
Investimento: R$ 49,50 (99 micro) + R$ 250 (1 lendário) = R$ 299,50
Retorno: Booster Lendário normal (~R$ 58) + Godmode (R$ 5,00) = ~R$ 63
RTP do exploit: 21% (não quebra, mas é estratégia)
```

**Mas se Legendary vier no godmode:**
```
Booster Lendário tem 23% de legendary por carta
15 cartas = alta chance de legendary no pack
Godmode legendary = R$ 0,50 × 10 = R$ 5,00 (limitado pelo jackpot scaling)
```

### Risco REAL: **MÉDIO** ⚠️
- Godmode é 10× sobre PRIMEIRA CARTA do booster
- Jackpot scaling já limita valor máximo
- Mesmo com exploit, RTP não estoura 30-40%
- **MAS:** Se muitos usuários fizerem isso, margem cai

---

## 🔴 PROBLEMA 3: RECICLAGEM PODE QUEBRAR RTP

### Mecânica Atual de Reciclagem:
```
25 cartas trash (R$ 0,01 cada) = R$ 0,25 de valor
↓
1 Booster ED01 GRÁTIS (5 cartas)
```

### Cálculo de Valor:
**Input (25 cartas trash):**
- 25 × R$ 0,01 = R$ 0,25

**Output (1 Booster Básico grátis):**
- Esperança do booster: ~R$ 0,54 (5 cartas, RTP ~27%)
- Distribuição:
  - 45% trash (R$ 0,01)
  - 33% meme (R$ 0,03)
  - 18% viral (R$ 0,10)
  - 4% legendary (R$ 0,50)
  - 1% godmode (10x primeira carta)

**EV Médio de 1 Booster ED01:**
```
5 cartas × (0.45×0.01 + 0.33×0.03 + 0.18×0.10 + 0.04×0.50 + 0.01×5.00)
= 5 × (0.0045 + 0.0099 + 0.018 + 0.02 + 0.05)
= 5 × 0.1024
= R$ 0,512
```

### Reciclagem RTP:
```
Output / Input = R$ 0,512 / R$ 0,25 = 204% RTP
```

### 🚨 EXPLOIT POSSÍVEL:

**Estratégia 1: Farm de Trash**
1. Comprar boosters Micro (R$ 0,50, 1 carta)
2. 60% de chance de trash (R$ 0,01)
3. Acumular 25 trash
4. Reciclar → 1 booster grátis (R$ 0,51 esperado)

**Custo para 25 trash:**
- Esperança: ~42 boosters Micro = R$ 21,00
- Retorno: 1 booster grátis (R$ 0,51) + ~17 cartas não-trash (~R$ 0,70)
- **Total: ~R$ 1,21 de retorno por R$ 21,00 = RTP ~5,7%**
- ❌ NÃO é exploit vantajoso

**Estratégia 2: Reciclar Duplicatas após Compras**
1. Usuário compra 20 Boosters Básicos (R$ 500)
2. Recebe ~100 cartas
3. Separa as 25 piores (trash)
4. Recicla → 1 booster grátis
5. **Efeito: Aumenta RTP efetivo de 27% para ~28%**

### Risco Real: **BAIXO-MÉDIO** ⚠️
- Reciclagem aumenta RTP em ~1-2%
- Não é exploit isolado (precisa comprar primeiro)
- Usuários "sentem" que estão ganhando mais
- **MAS:** Se todos reciclarem sistematicamente, margem cai

---

## 🔴 PROBLEMA 4: COMBINAÇÃO PITY + RECICLAGEM

### Exploit Teórico Máximo:
1. Comprar 99 Boosters Micro (R$ 49,50)
2. Acumular ~60 trash, ~30 meme, ~10 viral
3. Reciclar 25 trash → 1 booster grátis (contador pity = 100)
4. **Booster 100 = godmode garantido**
5. Repetir

### Cálculo:
```
99 boosters micro = R$ 49,50
→ ~60 trash
→ 2 boosters grátis (50 trash recicladas)
→ Pity counter = 101 (inclui os grátis)
→ 1-2 godmodes
```

**EV do Exploit:**
```
Input: R$ 49,50
Output: 99 cartas (R$ 2,00) + 2 boosters grátis (R$ 1,00) + 1-2 godmodes (R$ 5-10)
= R$ 8-13
RTP = 16-26%
```

### Risco: **BAIXO** ✅
- Mesmo combinando, RTP não estoura 30%
- Jackpot scaling limita dano
- É "work" demais para pouco retorno

---

## 📊 RESUMO DE RISCOS

| Risco | Severidade | RTP Máximo | Mitigação |
|-------|------------|------------|-----------|
| **Pity não funciona** | 🟡 Baixo | 27% (atual) | Implementar corretamente |
| **Godmode pity exploit** | 🟠 Médio | 35-40% | Pity por TIPO de booster |
| **Reciclagem isolada** | 🟡 Baixo-Médio | 28-29% | Limitar reciclagens/dia |
| **Pity + Reciclagem** | 🟢 Baixo | 26% | Boosters grátis não contam pity |

---

## ✅ RECOMENDAÇÕES IMEDIATAS

### 1. **IMPLEMENTAR PITY CORRETAMENTE**
```typescript
// Adicionar no início de POST /boosters/open
const { data: pityData } = await supabaseAdmin
  .from('user_pity_counter')
  .select('counter')
  .eq('user_id', user.id)
  .eq('edition_id', edition_id)
  .single();

const pityCounter = pityData?.counter || 0;

// Forçar godmode se pity >= 100
if (pityCounter >= 100) {
  // Garantir 1 godmode no pack
  generatedCards[0] = selectGodmodeCard();
  
  // Reset counter
  await supabaseAdmin
    .from('user_pity_counter')
    .update({ counter: 0 })
    .eq('user_id', user.id)
    .eq('edition_id', edition_id);
}
```

### 2. **PITY POR TIPO DE BOOSTER**
```typescript
// Separar contadores por tier
user_pity_counter:
  - user_id
  - edition_id
  - booster_tier (micro, basico, premium, lendario)
  - counter
```

**Por quê?**
- Evita exploit de "farm micro → comprar lendário"
- Cada tier tem seu próprio pity
- Mantém incentivo para comprar boosters caros

### 3. **LIMITAR RECICLAGENS**
```typescript
// Adicionar na tabela transactions
user_daily_recycles:
  - user_id
  - date (YYYY-MM-DD)
  - recycle_count INT
  
// Limitar a 3 reciclagens/dia
if (recycleCount >= 3) {
  return error('Limite diário de reciclagens atingido');
}
```

### 4. **BOOSTERS GRÁTIS NÃO CONTAM PITY**
```typescript
// Na abertura de booster:
if (opening.source === 'purchase') {
  // Incrementa pity normalmente
} else if (opening.source === 'recycle' || opening.source === 'reward') {
  // NÃO incrementa pity
  // NÃO pode dar godmode via pity
}
```

### 5. **ADICIONAR COLUNA `source` EM booster_openings**
```sql
ALTER TABLE booster_openings 
ADD COLUMN source TEXT DEFAULT 'purchase';

-- Valores possíveis: 'purchase', 'recycle', 'reward', 'promo'
```

---

## 📈 IMPACTO FINANCEIRO PROJETADO

### Cenário Atual (Sem Pity):
```
RTP Médio: 27%
Margem: 73%
```

### Cenário com Pity Implementado:
```
RTP Médio: 29-31%
Margem: 69-71%
```

### Cenário com Pity + Reciclagem Ilimitada:
```
RTP Médio: 31-33%
Margem: 67-69%
```

### Cenário PIOR CASO (Exploit Massivo):
```
RTP Médio: 35-40%
Margem: 60-65%
```

### Cenário com TODAS as Mitigações:
```
RTP Médio: 28-30%
Margem: 70-72%
✅ Seguro e sustentável
```

---

## 🎯 PLANO DE AÇÃO

### Prioridade 1 (URGENTE):
- [ ] Adicionar coluna `source` em `booster_openings`
- [ ] Implementar verificação de pity counter
- [ ] Boosters grátis não incrementam pity
- [ ] Limitar reciclagens a 3/dia

### Prioridade 2 (IMPORTANTE):
- [ ] Separar pity por tier de booster
- [ ] Implementar incremento automático de pity
- [ ] Reset automático após godmode
- [ ] Testes com 10k simulações

### Prioridade 3 (DESEJÁVEL):
- [ ] Dashboard de monitoramento de RTP
- [ ] Alertas se RTP > 35%
- [ ] Sistema de ban para exploit detectado
- [ ] A/B test de thresholds de pity

---

## 🔍 MONITORAMENTO RECOMENDADO

```sql
-- Query para detectar exploits
SELECT 
  user_id,
  COUNT(*) as recycle_count,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 day') as recycles_today
FROM transactions
WHERE type = 'recycle_bulk'
GROUP BY user_id
HAVING COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 day') > 5
ORDER BY recycles_today DESC;

-- Query para RTP real
SELECT 
  DATE(purchased_at) as date,
  COUNT(*) as boosters_opened,
  SUM(payout_brl) as total_payout,
  SUM(price_brl) as total_revenue,
  (SUM(payout_brl) / NULLIF(SUM(price_brl), 0)) * 100 as rtp_percent
FROM booster_openings
WHERE opened_at IS NOT NULL
GROUP BY DATE(purchased_at)
ORDER BY date DESC;
```

---

## 💡 CONCLUSÃO

### Riscos Identificados:
1. ✅ **Pity não funciona** - Risco BAIXO (beneficia casa)
2. ⚠️ **Godmode pity** - Risco MÉDIO (implementar mitigações)
3. ⚠️ **Reciclagem** - Risco BAIXO-MÉDIO (limitar usos)
4. ✅ **Combinação** - Risco BAIXO (com mitigações)

### Recomendação Final:
**IMPLEMENTAR TODAS AS MITIGAÇÕES ANTES DE LANÇAR**

Sistema atual é MAIS seguro sem pity (RTP menor), mas:
- Frustra jogadores (bad UX)
- Promessa não cumprida (documentação vs realidade)
- Quando implementar pity, DEVE ter as proteções

**Prazo sugerido:** 2-3 dias de desenvolvimento + testes
**Custo de NÃO fazer:** Potencial aumento de RTP para 35-40% (quebra margem)
