# 🎰 Sistema de Testes de Viabilidade - Kroova

## ✅ O Que Foi Criado

Sistema completo e profissional para testar periodicamente a viabilidade econômica de boosters antes do deploy.

### 📁 Estrutura Criada

```
tests/simulation/
├── engine.ts              # Motor de simulação (core)
├── configs.ts             # 7 configurações pré-definidas
├── reporter.ts            # Gerador de relatórios (JSON, CSV, MD)
├── cli.ts                 # Interface de linha de comando
├── dashboard.ts           # Visualizador de histórico
├── index.ts               # API pública para uso programático
├── README.md              # Documentação completa
├── results/               # Resultados em JSON e CSV
│   └── .gitignore
└── reports/               # Relatórios em Markdown
    └── .gitignore
```

### 🎯 7 Configurações Pré-Definidas

1. **ED01** - Padrão (R$ 0.50, 5 cartas, RTP 18%)
2. **CONSERVATIVE** - RTP baixo (12%)
3. **AGGRESSIVE** - RTP alto (25%)
4. **PREMIUM** - Booster caro (R$ 1.00, 10 cartas)
5. **MINI** - Booster barato (R$ 0.25, 3 cartas)
6. **HIGH_CAC** - Marketing caro (CAC R$ 5.00)
7. **LOW_CAC** - Marketing eficiente (CAC R$ 0.50)

## 🚀 Como Usar

### Comandos Rápidos

```bash
# Simulação padrão (1000 boosters, 10 iterações)
npm run simulate

# Simulação rápida (500 boosters, 5 iterações)
npm run simulate:quick

# Simulação profunda (5000 boosters, 20 iterações)
npm run simulate:deep

# Comparar todas as configs
npm run simulate:compare

# Exportar CSV detalhado
npm run simulate:csv

# Ver histórico de simulações
npm run simulate:dashboard

# Validar sistema de correlação Godmode
npm run simulate:validate

# Visualização gráfica no terminal (NOVO! 🎨)
npm run simulate:visual
```

### Visualização Interativa

O comando `simulate:visual` exibe resultados de forma gráfica no terminal:

```bash
# Visualização padrão (1000 boosters)
npm run simulate:visual

# Customizar quantidade
npx tsx tests/simulation/visual.ts 5000

# Com amostra de cartas
npx tsx tests/simulation/visual.ts 2000 --cards
```

**Recursos da visualização:**
- 📊 Barras de progresso para economia
- 🎲 Distribuição visual de raridades
- 🎨 Gráficos de modos visuais
- 🌟 Análise de prêmios Godmode
- 🔗 Correlação raridade/modo/prêmio
- 🃏 Amostra de cartas geradas
- 💡 **Insights inteligentes** (NOVO! 🧠)

### Insights Automáticos

O sistema analisa os resultados e gera insights contextuais:

**Exemplos de insights gerados:**

✅ **Margem Excepcional**
```
💰 Margem excepcional (>70%)! Há espaço para campanhas agressivas ou aumentar RTP.
```

🔗 **Correlação Validada**
```
🔗 Correlação funcionando! Modos premium pagam 2x+ mais que Default.
```

💎 **Prêmios Altos**
```
💎 2 prêmio(s) alto(s) (≥R$50) em modos: holo, glitch
```

🎰 **Rodada com Sorte**
```
🎰 Jackpots pagaram mais que reciclagem normal! Rodada com muita sorte.
```

📈 **Viabilidade de Escala**
```
🚀 LTV/CAC de 1760x é extraordinário! Invista pesado em marketing.
```

💡 **Recomendações**
```
💡 Sugestão: Margem alta permite aumentar RTP para melhorar retenção.
```
```

### Comandos Avançados

```bash
# Config específica
npx tsx tests/simulation/cli.ts --config PREMIUM

# Customizar parâmetros
npx tsx tests/simulation/cli.ts --boosters 10000 --iterations 50

# Com detalhes e CSV
npx tsx tests/simulation/cli.ts --detailed --csv

# Ver ajuda
npx tsx tests/simulation/cli.ts --help
```

## 📊 Arquivos Gerados

### 1. JSON Results

**Local:** `tests/simulation/results/*.json`

Contém:
- Configuração completa usada
- Estatísticas agregadas (média, desvio padrão, min/max)
- Resultados de cada iteração
- Metadata (timestamp, total de cartas)

**Uso:** Análise programática, histórico, comparações

### 2. CSV Export

**Local:** `tests/simulation/results/*.csv`

Contém todas as cartas geradas:
- Booster # | Card # | Raridade | Modo | Godmode | Prêmio | Valor

**Uso:** Excel, Google Sheets, tabelas dinâmicas, gráficos

### 3. Markdown Reports

**Local:** `tests/simulation/reports/*.md`

Contém:
- Resumo executivo
- Tabelas de lucratividade
- Distribuição de raridades
- Análise de Godmodes
- Conclusões e recomendações

**Uso:** Documentação, apresentações, decisões de negócio

## 📈 Métricas Principais

### O Que Observar

| Métrica | Ótimo | Aceitável | Ruim |
|---------|-------|-----------|------|
| **Margem de Lucro** | > 50% | 30-50% | < 30% |
| **LTV/CAC Ratio** | > 5x | 3-5x | < 3x |
| **Desvio Padrão Margem** | < 15% | 15-25% | > 25% |
| **Distribuição Raridades** | ±0.3% | ±0.5% | > 1% |

### Interpretação

- **Margem alta (>50%)**: Ótima lucratividade, espaço para promoções
- **LTV/CAC >3x**: Modelo escalável, pode investir em marketing
- **Desvio alto**: Precisa de mais volume para estabilizar
- **Distribuição precisa**: Algoritmo funcionando corretamente

## 🔄 Workflow Recomendado

### 🆕 Sistema de Correlação Godmode

A partir de agora, **prêmios Godmode estão correlacionados** com a raridade e modo visual da carta:

✅ **Cartas raras** (Legendary) recebem **prêmios maiores**
✅ **Modos premium** (Dark, Holo, Ghost) aumentam o valor do prêmio
✅ **Coerência narrativa**: Legendary Dark pode pagar até R$ 1.000
✅ **Sem mais "Default com R$ 200"**: Sistema inteligente

**Documentação completa:** `GODMODE_CORRELATION_SYSTEM.md`

**Validar sistema:**
```bash
npm run simulate:validate
```

### Teste Mensal (Rotina)

```bash
# 1. Rodar comparação completa
npm run simulate:compare

# 2. Revisar dashboard
npm run simulate:dashboard

# 3. Se houver degradação, investigar
npm run simulate:deep
```

### Antes de Nova Edição

```bash
# 1. Criar config em configs.ts
# 2. Testar
npx tsx tests/simulation/cli.ts --config NOVA_EDICAO --iterations 20

# 3. Se viável, simulação profunda
npx tsx tests/simulation/cli.ts --config NOVA_EDICAO --boosters 10000 --csv

# 4. Analisar CSV no Excel
# 5. Salvar relatório
# 6. Deploy
```

### Otimização de RTP

```bash
# Testar diferentes RTPs
npm run simulate -- --config CONSERVATIVE  # 12%
npm run simulate -- --config ED01          # 18%
npm run simulate -- --config AGGRESSIVE    # 25%

# Comparar
npm run simulate:compare
```

### Ajuste de Preço

```bash
# Testar preços diferentes
npm run simulate -- --config MINI      # R$ 0.25
npm run simulate -- --config ED01      # R$ 0.50
npm run simulate -- --config PREMIUM   # R$ 1.00
```

## 🎯 Casos de Uso Reais

### Caso 1: "Quero validar se ED01 é viável"

```bash
npm run simulate:deep
# Aguardar resultado
# Se margem > 50% e ratio > 3x → ✅ DEPLOY
```

### Caso 2: "Marketing está caro, ainda compensa?"

```bash
npm run simulate -- --config HIGH_CAC --detailed
# Se ratio > 3x → ✅ Compensa
# Se ratio 1-3x → ⚠️ Margem apertada
# Se ratio < 1x → ❌ Inviável
```

### Caso 3: "Posso baixar o RTP para ganhar mais?"

```bash
npm run simulate:compare
# Comparar CONSERVATIVE (12%) vs ED01 (18%)
# Avaliar trade-off: lucro vs experiência do usuário
```

### Caso 4: "Toda segunda-feira, ver se tá tudo OK"

```bash
npm run simulate:dashboard
# Revisar tendências
# Se métricas degradaram, investigar
```

## 🔧 Criar Nova Config

Edite `tests/simulation/configs.ts`:

```typescript
export const MINHA_CONFIG: EditionConfig = {
  name: "Minha Config Personalizada",
  boosterPrice: 0.75,
  cardsPerBooster: 7,
  rtpTotal: 0.20,
  rtpRecycleNormal: 0.65,
  rtpJackpots: 0.35,
  
  rarityDistribution: {
    trash: 65.0,
    meme: 25.0,
    viral: 8.0,
    legendary: 1.5,
    godmode: 0.5,
  },
  
  modeDistribution: {
    default: 55.0,
    neon: 22.0,
    glow: 12.0,
    glitch: 6.0,
    ghost: 3.0,
    holo: 1.5,
    dark: 0.5,
  },
  
  modeMultipliers: {
    default: 1.0,
    neon: 2.0,
    glow: 3.0,
    glitch: 4.0,
    ghost: 6.0,
    holo: 8.0,
    dark: 12.0,
  },
  
  godmodePrizeWeights: {
    5: 50.0,
    10: 25.0,
    20: 12.5,
    50: 6.25,
    100: 3.125,
    200: 1.5625,
    500: 0.78125,
    1000: 0.39063,
  },
  
  costs: {
    payment_gateway: 0.04,
    server_per_booster: 0.001,
    support_per_user: 0.05,
    marketing_cac: 2.50,
  },
};

// Adicionar ao mapa
export const CONFIGS = {
  // ... outras
  CUSTOM: MINHA_CONFIG,
};
```

Depois:

```bash
npx tsx tests/simulation/cli.ts --config CUSTOM
```

## 📚 Arquivos de Apoio

- **KROOVA_BOOSTER_ALGORITHM.md**: Especificação completa do algoritmo
- **BOOSTER_VIABILITY_REPORT.md**: Exemplo de relatório executivo
- **tests/simulation/README.md**: Documentação técnica detalhada

## ✅ Checklist Pré-Deploy

- [ ] Rodar `npm run simulate:deep` com config final
- [ ] Verificar margem > 50%
- [ ] Verificar LTV/CAC > 3x
- [ ] Revisar distribuição de raridades (diff < 0.5%)
- [ ] Validar prêmios Godmode balanceados
- [ ] Exportar CSV e revisar amostra de cartas
- [ ] Salvar relatórios para histórico
- [ ] Documentar decisão tomada

## 🎉 Resultado do Teste Inicial

Baseado na simulação de 10x 1000 boosters:

| Métrica | Valor | Status |
|---------|-------|--------|
| **Margem Média** | 57.16% | ✅ Excelente |
| **LTV/CAC Ratio** | 142.9x | ✅ Excepcional |
| **Desvio Margem** | ±23.69% | ⚠️ Alto (normal) |
| **Distribuição** | ±0.1% | ✅ Perfeita |

**Conclusão:** Modelo altamente viável e escalável.

---

**Desenvolvido para Kroova Labs**  
*"Caos é tendência. Tendência vira entidade."*
