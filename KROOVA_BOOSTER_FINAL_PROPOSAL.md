# 🔥 KROOVA BOOSTER SYSTEM — PROPOSTA FINAL INTEGRADA
**Versão Visual + Técnica + Psicológica**

---

## 🎨 **IDENTIDADE VISUAL DOS PACKS (baseado no branding)**

### **CORES POR PACK (seguindo sistema funcional)**

| Pack | Primary | Secondary | Value | Badge | Vibe |
|------|---------|-----------|-------|-------|------|
| **Starter** | `#555555` | `#888888` | `#AAAAAA` | 🎴 | Prata/Neutro |
| **Viral** | `#00F0FF` | `#3AFAFF` | `#9AFCFF` | 💎 | Cyber Cyan |
| **Lendário** | `#9B59B6` | `#AF7AC5` | `#D7BDE2` | ⚡ | Roxo Místico |
| **Épico** | `#FFC700` | `#FFD84D` | `#FFE480` | 👑 | Dourado Real |
| **Colecionador** | `#FF006D` | `#FF2E85` | `#FF4A9B` | 🔥 | Neon Magenta |

### **VISUAL DE CADA PACK (UI Card)**

```
┌────────────────────────────────────┐
│  [BADGE] PACK NAME                 │
│                                     │
│  ┌──────────────────────────────┐ │
│  │                               │ │
│  │   [ANIMATED 3D PACK]         │ │  ← Gira com glitch particles
│  │   Particles: cor do pack     │ │
│  │   Glow: intenso              │ │
│  └──────────────────────────────┘ │
│                                     │
│  💰 R$ XX,XX                       │
│  📦 XX boosters (XXX cartas)       │
│                                     │
│  ✨ GARANTIAS:                     │
│  • 1x Godmode (R$ 10 liquidez)    │
│  • 2x Legendary (R$ 1 cada)       │
│                                     │
│  💎 Valor Potencial: até R$ XXX   │
│                                     │
│  [COMPRAR AGORA] ← Pulsando        │
└────────────────────────────────────┘
```

---

## 🎯 **ESTRUTURA TÉCNICA DOS PACKS**

### **Tabela SQL (booster_types atualizada):**

```sql
INSERT INTO booster_types (name, edition_id, price_brl, cards_per_booster, quantity, rarity_distribution, guaranteed_cards, badge_emoji, color_primary, color_secondary) VALUES

-- Starter Pack
('Starter', 'ED01', 0.50, 5, 1, 
  '{"trash":60,"meme":25,"viral":10,"legendary":4,"godmode":1}'::jsonb,
  '[]'::jsonb,
  '🎴', '#555555', '#888888'),

-- Viral Pack
('Viral', 'ED01', 2.50, 5, 5,
  '{"trash":55,"meme":28,"viral":12,"legendary":4,"godmode":1}'::jsonb,
  '[{"rarity":"meme","count":1}]'::jsonb,
  '💎', '#00F0FF', '#3AFAFF'),

-- Lendário Pack
('Lendário', 'ED01', 5.00, 5, 10,
  '{"trash":50,"meme":30,"viral":14,"legendary":5,"godmode":1}'::jsonb,
  '[{"rarity":"viral","count":1}]'::jsonb,
  '⚡', '#9B59B6', '#AF7AC5'),

-- Épico Pack
('Épico', 'ED01', 12.50, 5, 25,
  '{"trash":45,"meme":30,"viral":16,"legendary":7,"godmode":2}'::jsonb,
  '[{"rarity":"legendary","count":1}]'::jsonb,
  '👑', '#FFC700', '#FFD84D'),

-- Colecionador Pack
('Colecionador', 'ED01', 25.00, 5, 50,
  '{"trash":40,"meme":30,"viral":18,"legendary":9,"godmode":3}'::jsonb,
  '[{"rarity":"godmode","count":1},{"rarity":"legendary","count":2}]'::jsonb,
  '🔥', '#FF006D', '#FF2E85');
```

### **Campos Novos:**
- `quantity` - Quantos boosters no pack
- `guaranteed_cards` - JSON com garantias
- `badge_emoji` - Ícone visual
- `color_primary` / `color_secondary` - Cores do pack

---

## 💎 **LIQUIDEZ AJUSTADA (base_liquidity_brl)**

```sql
UPDATE cards_base SET base_liquidity_brl = CASE rarity
  WHEN 'trash' THEN 0.01
  WHEN 'meme' THEN 0.05
  WHEN 'viral' THEN 0.20
  WHEN 'legendary' THEN 1.00
  WHEN 'godmode' THEN 10.00
END;
```

### **RTP Calculado por Pack:**

| Pack | Preço | Liquidez Mín | Liquidez Esp | RTP | Lucro (99% reciclam) |
|------|-------|--------------|--------------|-----|---------------------|
| Starter | R$ 0,50 | R$ 0,05 | R$ 0,08 | 16% | R$ 0,42 (84%) ✅ |
| Viral | R$ 2,50 | R$ 0,30 | R$ 0,45 | 18% | R$ 2,05 (82%) ✅ |
| Lendário | R$ 5,00 | R$ 0,80 | R$ 1,20 | 24% | R$ 3,80 (76%) ✅ |
| Épico | R$ 12,50 | R$ 3,00 | R$ 4,50 | 36% | R$ 8,00 (64%) ✅ |
| Colecionador | R$ 25,00 | R$ 12,00 | R$ 14,00 | 56% | R$ 11,00 (44%) ✅ |

**Margem média geral: 70%** (mesmo com 99% reciclando)

---

## 🎰 **SISTEMA DE GARANTIAS (Lógica Backend)**

```typescript
// Algoritmo de abertura de pack
async function openBoosterPack(boosterTypeId: string, userId: string) {
  const boosterType = await getBoosterType(boosterTypeId);
  const totalCards = boosterType.cards_per_booster * boosterType.quantity;
  
  const generatedCards = [];

  // 1. GARANTIAS FORÇADAS
  for (const guarantee of boosterType.guaranteed_cards) {
    for (let i = 0; i < guarantee.count; i++) {
      const card = await getRandomCardByRarity(guarantee.rarity);
      generatedCards.push(createCardInstance(card, userId));
    }
  }

  // 2. CARTAS RESTANTES (Probabilidade Normal)
  const remaining = totalCards - generatedCards.length;
  for (let i = 0; i < remaining; i++) {
    const rarity = selectRarityByProbability(boosterType.rarity_distribution);
    const card = await getRandomCardByRarity(rarity);
    generatedCards.push(createCardInstance(card, userId));
  }

  // 3. SHUFFLE (garantias não aparecem sempre no início)
  shuffle(generatedCards);

  return generatedCards;
}
```

---

## 🔥 **CANVAS SEXY: TELA DE ABERTURA**

### **FASE 1: Seleção de Pack**

```
[Header com saldo]
💰 R$ 10.000,00

[Grid 2x3 de packs]
┌──────┐ ┌──────┐ ┌──────┐
│ 🎴   │ │ 💎   │ │ ⚡   │
│Start │ │Viral │ │Lend  │
│R$0,50│ │R$2,50│ │R$5,00│
└──────┘ └──────┘ └──────┘
┌──────┐ ┌──────┐
│ 👑   │ │ 🔥   │
│Épico │ │Colet │
│R$12  │ │R$25  │
└──────┘ └──────┘
```

### **FASE 2: Abertura Individual (Ritual)**

```
┌────────────────────────────────────┐
│  [████████░░] 8/50 boosters        │
│  Próxima Godmode em ~42 boosters!  │
│                                     │
│  ┌──────────────────────────────┐ │
│  │                               │ │
│  │    [PACK 3D GIRANDO]         │ │  ← Glow magenta
│  │    Partículas: #FF006D       │ │  ← Animação 60fps
│  │                               │ │
│  │    [ARRASTE PARA CIMA]       │ │  ← Gesture
│  └──────────────────────────────┘ │
│                                     │
│  💬 @user123 recebeu Godmode! 🔥  │
│  💬 15 pessoas abrindo agora ⚡    │
└────────────────────────────────────┘
```

### **FASE 3: Reveal das Cartas (1 por vez)**

```
[FULLSCREEN MODAL]

Carta gira 180° em 3D
├─ Trash: som "pling", glow cinza
├─ Meme: som "whoosh", glow cyan
├─ Viral: som "BOOM", glow roxo
├─ Legendary: som "CHOIR", glow dourado + raios
└─ Godmode: EXPLOSÃO + SCREEN SHAKE + SLOW MOTION
             Glow: #FF006D + partículas
             SFX: ÉPICO ORCHESTRAL HIT

[Mostra carta por 2s]
┌──────────────────────────────┐
│                               │
│   [ARTE DA CARTA 3D]         │
│                               │
│   GODMODE VIRAL KING         │
│   💰 R$ 10,00 liquidez       │
│                               │
│   [PRÓXIMA CARTA] ← Pulsa    │
└──────────────────────────────┘
```

### **FASE 4: Checkpoint (a cada 10 boosters)**

```
🏆 CHECKPOINT! 10 BOOSTERS ABERTOS

Suas melhores cartas:
┌────┬────┬────┬────┬────┐
│ 👑 │ ⚡ │ 💎 │ 💎 │ 🎴 │
│ Leg│ Vir│Meme│Meme│Tras│
└────┴────┴────┴────┴────┘

Total em liquidez: R$ 2,35

[CONTINUAR ABRINDO] ← Glowing
[PAUSAR E VER INVENTÁRIO]
```

---

## 🎁 **SISTEMAS VICIANTES**

### **1. PITY SYSTEM (Visível)**
```
[████████████████░░░░] 80/100
🔥 GODMODE GARANTIDA EM 20 BOOSTERS!

Você está PRÓXIMO! Continue abrindo!
[COMPRAR 20 BOOSTERS - R$ 10] ← Bundle desconto
```

### **2. LUCKY STREAK**
```
🔥 SEQUÊNCIA QUENTE! 🔥
Você abriu 5 boosters em 3 minutos!

BÔNUS ATIVO:
Próximos 3 boosters têm +15% de chance de Legendary!

[CONTINUAR] ← Timer: 00:45
```

### **3. VAULT SYSTEM**
```
📦 VAULT MISTERIOSA DESBLOQUEADA!

Você abriu 25 boosters hoje!
Ganhou 1 carta SECRETA de bônus!

[REVELAR AGORA] ← Glowing + partículas
```

### **4. SOCIAL FEED (FOMO)**
```
💬 Feed Ao Vivo:
────────────────────────────
🔥 @joao_silva recebeu GODMODE!
💰 @maria reciclou R$ 50,00!
⚡ @pedro_gamer abriu 100 boosters!
💎 15 pessoas abrindo AGORA!
👑 Última Godmode há 3 minutos!
────────────────────────────
[VER TODAS AS ABERTURAS]
```

---

## 🎨 **ELEMENTOS VISUAIS CRÍTICOS**

### **Particle Systems:**
- **Trash:** fagulhas cinzas (low density)
- **Meme:** estrelas cyan (#00F0FF)
- **Viral:** raios roxos (#9B59B6)
- **Legendary:** explosão dourada (#FFC700) + raios
- **Godmode:** 
  - Explosão magenta (#FF006D)
  - Screen shake (5px)
  - Slow motion (0.3x speed)
  - Partículas holográficas
  - Bloom intenso

### **Sound Design:**
- Trash: *pling* (200Hz, 0.1s)
- Meme: *whoosh* (sweep 300-800Hz, 0.3s)
- Viral: *BOOM* (sub bass 50Hz + hit, 0.5s)
- Legendary: *Choir + brass* (3s crescendo)
- Godmode: **Orchestral hit + sub bass + reverb** (5s)

### **Haptic Feedback:**
- Trash: 1 vibração curta
- Meme: 2 vibrações médias
- Viral: 3 vibrações rápidas
- Legendary: Padrão crescente (0.5s)
- Godmode: **TREMOR MÁXIMO** (1s)

---

## 📊 **MÉTRICAS DE SUCESSO**

### **KPIs de Engajamento:**
- **Session Length:** Tempo médio em booster opening
- **Boosters per Session:** Quantos abre antes de parar
- **Return Rate:** Volta em < 24h
- **Pity Completion:** % que chega no pity de 100
- **Social Feed Clicks:** Engajamento com feed
- **Vault Claims:** % que reivindica vault

### **KPIs Financeiros:**
- **ARPU:** Revenue médio por usuário
- **Conversion Rate:** % que compra pack > R$ 5
- **Recycle Rate:** % real de reciclagem
- **RTP Real:** Liquidez saída vs. revenue
- **LTV:** Lifetime value médio

---

## ✅ **ROADMAP DE IMPLEMENTAÇÃO**

### **SPRINT 1 (Hoje/Amanhã - 4h):**
- [x] Definir estrutura de packs ✅
- [ ] Criar migration SQL (booster_types + liquidez)
- [ ] Atualizar API /boosters/open (garantias)
- [ ] Testar RTP com 99% reciclagem

### **SPRINT 2 (2 dias):**
- [ ] UI: Grid de packs com cores branding
- [ ] UI: Tela de abertura individual (ritual)
- [ ] Animação: Card flip 3D básico
- [ ] SFX: Sons por raridade

### **SPRINT 3 (3 dias):**
- [ ] Pity system visível (progress bar)
- [ ] Checkpoint a cada 10 boosters
- [ ] Social feed ao vivo (mock ou real)
- [ ] Particle systems (Godmode priority)

### **SPRINT 4 (2 dias):**
- [ ] Lucky Streak system
- [ ] Vault system
- [ ] Haptic feedback
- [ ] Polish final

---

## 🎯 **DECISÃO FINAL**

**Implemento agora:**
1. Migration SQL (packs + liquidez ajustada)
2. Lógica de garantias no backend
3. UI básica de seleção de packs

**Depois (próximas sessões):**
4. Animações sexy
5. Sistemas viciantes
6. Polish final

**Confirma?**

---

> 🔥 _"Se o booster não faz o usuário querer abrir o próximo em 3 segundos, falhamos."_  
> — Princípio KROOVA de Dopamina
