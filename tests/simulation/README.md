# 🎰 Sistema de Simulação de Boosters Kroova

## 📋 Visão Geral

Sistema completo para testar e validar a viabilidade econômica de diferentes configurações de boosters antes do deploy em produção.

## 🚀 Uso Rápido

```bash
# Simulação padrão (ED01, 1000 boosters, 10 iterações)
npm run simulate

# Simulação rápida (500 boosters, 5 iterações)
npm run simulate:quick

# Simulação profunda (5000 boosters, 20 iterações)
npm run simulate:deep

# Comparar todas as configurações
npm run simulate:compare

# Exportar CSV com cartas individuais
npm run simulate:csv
```

## 📊 Comandos Avançados

### Testar Configuração Específica

```bash
npm run simulate -- --config PREMIUM
npm run simulate -- --config AGGRESSIVE
npm run simulate -- --config HIGH_CAC
```

### Customizar Parâmetros

```bash
# 10000 boosters, 50 iterações
npm run simulate -- --boosters 10000 --iterations 50

# Com detalhes e CSV
npm run simulate -- --detailed --csv
```

## 🎯 Configurações Disponíveis

| Config | Descrição | Preço | Cartas | RTP |
|--------|-----------|-------|--------|-----|
| **ED01** | Configuração padrão | R$ 0,50 | 5 | 18% |
| **CONSERVATIVE** | RTP conservador | R$ 0,50 | 5 | 12% |
| **AGGRESSIVE** | RTP agressivo | R$ 0,50 | 5 | 25% |
| **PREMIUM** | Booster premium | R$ 1,00 | 10 | 20% |
| **MINI** | Booster mini | R$ 0,25 | 3 | 15% |
| **HIGH_CAC** | Alto CAC (R$ 5,00) | R$ 0,50 | 5 | 18% |
| **LOW_CAC** | Baixo CAC (R$ 0,50) | R$ 0,50 | 5 | 18% |

## 📁 Estrutura de Arquivos

```
tests/simulation/
├── engine.ts          # Motor de simulação (core)
├── configs.ts         # Configurações pré-definidas
├── reporter.ts        # Gerador de relatórios
├── cli.ts             # Interface de linha de comando
├── results/           # Resultados em JSON e CSV
│   ├── simulation_2025-11-24.json
│   └── cards_2025-11-24.csv
└── reports/           # Relatórios em Markdown
    └── report_2025-11-24.md
```

## 📈 Arquivos Gerados

### 1. JSON Results (`results/*.json`)

Contém dados completos da simulação:
- Configuração usada
- Estatísticas agregadas
- Resultados de cada iteração
- Timestamp e metadata

### 2. CSV Export (`results/*.csv`)

Planilha com todas as cartas geradas:
- Número do booster
- Número da carta
- Raridade e modo visual
- Godmode e prêmio
- Valor de reciclagem

**Uso:** Abrir no Excel para análise detalhada, tabelas dinâmicas, gráficos.

### 3. Markdown Report (`reports/*.md`)

Relatório executivo formatado:
- Resumo de lucratividade
- Tabelas de distribuição
- Análise de Godmodes
- Conclusões e recomendações

## 🔧 Como Criar Nova Configuração

Edite `tests/simulation/configs.ts`:

```typescript
export const MINHA_CONFIG: EditionConfig = {
  name: "Minha Configuração Custom",
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
  
  // ... resto da config
};

// Adicionar ao mapa
export const CONFIGS = {
  // ... outras configs
  CUSTOM: MINHA_CONFIG,
};
```

Depois rode:

```bash
npm run simulate -- --config CUSTOM
```

## 📊 Interpretando Resultados

### Métricas Principais

- **Lucro Médio**: Quanto você ganha em média por X boosters
- **Margem**: Percentual de lucro sobre receita
- **LTV/CAC Ratio**: Relação entre valor vitalício e custo de aquisição
  - **> 3x**: Excelente ✅
  - **1-3x**: Aceitável ⚠️
  - **< 1x**: Inviável ❌
- **Desvio Padrão**: Variação esperada (alta = mais risco)

### Distribuição de Raridades

Verifique se os percentuais reais estão próximos dos esperados:
- **Diferença < 0.5%**: Perfeito ✅
- **Diferença 0.5-1%**: Aceitável ⚠️
- **Diferença > 1%**: Revisar algoritmo ❌

### Godmodes

- **0.15%** esperado = ~7-8 por 1000 boosters
- Prêmios altos (R$ 500+) aparecem apenas em grandes volumes (10k+)

## 🔄 Workflow Recomendado

### 1. Teste Rápido (5 min)

```bash
npm run simulate:quick
```

Valida se tudo está funcionando, gera resultado preliminar.

### 2. Teste Padrão (15 min)

```bash
npm run simulate
```

Gera estatísticas confiáveis para tomada de decisão.

### 3. Teste Profundo (1h)

```bash
npm run simulate:deep
```

Validação final antes de deploy, estabiliza variância.

### 4. Comparação (30 min)

```bash
npm run simulate:compare
```

Compara todas as configs lado a lado, escolhe a melhor.

### 5. Análise Detalhada

```bash
npm run simulate -- --detailed --csv
```

Exporta tudo para análise no Excel/Sheets.

## 📝 Checklist Pré-Deploy

- [ ] Rodar `npm run simulate:deep` com config final
- [ ] Verificar margem > 50%
- [ ] Verificar LTV/CAC > 3x
- [ ] Revisar distribuição de raridades (diff < 0.5%)
- [ ] Validar prêmios Godmode balanceados
- [ ] Exportar CSV e revisar cartas manualmente
- [ ] Salvar relatórios em `reports/` para histórico

## 🎯 Casos de Uso

### Cenário 1: Validar Nova Edição

```bash
# 1. Criar config em configs.ts
# 2. Rodar simulação
npm run simulate -- --config NOVA_EDICAO --iterations 20

# 3. Se viável, criar simulação profunda
npm run simulate -- --config NOVA_EDICAO --boosters 10000 --csv

# 4. Analisar CSV no Excel
# 5. Deploy
```

### Cenário 2: Otimizar RTP

```bash
# Testar diferentes RTPs
npm run simulate -- --config CONSERVATIVE  # RTP 12%
npm run simulate -- --config ED01          # RTP 18%
npm run simulate -- --config AGGRESSIVE    # RTP 25%

# Comparar
npm run simulate:compare
```

### Cenário 3: Ajustar para CAC Alto

```bash
# Testar com CAC alto
npm run simulate -- --config HIGH_CAC --detailed

# Se margem baixar muito, ajustar RTP para baixo
# Criar nova config e testar novamente
```

### Cenário 4: Análise Mensal

```bash
# Todo mês, rodar relatório comparativo
npm run simulate:compare

# Salvar em reports/ com data
# Comparar com mês anterior
# Ajustar configs se necessário
```

## 🐛 Troubleshooting

### Simulação muito lenta

```bash
# Reduzir boosters ou iterações
npm run simulate -- --boosters 500 --iterations 5
```

### Resultados muito variados

```bash
# Aumentar iterações para estabilizar
npm run simulate -- --iterations 30
```

### CSV muito grande

```bash
# Reduzir boosters
npm run simulate -- --boosters 1000 --csv
```

### Não encontra config

```bash
# Listar configs disponíveis
npm run simulate -- --help
```

## 📚 Referências

- **KROOVA_BOOSTER_ALGORITHM.md**: Especificação completa do algoritmo
- **BOOSTER_VIABILITY_REPORT.md**: Exemplo de relatório gerado
- **simulation-results.json**: Exemplo de resultado JSON
- **booster-cards.csv**: Exemplo de CSV

## 🚀 Próximos Passos

1. ✅ Sistema de simulação implementado
2. 🔄 Integrar simulação no backend real
3. 🔄 Dashboard web para visualizar resultados
4. 🔄 Alertas automáticos se métricas degradarem
5. 🔄 A/B testing em produção

---

**Desenvolvido para Kroova Labs**  
*"Caos é tendência. Tendência vira entidade."*
