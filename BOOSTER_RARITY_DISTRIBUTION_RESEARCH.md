# 🎴 Sistema de Distribuição de Raridades - Pesquisa Star Wars Unlimited

## 📊 Star Wars Unlimited - Sistema de Slots

### Estrutura Base (16 cartas por booster)
```
Slots 1-9:   Common (56.25%)
Slots 10-13: Uncommon (25%)
Slot 14:     Rare/Special Rare (12.5%)
Slot 15:     Super Rare/Legendary (6.25%)
Slot 16:     Leader/Base (variável)
```

### Hyperspace/Foil System (Equivalente aos nossos Skins)
- **Cada carta** pode vir em versão "Hyperspace" (foil)
- **Probabilidade base**: 1 Hyperspace por booster (~6-8%)
- **Upgrade independente**: A raridade da carta é rolada ANTES do Hyperspace
- **Multiplicador**: Hyperspace aumenta valor de colecionador (não gameplay)

### Sistema de "Pity" (Mercy Rule)
- Se abrir X boosters sem Legendary → próximo garantido
- Se abrir Y boosters sem Hyperspace → próximo garantido
- Contadores separados para raridade e foil

---

## 🎯 Adaptação para KROUVA (5 cartas por booster)

### Modelo Base - Slot Weighting

#### 📦 Booster Micro (R$ 1.00)
```typescript
Slot 1: 85% Trash, 15% Meme
Slot 2: 80% Trash, 20% Meme
Slot 3: 70% Trash, 30% Meme
Slot 4: 60% Trash, 30% Meme, 10% Viral
Slot 5: 50% Trash, 25% Meme, 20% Viral, 4.9% Legendary, 0.1% Godmode
```
**Esperança matemática**: ~R$ 0.70 (70% RTP)
**Godmode chance**: 0.1% (1 em 1000 boosters)

#### 📦 Booster Básico (R$ 5.00)
```typescript
Slot 1: 70% Trash, 30% Meme
Slot 2: 60% Trash, 40% Meme
Slot 3: 50% Trash, 40% Meme, 10% Viral
Slot 4: 40% Trash, 35% Meme, 20% Viral, 5% Legendary
Slot 5: 20% Trash, 30% Meme, 35% Viral, 14.5% Legendary, 0.5% Godmode
```
**Esperança matemática**: ~R$ 3.50 (70% RTP)
**Godmode chance**: 0.5% (1 em 200 boosters)

#### 📦 Booster Premium (R$ 10.00)
```typescript
Slot 1: 50% Trash, 50% Meme
Slot 2: 40% Trash, 50% Meme, 10% Viral
Slot 3: 30% Trash, 40% Meme, 30% Viral
Slot 4: 20% Trash, 30% Meme, 35% Viral, 15% Legendary
Slot 5: 10% Trash, 20% Meme, 40% Viral, 28% Legendary, 2% Godmode
```
**Esperança matemática**: ~R$ 7.00 (70% RTP)
**Godmode chance**: 2% (1 em 50 boosters)

#### 📦 Booster Lendário (R$ 50.00)
```typescript
Slot 1: 30% Trash, 70% Meme
Slot 2: 20% Trash, 50% Meme, 30% Viral
Slot 3: 10% Trash, 30% Meme, 60% Viral
Slot 4: 5% Trash, 20% Meme, 50% Viral, 25% Legendary
Slot 5: 0% Trash, 10% Meme, 30% Viral, 50% Legendary, 10% Godmode
```
**Esperança matemática**: ~R$ 35.00 (70% RTP)
**Godmode chance**: 10% (1 em 10 boosters)

---

## 🌈 Sistema de Skin (Hyperspace Adaptation)

### Probabilidades de Skin por Slot
Após definir a raridade, rola-se o skin **independentemente**:

```typescript
const SKIN_WEIGHTS = {
  default: 70,   // 70%
  premium: 15,   // 15%
  holo: 8,       // 8%
  ghost: 4,      // 4%
  dark: 2,       // 2%
  glitch: 1      // 1%
}
```

### Upgrade Progressivo (Opcional)
Se o skin for > default, há 20% de chance de "upgrade":
- Premium pode virar Holo (20%)
- Holo pode virar Ghost (20%)
- Ghost pode virar Dark (20%)
- Dark pode virar Glitch (20%)

**Resultado**: Skins raros são MUITO raros mas não impossíveis

---

## 💎 Valores de Carta por Raridade (para cálculo de RTP)

```typescript
const RARITY_VALUES = {
  trash: { min: 0.01, max: 0.05, avg: 0.02 },
  meme: { min: 0.05, max: 0.30, avg: 0.15 },
  viral: { min: 0.20, max: 1.50, avg: 0.50 },
  legendary: { min: 1.00, max: 10.00, avg: 3.00 },
  godmode: { min: 50.00, max: 100.00, avg: 70.00 }
}
```

### Cálculo de Valor Final
```typescript
cardValue = baseValue[rarity] * skinMultiplier
// Onde skinMultiplier já está no cashback (não precisa aplicar de novo)
```

---

## 🎲 Implementação Técnica

### 1. Weighted Random Selection
```typescript
function weightedRandom(weights: Record<string, number>): string {
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  let random = Math.random() * total;
  
  for (const [key, weight] of Object.entries(weights)) {
    random -= weight;
    if (random <= 0) return key;
  }
  
  return Object.keys(weights)[0]; // fallback
}
```

### 2. Slot System
```typescript
function openBooster(boosterTier: string): Card[] {
  const slotConfig = SLOT_CONFIGS[boosterTier];
  const cards: Card[] = [];
  
  for (let i = 0; i < 5; i++) {
    const rarityWeights = slotConfig[i];
    const rarity = weightedRandom(rarityWeights);
    const skin = weightedRandom(SKIN_WEIGHTS);
    const card = selectRandomCard(rarity);
    
    cards.push({ ...card, skin, rarity });
  }
  
  return cards;
}
```

### 3. Pity System (Mercy Rule)
```typescript
// Após 50 boosters sem Godmode → próximo slot 5 tem 50% Godmode
// Após 100 boosters sem Legendary → próximo slot 4 é 100% Legendary
// Após 10 boosters sem Viral → próximo slot 3 tem 80% Viral
```

---

## 📈 Validação de RTP

### Simulação Monte Carlo
```python
def simulate_boosters(tier, count=10000):
    total_value = 0
    for _ in range(count):
        cards = open_booster(tier)
        total_value += sum(card.value for card in cards)
    
    avg_value = total_value / count
    booster_cost = BOOSTER_PRICES[tier]
    rtp = (avg_value / booster_cost) * 100
    
    print(f"{tier}: {rtp:.2f}% RTP (target: 70%)")
```

---

## 🚀 Próximos Passos

1. ✅ Criar tabela `booster_slot_configs` no Supabase
2. ✅ Criar função `calculate_slot_rarity(booster_tier, slot_index)`
3. ✅ Criar função `apply_skin_upgrade(base_skin)`
4. ✅ Criar tabela `user_pity_counters` (godmode_counter, legendary_counter, etc)
5. ✅ Atualizar Edge Function `/boosters/open` para usar novo sistema
6. ✅ Criar script de migração para popular slot_configs
7. ✅ Criar simulador de RTP para validação

---

## 📚 Referências

- Star Wars Unlimited Official Rules
- Magic: The Gathering Booster Ratios
- Hearthstone Pack Opening Mechanics
- Gacha Game Pity Systems (Genshin Impact, Honkai)
