# 🎮 Estratégia Competitiva de Scores - Kroova TCG

## 📊 Situação Atual

**Cartas no banco:** 354 cartas ED01
- trash: 177 (50%)
- meme: 114 (32.2%)
- viral: 46 (13%)
- legendary: 16 (4.5%)
- godmode: 1 (0.3%)

**Sistema atual:**
- `rarity` → Define `base_liquidity_brl` (FIXO, não pode mudar)
- `influence_score` → Calculado por keywords/texto (0-100 teórico, mas max 32 na prática)
- `rarity_score` → Não usado no jogo

## 🎯 Objetivo Competitivo

Criar um meta-game onde:
1. **Raridade ≠ Poder absoluto** (legendaries fracas existem, trash fortes também)
2. **Diferenciação dentro da mesma raridade** (nem toda viral é igual)
3. **Decisões estratégicas** (reciclar legendary fraca ou manter trash forte?)
4. **Meta dinâmico** (cartas subestimadas podem dominar)

---

## 💡 Estratégia Proposta: Sistema de 3 Camadas

### **Camada 1: RARITY (Raridade Base)**
**O que define:** Valor econômico fixo (liquidez)
**Range:** trash (R$0.01) → godmode (R$1.00)
**Não muda:** Liquidez é SEMPRE fixa por raridade

```
trash     → R$ 0.01  (comum, fácil de reciclar)
meme      → R$ 0.03  (incomum, material de deck)
viral     → R$ 0.10  (rara, core de estratégia)
legendary → R$ 0.50  (épica, win condition)
godmode   → R$ 1.00  (mítica, game changer)
```

### **Camada 2: INFLUENCE_SCORE (Poder Competitivo)**
**O que define:** Força da carta no meta, independente de raridade
**Range:** 1-100 (distribuído dentro de cada raridade)
**Usado para:** Mecânicas de jogo, synergies, combos

#### Distribuição Ideal por Raridade:

**Trash (177 cartas):**
- Baixa (1-30): 100 cartas (~56%) - Material de reciclagem
- Média (31-60): 55 cartas (~31%) - Úteis em decks budget
- Alta (61-85): 20 cartas (~11%) - Sleepers, memes fortes
- Elite (86-95): 2 cartas (~1%) - As lendas trash (Pepe, Doge)

**Meme (114 cartas):**
- Baixa (15-40): 45 cartas (~39%) - Nichadas
- Média (41-65): 50 cartas (~44%) - Backbone de decks
- Alta (66-85): 17 cartas (~15%) - Tech cards fortes
- Elite (86-95): 2 cartas (~2%) - Os "broken commons"

**Viral (46 cartas):**
- Baixa (30-50): 10 cartas (~22%) - Situacionais
- Média (51-70): 20 cartas (~43%) - Sólidas
- Alta (71-90): 14 cartas (~30%) - Win conditions
- Elite (91-97): 2 cartas (~4%) - Format definers

**Legendary (16 cartas):**
- Baixa (40-60): 3 cartas (~19%) - Flex picks
- Média (61-75): 6 cartas (~38%) - Staples
- Alta (76-90): 5 cartas (~31%) - Bomba
- Elite (91-98): 2 cartas (~13%) - Meta definers

**Godmode (1 carta):**
- Elite (95-100): 1 carta - O ápice absoluto

### **Camada 3: RARITY_SCORE (Exclusividade/Colecao)**
**O que define:** Raridade percebida, valor colecionável
**Range:** 1-100 (correlacionado com raridade, mas com variação)
**Usado para:** Sistema de achievements, showcase, flex

```
trash     → 5-25   (comum, mas alguns são icônicos)
meme      → 20-45  (memoráveis, parte da cultura)
viral     → 40-70  (desejadas, símbolos de status)
legendary → 65-90  (raras, cobiçadas)
godmode   → 95-100 (única, lendária)
```

---

## 🔥 Exemplos Práticos

### Caso 1: Trash Viral vs Legendary Fraca
```
🃏 "Pepe Sorriso" (trash)
- base_liquidity: R$ 0.01
- influence_score: 87 (meme lendário, synergy forte)
- rarity_score: 22
- Uso: Core em decks meme, combo infinito
- Decisão: NUNCA reciclar, vale mais no deck

🃏 "Influencer Esquecido 2019" (legendary)  
- base_liquidity: R$ 0.50
- influence_score: 42 (relevância baixa, sem synergy)
- rarity_score: 78
- Uso: Niche em deck histórico
- Decisão: Reciclar por R$ 0.50 ou manter pra coleção?
```

### Caso 2: Meme Média vs Viral Média
```
🃏 "Gato Keyboard" (meme)
- base_liquidity: R$ 0.03
- influence_score: 55
- rarity_score: 38
- 25x = R$ 0.75 de reciclagem
- Uso: Filler decente

🃏 "TikTok Trend #847" (viral)
- base_liquidity: R$ 0.10  
- influence_score: 58
- rarity_score: 52
- 25x = R$ 2.50 de reciclagem
- Uso: Não encaixa no meta atual
- Decisão: Viral dá mais valor de reciclagem!
```

---

## 🎲 Mecânicas de Jogo Sugeridas

### 1. **Influence-Based Combos**
Cartas com influence alto (70+) desbloqueiam synergies:
- 2 cartas influence 80+ = +50% efeito
- 3 cartas influence 60+ = Combo especial

### 2. **Rarity-Based Restrictions**
Limites por deck:
- Max 3 godmode
- Max 8 legendary
- Max 15 viral
- Ilimitado meme/trash

### 3. **Underdog Bonus**
Trash/meme com influence alto ganham buff:
- Trash 80+ influence = +25% stats
- Cria incentivo pra decks criativos

### 4. **Collection Achievements**
Baseado em rarity_score:
- Coletar todas rarity_score 90+ = Badge "Lendário"
- Completar set de trash rarity_score 20+ = Badge "Sleeper Hunter"

---

## 📐 Fórmula de Cálculo Proposta

### **Influence Score (Independente por Raridade)**

```python
def calculate_influence_score(card):
    # Score base por conteúdo (0-70)
    keyword_score = count_viral_keywords(card.name, card.description) * 8  # 0-50
    complexity_score = calculate_text_complexity(card.description)  # 0-20
    
    # Buscar todas cartas da mesma raridade
    same_rarity_cards = get_cards_by_rarity(card.rarity)
    
    # Calcular score bruto
    raw_score = keyword_score + complexity_score
    
    # Normalizar dentro da raridade (0-90)
    min_raw = min(c.raw_score for c in same_rarity_cards)
    max_raw = max(c.raw_score for c in same_rarity_cards)
    normalized = 90 * (raw_score - min_raw) / (max_raw - min_raw)
    
    # Adicionar variação única (consistente por nome)
    variance = hash(card.name) % 15 - 7  # -7 a +7
    
    final = normalized + variance
    
    # Ajustar range por raridade (pra godmode chegar a 100)
    if card.rarity == 'godmode':
        final = min(100, final + 10)
    elif card.rarity == 'legendary':
        final = min(98, final + 5)
    
    return clamp(final, 1, 100)
```

### **Rarity Score (Correlacionado mas Variado)**

```python
def calculate_rarity_score(card):
    # Base por raridade
    base_scores = {
        'trash': 15,
        'meme': 32,
        'viral': 55,
        'legendary': 77,
        'godmode': 97
    }
    
    base = base_scores[card.rarity]
    
    # Adicionar fatores únicos
    name_hash = hash(card.name) % 20 - 10  # -10 a +10
    
    # Keywords de exclusividade
    exclusive_keywords = ['único', 'lendário', 'raro', 'exclusivo', 'limited']
    exclusive_bonus = sum(5 for kw in exclusive_keywords if kw in card.description.lower())
    
    final = base + name_hash + exclusive_bonus
    
    # Limites por raridade
    ranges = {
        'trash': (5, 25),
        'meme': (20, 45),
        'viral': (40, 70),
        'legendary': (65, 90),
        'godmode': (95, 100)
    }
    
    min_val, max_val = ranges[card.rarity]
    return clamp(final, min_val, max_val)
```

---

## ✅ Vantagens Desta Estratégia

1. **Meta Dinâmico:** Trash forte vira sleeper hit, legendary fraca vira bait
2. **Decisões Complexas:** Reciclar legendary R$0.50 vs manter trash influence 85?
3. **Replay Value:** Players descobrem combos com cartas "ruins"
4. **Economia Saudável:** Liquidez fixa + valor competitivo variável
5. **Colecionabilidade:** Rarity score independente cria chase cards em todas raridades
6. **Balanceamento:** Podemos buffar/nerfar influence sem mexer na economia

---

## 🚨 Garantias de Segurança

### ✅ O Que NÃO Muda:
- `base_liquidity_brl` (sempre fixo por raridade)
- Distribuição de raridades (50% trash, 32% meme, etc)
- Sistema de reciclagem (25 cartas → 1 booster)

### ✅ O Que Muda:
- `influence_score` recalculado com normalização por raridade
- `rarity_score` recalculado com variação
- Meta-game fica mais interessante
- RTP permanece 28-30% (inalterado)

---

## 🎯 Decisão Final

**Implementar?**
- [ ] ✅ SIM - Normalizar influence por raridade, criar meta dinâmico
- [ ] ⚠️ AJUSTAR - Manter simples mas aumentar range (1-80)
- [ ] ❌ NÃO - Deixar como está (max 32)

**Se SIM:**
1. Criar `recalc-influence-normalized.py`
2. Rodar em todas 354 cartas
3. Verificar distribuição por raridade
4. Commit + Deploy

**Aguardando decisão...**
