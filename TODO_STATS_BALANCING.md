# ✅ TODO: Ajuste de Stats para Balanceamento de Jogo

## 🎯 Objetivo
Implementar sistema de stats balanceado para Super Trunfo Kroova com 3 atributos de batalha.

## 📋 Checklist de Implementação

### 1. ⚔️ Recalcular Influence Score (CONCLUÍDO)
- [x] Criar ranges sobrepostos por raridade
- [x] trash: 6-29 | meme: 15-39 | viral: 35-57 | legendary: 55-70 | godmode: 75
- [x] Script executado: 345/354 cartas atualizadas
- [x] Status: ✅ PRONTO

### 2. 👑 Recalcular Rarity Score (EM PROGRESSO)
- [ ] Implementar ranges sobrepostos
  - trash: 5-30
  - meme: 20-50
  - viral: 40-70
  - legendary: 60-85
  - godmode: 75-95
- [ ] Executar script `recalc-influence-tiered.py` (atualizado)
- [ ] Verificar distribuição final
- [ ] Status: 🔧 SCRIPT PRONTO, AGUARDANDO EXECUÇÃO

### 3. 💰 Verificar Liquidez (base_liquidity_brl)
- [ ] Confirmar que liquidez é FIXA e NÃO mudou
  - trash: R$ 0.01
  - meme: R$ 0.03
  - viral: R$ 0.10
  - legendary: R$ 0.50
  - godmode: R$ 1.00
- [ ] Query SQL para validar:
  ```sql
  SELECT rarity, 
         MIN(base_liquidity_brl) as min_liq, 
         MAX(base_liquidity_brl) as max_liq,
         AVG(base_liquidity_brl) as avg_liq
  FROM cards_base 
  WHERE edition_id = 'ED01'
  GROUP BY rarity
  ORDER BY min_liq;
  ```
- [ ] Status: ⏸️ PENDENTE VERIFICAÇÃO

### 4. 📊 Testar Balanceamento de Batalha
- [ ] Criar script de simulação de batalhas
- [ ] Cenários de teste:
  - [ ] Trash top (influence 29, rarity 30) vs Meme bottom (influence 15, rarity 20)
  - [ ] Meme top (influence 39, rarity 50) vs Viral bottom (influence 35, rarity 40)
  - [ ] Viral top (influence 57, rarity 70) vs Legendary bottom (influence 55, rarity 60)
  - [ ] Legendary vs Godmode (influence 75, rarity 85)
- [ ] Verificar:
  - [ ] Trash pode ganhar de raridades superiores? (skill expression)
  - [ ] Legendary sempre domina? (pay-to-win check)
  - [ ] Escolha de atributo importa? (strategic depth)
- [ ] Status: ⏸️ PENDENTE

### 5. 💵 Recalcular RTP (Return to Player)
- [ ] Fórmula atual: média_retorno / custo_booster
- [ ] Verificar se mudanças afetam economia:
  - [ ] Liquidez NÃO mudou → RTP NÃO muda ✅
  - [ ] Influence/Rarity são stats de jogo → NÃO afetam RTP ✅
- [ ] Confirmar RTP atual: ~27-30%
- [ ] Query SQL:
  ```sql
  SELECT 
    AVG(base_liquidity_brl) * 5 as avg_booster_value,
    2.50 as booster_cost,
    (AVG(base_liquidity_brl) * 5 / 2.50) * 100 as rtp_percent
  FROM cards_base
  WHERE edition_id = 'ED01';
  ```
- [ ] Status: ⏸️ PENDENTE VERIFICAÇÃO

### 6. 🎮 Atualizar Documentação
- [ ] Atualizar `KROOVA_GAME_RULES.MD`:
  - [ ] Ranges de Influência Social: 6-75
  - [ ] Ranges de Raridade Essencial: 5-95
  - [ ] Ranges de Impacto Econômico: R$0.01-1.00 (FIXO)
- [ ] Atualizar `CARD_SCORING_STRATEGY.md` com decisão final
- [ ] Criar tabela de referência rápida para devs
- [ ] Status: ⏸️ PENDENTE

### 7. 🚀 Deploy
- [ ] Git commit de todas mudanças
- [ ] Aguardar reset de limite Vercel (4h)
- [ ] Deploy frontend (sem mudanças necessárias)
- [ ] Verificar cartas em produção
- [ ] Status: ⏸️ AGUARDANDO

## 🔍 Verificações Críticas

### ⚠️ NÃO PODE MUDAR:
- ✅ `base_liquidity_brl` (economia depende disso)
- ✅ Distribuição de raridades (50% trash, 32% meme, etc)
- ✅ Sistema de reciclagem (25 cartas → 1 booster)
- ✅ Limite 3 reciclagens/dia

### ✅ PODE MUDAR:
- ✅ `influence_score` (stat de batalha)
- ✅ `rarity_score` (stat de batalha)
- ✅ Balanceamento competitivo

## 📈 Próximos Passos (Ordem)

1. **AGORA:** Executar `recalc-influence-tiered.py` para atualizar rarity_score
2. **Depois:** Verificar liquidez não mudou (SQL query)
3. **Depois:** Confirmar RTP mantido em ~27-30%
4. **Depois:** Testar balanceamento de batalha (simulações)
5. **Depois:** Atualizar docs
6. **Depois:** Deploy

## 🎯 Critérios de Sucesso

- [ ] Influence: ranges 6-75 com overlaps ✅
- [ ] Rarity: ranges 5-95 com overlaps ⏸️
- [ ] Liquidez: INALTERADA ⏸️
- [ ] RTP: 27-30% mantido ⏸️
- [ ] Balanceamento: trash pode ganhar de legendaries em cenários específicos ⏸️
- [ ] Pay-to-win: legendary não domina 100% das partidas ⏸️

## 🚨 Riscos Identificados

### Risco 1: Liquidez Acidentalmente Alterada
- **Probabilidade:** Baixa (não mexemos nisso)
- **Impacto:** CRÍTICO (quebra economia inteira)
- **Mitigação:** Query SQL de verificação antes de deploy

### Risco 2: RTP Quebrado
- **Probabilidade:** Muito Baixa (stats de jogo não afetam economia)
- **Impacto:** Alto (exploit econômico)
- **Mitigação:** Recalcular RTP após mudanças

### Risco 3: Desbalanceamento de Jogo
- **Probabilidade:** Média (novos ranges podem criar dominância)
- **Impacto:** Médio (frustração de jogadores)
- **Mitigação:** Simulações de batalha antes de deploy

---

**Status Geral:** 🟡 EM PROGRESSO (Step 1/7 completo)
**Bloqueadores:** Nenhum
**ETA para conclusão:** 30-45 minutos
