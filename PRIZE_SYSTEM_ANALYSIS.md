# 🎰 ANÁLISE DO SISTEMA DE PRÊMIOS - KROOVA TCG

## 📊 SISTEMA ATUAL (PROBLEMÁTICO)

### **Como Funciona Hoje:**

**Arquivo:** `frontend/app/api/v1/boosters/open/route.ts`

```typescript
// Para cada carta dropada no booster:
const baseLiquidity = randomCard.base_liquidity_brl; // Ex: R$ 4.00 (godmode)
const skinMultiplier = calculateSkin(); // Ex: 3.0x (ghost)
const valueAdjustment = boosterType.value_adjustment; // Ex: 3.00 (Whale)

// CÁLCULO ATUAL:
const calculatedLiquidity = (baseLiquidity × skinMultiplier) / valueAdjustment;
// R$ 4.00 × 3.0 / 3.00 = R$ 4.00

// Aplica CAP por tier
const cappedLiquidity = Math.min(calculatedLiquidity, maxLiquidityByTier[tier]);

// PROBLEMA: Este valor vai para cards_instances.liquidity_brl
await supabaseAdmin.from('cards_instances').insert({
  base_id: randomCard.id,
  owner_id: user.id,
  liquidity_brl: cappedLiquidity // ❌ SERVE PARA TUDO!
});
```

### **❌ PROBLEMAS IDENTIFICADOS:**

1. **Conflito de Valor:**
   - `liquidity_brl` é usado TANTO para prêmio de booster QUANTO para valor de mercado
   - Mesma carta pode ter valores diferentes dependendo do booster aberto
   - **Exemplo:** "BurnSaint legendary" pode valer R$ 1.00 (Padrão) ou R$ 3.00 (Whale)?

2. **Mercado Quebrado:**
   - Marketplace não tem preço fixo por carta
   - Sistema competitivo precisa de liquidez única por carta (exceto trash R$ 0.01)
   - Impossibilidade de criar economia estável

3. **RTP Limitado:**
   - Jackpots limitados ao CAP por tier
   - Whale: máximo R$ 7.00 por carta = 70% RTP máximo
   - **Psicologia de slot machine não funciona** (precisa 500-1000% RTP em jackpots)

4. **Sem Rastreamento:**
   - Não há histórico de quanto jogador "ganhou" vs "gastou"
   - Impossível calcular RTP real por usuário
   - Sem gamification de "maiores winners"

---

## ✅ SISTEMA PROPOSTO (SOLUÇÃO)

### **Conceito Core:**
**SEPARAR COMPLETAMENTE gambling (prêmio) de trading (mercado)**

### **Arquitetura Nova:**

```
ABERTURA DE BOOSTER:
1. Jogador compra booster (R$ 1.00 - Padrão)
2. Sistema DROPPA 5 cartas (rarity pools)
3. Sistema CALCULA prêmio INDEPENDENTE (R$ 0.30 ou R$ 8.00)
4. Jogador recebe:
   - 5 cartas (valor FIXO de mercado)
   - Prêmio em BRL na carteira
```

### **Nova Tabela: booster_prizes**

```sql
CREATE TABLE booster_prizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opening_id UUID NOT NULL REFERENCES booster_openings(id),
  user_id UUID NOT NULL REFERENCES users(id),
  booster_type_id UUID NOT NULL REFERENCES booster_types(id),
  
  -- PRÊMIO
  prize_amount_brl NUMERIC(12,2) NOT NULL,
  rtp_percentage NUMERIC(5,2) NOT NULL,
  
  -- CLASSIFICAÇÃO
  prize_tier TEXT CHECK (prize_tier IN ('loss','near_even','small_win','jackpot')),
  
  -- METADATA
  cards_summary JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_booster_prizes_user ON booster_prizes(user_id);
CREATE INDEX idx_booster_prizes_rtp ON booster_prizes(rtp_percentage DESC);
```

### **Nova Lógica de Cálculo:**

```typescript
// PASSO 1: DROP DE CARTAS (valor FIXO de mercado)
const droppedCards = await dropCards(boosterType, rarityDistribution);
// Cartas têm base_liquidity_brl FIXO (marketplace)

// PASSO 2: CALCULAR PRÊMIO INDEPENDENTE
const prizeAmount = calculateBoosterPrize(boosterType, droppedCards);
// Usa RTP variável: 30-40% média, 500-1000% jackpots

// PASSO 3: REGISTRAR PRÊMIO
await supabaseAdmin.from('booster_prizes').insert({
  opening_id,
  user_id,
  booster_type_id,
  prize_amount_brl: prizeAmount,
  rtp_percentage: (prizeAmount / boosterType.price_brl) * 100,
  prize_tier: classifyPrize(rtp),
  cards_summary: { cards: droppedCards.map(c => c.id) }
});

// PASSO 4: ADICIONAR À CARTEIRA
await supabaseAdmin.from('wallets')
  .update({ balance_brl: wallets.balance_brl + prizeAmount })
  .eq('user_id', user_id);
```

### **Função de RTP Variável:**

```typescript
function calculateBoosterPrize(boosterType, droppedCards) {
  const boosterPrice = boosterType.price_brl;
  
  // DISTRIBUIÇÃO DESEJADA:
  // 60% openings: 20-50% RTP (loss)
  // 30% openings: 60-90% RTP (near even)
  // 9% openings: 100-150% RTP (small win)
  // 1% openings: 500-1000% RTP (JACKPOT!)
  
  const rand = Math.random() * 100;
  
  if (rand < 60) {
    // LOSS (60%)
    return boosterPrice * (0.20 + Math.random() * 0.30);
  } else if (rand < 90) {
    // NEAR EVEN (30%)
    return boosterPrice * (0.60 + Math.random() * 0.30);
  } else if (rand < 99) {
    // SMALL WIN (9%)
    return boosterPrice * (1.00 + Math.random() * 0.50);
  } else {
    // JACKPOT (1%) 🎰🎰🎰
    return boosterPrice * (5.00 + Math.random() * 5.00);
  }
}
```

---

## 🎯 EXEMPLO PRÁTICO

### **Cenário 1: Padrão com LOSS (60% probabilidade)**

```
Booster: Padrão (R$ 1.00)
Cartas dropadas:
  - 2× trash (base_liquidity_brl = R$ 0.02 cada)
  - 2× meme (base_liquidity_brl = R$ 0.15 cada)
  - 1× viral (base_liquidity_brl = R$ 0.50)

PRÊMIO CALCULADO: R$ 0.30 (30% RTP) ❌ PERDA

RESULTADO:
  - Carteira: +R$ 0.30
  - Inventário: +5 cartas (vendem na bolsa por R$ 0.02, R$ 0.15, R$ 0.50)
  - Psicologia: "Perdi R$ 0.70... mas quase!" 🎰
```

### **Cenário 2: Padrão com JACKPOT (1% probabilidade)**

```
Booster: Padrão (R$ 1.00)
Cartas dropadas:
  - 3× meme (base_liquidity_brl = R$ 0.15 cada)
  - 1× legendary (base_liquidity_brl = R$ 3.00)
  - 1× viral (base_liquidity_brl = R$ 0.50)

PRÊMIO CALCULADO: R$ 8.50 (850% RTP) 🎰🎰🎰 JACKPOT!!!

RESULTADO:
  - Carteira: +R$ 8.50 💰💰💰
  - Inventário: +5 cartas (incluindo legendary R$ 3.00)
  - Psicologia: "GANHEI R$ 7.50!!! VOU COMPRAR MAIS!!!" 🚀🚀🚀
```

### **Cenário 3: Whale com JACKPOT**

```
Booster: Whale (R$ 10.00)
Cartas dropadas:
  - 2× godmode (base_liquidity_brl = R$ 4.00 cada)
  - 2× legendary (base_liquidity_brl = R$ 3.00 cada)
  - 1× viral (base_liquidity_brl = R$ 0.50)

PRÊMIO CALCULADO: R$ 75.00 (750% RTP) 🎰🎰🎰🎰🎰

RESULTADO:
  - Carteira: +R$ 75.00 💎💎💎
  - Inventário: +5 cartas PREMIUM (2 godmodes!)
  - Psicologia: "JACKPOT SUPREMO!!! LUCREI R$ 65!!!" 🚀🚀🚀🚀🚀
```

---

## 📈 VANTAGENS DO NOVO SISTEMA

### **1. Mercado Estável**
- ✅ Cada carta tem `base_liquidity_brl` FIXO
- ✅ Marketplace usa valores consistentes
- ✅ Sistema competitivo funciona (liquidez única exceto trash)

### **2. Jackpots Emocionantes**
- ✅ Prêmios podem ser 500-1000% do booster price
- ✅ Psicologia de slot machine REAL
- ✅ Jogadores voltam para tentar jackpot novamente

### **3. House Edge Controlado**
- ✅ RTP médio: 35-40% (casa lucra 60-65%)
- ✅ Jogador perde na maioria das vezes MAS jackpots compensam emocionalmente
- ✅ Sustentável a longo prazo

### **4. Gamification**
- ✅ Histórico de prêmios (`/api/prizes/history`)
- ✅ Leaderboard de "maiores winners"
- ✅ Notificações de jackpots (marketing viral)
- ✅ Estatísticas de RTP por usuário

### **5. Transparência**
- ✅ Jogador vê claramente quanto ganhou/perdeu
- ✅ RTP% mostrado em cada abertura
- ✅ Compliance com regulações de gambling

---

## 🔧 IMPLEMENTAÇÃO

### **Ordem de Execução:**

1. ✅ Criar `booster_prizes` table
2. ✅ Ajustar `cards_base.base_liquidity_brl` para valores únicos
3. ✅ Implementar `calculateBoosterPrize()` function
4. ✅ Modificar `/api/boosters/open` route
5. ✅ Atualizar frontend UI (mostrar prêmio + RTP%)
6. ✅ Criar `/api/prizes/history` endpoint
7. ✅ Testar com amostras (validar RTP médio)
8. ✅ Deploy e monitoramento

### **Riscos e Mitigações:**

**Risco 1:** RTP médio acima de 50%
- **Mitigação:** Ajustar probabilidades de jackpot (reduzir de 1% para 0.5%)

**Risco 2:** Jogadores reclamam de perdas frequentes
- **Mitigação:** Marketing focado em jackpots, mostrar winners recentes

**Risco 3:** Economia de cartas desbalanceada
- **Mitigação:** Ajustar base_liquidity_brl gradualmente, monitorar mercado

---

## 📊 MÉTRICAS DE SUCESSO

### **KPIs a Monitorar:**

1. **RTP Médio Real:** Deve ficar em 35-40%
2. **Frequência de Jackpots:** ~1% das aberturas
3. **Retenção de Usuários:** Aumentar de X% para Y%
4. **Volume de Compras:** Aumentar de N boosters/dia para M boosters/dia
5. **Satisfação:** NPS score, feedback qualitativo

---

## 🎰 CONCLUSÃO

O novo sistema resolve o conflito fundamental entre **gambling** e **trading** ao separar completamente:

- **Prêmio de booster** → `booster_prizes.prize_amount_brl` (variável, alta volatilidade)
- **Valor de mercado** → `cards_base.base_liquidity_brl` (fixo, economia estável)

Isso permite:
- ✅ Jackpots emocionantes (500-1000% RTP)
- ✅ Economia de cartas sustentável
- ✅ House edge controlado (60-65%)
- ✅ Psicologia de slot machine funcionando
- ✅ Marketing viral ("Fulano ganhou R$ 500!")

**Resultado esperado:** Aumento significativo em retenção e volume de compras, mantendo lucratividade da casa.
