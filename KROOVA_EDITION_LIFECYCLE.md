# 🔄 KROOVA EDITION LIFECYCLE MANAGEMENT
**Sistema de Gestão de Edições: Lançamento, Operação e Sunset**

---

## 📋 **ÍNDICE**

1. [Filosofia de Edições](#filosofia)
2. [Ciclo de Vida de uma Edição](#ciclo-de-vida)
3. [Premiação Máxima e Escalabilidade](#premiacao)
4. [Sistema de Rotação](#rotacao)
5. [Melhores Práticas (desde ED01)](#best-practices)
6. [Estrutura SQL por Edição](#sql)
7. [Roadmap de Edições Futuras](#roadmap)

---

<a name="filosofia"></a>
## 🎯 **1. FILOSOFIA DE EDIÇÕES**

### **Cada edição é uma "temporada econômica fechada"**

```
EDIÇÃO = Tema + Economia + Liquidez + Cartas + Duração
```

#### **Princípios:**

✅ **Economia Isolada**: Cada edição tem seus próprios valores de liquidez  
✅ **Imutabilidade**: Valores não mudam durante a vida da edição  
✅ **Escalabilidade**: Novas edições podem ter prêmios maiores  
✅ **Transparência**: Matemática clara e auditável  
✅ **Sustentabilidade**: Hard caps impedem colapso econômico  

### **Por que esse modelo?**

| Problema | Solução com Edições |
|----------|---------------------|
| **Inflação descontrolada** | Cada edição redefine valores base |
| **Power creep** | Cartas antigas mantêm valor histórico |
| **Monotonia** | Novos temas/mecânicas a cada 3-6 meses |
| **Legal/compliance** | Transparência por edição facilita auditoria |
| **Sustentabilidade** | Hard caps por edição previnem colapso |

---

<a name="ciclo-de-vida"></a>
## 🔄 **2. CICLO DE VIDA DE UMA EDIÇÃO**

### **Fases:**

```
1. DESIGN (2-4 semanas)
   ↓
2. PRE-LAUNCH (1-2 semanas)
   ↓
3. ACTIVE (3-6 meses) ← Fase principal
   ↓
4. WINDING DOWN (2-4 semanas)
   ↓
5. LEGACY (indefinido)
```

---

### **FASE 1: DESIGN** 🎨

**Objetivo:** Definir tema, economia e cartas

**Checklist:**
- [ ] Tema narrativo (ex: ED01 "Colapso da Interface")
- [ ] 250 cartas criadas (arte + lore + atributos)
- [ ] Valores de liquidez definidos (trash → épica)
- [ ] Skin multipliers confirmados
- [ ] Godmode probability calculada
- [ ] RTP target definido (20-40%)
- [ ] Hard cap estabelecido (15% receita)
- [ ] Premiação máxima calculada
- [ ] Simulações rodadas (10.000+ boosters)

**Outputs:**
```
- KROOVA_EDITION_XX.md (especificação)
- EDXX_250_CARDS.csv (dados)
- edition_config.json (parâmetros técnicos)
- simulation_report.md (validação matemática)
```

---

### **FASE 2: PRE-LAUNCH** 🚀

**Objetivo:** Deploy técnico e marketing

**Checklist Técnico:**
- [ ] SQL migration executada
- [ ] Seeds inseridos (250 cartas)
- [ ] Booster types criados (5 packs)
- [ ] APIs testadas (compra + abertura)
- [ ] RLS policies validadas
- [ ] Monitoring configurado
- [ ] Hard cap alert ativo

**Checklist Marketing:**
- [ ] Landing page da edição
- [ ] Teaser trailer (30s)
- [ ] Press kit (imagens + lore)
- [ ] Influencers onboarding
- [ ] Launch event planejado

**Duração:** 1-2 semanas

---

### **FASE 3: ACTIVE** ⚡ (PRINCIPAL)

**Objetivo:** Operação plena da edição

**Duração:** 3-6 meses

**Características:**
- ✅ Boosters disponíveis para compra
- ✅ Marketplace ativo (P2P trading)
- ✅ Reciclagem habilitada
- ✅ Eventos temáticos semanais
- ✅ Drops de cartas especiais

**Monitoring Contínuo:**

```typescript
interface EditionHealthMetrics {
  // Vendas
  total_boosters_sold: number;
  daily_revenue: number;
  conversion_rate: number;
  
  // Economia
  current_rtp: number;           // Meta: 20-40%
  jackpot_payout_pct: number;    // Hard cap: 15%
  marketplace_volume: number;
  recycle_rate: number;          // Esperado: 99%
  
  // Alertas
  cap_proximity: number;         // % até hard cap
  deviation_alerts: number;      // Desvios estatísticos
  fraud_flags: number;
}
```

**Alertas Críticos:**

| Alerta | Threshold | Ação |
|--------|-----------|------|
| **Jackpot Cap** | 12% receita | Reduzir prob. Godmode para 0.5% |
| **Jackpot Cap** | 15% receita | Pausar Godmode completamente |
| **RTP Deviation** | >45% | Investigar bugs no algoritmo |
| **Fraud Spike** | +200% usual | Pausar compras temporariamente |

---

### **FASE 4: WINDING DOWN** 🌅

**Objetivo:** Transição suave para próxima edição

**Duração:** 2-4 semanas

**Ações:**
- ⚠️ Anúncio oficial: "ED01 encerra em X dias"
- 📢 Marketing da próxima edição (ED02)
- 🎁 Evento de despedida (bonus boosters)
- 💰 Last chance sale (desconto 20%)
- 🔒 Cutoff date definido

**Comunicação:**
```
📢 "ED01 COLAPSO DA INTERFACE encerra dia 30/04/2026"

✅ Suas cartas ED01 permanecem no inventário
✅ Marketplace ED01 continua ativo (legacy)
✅ Reciclagem ED01 mantém valores originais
✅ Boosters ED01 param de ser vendidos

🔥 ED02 "SURGE DA ESPECULAÇÃO" lança dia 01/05/2026
💎 Novos prêmios: até R$ 500!
```

---

### **FASE 5: LEGACY** 🏛️

**Objetivo:** Preservar valor histórico

**Duração:** Indefinido

**Status:**
- ❌ Boosters não podem mais ser comprados
- ✅ Cartas permanecem no inventário
- ✅ Marketplace continua ativo (P2P)
- ✅ Reciclagem mantém valores originais
- ✅ Cartas podem ser usadas no jogo (se houver)

**Preservação de Valor:**

```typescript
// Valores de liquidez ED01 são IMUTÁVEIS
const ED01_LIQUIDITY_LOCKED = {
  trash: 0.01,
  meme: 0.05,
  viral: 0.20,
  legendary: 1.00,
  epica: 2.00,
  // Nunca mudam, mesmo em 2030
};

// Skins ED01 também travados
const ED01_SKIN_MULTIPLIERS_LOCKED = {
  default: 1.0, neon: 1.5, glow: 2.0,
  glitch: 3.0, ghost: 4.0, holo: 6.0, dark: 10.0
};
```

**Benefícios:**
- 💎 Colecionadores mantêm valor
- 📈 Cartas raras podem valorizar no marketplace
- 🎮 Compatibilidade com futuras mecânicas de jogo
- 📚 Valor histórico/nostálgico

---

<a name="premiacao"></a>
## 🏆 **3. PREMIAÇÃO MÁXIMA E ESCALABILIDADE**

### **Sistema Progressivo de Prêmios:**

| Edição | Lançamento | Liquidez Épica | Skin Dark | Godmode | **Prêmio Max** |
|--------|------------|----------------|-----------|---------|----------------|
| **ED01** | Mar/2026 | R$ 2.00 | 10x | 10x | **R$ 200** |
| **ED02** | Set/2026 | R$ 5.00 | 10x | 10x | **R$ 500** |
| **ED03** | Mar/2027 | R$ 10.00 | 10x | 10x | **R$ 1.000** |
| **ED04** | Set/2027 | R$ 20.00 | 12x | 10x | **R$ 2.400** |
| **ED05** | Mar/2028 | R$ 50.00 | 15x | 10x | **R$ 7.500** |

### **Razões para Escalada:**

✅ **Inflação**: Valores acompanham economia real  
✅ **Hype**: Prêmios maiores geram mais FOMO  
✅ **Base instalada**: Mais usuários = mais receita = suporta prêmios maiores  
✅ **Competição**: Manter KROOVA competitiva vs outros jogos  
✅ **Retention**: Usuários antigos querem novos desafios  

### **Como Manter Sustentabilidade:**

```typescript
// Hard cap SEMPRE 15% da receita, independente da edição
const JACKPOT_CAP = 0.15;

// Exemplo ED05 (prêmio R$ 7.500):
// Se vendermos 100.000 boosters × R$ 0.50 = R$ 50.000
// Hard cap = R$ 7.500 (15%)
// Probabilidade Épica/Dark/Godmode: 0.000002%
// Ocorrências esperadas: 0.002 (praticamente zero)
// Se sair 1 carta: R$ 7.500 (exatamente no cap)
// Se sair 2 cartas: sistema bloqueia a 2ª (já atingiu 15%)
```

**Sistema de Proteção:**

```typescript
function canAwardGodmode(editionId: string): boolean {
  const edition = getEditionStats(editionId);
  const currentPayout = edition.jackpots_paid.total_value;
  const totalRevenue = edition.total_revenue;
  
  const payoutPct = currentPayout / totalRevenue;
  
  if (payoutPct >= 0.15) {
    // Hard cap atingido
    logAlert('JACKPOT_CAP_REACHED', { editionId, payoutPct });
    return false; // Bloqueia Godmode
  }
  
  if (payoutPct >= 0.12) {
    // Proximidade do cap: reduz probabilidade
    GODMODE_PROBABILITY = 0.005; // Metade (0.5%)
    logWarning('JACKPOT_CAP_PROXIMITY', { editionId, payoutPct });
  }
  
  return true;
}
```

---

<a name="rotacao"></a>
## 🔄 **4. SISTEMA DE ROTAÇÃO**

### **Rotação Padrão: 2 edições por ano**

```
Q1-Q2: ED01 (Jan-Jun)
Q3-Q4: ED02 (Jul-Dez)
Q1-Q2: ED03 (Jan-Jun)
...
```

### **Overlap Permitido (2-4 semanas):**

```
ED01 Active: |████████████████████|
ED02 Active:               |████████████████████|
             Jan            Jun              Dez

Overlap:                   |▓▓|
                        (2 semanas)
```

**Durante Overlap:**
- ✅ Ambas edições disponíveis
- ✅ Usuário escolhe qual comprar
- ✅ Desconto 20% na edição antiga
- ✅ Bonus na edição nova (+10% cartas)

### **Modelo Multi-Edição Ativo (alternativo):**

```
ED01 Legacy: |░░░░░░░░░░░░░░░░░░░░░░░░░░░░░|
ED02 Legacy:          |░░░░░░░░░░░░░░░░░░░|
ED03 Active:                   |████████████|
ED04 Pre-launch:                         |▒▒|

Legend:
█ Active (boosters à venda)
▒ Pre-launch (teaser)
░ Legacy (marketplace only)
```

**Vantagens:**
- 💰 Marketplace sempre ativo
- 📈 Cartas antigas podem valorizar
- 🎮 Meta de jogo mais complexo (mix de edições)
- 🔄 Reciclagem multi-edição (valores preservados)

---

<a name="best-practices"></a>
## ✅ **5. MELHORES PRÁTICAS (desde ED01)**

### **A. Estrutura de Dados Isolada**

```sql
-- Cada edição tem sua própria config
CREATE TABLE edition_configs (
  id TEXT PRIMARY KEY,                    -- 'ED01', 'ED02'...
  name TEXT NOT NULL,                     -- 'Colapso da Interface'
  launch_date TIMESTAMPTZ,
  sunset_date TIMESTAMPTZ,
  status TEXT NOT NULL,                   -- 'active', 'legacy', 'sunset'
  
  -- Economia (IMUTÁVEL após launch)
  base_liquidity JSONB NOT NULL,          -- {trash:0.01, meme:0.05, ...}
  skin_multipliers JSONB NOT NULL,        -- {default:1.0, neon:1.5, ...}
  godmode_multiplier DECIMAL NOT NULL,    -- 10
  godmode_probability DECIMAL NOT NULL,   -- 0.01
  
  -- Limites
  rtp_target DECIMAL NOT NULL,            -- 0.30 (30%)
  jackpot_hard_cap DECIMAL NOT NULL,      -- 0.15 (15%)
  
  -- Tracking
  total_boosters_sold INTEGER DEFAULT 0,
  total_revenue DECIMAL DEFAULT 0,
  total_jackpots_paid DECIMAL DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **B. Isolamento de Cartas**

```sql
-- cards_base sempre tem edition_id
CREATE INDEX idx_cards_base_edition ON cards_base(edition_id);

-- cards_instances herdam edição
CREATE INDEX idx_cards_instances_edition ON cards_instances(edition_id);

-- Queries sempre filtram por edição
SELECT * FROM cards_base WHERE edition_id = 'ED01';
```

### **C. Tracking Independente**

```sql
-- Métricas por edição
CREATE TABLE edition_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  edition_id TEXT NOT NULL REFERENCES edition_configs(id),
  date DATE NOT NULL,
  
  -- Vendas
  boosters_sold INTEGER,
  revenue DECIMAL,
  
  -- Economia
  current_rtp DECIMAL,
  jackpot_payout_pct DECIMAL,
  marketplace_volume DECIMAL,
  
  -- Distribuição
  cards_generated JSONB,              -- {trash: X, meme: Y, ...}
  skins_generated JSONB,              -- {default: X, neon: Y, ...}
  godmodes_awarded INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(edition_id, date)
);
```

### **D. Hard Cap Enforcement**

```typescript
async function openBooster(userId: string, boosterTypeId: string) {
  const boosterType = await getBoosterType(boosterTypeId);
  const edition = await getEditionConfig(boosterType.edition_id);
  
  // Verificar hard cap ANTES de gerar cartas
  const canAward = await canAwardGodmode(edition.id);
  
  const cards = [];
  for (let i = 0; i < totalCards; i++) {
    const rarity = selectRarity(distribution);
    const skin = selectSkin();
    
    // Se Godmode bloqueado, força raridade abaixo
    const isGodmode = canAward && (Math.random() < edition.godmode_probability);
    
    const card = await generateCard({
      rarity,
      skin,
      is_godmode: isGodmode,
      edition_id: edition.id
    });
    
    cards.push(card);
  }
  
  // Atualizar tracking
  await updateEditionMetrics(edition.id, {
    boosters_sold: +1,
    revenue: +boosterType.price_brl,
    jackpot_payout: cards.filter(c => c.is_godmode).reduce((sum, c) => sum + c.liquidity_brl, 0)
  });
  
  return cards;
}
```

### **E. Imutabilidade de Liquidez**

```typescript
// NUNCA fazer isso:
// ❌ UPDATE cards_base SET base_liquidity_brl = 0.05 WHERE edition_id = 'ED01' AND rarity = 'meme';

// Liquidez é definida UMA VEZ no launch:
// ✅ INSERT INTO edition_configs (id, base_liquidity) VALUES ('ED01', '{"meme":0.05}');

// Se precisar mudar: criar nova edição
// ✅ INSERT INTO edition_configs (id, base_liquidity) VALUES ('ED02', '{"meme":0.10}');
```

### **F. Comunicação Clara**

```typescript
// Sempre mostrar edição no frontend
<Card>
  <EditionBadge>ED01</EditionBadge>
  <CardName>Crocodile Trader</CardName>
  <Rarity>Legendary</Rarity>
  <Skin>Dark</Skin>
  <Liquidity edition="ED01">R$ 10.00</Liquidity>
  <EditionInfo>
    Valor garantido pela ED01 "Colapso da Interface"
    Liquidez imutável: nunca desvaloriza
  </EditionInfo>
</Card>
```

---

<a name="sql"></a>
## 🗄️ **6. ESTRUTURA SQL COMPLETA**

```sql
-- =====================================================
-- EDITION LIFECYCLE MANAGEMENT
-- =====================================================

-- 1. Tabela principal de edições
CREATE TABLE edition_configs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Datas
  launch_date TIMESTAMPTZ NOT NULL,
  sunset_date TIMESTAMPTZ,
  
  -- Status
  status TEXT NOT NULL CHECK (status IN ('design', 'pre-launch', 'active', 'winding-down', 'legacy')),
  
  -- Economia (imutável)
  base_liquidity JSONB NOT NULL,
  skin_multipliers JSONB NOT NULL,
  godmode_multiplier DECIMAL NOT NULL DEFAULT 10,
  godmode_probability DECIMAL NOT NULL DEFAULT 0.01,
  
  -- Targets
  rtp_target DECIMAL NOT NULL,
  jackpot_hard_cap DECIMAL NOT NULL DEFAULT 0.15,
  
  -- Tracking
  total_boosters_sold INTEGER DEFAULT 0,
  total_revenue DECIMAL DEFAULT 0,
  total_jackpots_paid DECIMAL DEFAULT 0,
  
  -- Metadata
  theme_colors JSONB,
  lore_summary TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Métricas diárias por edição
CREATE TABLE edition_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  edition_id TEXT NOT NULL REFERENCES edition_configs(id),
  date DATE NOT NULL,
  
  -- Vendas
  boosters_sold INTEGER DEFAULT 0,
  revenue DECIMAL DEFAULT 0,
  
  -- Economia
  current_rtp DECIMAL,
  jackpot_payout_pct DECIMAL,
  marketplace_volume DECIMAL DEFAULT 0,
  recycle_volume DECIMAL DEFAULT 0,
  
  -- Distribuição
  cards_generated JSONB,
  skins_generated JSONB,
  godmodes_awarded INTEGER DEFAULT 0,
  
  -- Alertas
  cap_alerts INTEGER DEFAULT 0,
  fraud_flags INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(edition_id, date)
);

CREATE INDEX idx_edition_metrics_edition_date ON edition_metrics(edition_id, date DESC);

-- 3. Eventos de edição
CREATE TABLE edition_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  edition_id TEXT NOT NULL REFERENCES edition_configs(id),
  event_type TEXT NOT NULL,  -- 'launch', 'sunset', 'cap_reached', 'bonus_event'
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_edition_events_edition ON edition_events(edition_id, created_at DESC);

-- 4. Atualizar booster_types para incluir edition_id (se ainda não tiver)
ALTER TABLE booster_types ADD COLUMN IF NOT EXISTS edition_id TEXT REFERENCES edition_configs(id);
CREATE INDEX IF NOT EXISTS idx_booster_types_edition ON booster_types(edition_id);

-- 5. Atualizar cards_base para incluir edition_id (se ainda não tiver)
ALTER TABLE cards_base ADD COLUMN IF NOT EXISTS edition_id TEXT REFERENCES edition_configs(id);
CREATE INDEX IF NOT EXISTS idx_cards_base_edition ON cards_base(edition_id);

-- 6. Atualizar cards_instances para herdar edition_id
ALTER TABLE cards_instances ADD COLUMN IF NOT EXISTS edition_id TEXT;
CREATE INDEX IF NOT EXISTS idx_cards_instances_edition ON cards_instances(edition_id);

-- 7. Função para atualizar métricas
CREATE OR REPLACE FUNCTION update_edition_metrics()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO edition_metrics (edition_id, date, boosters_sold, revenue)
  VALUES (
    (SELECT edition_id FROM booster_types WHERE id = NEW.booster_type_id),
    CURRENT_DATE,
    1,
    (SELECT price_brl FROM booster_types WHERE id = NEW.booster_type_id)
  )
  ON CONFLICT (edition_id, date) DO UPDATE SET
    boosters_sold = edition_metrics.boosters_sold + 1,
    revenue = edition_metrics.revenue + EXCLUDED.revenue;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_edition_metrics
AFTER INSERT ON booster_openings
FOR EACH ROW
EXECUTE FUNCTION update_edition_metrics();

-- 8. Função para verificar hard cap
CREATE OR REPLACE FUNCTION check_edition_hard_cap(p_edition_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_total_revenue DECIMAL;
  v_total_jackpots DECIMAL;
  v_hard_cap DECIMAL;
  v_payout_pct DECIMAL;
BEGIN
  SELECT 
    total_revenue,
    total_jackpots_paid,
    jackpot_hard_cap
  INTO 
    v_total_revenue,
    v_total_jackpots,
    v_hard_cap
  FROM edition_configs
  WHERE id = p_edition_id;
  
  IF v_total_revenue = 0 THEN
    RETURN TRUE; -- Sem receita ainda, pode continuar
  END IF;
  
  v_payout_pct := v_total_jackpots / v_total_revenue;
  
  IF v_payout_pct >= v_hard_cap THEN
    -- Log alerta
    INSERT INTO edition_events (edition_id, event_type, description, metadata)
    VALUES (
      p_edition_id,
      'cap_reached',
      'Hard cap atingido - Godmode bloqueado',
      jsonb_build_object('payout_pct', v_payout_pct, 'hard_cap', v_hard_cap)
    );
    
    RETURN FALSE; -- Bloqueia Godmode
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 9. Seed ED01
INSERT INTO edition_configs (
  id,
  name,
  description,
  launch_date,
  status,
  base_liquidity,
  skin_multipliers,
  godmode_multiplier,
  godmode_probability,
  rtp_target,
  jackpot_hard_cap,
  theme_colors,
  lore_summary
) VALUES (
  'ED01',
  'Colapso da Interface',
  'Primeira edição oficial do universo Kroova. Entidades que vazaram da camada digital para o mundo real.',
  '2026-03-01 00:00:00+00',
  'active',
  '{"trash":0.01,"meme":0.05,"viral":0.20,"legendary":1.00,"epica":2.00}'::jsonb,
  '{"default":1.0,"neon":1.5,"glow":2.0,"glitch":3.0,"ghost":4.0,"holo":6.0,"dark":10.0}'::jsonb,
  10,
  0.01,
  0.30,
  0.15,
  '{"primary":"#FF006D","secondary":"#00F0FF","value":"#FFC700"}'::jsonb,
  'Quando a interface cai, quem sobrevive é quem sabe negociar.'
);
```

---

<a name="roadmap"></a>
---

## 💡 **DESCOBERTA: MODELO DE BOOSTER ESCALÁVEL**

### **Insight Crítico:**

Em vez de mudar valores de liquidez por edição, podemos **escalar o preço do booster** mantendo a **mesma matemática**!

```
MODELO ANTIGO (requer mudança por edição):
ED01: Booster R$ 0.50 → Prêmio R$ 200
ED02: Booster R$ 0.50 → Prêmio R$ 500 (precisa mudar liquidez base)

MODELO NOVO (escalável):
ED01: Booster R$ 0.50 → Prêmio R$ 200 (15% cap = R$ 0.075)
ED01: Booster R$ 2.00 → Prêmio R$ 800 (15% cap = R$ 0.30)
ED01: Booster R$ 5.00 → Prêmio R$ 2.000 (15% cap = R$ 0.75)
```

### **Vantagens:**

✅ **Uma edição, múltiplos preços**: ED01 pode ter boosters de R$ 0.50 a R$ 10.00  
✅ **Matemática constante**: 15% cap, mesmas probabilidades  
✅ **Sem mudança de liquidez**: Épica sempre R$ 2.00  
✅ **Prêmio escala automaticamente**: Proporcional ao preço do booster  
✅ **Segmentação de público**: Casual (R$ 0.50) e Whale (R$ 10.00)  

### **Como Funciona:**

```typescript
// Liquidez base FIXA por edição
const ED01_BASE = {
  epica: 2.00,
  legendary: 1.00,
  // ...
};

// Multiplicador por PREÇO DE BOOSTER
const BOOSTER_PRICE_MULTIPLIER = booster_price_brl / 0.50;

// Prêmio máximo escalado
const MAX_PRIZE = ED01_BASE.epica * 10 (dark) * 10 (godmode) * BOOSTER_PRICE_MULTIPLIER;

// Exemplos:
// Booster R$ 0.50: R$ 2 × 10 × 10 × 1 = R$ 200
// Booster R$ 2.00: R$ 2 × 10 × 10 × 4 = R$ 800
// Booster R$ 5.00: R$ 2 × 10 × 10 × 10 = R$ 2.000
// Booster R$ 10.00: R$ 2 × 10 × 10 × 20 = R$ 4.000
```

### **Estrutura de Boosters ED01 (atualizada):**

| Booster | Preço | Cartas | Multiplier | **Prêmio Max** | Hard Cap (15%) |
|---------|-------|--------|------------|----------------|----------------|
| **Básico** | R$ 0.50 | 5 | 1x | **R$ 200** | R$ 0.075 |
| **Padrão** | R$ 1.00 | 5 | 2x | **R$ 400** | R$ 0.15 |
| **Premium** | R$ 2.00 | 5 | 4x | **R$ 800** | R$ 0.30 |
| **Elite** | R$ 5.00 | 5 | 10x | **R$ 2.000** | R$ 0.75 |
| **Whale** | R$ 10.00 | 5 | 20x | **R$ 4.000** | R$ 1.50 |

### **Display no Frontend (tipo caça-níquel):**

```tsx
<BoosterCard price="10.00">
  <PrizeDisplay>
    🏆 PRÊMIO MÁXIMO
    <BigNumber>R$ 4.000</BigNumber>
    <Subtitle>Épica/Dark/Godmode</Subtitle>
  </PrizeDisplay>
  
  <ProbabilityInfo>
    Probabilidade: 0.000002%
    Aproximadamente 1 em 50 milhões de cartas
  </ProbabilityInfo>
  
  <GuaranteedInfo>
    ✅ Todas cartas têm valor garantido
    💰 Reciclagem imediata disponível
    📊 RTP: 30% (transparente)
  </GuaranteedInfo>
</BoosterCard>
```

### **Benefícios Legais:**

✅ **Não é loteria**: Valores fixos, não pool acumulado  
✅ **Transparência total**: "Prêmio máximo R$ 4.000" claramente exibido  
✅ **Sem engano**: Probabilidade 0.000002% mostrada  
✅ **Liquidez garantida**: Toda carta tem valor mínimo  

---

## 🗺️ **7. ROADMAP DE EDIÇÕES FUTURAS**

### **ED01: Colapso da Interface** (Mar-Ago 2026)

**Tema:** Vícios digitais ganham forma física  
**Prêmio Max:** R$ 200 - R$ 4.000 (depende do booster)  
**Status:** Active  
**Cartas:** 250  
**Boosters:** 5 tiers (R$ 0.50 a R$ 10.00)  

### **ED02: Surge da Especulação** (Set 2026-Fev 2027)

**Tema:** Criptomoedas e NFTs viram entidades vivas  
**Prêmio Max:** R$ 250 - R$ 5.000 (depende do booster)  
**Boosters:** 5 tiers (R$ 0.50 a R$ 10.00)  
**Épica Base:** R$ 2.50 (↑ 25% vs ED01)  
**Novidades:**
- Novo arquétipo: "Especulação"
- Skin adicional: "Crystal" (8x)
- Cartas interativas (afetam outras)

### **ED03: Algoritmo Divino** (Mar-Set 2027)

**Tema:** IAs ganham consciência e se declaram deuses  
**Prêmio Max:** R$ 1.000  
**Novidades:**
- Sistema de evolução de cartas
- Cartas "Oráculo" (predizem futuro)
- Skin adicional: "Divine" (12x)

### **ED04: Guerra dos Feeds** (Out 2027-Mar 2028)

**Tema:** Redes sociais disputam controle da realidade  
**Prêmio Max:** R$ 2.400  
**Novidades:**
- Cartas faccionadas (escolha um lado)
- PvP real-time
- Skin adicional: "Faction" (varia por lado)

### **ED05: Singularidade Meme** (Abr-Set 2028)

**Tema:** Memes se fundem criando entidade suprema  
**Prêmio Max:** R$ 7.500  
**Novidades:**
- Fusion system (combine 2 cartas)
- Godmode evolution (Godmode² = 100x)
- Skin adicional: "Singularity" (20x)

---

## 📊 **COMPARATIVO DE EDIÇÕES**

| Métrica | ED01 | ED02 | ED03 | ED04 | ED05 |
|---------|------|------|------|------|------|
| **Lançamento** | Mar/26 | Set/26 | Mar/27 | Out/27 | Abr/28 |
| **Duração** | 6 meses | 6 meses | 6 meses | 6 meses | 6 meses |
| **Cartas** | 250 | 300 | 350 | 400 | 500 |
| **Booster Min** | R$ 0.50 | R$ 0.50 | R$ 0.50 | R$ 0.50 | R$ 0.50 |
| **Booster Max** | R$ 10 | R$ 10 | R$ 15 | R$ 20 | R$ 25 |
| **Prêmio Min** | R$ 200 | R$ 250 | R$ 300 | R$ 400 | R$ 500 |
| **Prêmio Max** | R$ 4k | R$ 5k | R$ 9k | R$ 16k | R$ 25k |
| **Épica Base** | R$ 2 | R$ 2.5 | R$ 3 | R$ 4 | R$ 5 |
| **Skins** | 7 | 8 | 9 | 10 | 11 |
| **Hard Cap** | 15% | 15% | 15% | 15% | 15% |
| **Novidade** | Tiers | Crystal | Evolução | PvP | Fusion |

---

## ✅ **RESUMO EXECUTIVO: BEST PRACTICES**

### **Para ED01 (implementar AGORA):**

1. ✅ **Criar `edition_configs` table**
2. ✅ **Inserir ED01 config** (valores imutáveis)
3. ✅ **Adicionar `edition_id` em todas tabelas relevantes**
4. ✅ **Implementar `check_edition_hard_cap()` function**
5. ✅ **Criar `edition_metrics` tracking**
6. ✅ **Configurar alertas** (12% proximity, 15% hard block)
7. ✅ **Documentar lifecycle** (este documento)
8. ✅ **Planejar ED02** (6 meses ahead)

### **Benefícios Imediatos:**

✅ **Sustentabilidade**: Hard cap previne colapso  
✅ **Escalabilidade**: Novas edições fáceis de adicionar  
✅ **Transparência**: Valores claros e auditáveis  
✅ **Flexibilidade**: Cada edição pode experimentar  
✅ **Retention**: Roadmap claro mantém usuários engajados  
✅ **Legal**: Modelo defensável perante reguladores  

### **Próximos Passos:**

1. **Semana 1-2**: Implementar estrutura SQL + functions
2. **Semana 3**: Deploy ED01 com hard cap ativo
3. **Semana 4**: Monitoring e ajustes
4. **Mês 2-6**: Operação plena ED01
5. **Mês 5**: Anunciar ED02
6. **Mês 6**: Pre-launch ED02
7. **Mês 7**: Launch ED02

---

> 🔄 _"Cada edição é uma oportunidade de recomeçar. Cada carta, uma memória preservada."_  
> — Filosofia KROOVA de Edições

**Documento criado para:** KROOVA Edition Lifecycle Management  
**Versão:** 1.0  
**Data:** Novembro 2025  
**Próxima Revisão:** Após launch ED01 (avaliar métricas reais)
