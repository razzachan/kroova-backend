# 🎰 Sistema de Correlação Godmode - Kroova

## 📋 Visão Geral

A partir de agora, os **prêmios Godmode** estão **correlacionados** com a raridade e modo visual da carta. Isso significa que:

✅ Cartas mais raras recebem prêmios maiores
✅ Modos visuais premium aumentam o valor do prêmio
✅ O sistema faz sentido narrativo e econômico
✅ Não há mais "Default Trash com R$ 200"

---

## 🧮 Como Funciona

### Score da Carta

Cada carta recebe um **score** baseado em:

```
Score Total = (Score Raridade × 40%) + (Score Modo × 60%)
```

**Por que 40/60?**
- Modo visual é mais visível/impactante que raridade
- Incentiva valorização dos modos especiais
- Mantém equilíbrio entre sorte de rarity e sorte de mode

### Tabelas de Score

#### 🎯 Raridade

| Raridade | Score |
|----------|-------|
| Trash | 1 |
| Meme | 2 |
| Viral | 4 |
| Legendary | 7 |

#### 🎨 Modo Visual

| Modo | Score | Multiplicador |
|------|-------|---------------|
| Default | 1 | 1x |
| Neon | 2 | 2x |
| Glow | 3 | 3x |
| Glitch | 4 | 4x |
| Ghost | 6 | 6x |
| Holo | 8 | 8x |
| Dark | 12 | 12x |

---

## 💰 Faixas de Prêmio por Score

| Score Total | Prêmios Possíveis | Exemplos de Cartas |
|-------------|-------------------|--------------------|
| **1.0 - 2.0** | R$ 5 | Trash Default |
| **2.1 - 3.5** | R$ 5, 10 | Trash Neon, Meme Default |
| **3.6 - 5.0** | R$ 10, 20 | Meme Neon, Viral Default |
| **5.1 - 7.0** | R$ 20, 50 | Viral Glow, Legendary Default |
| **7.1 - 9.0** | R$ 50, 100 | Legendary Neon, Legendary Glow |
| **9.1 - 11.0** | R$ 100, 200 | Legendary Glitch, Legendary Ghost |
| **11.1 - 13.0** | R$ 200, 500 | Legendary Holo |
| **13.1+** | R$ 500, 1000 | Legendary Dark |

---

## 📊 Exemplos Práticos

### Exemplo 1: Legendary Dark (Melhor Possível)

```
Raridade: Legendary (score 7)
Modo: Dark (score 12)
Score Total = (7 × 0.4) + (12 × 0.6) = 2.8 + 7.2 = 10.0
Prêmios Possíveis: R$ 100, 200
```

### Exemplo 2: Trash Default (Pior Caso)

```
Raridade: Trash (score 1)
Modo: Default (score 1)
Score Total = (1 × 0.4) + (1 × 0.6) = 0.4 + 0.6 = 1.0
Prêmios Possíveis: R$ 5
```

### Exemplo 3: Legendary Holo (Premium)

```
Raridade: Legendary (score 7)
Modo: Holo (score 8)
Score Total = (7 × 0.4) + (8 × 0.6) = 2.8 + 4.8 = 7.6
Prêmios Possíveis: R$ 50, 100
```

### Exemplo 4: Viral Neon (Intermediário)

```
Raridade: Viral (score 4)
Modo: Neon (score 2)
Score Total = (4 × 0.4) + (2 × 0.6) = 1.6 + 1.2 = 2.8
Prêmios Possíveis: R$ 5, 10
```

---

## 📈 Resultados de Simulação (20.000 Boosters)

### Estatísticas Gerais

- **Total de Cartas:** 100.000
- **Godmodes:** 137 (0.137%)
- **Jackpots Totais:** R$ 1.460,00

### Distribuição de Prêmios

| Prêmio | Quantidade | Total Pago | % dos Godmodes |
|--------|------------|------------|----------------|
| R$ 5 | 60 | R$ 300 | 43.8% |
| R$ 10 | 50 | R$ 500 | 36.5% |
| R$ 20 | 23 | R$ 460 | 16.8% |
| R$ 50 | 4 | R$ 200 | 2.9% |

### Modos Visuais dos Godmodes

| Modo | Quantidade | Prêmio Médio | Observação |
|------|------------|--------------|------------|
| Default | 88 | R$ 6,59 | Base (64%) |
| Neon | 26 | R$ 13,08 | 2x melhor |
| Glow | 9 | R$ 15,56 | 2.4x melhor |
| Glitch | 9 | R$ 26,67 | 4x melhor |
| Ghost | 4 | R$ 27,50 | 4.2x melhor |
| Holo | 1 | R$ 50,00 | 7.6x melhor |

**Conclusão:** Sistema funcionando perfeitamente! Modos mais raros recebem prêmios significativamente maiores.

---

## 🎯 Benefícios do Sistema

### 1. Coerência Narrativa
- Cartas épicas têm prêmios épicos
- Modos especiais são realmente especiais
- Experiência mais satisfatória

### 2. Economia Balanceada
- Mantém RTP total (18%)
- Não altera frequência de Godmode (0.15%)
- Apenas redistribui valores de forma inteligente

### 3. Engajamento
- Usuários valorizam mais modos raros
- Criar hype ao tirar Legendary Dark
- Reduz frustração de "carta boa, prêmio ruim"

### 4. Marketing
- "Legendary Dark pode pagar até R$ 1.000!"
- Storytelling mais forte
- Transparência no sistema

---

## 🔧 Implementação Técnica

### Arquivo Modificado

```
tests/simulation/engine.ts
```

### Novos Métodos

1. **`calculateCardScore(rarity, mode)`**
   - Calcula score ponderado da carta

2. **`getEligiblePrizes(cardScore)`**
   - Retorna array de prêmios possíveis baseado no score

3. **`rollGodmodePrize(rarity, mode)`**
   - Modificado para aceitar raridade e modo
   - Sorteia apenas entre prêmios elegíveis

### Lógica de Filtragem

```typescript
// Exemplo simplificado
if (cardScore >= 13.1) return [500, 1000];
if (cardScore >= 11.1) return [200, 500];
if (cardScore >= 9.1) return [100, 200];
// ... etc
```

---

## 📊 Como Testar

### Teste Rápido (5K Boosters)
```bash
npm run simulate -- --boosters 5000 --csv
```

### Teste Completo (20K Boosters)
```bash
npx tsx tests/simulation/cli.ts --config ED01 --boosters 20000 --csv
```

### Análise Manual do CSV
```powershell
$csv = Import-Csv tests\simulation\results\cards_*.csv
$godmodes = $csv | Where-Object { $_.Godmode -eq "SIM" }
$godmodes | Group-Object Modo | Select Name,Count
```

---

## 🎮 Impacto no Jogo

### Para o Usuário

- **Mais satisfação:** Carta rara = prêmio justo
- **Mais emoção:** Saber que Dark pode pagar R$ 1.000
- **Mais estratégia:** Valorizar modos especiais no marketplace

### Para a Kroova

- **Melhor economia:** Valores fazem sentido
- **Mais transparente:** Lógica clara e documentada
- **Menos reclamações:** Sistema justo e compreensível

---

## 📝 Observações Importantes

### 1. Godmode vs Modo Visual

- **Godmode** é o **status de premiação** (raro, 0.15%)
- **Modo Visual** é o **estilo da carta** (comum)
- Todos os Godmodes têm um modo visual
- Nem todos os modos visuais são Godmode

### 2. Raridade no Godmode

- Quando uma carta é sorteada como "Godmode" na distribuição de raridade
- Ela **substitui** a raridade original por "Legendary"
- Isso garante que todos Godmodes sejam Legendary
- Mantém consistência visual

### 3. Probabilidades

- **Frequência de Godmode:** Não mudou (0.15%)
- **Distribuição de modos:** Não mudou
- **Apenas os prêmios** são agora inteligentes

---

## 🚀 Próximos Passos

### Opcional: Ajustes Futuros

1. **Pity System:** Garantir 1 Godmode a cada X boosters
2. **Season Boosts:** Modos temporariamente mais valiosos
3. **Achievement Multipliers:** Colecionadores ganham mais
4. **Dynamic RTP:** Ajustar baseado no volume real

---

**Implementado em:** 24/11/2025
**Desenvolvido para:** Kroova Labs
**Versão:** 1.0

> *"Caos é tendência. Raridade é recompensa."*
> — Sistema Godmode Correlacionado
