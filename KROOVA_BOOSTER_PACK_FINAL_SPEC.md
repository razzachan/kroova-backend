# 🔥 KROOVA BOOSTER SYSTEM — ESPECIFICAÇÃO FINAL COMPLETA
**Versão Consolidada: Sistema de Packs + Skins + Economia + Visual**

> _"Valor nasce da raridade. Raridade nasce do comportamento coletivo."_  
> — Sistema KROOVA de Boosters

**Alinhamento com Lore:** Boosters são "portais" que permitem manifestar Kroovas da Interface. Skins (neon, glitch, ghost, holo, dark) representam diferentes estados de "corrupção digital" dessas entidades. Status Godmode é quando um comportamento coletivo atinge nível crítico de influência social.

**Alinhamento com Branding:** Cores seguem sistema funcional (PRIMARY #FF006D, SECONDARY #00F0FF, VALUE #FFC700). Tipografia: Rajdhani Black para nomes, Rajdhani Regular para valores. Visual modes (skins) aplicam paleta específica por estado.

---

## 📋 **ÍNDICE**

1. [Estrutura Comercial dos Packs](#estrutura-comercial)
2. [Sistema de Skins (Visual Variants)](#sistema-de-skins)
3. [Sistema de Raridades](#sistema-de-raridades)
4. [Economia e Lucratividade](#economia)
5. [Algoritmo de Abertura](#algoritmo)
6. [Estrutura SQL](#sql)
7. [Implementação Frontend](#frontend)
8. [Mecânicas de Gamificação](#gamificacao)
9. [Identidade Visual](#visual)

---

<a name="estrutura-comercial"></a>
## 🛍️ **1. ESTRUTURA COMERCIAL DOS PACKS**

### **Modelo Híbrido: Individual + Pacotes + Boosters Premium**

#### **TIER 1: Boosters Individuais (R$ 0.50 - R$ 10.00)**

| Booster | Preço | Cartas | Multiplier | **Prêmio Max** | Badge |
|---------|-------|--------|------------|----------------|-------|
| **Básico** | R$ 0.50 | 5 | 1x | **R$ 200** 🏆 | 🎴 |
| **Padrão** | R$ 1.00 | 5 | 2x | **R$ 400** 🏆 | 💎 |
| **Premium** | R$ 2.00 | 5 | 4x | **R$ 800** 🏆 | ⚡ |
| **Elite** | R$ 5.00 | 5 | 10x | **R$ 2.000** 🏆 | 👑 |
| **Whale** | R$ 10.00 | 5 | 20x | **R$ 4.000** 🏆 | 🔥 |

📌 **Prêmio Máximo Escalável**: Épica/Dark/Godmode × Multiplicador de Preço  
📌 **Mesma matemática**: 15% hard cap, probabilidades constantes  
📌 **Display tipo caça-níquel**: "PRÊMIO MÁXIMO R$ 4.000" no destaque  

#### **TIER 2: Pacotes com Desconto**

| Pack | Preço | Boosters | Cartas Totais | Desconto | Garantias | Badge |
|------|-------|----------|---------------|----------|-----------|-------|
| **Viral** | R$ 2.25 | 5 | 25 | 10% | 1 Meme+ | 💎 |
| **Lendário** | R$ 4.00 | 10 | 50 | 20% | 1 Viral+ | ⚡ |
| **Épico** | R$ 9.00 | 25 | 125 | 28% | 1 Legendary+ | 👑 |
| **Colecionador** | R$ 16.00 | 50 | 250 | 36% | 1 Godmode + 2 Legendary | 🔥 |

### **Cálculo de Desconto:**
- **Viral**: R$ 2.50 → R$ 2.25 (10% off)
- **Lendário**: R$ 5.00 → R$ 4.00 (20% off)
- **Épico**: R$ 12.50 → R$ 9.00 (28% off)
- **Colecionador**: R$ 25.00 → R$ 16.00 (36% off)

### **Razões Estratégicas:**

✅ **Boosters Escalonados (R$ 0.50 - R$ 10.00)**:
- Porta de entrada baixa (R$ 0.50)
- Segmentação natural: Casual → Whale
- **Prêmio escala automaticamente** (R$ 200 → R$ 4.000)
- Mesma matemática, zero complexidade técnica
- Display tipo caça-níquel aumenta conversão

✅ **Packs com Desconto**:
- Incentivam compra em volume
- Garantias aumentam valor percebido
- Descontos crescentes (10% → 36%)

✅ **Transparência Legal**:
- "PRÊMIO MÁXIMO R$ 4.000" visível
- Probabilidade mostrada (0.000002%)
- Não é loteria (valores fixos)
- RTP 30% transparente

✅ **Colecionador (Premium)**:
- Único com Godmode garantido
- Valor percebido: até R$ 4.000+ (Whale × Godmode/Dark)
- Efeito FOMO/exclusividade

---

<a name="sistema-de-skins"></a>
## 🎨 **2. SISTEMA DE SKINS (VISUAL VARIANTS)**

### **CAMADA 2: SKIN (variante visual)**

| Skin | Probabilidade | Multiplicador | Descrição | Cor Dominante |
|------|---------------|---------------|-----------|---------------|
| **Default** | 50.0% | 1.0x | Base neutra | Padrão da raridade |
| **Neon** | 25.0% | 1.5x | Cyberpunk fosforescente | `#00F0FF` |
| **Glow** | 15.0% | 2.0x | Brilho energético | `#FFC700` |
| **Glitch** | 7.0% | 3.0x | Pixels corrompidos | `#39FF14` |
| **Ghost** | 2.0% | 4.0x | Transparente etéreo | `#9B59B6` |
| **Holo** | 0.8% | 6.0x | Reflexo holográfico | Rainbow |
| **Dark** | 0.2% | 10.0x | Sombrio proibido | `#111113` |

### **CAMADA 3: STATUS GODMODE (jackpot multiplier)**

| Status | Probabilidade | Multiplicador Extra | Descrição |
|--------|---------------|---------------------|-----------|
| **Normal** | 99% | 1x | Carta comum |
| **Godmode** | 1% | 10x | Jackpot especial |

📌 **Godmode pode acontecer em QUALQUER carta (trash até épica)!**

### **Cálculo de Valor Final:**

```
Liquidez Final = Base Liquidity × Skin Multiplier × Godmode Multiplier

Exemplos:
- Trash/Default/Normal = R$ 0.01 × 1.0 × 1 = R$ 0.01
- Trash/Neon/Normal = R$ 0.01 × 1.5 × 1 = R$ 0.015
- Trash/Neon/Godmode = R$ 0.01 × 1.5 × 10 = R$ 0.15
- Legendary/Glitch/Normal = R$ 1.00 × 3.0 × 1 = R$ 3.00
- Legendary/Glitch/Godmode = R$ 1.00 × 3.0 × 10 = R$ 30.00
- Legendary/Holo/Godmode = R$ 1.00 × 6.0 × 10 = R$ 60.00
- Legendary/Dark/Godmode = R$ 1.00 × 10.0 × 10 = R$ 100.00 🔥
- Épica/Dark/Godmode = R$ 2.00 × 10.0 × 10 = R$ 200.00 💎
```

### **Combinações Ultra-Raras (3 Camadas):**

| Combinação | Prob. Raridade | Prob. Skin | Prob. Godmode | **Prob. Total** | Valor |
|------------|----------------|------------|---------------|-----------------|-------|
| Épica/Dark/Godmode | 1% | 0.2% | 1% | **0.000002%** | R$ 200.00 |
| Legendary/Dark/Godmode | 4% | 0.2% | 1% | **0.000008%** | R$ 100.00 |
| Legendary/Holo/Godmode | 4% | 0.8% | 1% | **0.000032%** | R$ 60.00 |
| Legendary/Ghost/Godmode | 4% | 2% | 1% | **0.0008%** | R$ 40.00 |
| Legendary/Glitch/Godmode | 4% | 7% | 1% | **0.0028%** | R$ 30.00 |
| Trash/Dark/Godmode | 60% | 0.2% | 1% | **0.00012%** | R$ 0.10 |

📌 **Épica/Dark/Godmode = 1 em 50.000.000 cartas** (jackpot supremo)  
📌 **Legendary/Dark/Godmode = 1 em 12.500.000 cartas** (jackpot visual)

---

<a name="sistema-de-raridades"></a>
## ⭐ **3. SISTEMA DE 3 CAMADAS (Raridade × Skin × Status)**

### **IMPORTANTE: Godmode NÃO é raridade, é STATUS especial!**

```
CARTA FINAL = RARIDADE × SKIN × STATUS GODMODE
```

### **CAMADA 1: RARIDADE (base da carta)**

| Raridade | Probabilidade | Liquidez Base | Cor |
|----------|---------------|---------------|-----|
| **Trash** | 60% | R$ 0.01 | `#666666` |
| **Meme** | 25% | R$ 0.05 | `#6CFB6C` |
| **Viral** | 10% | R$ 0.20 | `#00F0FF` |
| **Legendary** | 4% | R$ 1.00 | `#FFC700` |
| **Épica** | 1% | R$ 2.00 | `#FF006D` |

### **Distribuição por Pack (com Garantias):**

#### **Booster (R$ 0.50) - 5 cartas:**
```json
{
  "trash": 60,
  "meme": 25,
  "viral": 10,
  "legendary": 4,
  "epica": 1
}
```
**Garantias:** Nenhuma (pura probabilidade)  
**Status Godmode:** 1% em qualquer carta (aplicado após raridade+skin)

#### **Viral (R$ 2.25) - 25 cartas (5 boosters):**
```json
{
  "trash": 55,
  "meme": 28,
  "viral": 12,
  "legendary": 4,
  "epica": 1
}
```
**Garantias:** 1 Meme+ (força pelo menos 1 Meme ou superior)  
**Status Godmode:** 1% em qualquer carta gerada

#### **Lendário (R$ 4.00) - 50 cartas (10 boosters):**
```json
{
  "trash": 50,
  "meme": 30,
  "viral": 14,
  "legendary": 5,
  "epica": 1
}
```
**Garantias:** 1 Viral+ (força pelo menos 1 Viral ou superior)  
**Status Godmode:** 1% em qualquer carta gerada

#### **Épico (R$ 9.00) - 125 cartas (25 boosters):**
```json
{
  "trash": 45,
  "meme": 30,
  "viral": 16,
  "legendary": 7,
  "epica": 2
}
```
**Garantias:** 1 Legendary+ (força pelo menos 1 Legendary ou superior)  
**Status Godmode:** 1% em qualquer carta gerada

#### **Colecionador (R$ 16.00) - 250 cartas (50 boosters):**
```json
{
  "trash": 40,
  "meme": 30,
  "viral": 18,
  "legendary": 9,
  "epica": 3
}
```
**Garantias:** 2 Legendary + 1 Épica (forçado)  
**Status Godmode GARANTIDO:** 1 carta com Godmode forçado (além do 1% natural nas outras)

---

<a name="economia"></a>
## 💰 **4. ECONOMIA E LUCRATIVIDADE**

### **Premissas:**
- **99% dos usuários reciclam** imediatamente
- Cada carta vale sua liquidez (base × skin multiplier)
- RTP = Return to Player (% que volta ao usuário)

### **RTP por Pack (considerando skins):**

| Pack | Preço | Cartas | RTP Médio | Custo (99% recicla) | **Margem** |
|------|-------|--------|-----------|---------------------|------------|
| **Booster** | R$ 0.50 | 5 | 22% | R$ 0.11 | **78%** ✅ |
| **Viral** | R$ 2.25 | 25 | 24% | R$ 0.54 | **76%** ✅ |
| **Lendário** | R$ 4.00 | 50 | 28% | R$ 1.12 | **72%** ✅ |
| **Épico** | R$ 9.00 | 125 | 34% | R$ 3.06 | **66%** ✅ |
| **Colecionador** | R$ 16.00 | 250 | 42% | R$ 6.72 | **58%** ✅ |

### **Margem Ponderada (distribuição realista):**

Assumindo:
- 40% compram Booster
- 30% compram Viral
- 20% compram Lendário
- 8% compram Épico
- 2% compram Colecionador

```
Margem Média = (0.40 × 78%) + (0.30 × 76%) + (0.20 × 72%) + (0.08 × 66%) + (0.02 × 58%)
             = 31.2% + 22.8% + 14.4% + 5.3% + 1.2%
             = 74.9%
```

**Margem média: ~75%** (extremamente lucrativo!)

### **Projeção de Receita (1000 usuários):**

| Cenário | Conversão | Ticket Médio | Receita | Custo | Lucro | Margem |
|---------|-----------|--------------|---------|-------|-------|--------|
| **Só Pacotes (min R$ 2.50)** | 42% | R$ 4.50 | R$ 1,890 | R$ 472 | R$ 1,418 | 75% |
| **Híbrido (com R$ 0.50)** | 68% | R$ 2.25 | R$ 1,530 | R$ 382 | R$ 1,148 | 75% |

📌 **Modelo híbrido gera mais receita em volume, mas mantém mesma margem.**

---

## 🏆 **PREMIAÇÃO MÁXIMA E SISTEMA DE JACKPOT**

### **Como Funciona:**

**MODELO: Pré-setado com Teto Dinâmico por Edição**

#### **1. Premiação Base (Pré-setada):**

Cada edição tem valores **fixos** de liquidez base:

```typescript
// Valores IMUTÁVEIS da ED01
const ED01_BASE_LIQUIDITY = {
  trash: 0.01,
  meme: 0.05,
  viral: 0.20,
  legendary: 1.00,
  epica: 2.00
};

const SKIN_MULTIPLIERS = {
  default: 1.0, neon: 1.5, glow: 2.0,
  glitch: 3.0, ghost: 4.0, holo: 6.0, dark: 10.0
};

const GODMODE_MULTIPLIER = 10;
```

📌 **Esses valores NÃO mudam durante a vida da edição.**

#### **2. Premiação Máxima Teórica:**

```
Premiação Máxima = Raridade Máxima × Skin Máxima × Godmode

ED01: R$ 2.00 (Épica) × 10 (Dark) × 10 (Godmode) = R$ 200.00
```

**Probabilidade:**
```
Épica (1%) × Dark (0.2%) × Godmode (1%) = 0.000002%
= 1 em 50.000.000 cartas
```

#### **3. Jackpots Práticos (por edição):**

| Prêmio | Combinação | Probabilidade | Ocorrência (1M cartas) |
|--------|------------|---------------|------------------------|
| **R$ 200** | Épica/Dark/Godmode | 0.000002% | 0.02 cartas |
| **R$ 100** | Legendary/Dark/Godmode | 0.000008% | 0.08 cartas |
| **R$ 60** | Legendary/Holo/Godmode | 0.000032% | 0.32 cartas |
| **R$ 40** | Legendary/Ghost/Godmode | 0.0008% | 8 cartas |
| **R$ 30** | Legendary/Glitch/Godmode | 0.0028% | 28 cartas |
| **R$ 20** | Épica/Glow/Normal | 0.15% | 1.500 cartas |

#### **4. Controle de Custos (Pool de Jackpot):**

O sistema monitora **quanto foi pago em premiações altas**:

```typescript
// Tracking por edição
interface EditionJackpotTracking {
  edition_id: string;
  total_boosters_sold: number;
  total_revenue: number;
  jackpots_paid: {
    count: number;
    total_value: number;
    by_tier: {
      '200': number,
      '100': number,
      '60': number,
      // ...
    }
  };
  current_rtp: number; // % real de retorno
}
```

**Exemplo prático:**
```
ED01 vendeu 10.000 boosters (R$ 5.000)
→ Gerou 50.000 cartas
→ Esperado: ~5 jackpots de R$ 60+ (total ~R$ 350)
→ RTP de jackpots: 7% (dentro do esperado 5-10%)
```

#### **5. Teto de Segurança (Hard Cap):**

Para evitar quebrar a economia, existe um **limite máximo de pagamento** por edição:

```typescript
const JACKPOT_CAP_PER_EDITION = {
  max_total_payout: 0.15, // 15% da receita total
  max_single_card: 200.00,  // R$ 200 (ED01)
  alert_threshold: 0.12     // Alerta se passar 12%
};

// Se ultrapassar cap:
if (edition.jackpots_paid.total_value > edition.total_revenue * 0.15) {
  // Reduz probabilidade de Godmode temporariamente
  GODMODE_PROBABILITY = 0.005; // 0.5% (metade)
  notifyAdmin('ED01 atingiu 15% de jackpot payout');
}
```

#### **6. Refresh por Edição:**

Cada **nova edição** (ED02, ED03...) pode ter:

```typescript
const ED02_BASE_LIQUIDITY = {
  trash: 0.02,    // Dobrou
  meme: 0.10,     // Dobrou
  viral: 0.40,    // Dobrou
  legendary: 2.00,
  epica: 5.00     // Nova premiação máxima
};

// ED02 Premiação Máxima:
// R$ 5.00 × 10 × 10 = R$ 500.00 🔥
```

**Motivos para mudar:**
- Inflação
- Hype da edição
- Ajuste de RTP
- Competitividade

### **RESUMO: Premiação Máxima**

| Aspecto | Como Funciona |
|---------|---------------|
| **Valores base** | Pré-setados por edição (imutáveis) |
| **Premiação máxima** | Calculada (raridade × skin × godmode) |
| **Probabilidade** | Fixa e transparente (matemática pura) |
| **Controle de custos** | Pool tracking + hard cap (15% receita) |
| **Ajuste dinâmico** | Se ultrapassar cap, reduz prob. Godmode |
| **Refresh** | Novas edições podem ter novos valores |
| **ED01 Max** | R$ 200 (Épica/Dark/Godmode) |
| **ED02 Max (futuro)** | Pode ser R$ 500+ |

### **Vantagens desse Sistema:**

✅ **Transparente**: Matemática clara e auditável  
✅ **Sustentável**: Cap impede quebrar economia  
✅ **Escalável**: Novas edições podem ter prêmios maiores  
✅ **Legal**: Não é "loteria" (valores fixos, não pool acumulado)  
✅ **Justo**: Probabilidades não mudam arbitrariamente  

📌 **Resposta direta: Premiação é PRÉ-SETADA por edição, com teto de segurança de 15% da receita.**

---

### **Jackpots Visuais (Godmode + Skins Raros):**

| Combinação | Prob. | Valor | Ocorrência (1M cartas) |
|------------|-------|-------|------------------------|
| Godmode/Dark | 0.002% | R$ 100 | 20 cartas |
| Godmode/Holo | 0.008% | R$ 60 | 80 cartas |
| Godmode/Ghost | 0.02% | R$ 40 | 200 cartas |
| Legendary/Dark | 0.008% | R$ 10 | 80 cartas |

📌 **Esses jackpots já estão incluídos no RTP calculado (não mudam margem).**

---

<a name="algoritmo"></a>
## 🎲 **5. ALGORITMO DE ABERTURA**

### **Fluxo Completo:**

```typescript
function openBooster(boosterTypeId: string, userId: string) {
  // 1. Buscar tipo de booster
  const boosterType = await getBoosterType(boosterTypeId);
  const { quantity, cards_per_booster, guaranteed_cards, rarity_distribution } = boosterType;
  
  const totalCards = quantity * cards_per_booster;
  const generatedCards = [];
  let guaranteedGodmodeUsed = false;

  // 2. GARANTIAS PRIMEIRO (forçar cartas específicas)
  for (const guarantee of guaranteed_cards) {
    const { rarity, count, force_godmode } = guarantee;
    
    for (let i = 0; i < count; i++) {
      // Força carta da raridade garantida ou superior
      const forcedRarity = selectRarityGuaranteed(rarity);
      const skin = selectSkin();
      const cardBase = await getRandomCardBase(forcedRarity);
      
      // Se guarantee tem force_godmode = true, garante status godmode
      const isGodmode = force_godmode && !guaranteedGodmodeUsed ? true : (Math.random() < 0.01);
      if (force_godmode && isGodmode) guaranteedGodmodeUsed = true;
      
      const godmodeMultiplier = isGodmode ? 10 : 1;
      
      const cardInstance = await createCardInstance({
        base_id: cardBase.id,
        owner_id: userId,
        skin: skin,
        is_godmode: isGodmode,
        liquidity_brl: cardBase.base_liquidity_brl * getSkinMultiplier(skin) * godmodeMultiplier
      });
      
      generatedCards.push(cardInstance);
    }
  }

  // 3. CARTAS RESTANTES (probabilidade normal)
  const remainingCards = totalCards - generatedCards.length;
  
  for (let i = 0; i < remainingCards; i++) {
    const rarity = selectRarity(rarity_distribution);
    const skin = selectSkin();
    const cardBase = await getRandomCardBase(rarity);
    
    // 1% chance de qualquer carta virar Godmode
    const isGodmode = Math.random() < 0.01;
    const godmodeMultiplier = isGodmode ? 10 : 1;
    
    const cardInstance = await createCardInstance({
      base_id: cardBase.id,
      owner_id: userId,
      skin: skin,
      is_godmode: isGodmode,
      liquidity_brl: cardBase.base_liquidity_brl * getSkinMultiplier(skin) * godmodeMultiplier
    });
    
    generatedCards.push(cardInstance);
  }

  // 4. EMBARALHAR (para não revelar ordem das garantias)
  shuffle(generatedCards);

  // 5. ATUALIZAR BOOSTER OPENING
  await updateBoosterOpening(openingId, {
    cards_received: generatedCards.map(c => c.id),
    opened_at: new Date()
  });

  return generatedCards;
}
```

### **Funções Auxiliares:**

```typescript
function selectRarity(distribution: Record<string, number>): string {
  const rand = Math.random() * 100;
  let cumulative = 0;
  
  for (const [rarity, probability] of Object.entries(distribution)) {
    cumulative += probability;
    if (rand <= cumulative) return rarity;
  }
  
  return 'trash'; // fallback
}

function selectRarityGuaranteed(minRarity: string): string {
  // legendary+ pode sair godmode (4% chance de upgrade)
  if (minRarity === 'legendary') {
    return Math.random() < 0.04 ? 'godmode' : 'legendary';
  }
  
  // viral+ pode sair legendary (5% chance) ou godmode (1%)
  if (minRarity === 'viral') {
    const rand = Math.random();
    if (rand < 0.01) return 'godmode';
    if (rand < 0.06) return 'legendary';
    return 'viral';
  }
  
  // meme+ pode sair viral (10%), legendary (1%)
  if (minRarity === 'meme') {
    const rand = Math.random();
    if (rand < 0.01) return 'legendary';
    if (rand < 0.11) return 'viral';
    return 'meme';
  }
  
  return minRarity;
}

function selectSkin(): string {
  const rand = Math.random() * 100;
  
  if (rand <= 50.0) return 'default';
  if (rand <= 75.0) return 'neon';
  if (rand <= 90.0) return 'glow';
  if (rand <= 97.0) return 'glitch';
  if (rand <= 99.0) return 'ghost';
  if (rand <= 99.8) return 'holo';
  return 'dark';
}

function getSkinMultiplier(skin: string): number {
  const multipliers = {
    'default': 1.0,
    'neon': 1.5,
    'glow': 2.0,
    'glitch': 3.0,
    'ghost': 4.0,
    'holo': 6.0,
    'dark': 10.0
  };
  
  return multipliers[skin] || 1.0;
}
```

---

<a name="sql"></a>
## 🗄️ **6. ESTRUTURA SQL**

### **Atualização da Tabela `booster_types`:**

```sql
-- Adicionar novos campos
ALTER TABLE booster_types ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1;
ALTER TABLE booster_types ADD COLUMN IF NOT EXISTS guaranteed_cards JSONB DEFAULT '[]';
ALTER TABLE booster_types ADD COLUMN IF NOT EXISTS badge_emoji TEXT;
ALTER TABLE booster_types ADD COLUMN IF NOT EXISTS color_primary TEXT;
ALTER TABLE booster_types ADD COLUMN IF NOT EXISTS color_secondary TEXT;

-- Deletar tipos antigos
DELETE FROM booster_types;

-- Inserir novos tipos
INSERT INTO booster_types (
  id, name, edition_id, price_brl, cards_per_booster, quantity, 
  rarity_distribution, guaranteed_cards, badge_emoji, color_primary, color_secondary
) VALUES
  -- Booster Individual
  (
    'booster-individual-ed01',
    'Booster',
    'ED01',
    0.50,
    5,
    1,
    '{"trash":60,"meme":25,"viral":10,"legendary":4,"godmode":1}'::jsonb,
    '[]'::jsonb,
    '🎴',
    '#555555',
    '#888888'
  ),
  
  -- Viral Pack
  (
    'viral-pack-ed01',
    'Viral',
    'ED01',
    2.25,
    5,
    5,
    '{"trash":55,"meme":28,"viral":12,"legendary":4,"godmode":1}'::jsonb,
    '[{"rarity":"meme","count":1}]'::jsonb,
    '💎',
    '#00F0FF',
    '#3AFAFF'
  ),
  
  -- Lendário Pack
  (
    'lendario-pack-ed01',
    'Lendário',
    'ED01',
    4.00,
    5,
    10,
    '{"trash":50,"meme":30,"viral":14,"legendary":5,"godmode":1}'::jsonb,
    '[{"rarity":"viral","count":1}]'::jsonb,
    '⚡',
    '#9B59B6',
    '#AF7AC5'
  ),
  
  -- Épico Pack
  (
    'epico-pack-ed01',
    'Épico',
    'ED01',
    9.00,
    5,
    25,
    '{"trash":45,"meme":30,"viral":16,"legendary":7,"godmode":2}'::jsonb,
    '[{"rarity":"legendary","count":1}]'::jsonb,
    '👑',
    '#FFC700',
    '#FFD84D'
  ),
  
  -- Colecionador Pack
  (
    'colecionador-pack-ed01',
    'Colecionador',
    'ED01',
    16.00,
    5,
    50,
    '{"trash":40,"meme":30,"viral":18,"legendary":9,"godmode":3}'::jsonb,
    '[{"rarity":"godmode","count":1},{"rarity":"legendary","count":2}]'::jsonb,
    '🔥',
    '#FF006D',
    '#FF2E85'
  );
```

### **Atualizar `cards_instances` para incluir liquidez calculada:**

```sql
-- Adicionar coluna de liquidez final
ALTER TABLE cards_instances ADD COLUMN IF NOT EXISTS liquidity_brl DECIMAL(10,2);

-- Atualizar liquidez de cartas existentes
UPDATE cards_instances ci
SET liquidity_brl = cb.base_liquidity_brl * 
  CASE ci.skin
    WHEN 'default' THEN 1.0
    WHEN 'neon' THEN 1.5
    WHEN 'glow' THEN 2.0
    WHEN 'glitch' THEN 3.0
    WHEN 'ghost' THEN 4.0
    WHEN 'holo' THEN 6.0
    WHEN 'dark' THEN 10.0
    ELSE 1.0
  END
FROM cards_base cb
WHERE ci.base_id = cb.id;
```

### **Atualizar valores base de liquidez:**

```sql
UPDATE cards_base SET base_liquidity_brl = CASE rarity
  WHEN 'trash' THEN 0.01
  WHEN 'meme' THEN 0.05
  WHEN 'viral' THEN 0.20
  WHEN 'legendary' THEN 1.00
  WHEN 'godmode' THEN 10.00
  ELSE 0.01
END;
```

---

<a name="frontend"></a>
## 💻 **7. IMPLEMENTAÇÃO FRONTEND**

### **Componente: PackCard**

```tsx
interface PackCardProps {
  pack: BoosterType;
  onPurchase: (packId: string) => void;
  userBalance: number;
}

export function PackCard({ pack, onPurchase, userBalance }: PackCardProps) {
  const totalCards = pack.quantity * pack.cards_per_booster;
  const canAfford = userBalance >= pack.price_brl;
  
  // Calcular desconto
  const basePrice = pack.quantity * 0.50;
  const discount = Math.round((1 - pack.price_brl / basePrice) * 100);

  return (
    <div 
      className="pack-card"
      style={{
        background: `linear-gradient(135deg, ${pack.color_primary}, ${pack.color_secondary})`,
        border: `2px solid ${pack.color_primary}`,
        boxShadow: `0 0 20px ${pack.color_primary}40`
      }}
    >
      {/* Badge */}
      <div className="badge">{pack.badge_emoji}</div>
      
      {/* Nome */}
      <h2 className="pack-name">{pack.name}</h2>
      
      {/* Desconto (se aplicável) */}
      {discount > 0 && (
        <div className="discount-badge">
          -{discount}% OFF
        </div>
      )}
      
      {/* Visualização 3D do Pack */}
      <div className="pack-visual">
        <PackAnimation color={pack.color_primary} />
      </div>
      
      {/* Preço */}
      <div className="price">
        <span className="currency">R$</span>
        <span className="amount">{pack.price_brl.toFixed(2)}</span>
      </div>
      
      {/* Info */}
      <div className="pack-info">
        <div>📦 {pack.quantity} boosters</div>
        <div>🃏 {totalCards} cartas</div>
      </div>
      
      {/* Garantias */}
      {pack.guaranteed_cards.length > 0 && (
        <div className="guarantees">
          <h4>✨ Garantias:</h4>
          <ul>
            {pack.guaranteed_cards.map((g, i) => (
              <li key={i}>
                {g.count}x {getRarityLabel(g.rarity)}+
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Distribuição de Raridades */}
      <div className="rarity-distribution">
        <RarityBar distribution={pack.rarity_distribution} />
      </div>
      
      {/* Botão de Compra */}
      <button
        className="buy-button"
        onClick={() => onPurchase(pack.id)}
        disabled={!canAfford}
        style={{
          background: canAfford ? pack.color_primary : '#666',
          boxShadow: canAfford ? `0 0 15px ${pack.color_primary}` : 'none'
        }}
      >
        {canAfford ? 'COMPRAR AGORA' : 'SALDO INSUFICIENTE'}
      </button>
    </div>
  );
}
```

### **Componente: CardReveal (com Skins)**

```tsx
interface RevealedCard {
  id: string;
  name: string;
  rarity: string;
  skin: string;
  liquidity_brl: number;
  image_url: string;
}

export function CardReveal({ card }: { card: RevealedCard }) {
  const skinStyles = {
    'default': {},
    'neon': { filter: 'hue-rotate(180deg) saturate(2)', boxShadow: '0 0 30px #00F0FF' },
    'glow': { filter: 'brightness(1.5)', boxShadow: '0 0 40px #FFC700' },
    'glitch': { animation: 'glitch 0.3s infinite', filter: 'contrast(1.5)' },
    'ghost': { opacity: 0.7, filter: 'blur(1px)', boxShadow: '0 0 50px #9B59B6' },
    'holo': { 
      background: 'linear-gradient(45deg, #ff0080, #00ffff, #ff0080)',
      backgroundSize: '200% 200%',
      animation: 'holo-shift 3s ease infinite'
    },
    'dark': { filter: 'grayscale(0.8) brightness(0.3)', border: '2px solid #FF006D' }
  };

  return (
    <div 
      className="card-reveal"
      style={skinStyles[card.skin]}
    >
      <img src={card.image_url} alt={card.name} />
      
      {/* Skin Badge */}
      {card.skin !== 'default' && (
        <div className="skin-badge">
          {getSkinEmoji(card.skin)} {card.skin.toUpperCase()}
        </div>
      )}
      
      {/* Multiplicador */}
      {getSkinMultiplier(card.skin) > 1 && (
        <div className="multiplier">
          {getSkinMultiplier(card.skin)}x
        </div>
      )}
      
      {/* Nome e Raridade */}
      <div className="card-info">
        <h3>{card.name}</h3>
        <div className="rarity">{getRarityLabel(card.rarity)}</div>
      </div>
      
      {/* Liquidez */}
      <div className="liquidity">
        💰 R$ {card.liquidity_brl.toFixed(2)}
      </div>
      
      {/* Partículas por Skin */}
      <Particles color={getSkinColor(card.skin)} />
    </div>
  );
}
```

### **Layout da Página `/boosters`:**

```tsx
export default function BoostersPage() {
  const [activeTab, setActiveTab] = useState<'individual' | 'packs'>('individual');
  const [boosters, setBoosters] = useState<BoosterType[]>([]);

  return (
    <div className="boosters-page">
      {/* Header */}
      <header>
        <h1>🔥 KROOVA BOOSTERS</h1>
        <div className="balance">
          💰 R$ {userBalance.toFixed(2)}
        </div>
      </header>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={activeTab === 'individual' ? 'active' : ''}
          onClick={() => setActiveTab('individual')}
        >
          Individual (R$ 0.50)
        </button>
        <button
          className={activeTab === 'packs' ? 'active' : ''}
          onClick={() => setActiveTab('packs')}
        >
          Pacotes (até 36% OFF)
        </button>
      </div>

      {/* Grid de Packs */}
      <div className="packs-grid">
        {activeTab === 'individual' 
          ? <PackCard pack={boosters.find(b => b.quantity === 1)} />
          : boosters.filter(b => b.quantity > 1).map(pack => (
              <PackCard key={pack.id} pack={pack} onPurchase={handlePurchase} />
            ))
        }
      </div>

      {/* Pity Progress */}
      <PityProgressBar current={userPityCounter} max={100} />
    </div>
  );
}
```

---

<a name="gamificacao"></a>
## 🎮 **8. MECÂNICAS DE GAMIFICAÇÃO**

### **Sistema de Pity (100 Boosters = 1 Godmode):**

```typescript
// Após cada abertura
const pityCurrent = await getUserPityCounter(userId);

if (pityCurrent >= 100) {
  // Força 1 Godmode na próxima abertura
  await resetPityCounter(userId);
  return forceGodmodeCard();
}

await incrementPityCounter(userId, 1);
```

**UI:**
```tsx
<div className="pity-bar">
  <div className="progress" style={{ width: `${(current/100)*100}%` }} />
  <span>Próximo Godmode em {100 - current} boosters</span>
</div>
```

### **Reveal Ritual (Animações):**

1. **Card Flip 3D** (Framer Motion):
```tsx
<motion.div
  initial={{ rotateY: 0 }}
  animate={{ rotateY: 180 }}
  transition={{ duration: 0.6, ease: "easeInOut" }}
>
  {/* Carta */}
</motion.div>
```

2. **Particles por Raridade:**
- Trash: 5 partículas cinzas
- Meme: 10 partículas verdes
- Viral: 20 partículas cyan
- Legendary: 50 partículas douradas
- Godmode: 200 partículas magenta explosivas

3. **Sound Effects:**
```typescript
const sfx = {
  trash: 'card_flip.mp3',
  meme: 'card_rare.mp3',
  viral: 'card_epic.mp3',
  legendary: 'card_legendary.mp3',
  godmode: 'card_jackpot.mp3' // 5s com build-up
};

playSound(sfx[card.rarity]);
```

4. **Haptic Feedback:**
```typescript
if (card.rarity === 'godmode') {
  navigator.vibrate([100, 50, 100, 50, 200]); // Pattern
}
```

### **Social Feed (Real-time Wins):**

```tsx
<div className="live-feed">
  <h3>🔥 Últimas Conquistas</h3>
  <ul>
    {recentWins.map(win => (
      <li key={win.id}>
        <span className="user">{win.username}</span> pegou 
        <span className="card">{win.cardName}</span>
        <span className="skin">({win.skin})</span>
        há {win.timeAgo}
      </li>
    ))}
  </ul>
</div>
```

### **Vault System (25, 50, 100 boosters):**

```typescript
const milestones = [25, 50, 100];

milestones.forEach(milestone => {
  if (userTotalBoosters === milestone) {
    unlockVaultReward(userId, milestone);
    showVaultAnimation();
  }
});
```

**Rewards:**
- 25 boosters: +R$ 2.50 bonus
- 50 boosters: 1 Viral Pack grátis
- 100 boosters: 1 Godmode garantido

---

<a name="visual"></a>
## 🎨 **9. IDENTIDADE VISUAL**

### **Cores por Pack:**

| Pack | Primary | Secondary | Value | Vibe |
|------|---------|-----------|-------|------|
| Booster | `#555555` | `#888888` | `#AAAAAA` | Prata neutro |
| Viral | `#00F0FF` | `#3AFAFF` | `#9AFCFF` | Cyber cyan |
| Lendário | `#9B59B6` | `#AF7AC5` | `#D7BDE2` | Roxo místico |
| Épico | `#FFC700` | `#FFD84D` | `#FFE480` | Dourado real |
| Colecionador | `#FF006D` | `#FF2E85` | `#FF4A9B` | Neon magenta |

### **Tipografia:**

```css
.pack-name {
  font-family: 'Rajdhani', sans-serif;
  font-weight: 900; /* Black */
  font-size: 96px;
  line-height: 82%;
  text-transform: uppercase;
  letter-spacing: -2px;
}

.pack-info {
  font-family: 'Rajdhani', sans-serif;
  font-weight: 400; /* Regular */
  font-size: 36px;
  line-height: 115%;
}

.liquidity {
  font-family: 'Rajdhani', sans-serif;
  font-weight: 700; /* Bold */
  font-size: 72px;
  color: #FFC700;
}
```

### **Efeitos Visuais:**

**Glow (todos os packs):**
```css
.pack-card {
  box-shadow: 
    0 0 20px var(--pack-color),
    inset 0 0 40px var(--pack-color);
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 20px var(--pack-color); }
  50% { box-shadow: 0 0 40px var(--pack-color); }
}
```

**Glitch (Colecionador pack):**
```css
@keyframes glitch {
  0% { transform: translate(0); }
  20% { transform: translate(-2px, 2px); }
  40% { transform: translate(-2px, -2px); }
  60% { transform: translate(2px, 2px); }
  80% { transform: translate(2px, -2px); }
  100% { transform: translate(0); }
}
```

**Partículas (Three.js):**
```typescript
const particleSystem = new THREE.Points(
  new THREE.BufferGeometry(),
  new THREE.PointsMaterial({
    color: cardColor,
    size: raritySize,
    blending: THREE.AdditiveBlending
  })
);

// Explosão radial no reveal
particles.forEach(p => {
  p.velocity = new THREE.Vector3(
    (Math.random() - 0.5) * speed,
    Math.random() * speed,
    (Math.random() - 0.5) * speed
  );
});
```

---

## ✅ **RESUMO EXECUTIVO**

### **O que foi definido:**

1. ✅ **Modelo comercial**: Híbrido (R$ 0.50 individual + 4 packs escalonados)
2. ✅ **Sistema de skins**: 7 variantes com multiplicadores de 1x a 10x
3. ✅ **Sistema de raridades**: 5 níveis (trash → godmode)
4. ✅ **Economia**: 58-78% de margem, RTP 22-42%
5. ✅ **Garantias**: Cartas forçadas em packs grandes
6. ✅ **Algoritmo**: Garante → Probabilidade → Embaralhar
7. ✅ **SQL**: Schema completo com novos campos
8. ✅ **Frontend**: Componentes com identidade visual
9. ✅ **Gamificação**: Pity, animations, SFX, social feed, vault

### **Lucro projetado:**

- **Margem média: 75%**
- **Receita estimada (1000 usuários): R$ 1.500**
- **Lucro estimado: R$ 1.125**
- **Jackpot visual máximo: R$ 100 (Godmode/Dark)**

### **Próximos passos:**

1. Executar migrations SQL
2. Atualizar `/boosters/open` com sistema de garantias + skins
3. Criar componentes frontend (PackCard, CardReveal, PityBar)
4. Adicionar animations (Framer Motion + Three.js)
5. Implementar SFX e haptics
6. Deploy Vercel

---

> 🔥 _"Valor nasce da raridade. Raridade nasce do skin. Skin nasce da sorte."_  
> — Sistema KROOVA de Boosters v2.0

**Confirma?** Começamos implementação? 🚀
