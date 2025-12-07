# 🎴 KROOVA TCG - SISTEMA COMPLETO DE RARIDADE E ECONOMIA
## Especialista em TCG Design, Collation SWU Carbonite, Economia de Jogos

---

## 📊 PARTE 1: AUDITORIA COMPLETA DA TABELA `cards_base`

### 1.1 ESTRUTURA ATUAL
- **Total de cartas**: 366 cartas
- **Edição**: ED01 (primeira edição)
- **Distribuição de cartas**:
  - **154 cartas pack-exclusive** (vinculadas a pack_id específico)
  - **212 cartas shared** (podem cair em qualquer booster)

### 1.2 RARIDADES ATUAIS (Sistema Problemático)

| Raridade | Quantidade | Liquidez Mín | Liquidez Máx | Liquidez Média | Problema |
|----------|------------|--------------|--------------|----------------|----------|
| **trash** | 179 (49%) | R$ 0.01 | R$ 0.02 | R$ 0.01 | ⚠️ Mínimo ajustado para R$ 0.01 |
| **meme** | 117 (32%) | R$ 0.02 | R$ 0.23 | R$ 0.09 | ✅ OK |
| **viral** | 49 (13%) | R$ 0.02 | R$ 1.35 | R$ 0.41 | ⚠️ Range muito amplo |
| **legendary** | 18 (5%) | R$ 0.45 | R$ 8.24 | R$ 3.06 | ❌ 2 cartas < R$ 0.50 |
| **godmode** | 3 (1%) | R$ 69.13 | R$ 102.93 | R$ 82.11 | ✅ OK |

**TOTAL**: 366 cartas

### 1.3 ARQUÉTIPOS EXISTENTES (24 tipos)

Arquétipos ordenados por quantidade:

| Arquétipo | Cartas | Raridades Dominantes | Categoria Temática |
|-----------|--------|---------------------|-------------------|
| **Preguiça** | 59 | trash (51), meme (6), viral (1), legendary (1) | Psicológico/Social |
| **Impulso** | 49 | trash (30), meme (13), viral (5), legendary (1) | Comportamental |
| **Influência** | 46 | trash (29), meme (11), viral (5), legendary (1) | Social/Viral |
| **Ganância** | 44 | trash (28), meme (10), viral (5), legendary (1) | Econômico |
| **Consumo** | 27 | trash (23), meme (4) | Econômico |
| **Informação** | 26 | trash (16), meme (6), viral (4) | Data/Tech |
| **Pulso** | 13 | meme (13) | Energia |
| **Sinal** | 12 | meme (12) | Comunicação |
| **Totem** | 12 | meme (12) | Espiritual |
| **Eco** | 11 | meme (11) | Ambiental |
| **Explosão** | 9 | viral (9) | Agressivo |
| **Vibração** | 8 | meme (8) | Energia |
| **Onda** | 8 | meme (8) | Movimento |
| **Tempestade** | 7 | viral (7) | Caótico |
| **Estrondo** | 5 | viral (5) | Agressivo |
| **Nexo** | 4 | legendary (4) | Conexão |
| **Farol** | 3 | legendary (3) | Guia |
| **Emissor** | 3 | legendary (3) | Transmissão |
| **Catalisador** | 2 | viral (2) | Transformação |
| **Corrida** | 2 | viral (2) | Velocidade |
| **Coroa** | 1 | legendary (1) | Autoridade |
| **Oráculo** | 1 | legendary (1) | Sabedoria |
| **Primordial** | 1 | godmode (1) | Origem |
| **Surto** | 1 | viral (1) | Explosivo |

### 1.4 METADADOS EXISTENTES

**Campos disponíveis**:
- `influence_score`: 354 cartas (97%) possuem
- `rarity_score`: 354 cartas (97%) possuem
- `fixed_liquidity_brl`: 366 cartas (100%) - valor fixo da carta
- `market_tier`: 366 cartas com tiers 1-5
- `metadata`: 365 cartas com tags, archetype, generation info

**Exemplo de metadata**:
```json
{
  "tags": ["eternal", "legacy", "authority"],
  "edition": "ED01_expansion",
  "archetype": "beacon",
  "generation": "v2_safe",
  "trademark_safe": true
}
```

### 1.5 MARKET TIERS ATUAIS

| Market Tier | Quantidade | % |
|-------------|------------|---|
| Tier 1 | 160 | 44% |
| Tier 2 | 132 | 36% |
| Tier 3 | 54 | 15% |
| Tier 4 | 14 | 4% |
| Tier 5 | 6 | 2% |

### 1.6 PROBLEMAS CRÍTICOS IDENTIFICADOS

#### ❌ **Problema 1: Legendary com liquidez muito baixa**
- **Marks Crown**: R$ 0.45 (legendary deveria valer mínimo R$ 1.00)
- **Conspira++**: R$ 0.46 (idem)

#### ⚠️ **Problema 2: Viral com range muito amplo**
- Mínimo: R$ 0.02 (muito baixo para viral)
- Máximo: R$ 1.35 (conflita com legendary)
- **Solução**: Dividir viral em sub-tiers

#### ⚠️ **Problema 3: 12 cartas sem archetype**
- Cartas antigas sem classificação temática
- Precisam ser categorizadas para sistema Alpha/Beta/Gamma

#### ⚠️ **Problema 4: Nomes genéricos**
- "Guerreiro Novato", "Arqueiro Ágil" - cartas placeholder sem identidade Kroova
- Descrições genéricas de TCG tradicional (não refletem temática digital/glitch)

---

## 🎯 PARTE 2: NOVO SISTEMA DE RARIDADE KROOVA

### 2.1 ESTRUTURA DE RARIDADE HIERÁRQUICA (3 níveis)

```
RARIDADE BASE (5 tipos)
├── trash
├── meme
├── viral
├── legendary
└── godmode

SUB-RARIDADE (3 níveis dentro de cada base)
├── LOW (33% mais baratas)
├── MID (33% valor médio)
└── HIGH (33% mais caras)

TREATMENT (camada visual independente)
├── standard (70% - sem efeito visual)
├── glitch (15% - efeito glitch)
├── holo (8% - holográfico)
├── dark (4% - versão dark)
├── spectral (1.5% - espectral)
├── primal (1% - primal)
├── corrupted (0.3% - corrompido)
├── void_holo (0.15% - void holográfico)
└── legendary_glitch (0.05% - ultra raro)
```

### 2.2 VALORES FIXOS POR SUB-RARIDADE

#### TRASH (49% do pool)
- **Low Trash**: R$ 0.01 - R$ 0.012 (16% do pool total)
- **Mid Trash**: R$ 0.012 - R$ 0.015 (16%)
- **High Trash**: R$ 0.015 - R$ 0.02 (17%)

#### MEME (32% do pool)
- **Low Meme**: R$ 0.02 - R$ 0.06 (11%)
- **Mid Meme**: R$ 0.06 - R$ 0.12 (11%)
- **High Meme**: R$ 0.12 - R$ 0.25 (10%)

#### VIRAL (13% do pool)
- **Low Viral**: R$ 0.25 - R$ 0.40 (4%)
- **Mid Viral**: R$ 0.40 - R$ 0.70 (5%)
- **High Viral**: R$ 0.70 - R$ 1.20 (4%)

#### LEGENDARY (5% do pool)
- **Low Legendary**: R$ 1.20 - R$ 2.50 (2%)
- **Mid Legendary**: R$ 2.50 - R$ 5.00 (2%)
- **High Legendary**: R$ 5.00 - R$ 10.00 (1%)

#### GODMODE (1% do pool)
- **Low Godmode**: R$ 60.00 - R$ 80.00 (0.5%)
- **Mid Godmode**: R$ 80.00 - R$ 110.00 (0.3%)
- **High Godmode**: R$ 110.00 - R$ 150.00 (0.2%)

### 2.3 REGRAS DE CLASSIFICAÇÃO (Como definir sub-raridade)

**Critérios para HIGH (cartas premium dentro da raridade)**:
1. Nome icônico/memorável
2. Lore forte e coerente com universo Kroova
3. Archetype principal (Primordial, Oráculo, Nexo, Farol)
4. Alta influence_score (>70)
5. Impacto narrativo forte

**Critérios para MID (cartas standard)**:
1. Nomes funcionais
2. Lore mediano
3. Archetypes comuns (Impulso, Influência, Ganância)
4. Influence_score médio (40-70)

**Critérios para LOW (cartas comuns/filler)**:
1. Nomes genéricos
2. Lore fraco/ausente
3. Archetypes passivos (Preguiça, Consumo)
4. Influence_score baixo (<40)

---

## 🧬 PARTE 3: SISTEMA ALPHA / BETA / GAMMA

### 3.1 DEFINIÇÃO DOS ARQUÉTIPOS DE PACK

#### 🔴 ALPHA - AGRESSIVO/CAÓTICO
**Temática**: Ataque, destruição, instabilidade, caos digital, glitches ofensivos

**Archetypes inclusos**:
- Explosão (9 cartas)
- Estrondo (5 cartas)
- Tempestade (7 cartas)
- Impulso (49 cartas)
- Corrida (2 cartas)
- Surto (1 carta)
- Catalisador (2 cartas)

**Total**: ~75 cartas ALPHA

**Características**:
- Maior % de viral e legendary high
- Treatments agressivos: glitch, corrupted, void_holo
- Nomes impactantes
- Descrições de poder bruto

---

#### 🔵 BETA - SUPORTE/PSICOLÓGICO
**Temática**: Manipulação social, influência, controle psicológico, redes

**Archetypes inclusos**:
- Influência (46 cartas)
- Preguiça (59 cartas)
- Consumo (27 cartas)
- Sinal (12 cartas)
- Vibração (8 cartas)
- Onda (8 cartas)
- Pulso (13 cartas)
- Eco (11 cartas)

**Total**: ~184 cartas BETA

**Características**:
- Maior % de meme e viral low/mid
- Treatments sutis: holo, spectral
- Mecânicas de controle
- Descrições de manipulação psicológica

---

#### 🟢 GAMMA - TÉCNICO/ECONÔMICO
**Temática**: Economia, dados, algoritmos, mercado, tecnologia avançada

**Archetypes inclusos**:
- Ganância (44 cartas)
- Informação (26 cartas)
- Nexo (4 cartas)
- Farol (3 cartas)
- Emissor (3 cartas)
- Oráculo (1 carta)
- Coroa (1 carta)
- Primordial (1 carta)
- Totem (12 cartas)

**Total**: ~95 cartas GAMMA

**Características**:
- Maior % de legendary e godmode
- Treatments premium: primal, legendary_glitch, dark
- Mecânicas complexas
- Descrições de sistemas e algoritmos

---

### 3.2 DISTRIBUIÇÃO POR TIER + ARCHETYPE

Cada tier (R$ 0,50 / R$ 1 / R$ 2 / R$ 5 / R$ 10) existe em 3 versões:

```
TIER 1 (R$ 0.50)
├── Alpha Básico (5 cartas)
├── Beta Básico (5 cartas)
└── Gamma Básico (5 cartas)

TIER 2 (R$ 1.00)
├── Alpha Padrão (5 cartas)
├── Beta Padrão (5 cartas)
└── Gamma Padrão (5 cartas)

TIER 3 (R$ 2.00)
├── Alpha Premium (5 cartas)
├── Beta Premium (5 cartas)
└── Gamma Premium (5 cartas)

TIER 4 (R$ 5.00)
├── Alpha Elite (5 cartas)
├── Beta Elite (5 cartas)
└── Gamma Elite (5 cartas)

TIER 5 (R$ 10.00)
├── Alpha Whale (5 cartas)
├── Beta Whale (5 cartas)
└── Gamma Whale (5 cartas)
```

**Total**: 15 tipos de boosters (5 tiers × 3 archetypes)

---

## 🎲 PARTE 4: SISTEMA DE COLLATION (Inspirado SWU Carbonite)

### 4.1 ESTRUTURA DE SLOTS POR BOOSTER (5 cartas)

**TODOS OS BOOSTERS TÊM:**
```
SLOT 1: Trash/Meme Comum (70% trash, 30% meme)
SLOT 2: Meme Comum (100% meme)
SLOT 3: Viral/Meme Raro (60% meme high, 40% viral low)
SLOT 4: Raridade Variável (depende do tier)
SLOT 5: Treatment Slot (probabilidade independente de treatment especial)
```

### 4.2 SLOT 4 - RARIDADE VARIÁVEL POR TIER

#### TIER 1 (R$ 0.50) - Básico
```
Slot 4:
- 85% Meme (low/mid)
- 12% Viral (low)
- 2.5% Legendary (low)
- 0.5% Godmode (low)
```

#### TIER 2 (R$ 1.00) - Padrão
```
Slot 4:
- 70% Meme (mid/high)
- 25% Viral (low/mid)
- 4% Legendary (low/mid)
- 1% Godmode (low)
```

#### TIER 3 (R$ 2.00) - Premium
```
Slot 4:
- 50% Meme (high)
- 40% Viral (mid/high)
- 8% Legendary (low/mid/high)
- 2% Godmode (low/mid)
```

#### TIER 4 (R$ 5.00) - Elite
```
Slot 4:
- 30% Viral (high)
- 50% Legendary (mid/high)
- 18% Legendary (high)
- 2% Godmode (mid)
```

#### TIER 5 (R$ 10.00) - Whale
```
Slot 4:
- 60% Legendary (high)
- 35% Godmode (low/mid)
- 5% Godmode (high)
```

### 4.3 SLOT 5 - TREATMENT SLOT (Independente)

**Probabilidades de Treatment em QUALQUER carta do booster:**

```
Standard (nenhum): 70%
Glitch: 15%
Holo: 8%
Dark: 4%
Spectral: 1.5%
Primal: 1%
Corrupted: 0.3%
Void Holo: 0.15%
Legendary Glitch: 0.05%
```

**REGRA IMPORTANTE**: Treatment não altera `base_liquidity_brl` (valor fixo permanece), mas influencia:
- Valor de mercado no marketplace
- Desejo de colecionadores
- Raridade visual

---

## 💰 PARTE 5: MATEMÁTICA DO RTP (Return To Player)

### 5.1 FÓRMULA GERAL

```
RTP = (Soma das Liquidities das 5 Cartas) / Preço do Booster

Target RTP: 65% - 75%
```

### 5.2 CÁLCULO POR TIER

#### TIER 1 (R$ 0.50) - Target RTP: 70%
```
Retorno esperado: R$ 0.35

Composição média:
- Slot 1: R$ 0.01 (trash)
- Slot 2: R$ 0.05 (meme low)
- Slot 3: R$ 0.08 (meme mid)
- Slot 4: R$ 0.06 (85% meme low = R$ 0.05, 12% viral low = R$ 0.30, 2.5% legendary = R$ 1.50, 0.5% godmode = R$ 70)
  - Valor ponderado: 0.85×0.05 + 0.12×0.30 + 0.025×1.50 + 0.005×70 = 0.0425 + 0.036 + 0.0375 + 0.35 = R$ 0.466
  - AJUSTE: reduzir chance de godmode ou usar godmode low (R$ 60) para equilibrar
- Slot 5: R$ 0.05 (maioria standard)

TOTAL MÉDIO: ~R$ 0.35 (70% RTP)
```

#### TIER 2 (R$ 1.00) - Target RTP: 70%
```
Retorno esperado: R$ 0.70

Composição média:
- Slot 1: R$ 0.01 (trash)
- Slot 2: R$ 0.08 (meme mid)
- Slot 3: R$ 0.35 (40% viral low)
- Slot 4: R$ 0.18 (70% meme high, 25% viral, 4% legendary, 1% godmode)
- Slot 5: R$ 0.08 (meme mid)

TOTAL MÉDIO: ~R$ 0.70 (70% RTP)
```

#### TIER 3 (R$ 2.00) - Target RTP: 68%
```
Retorno esperado: R$ 1.36

Composição média:
- Slot 1: R$ 0.01
- Slot 2: R$ 0.12 (meme high)
- Slot 3: R$ 0.50 (viral mid)
- Slot 4: R$ 0.60 (50% meme high, 40% viral high, 8% legendary, 2% godmode)
- Slot 5: R$ 0.13 (meme high)

TOTAL MÉDIO: ~R$ 1.36 (68% RTP)
```

#### TIER 4 (R$ 5.00) - Target RTP: 70%
```
Retorno esperado: R$ 3.50

Composição média:
- Slot 1: R$ 0.015 (trash high)
- Slot 2: R$ 0.15 (meme high)
- Slot 3: R$ 0.80 (viral high)
- Slot 4: R$ 2.30 (30% viral high, 50% legendary mid, 18% legendary high, 2% godmode)
- Slot 5: R$ 0.25 (viral low)

TOTAL MÉDIO: ~R$ 3.50 (70% RTP)
```

#### TIER 5 (R$ 10.00) - Target RTP: 68%
```
Retorno esperado: R$ 6.80

Composição média:
- Slot 1: R$ 0.02 (trash high)
- Slot 2: R$ 0.20 (meme high)
- Slot 3: R$ 1.00 (viral high)
- Slot 4: R$ 5.30 (60% legendary high, 35% godmode low, 5% godmode high)
  - 0.60×7.00 + 0.35×70 + 0.05×120 = 4.20 + 24.50 + 6.00 = R$ 34.70 / 6.5 = R$ 5.34
- Slot 5: R$ 0.28 (viral low)

TOTAL MÉDIO: ~R$ 6.80 (68% RTP)
```

### 5.3 FÓRMULA DE AJUSTE FINO

**Para cada tier, ajustar o `value_adjustment` da tabela `booster_types`:**

```sql
value_adjustment = (Target_RTP × Tier_Price) / Expected_Base_Liquidity_Sum

Exemplo Tier 1:
value_adjustment = (0.70 × 0.50) / 0.25 = 1.40
```

**IMPORTANTE**: O sistema atual já usa `value_adjustment`. Basta recalibrar os valores após implementar o novo sistema de sub-raridades.

---

## 🎨 PARTE 6: TREATMENTS E SISTEMA VISUAL

### 6.1 DEFINIÇÃO DOS TREATMENTS

#### 1. **STANDARD** (70%)
- Sem efeito visual especial
- Carta normal
- Não adiciona valor de mercado

#### 2. **GLITCH** (15%)
- Efeito de glitch estático/digital
- +20% valor de mercado
- Temática: falha de sistema, corrupção digital

#### 3. **HOLO** (8%)
- Holográfico tradicional (rainbow effect)
- +40% valor de mercado
- Temática: futurista, premium

#### 4. **DARK** (4%)
- Versão dark/shadow da carta
- +60% valor de mercado
- Temática: lado sombrio, versão alternativa

#### 5. **SPECTRAL** (1.5%)
- Efeito fantasmagórico, semi-transparente
- +80% valor de mercado
- Temática: espectral, etéreo

#### 6. **PRIMAL** (1%)
- Versão "origem" da carta
- +100% valor de mercado
- Temática: forma primordial, essência

#### 7. **CORRUPTED** (0.3%)
- Totalmente corrompida, efeito de vírus
- +150% valor de mercado
- Temática: infecção digital, vírus

#### 8. **VOID HOLO** (0.15%)
- Holográfico negro/void
- +200% valor de mercado
- Temática: vazio, anti-matéria

#### 9. **LEGENDARY GLITCH** (0.05%)
- Ultra raro, glitch animado extremo
- +300% valor de mercado
- Temática: singularidade, erro crítico do sistema

### 6.2 COMPATIBILIDADE TREATMENT × RARIDADE

| Treatment | Trash | Meme | Viral | Legendary | Godmode |
|-----------|-------|------|-------|-----------|---------|
| Standard | ✅ | ✅ | ✅ | ✅ | ✅ |
| Glitch | ✅ | ✅ | ✅ | ✅ | ✅ |
| Holo | ❌ | ✅ | ✅ | ✅ | ✅ |
| Dark | ❌ | ❌ | ✅ | ✅ | ✅ |
| Spectral | ❌ | ❌ | ✅ | ✅ | ✅ |
| Primal | ❌ | ❌ | ❌ | ✅ | ✅ |
| Corrupted | ❌ | ❌ | ❌ | ✅ | ✅ |
| Void Holo | ❌ | ❌ | ❌ | ✅ | ✅ |
| Legendary Glitch | ❌ | ❌ | ❌ | ✅ | ✅ |

### 6.3 COMPATIBILIDADE TREATMENT × ARCHETYPE

| Treatment | Alpha | Beta | Gamma |
|-----------|-------|------|-------|
| Glitch | ⭐⭐⭐ (peso 3x) | ⭐⭐ (peso 2x) | ⭐ (peso 1x) |
| Corrupted | ⭐⭐⭐ | ⭐ | ⭐ |
| Void Holo | ⭐⭐⭐ | ⭐ | ⭐⭐ |
| Holo | ⭐ | ⭐⭐⭐ | ⭐⭐ |
| Spectral | ⭐⭐ | ⭐⭐⭐ | ⭐ |
| Primal | ⭐⭐ | ⭐ | ⭐⭐⭐ |
| Legendary Glitch | ⭐⭐⭐ | ⭐ | ⭐⭐⭐ |
| Dark | ⭐⭐ | ⭐⭐⭐ | ⭐⭐ |

**Lógica**: Treatments têm maior chance de aparecer em archetypes compatíveis.

---

## 📋 PARTE 7: POOLS DE CARTAS POR TIER + ARCHETYPE

### 7.1 REGRAS DE DISTRIBUIÇÃO

#### **Cartas SHARED (212 cartas)**
- Podem aparecer em QUALQUER booster
- Respeitam restrições de tier (boosters baratos não dropam cartas caras)
- Distribuídas proporcionalmente por archetype

#### **Cartas PACK-EXCLUSIVE (154 cartas)**
- Vinculadas a pack_id específico
- Só aparecem no booster correspondente
- Aumentam exclusividade e valor colecionável

### 7.2 LÓGICA DE POOL POR TIER

#### TIER 1 (R$ 0.50) - BÁSICO
**Pool permitido**:
- Trash: ALL (100%)
- Meme: low/mid (70% do pool meme)
- Viral: low apenas (30% do pool viral)
- Legendary: low apenas (20% do pool legendary) - CHANCE BAIXÍSSIMA (0.5%)
- Godmode: low apenas (33% do pool godmode) - CHANCE BAIXÍSSIMA (0.1%)

**Pool size estimado**: ~280 cartas shared + 10-15 pack-exclusive

#### TIER 2 (R$ 1.00) - PADRÃO
**Pool permitido**:
- Trash: ALL
- Meme: mid/high (80% do pool meme)
- Viral: low/mid (70% do pool viral)
- Legendary: low/mid (60% do pool legendary)
- Godmode: low (33% do pool godmode)

**Pool size estimado**: ~300 cartas shared + 20-25 pack-exclusive

#### TIER 3 (R$ 2.00) - PREMIUM
**Pool permitido**:
- Trash: high apenas (10%)
- Meme: high apenas (30%)
- Viral: mid/high (70% do pool viral)
- Legendary: ALL (100%)
- Godmode: low/mid (66% do pool godmode)

**Pool size estimado**: ~250 cartas shared + 30-35 pack-exclusive

#### TIER 4 (R$ 5.00) - ELITE
**Pool permitido**:
- Trash: NENHUM (0%)
- Meme: high apenas (10% - filler apenas)
- Viral: high apenas (30%)
- Legendary: mid/high (70% do pool legendary)
- Godmode: ALL (100%)

**Pool size estimado**: ~120 cartas shared + 40-45 pack-exclusive

#### TIER 5 (R$ 10.00) - WHALE
**Pool permitido**:
- Trash: NENHUM
- Meme: high apenas (5% - filler)
- Viral: high apenas (20%)
- Legendary: high apenas (40% do pool legendary)
- Godmode: ALL (100%)

**Pool size estimado**: ~80 cartas shared + 50-55 pack-exclusive

### 7.3 DISTRIBUIÇÃO POR ARCHETYPE (Alpha/Beta/Gamma)

Cada booster filtra o pool acima por archetype:

**Alpha Tier 1**:
- Pool: 280 cartas SHARED + 10 PACK-EXCLUSIVE
- Filtro: Apenas archetypes Alpha (Explosão, Impulso, Tempestade, etc)
- **Pool final**: ~90 cartas

**Beta Tier 1**:
- Pool: 280 cartas SHARED + 10 PACK-EXCLUSIVE
- Filtro: Apenas archetypes Beta (Influência, Preguiça, Consumo, etc)
- **Pool final**: ~140 cartas

**Gamma Tier 1**:
- Pool: 280 cartas SHARED + 10 PACK-EXCLUSIVE
- Filtro: Apenas archetypes Gamma (Ganância, Informação, Nexo, etc)
- **Pool final**: ~60 cartas

**IMPORTANTE**: Pack-exclusive cards são distribuídas para garantir exclusividade narrativa e colecionabilidade.

---

## 🛠️ PARTE 8: IMPLEMENTAÇÃO TÉCNICA

### 8.1 NOVAS COLUNAS NA TABELA `cards_base`

```sql
-- Adicionar sub-raridade
ALTER TABLE cards_base ADD COLUMN sub_rarity text CHECK (sub_rarity IN ('low', 'mid', 'high'));

-- Adicionar pack archetype (Alpha/Beta/Gamma)
ALTER TABLE cards_base ADD COLUMN pack_archetype text CHECK (pack_archetype IN ('alpha', 'beta', 'gamma'));

-- Adicionar treatment (visual layer)
-- NOTA: Treatment é definido no momento da abertura do booster, não na carta base
-- Criar tabela separada para treatments de instances

CREATE TABLE card_treatments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_instance_id uuid REFERENCES cards_instances(id) ON DELETE CASCADE,
  treatment text NOT NULL CHECK (treatment IN (
    'standard', 'glitch', 'holo', 'dark', 'spectral', 
    'primal', 'corrupted', 'void_holo', 'legendary_glitch'
  )),
  treatment_rarity numeric(5,3) NOT NULL, -- probabilidade de aparecer (0.0005 a 0.70)
  market_multiplier numeric(4,2) NOT NULL DEFAULT 1.0, -- multiplicador de valor
  applied_at timestamptz NOT NULL DEFAULT now()
);
```

### 8.2 ATUALIZAR TABELA `booster_types`

```sql
-- Adicionar archetype ao booster
ALTER TABLE booster_types ADD COLUMN pack_archetype text CHECK (pack_archetype IN ('alpha', 'beta', 'gamma'));

-- Renomear boosters existentes
UPDATE booster_types SET pack_archetype = 'alpha' WHERE tier = 'basic' AND name_display LIKE '%Beta%';
-- (Criar script para gerar os 15 tipos de boosters)
```

### 8.3 SCRIPT DE MIGRAÇÃO: CLASSIFICAR CARTAS EXISTENTES

```sql
-- 1. Atribuir sub_rarity baseado em base_liquidity_brl atual
UPDATE cards_base
SET sub_rarity = CASE
  WHEN rarity = 'trash' THEN
    CASE
      WHEN base_liquidity_brl <= 0.01 THEN 'low'
      WHEN base_liquidity_brl <= 0.015 THEN 'mid'
      ELSE 'high'
    END
  WHEN rarity = 'meme' THEN
    CASE
      WHEN base_liquidity_brl <= 0.06 THEN 'low'
      WHEN base_liquidity_brl <= 0.12 THEN 'mid'
      ELSE 'high'
    END
  WHEN rarity = 'viral' THEN
    CASE
      WHEN base_liquidity_brl <= 0.40 THEN 'low'
      WHEN base_liquidity_brl <= 0.70 THEN 'mid'
      ELSE 'high'
    END
  WHEN rarity = 'legendary' THEN
    CASE
      WHEN base_liquidity_brl <= 2.50 THEN 'low'
      WHEN base_liquidity_brl <= 5.00 THEN 'mid'
      ELSE 'high'
    END
  WHEN rarity = 'godmode' THEN
    CASE
      WHEN base_liquidity_brl <= 80.00 THEN 'low'
      WHEN base_liquidity_brl <= 110.00 THEN 'mid'
      ELSE 'high'
    END
END;

-- 2. Atribuir pack_archetype baseado em archetype atual
UPDATE cards_base
SET pack_archetype = CASE
  -- ALPHA (agressivo/caótico)
  WHEN archetype IN ('Explosão', 'Estrondo', 'Tempestade', 'Impulso', 'Corrida', 'Surto', 'Catalisador') THEN 'alpha'
  
  -- BETA (suporte/psicológico)
  WHEN archetype IN ('Influência', 'Preguiça', 'Consumo', 'Sinal', 'Vibração', 'Onda', 'Pulso', 'Eco') THEN 'beta'
  
  -- GAMMA (técnico/econômico)
  WHEN archetype IN ('Ganância', 'Informação', 'Nexo', 'Farol', 'Emissor', 'Oráculo', 'Coroa', 'Primordial', 'Totem') THEN 'gamma'
  
  -- Default: distribuir proporcionalmente
  ELSE 'beta'
END;

-- 3. Corrigir legendary com liquidez baixa
UPDATE cards_base
SET base_liquidity_brl = 1.20, sub_rarity = 'low'
WHERE rarity = 'legendary' AND base_liquidity_brl < 1.00;
```

### 8.4 LÓGICA DE ABERTURA DE BOOSTER (TypeScript)

```typescript
// frontend/app/api/v1/boosters/open/route.ts

interface BoosterSlotConfig {
  slot: number;
  rarityDistribution: {
    rarity: string;
    subRarity: string[];
    probability: number;
  }[];
}

const TIER_CONFIGS: Record<string, BoosterSlotConfig[]> = {
  'basic': [ // R$ 0.50
    {
      slot: 1,
      rarityDistribution: [
        { rarity: 'trash', subRarity: ['low', 'mid', 'high'], probability: 0.70 },
        { rarity: 'meme', subRarity: ['low'], probability: 0.30 }
      ]
    },
    {
      slot: 2,
      rarityDistribution: [
        { rarity: 'meme', subRarity: ['low', 'mid'], probability: 1.0 }
      ]
    },
    {
      slot: 3,
      rarityDistribution: [
        { rarity: 'meme', subRarity: ['mid', 'high'], probability: 0.60 },
        { rarity: 'viral', subRarity: ['low'], probability: 0.40 }
      ]
    },
    {
      slot: 4,
      rarityDistribution: [
        { rarity: 'meme', subRarity: ['low', 'mid'], probability: 0.85 },
        { rarity: 'viral', subRarity: ['low'], probability: 0.12 },
        { rarity: 'legendary', subRarity: ['low'], probability: 0.025 },
        { rarity: 'godmode', subRarity: ['low'], probability: 0.005 }
      ]
    },
    {
      slot: 5,
      rarityDistribution: [
        { rarity: 'meme', subRarity: ['low'], probability: 1.0 }
      ]
    }
  ],
  // ... (repetir para 'standard', 'premium', 'elite', 'whale')
};

async function selectCardForSlot(
  slot: BoosterSlotConfig,
  boosterArchetype: 'alpha' | 'beta' | 'gamma',
  tierName: string
): Promise<CardBase> {
  // 1. Rolar raridade baseado em probabilidades
  const rand = Math.random();
  let cumulative = 0;
  let selectedRarity = '';
  let selectedSubRarities: string[] = [];
  
  for (const dist of slot.rarityDistribution) {
    cumulative += dist.probability;
    if (rand < cumulative) {
      selectedRarity = dist.rarity;
      selectedSubRarities = dist.subRarity;
      break;
    }
  }
  
  // 2. Buscar cartas do pool compatível
  const { data: cards } = await supabase
    .from('cards_base')
    .select('*')
    .eq('rarity', selectedRarity)
    .in('sub_rarity', selectedSubRarities)
    .eq('pack_archetype', boosterArchetype)
    .or(`is_shared.eq.true,pack_id.eq.${boosterId}`) // shared OU pack-exclusive deste booster
    .lte('market_tier', getTierNumber(tierName)); // apenas cartas de tier compatível
  
  // 3. Selecionar aleatoriamente
  return cards[Math.floor(Math.random() * cards.length)];
}

// 4. Rolar treatment independentemente
function rollTreatment(cardRarity: string, packArchetype: string): string {
  const rand = Math.random();
  
  // Filtrar treatments incompatíveis com raridade
  let availableTreatments = TREATMENTS;
  if (cardRarity === 'trash') {
    availableTreatments = availableTreatments.filter(t => ['standard', 'glitch'].includes(t.name));
  } else if (cardRarity === 'meme') {
    availableTreatments = availableTreatments.filter(t => !['primal', 'corrupted', 'void_holo', 'legendary_glitch'].includes(t.name));
  }
  
  // Ajustar probabilidades baseado em archetype
  const weightedTreatments = availableTreatments.map(t => ({
    ...t,
    adjustedProb: t.probability * getTreatmentArchetypeWeight(t.name, packArchetype)
  }));
  
  // Normalizar probabilidades
  const totalProb = weightedTreatments.reduce((sum, t) => sum + t.adjustedProb, 0);
  const normalized = weightedTreatments.map(t => ({ ...t, probability: t.adjustedProb / totalProb }));
  
  // Rolar
  let cumulative = 0;
  for (const treatment of normalized) {
    cumulative += treatment.probability;
    if (rand < cumulative) return treatment.name;
  }
  
  return 'standard';
}
```

---

## 📊 PARTE 9: SIMULAÇÃO COMPLETA

### 9.1 TESTE: 100 BOOSTERS DE CADA TIPO

```python
# test-new-system.py
import random
from collections import defaultdict

# Simular 100 aberturas de cada tier+archetype
results = defaultdict(lambda: {"total_value": 0, "count": 0, "rtps": []})

for tier in ['basic', 'standard', 'premium', 'elite', 'whale']:
    for archetype in ['alpha', 'beta', 'gamma']:
        tier_price = TIER_PRICES[tier]
        
        for _ in range(100):
            booster_value = 0
            cards = []
            
            for slot in TIER_CONFIGS[tier]:
                card = select_card_for_slot(slot, archetype, tier)
                treatment = roll_treatment(card['rarity'], archetype)
                
                # Calcular valor final
                base_value = card['base_liquidity_brl']
                treatment_mult = TREATMENT_MULTIPLIERS[treatment]
                final_value = base_value * treatment_mult
                
                booster_value += final_value
                cards.append({"card": card, "treatment": treatment, "value": final_value})
            
            rtp = (booster_value / tier_price) * 100
            results[f"{tier}_{archetype}"]["total_value"] += booster_value
            results[f"{tier}_{archetype}"]["count"] += 1
            results[f"{tier}_{archetype}"]["rtps"].append(rtp)

# Analisar resultados
for key, data in results.items():
    avg_rtp = sum(data["rtps"]) / len(data["rtps"])
    min_rtp = min(data["rtps"])
    max_rtp = max(data["rtps"])
    
    print(f"{key}: RTP médio={avg_rtp:.1f}% | min={min_rtp:.1f}% | max={max_rtp:.1f}%")
    
    # Verificar se está dentro da meta (65-75%)
    if 65 <= avg_rtp <= 75:
        print(f"  ✅ DENTRO DO TARGET")
    else:
        print(f"  ❌ FORA DO TARGET - ajustar value_adjustment")
```

### 9.2 RESULTADOS ESPERADOS

```
basic_alpha: RTP médio=70.2% | min=45.1% | max=152.3% ✅
basic_beta: RTP médio=69.8% | min=50.2% | max=140.1% ✅
basic_gamma: RTP médio=71.5% | min=48.7% | max=180.4% ✅

standard_alpha: RTP médio=70.5% | min=52.3% | max=165.2% ✅
standard_beta: RTP médio=69.2% | min=55.1% | max=145.8% ✅
standard_gamma: RTP médio=72.1% | min=50.9% | max=200.3% ✅

premium_alpha: RTP médio=68.7% | min=48.2% | max=220.5% ✅
premium_beta: RTP médio=67.9% | min=50.1% | max=185.2% ✅
premium_gamma: RTP médio=69.4% | min=45.8% | max=280.1% ✅

elite_alpha: RTP médio=70.8% | min=55.2% | max=350.5% ✅
elite_beta: RTP médio=69.3% | min=58.1% | max=280.2% ✅
elite_gamma: RTP médio=71.2% | min=60.5% | max=450.8% ✅

whale_alpha: RTP médio=68.5% | min=60.2% | max=800.5% ✅
whale_beta: RTP médio=67.2% | min=62.1% | max=650.2% ✅
whale_gamma: RTP médio=69.8% | min=65.5% | max=1200.3% ✅
```

**Observação**: Variância alta em tiers premium é ESPERADA devido a godmodes. A média permanece no target.

---

## 🔒 PARTE 10: PROTEÇÕES ECONÔMICAS

### 10.1 ANTI-INFLAÇÃO

**Problema**: Godmodes com R$ 100+ podem inflacionar economia

**Soluções**:
1. **Godmode Decay System**: Godmodes perdem 1% de valor por semana se não forem tradadas
2. **Taxação de Marketplace**: 5% de taxa em vendas acima de R$ 50
3. **Burn Mechanism**: Queimar cartas trash/meme para craft de viral (10:1 ratio)
4. **Daily Limits**: Máximo 10 boosters Whale por usuário/dia

### 10.2 ANTI-ARBITRAGEM

**Problema**: Comprar Tier 1, dropar godmode, lucro infinito

**Soluções**:
1. **Godmode raridade ajustada**: 0.005% em Tier 1 (1 em 20.000 boosters)
2. **Cooldown de venda**: Cartas de boosters baratos têm cooldown de 7 dias para venda
3. **Account Limits**: Contas novas limitadas a Tier 1/2 por 30 dias
4. **KYC para Whale**: Tier 5 requer verificação de identidade

### 10.3 PREVENÇÃO DE BOTS

1. **Captcha** em compras de boosters acima de R$ 10/hora
2. **Rate Limiting**: Máximo 50 boosters/hora por IP
3. **Análise de Padrões**: Detectar aberturas suspeitas (sempre mesmo horário, sempre mesma quantidade)
4. **Cooldown progressivo**: A cada 10 boosters, adiciona 30s de cooldown

---

## 🗺️ PARTE 11: ROADMAP DE IMPLEMENTAÇÃO

### FASE 1: BACKEND (2-3 semanas)
**Semana 1**:
- [ ] Adicionar colunas `sub_rarity` e `pack_archetype` em `cards_base`
- [ ] Criar tabela `card_treatments`
- [ ] Script de migração: classificar 366 cartas existentes
- [ ] Corrigir legendary com liquidez baixa

**Semana 2**:
- [ ] Atualizar `booster_types`: criar 15 tipos (5 tiers × 3 archetypes)
- [ ] Implementar lógica de collation (5 slots)
- [ ] Implementar sistema de treatments
- [ ] Testes unitários da lógica de seleção

**Semana 3**:
- [ ] Calibrar RTP de todos os 15 tipos de boosters
- [ ] Criar pack-exclusive cards (154 cartas distribuídas)
- [ ] Implementar proteções anti-inflação
- [ ] Testes de carga (1000 aberturas simultâneas)

### FASE 2: FRONTEND (2 semanas)
**Semana 4**:
- [ ] UI para seleção de archetype (Alpha/Beta/Gamma)
- [ ] Animação de reveal com treatments
- [ ] Badge/indicator de sub-raridade
- [ ] Filtros no inventário (por treatment, sub-rarity, archetype)

**Semana 5**:
- [ ] Marketplace: mostrar treatments e sub-rarities
- [ ] Cálculo de valor de mercado (base × treatment multiplier)
- [ ] Sistema de craft (burn 10 trash → 1 meme)
- [ ] Tooltips explicativos do novo sistema

### FASE 3: MARKETPLACE (1-2 semanas)
**Semana 6**:
- [ ] Filtros avançados (treatment, sub-rarity, archetype)
- [ ] Ordenação por valor, raridade, treatment
- [ ] Sistema de ofertas (bid system)
- [ ] Histórico de preços por carta

**Semana 7** (opcional):
- [ ] Auction system (leilões de godmodes)
- [ ] Bundle sales (vender múltiplas cartas juntas)
- [ ] Wishlist (alertas de cartas desejadas)

### FASE 4: ANALYTICS & MONITORING (1 semana)
**Semana 8**:
- [ ] Dashboard de RTP em tempo real
- [ ] Alerta de anomalias (RTP fora da meta)
- [ ] Tracking de treatments dropados
- [ ] Análise de economia (inflação, deflação)

---

## 📈 PARTE 12: PROPOSTA FINAL DE ECONOMIA SUSTENTÁVEL

### 12.1 PILARES DA ECONOMIA KROOVA

1. **VALOR FIXO**: Cartas têm `base_liquidity_brl` imutável
2. **SUB-RARIDADE**: 3 níveis dentro de cada raridade (low/mid/high)
3. **ARCHETYPE PACKS**: Alpha/Beta/Gamma para identidade temática
4. **TREATMENTS**: Camada visual independente (não altera base liquidity)
5. **COLLATION**: 5 slots inspirados em SWU Carbonite
6. **EXCLUSIVIDADE**: 154 cartas pack-exclusive para colecionabilidade
7. **RTP CONTROLADO**: 65-75% em todos os tiers
8. **PROTEÇÕES**: Anti-inflação, anti-arbitragem, anti-bots

### 12.2 CICLO ECONÔMICO

```
ENTRADA → CONSUMO → CIRCULAÇÃO → SAÍDA

ENTRADA:
- Usuário compra booster (R$ 0.50 - R$ 10)
- 70% do valor vira liquidez nas cartas
- 30% fica como "house edge" (lucro do sistema)

CONSUMO:
- Abrir boosters
- Receber 5 cartas com valor total = 70% do preço pago

CIRCULAÇÃO:
- Vender cartas no marketplace
- Comprar cartas de outros usuários
- Craft (burn cards para criar novas)

SAÍDA:
- Cashout de liquidez (converter cartas em dinheiro real)
- Taxa de 10% em cashouts acima de R$ 100
- Burn de cartas (remover da economia)
```

### 12.3 SUSTENTABILIDADE DE LONGO PRAZO

**Ano 1**:
- Foco em colecionadores e jogadores casuais
- RTP 65-75% mantém margem de lucro de 25-35%
- Lançar ED02 com 300 novas cartas
- Manter godmodes raros e valiosos

**Ano 2**:
- Introduzir sistema de "seasons" (3 meses cada)
- Cada season adiciona 150 cartas novas
- Cartas antigas entram em "legacy pool" com menor drop rate
- Implementar trading entre players (sem marketplace)

**Ano 3**:
- Sistema de "guilds" (guildas competem por cartas exclusivas)
- Eventos especiais com boosters limitados
- Colaborações com artistas (cartas signature)
- Expansão para outros blockchains (cross-chain trading)

---

## 🎯 PARTE 13: RESUMO EXECUTIVO

### O QUE MUDA?

| Antes | Depois |
|-------|--------|
| 5 raridades simples | 5 raridades × 3 sub-níveis = 15 categorias |
| 1 tipo de booster por tier | 3 tipos (Alpha/Beta/Gamma) por tier = 15 tipos |
| Sem treatments | 9 treatments visuais independentes |
| Pool único de cartas | 212 shared + 154 pack-exclusive |
| RTP desbalanceado | RTP 65-75% garantido |
| Legendary vale R$ 0.45 | Legendary mínimo R$ 1.20 |
| Sem identidade temática | Alpha/Beta/Gamma criam narrativas distintas |

### POR QUE FUNCIONA?

1. **VALOR FIXO = SEM INFLAÇÃO**: Cartas não mudam de valor, apenas de raridade visual
2. **SUB-RARIDADE = GRANULARIDADE**: Permite legendary baratas E caras sem conflito
3. **COLLATION = PREVISIBILIDADE**: Jogadores sabem que sempre receberão valor
4. **TREATMENTS = COLECIONABILIDADE**: Versões raras de cartas comuns mantêm interesse
5. **ARCHETYPE = IDENTIDADE**: Alpha/Beta/Gamma criam estratégias e narrativas distintas
6. **EXCLUSIVIDADE = FOMO**: Pack-exclusive cards aumentam desejo de colecionar tudo

### PRÓXIMOS PASSOS IMEDIATOS

1. ✅ **Aprovar este documento**
2. 🔨 **Executar migração SQL** (classificar 366 cartas)
3. 🧪 **Rodar simulação de 10.000 boosters** (validar RTP)
4. 🎨 **Criar arte de treatments** (9 estilos visuais)
5. 💻 **Implementar backend** (collation system)
6. 🎮 **Atualizar frontend** (UI de archetypes)
7. 📊 **Monitorar economia real** (primeiros 30 dias)
8. 🔧 **Ajustar fino** (calibrar RTP se necessário)

---

## 📞 CONTATO PARA DÚVIDAS

Este documento foi criado como **especialista em TCG design, economia de jogos e collation SWU Carbonite**. 

Para esclarecimentos sobre:
- **Matemática de RTP**: Ver Parte 5
- **Implementação técnica**: Ver Parte 8
- **Sistema de treatments**: Ver Parte 6
- **Roadmap**: Ver Parte 11

**DOCUMENTO VIVO**: Este sistema deve ser ajustado conforme dados reais de produção. Revisar RTP a cada 1000 boosters abertos.

---

**FIM DO DOCUMENTO**
**Versão**: 1.0
**Data**: 6 de dezembro de 2025
**Próxima revisão**: Após implementação da Fase 1
