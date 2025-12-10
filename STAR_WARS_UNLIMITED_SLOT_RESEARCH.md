# Star Wars Unlimited - Booster Slot Distribution Research

## Objetivo
Implementar um sistema de "slots" para abertura de boosters inspirado em Star Wars Unlimited e Magic: The Gathering, onde cada carta em um booster vem de um slot específico com probabilidades próprias.

## Conceito de Slots

### O que são Slots?
Em vez de simplesmente sortear 5 cartas aleatórias de um pool geral, cada booster tem **posições fixas** (slots) onde cada posição tem regras específicas de raridade.

### Exemplo MTG (Draft Booster):
- **Slot 1**: 1 Rare/Mythic Rare (87.5% rare, 12.5% mythic)
- **Slots 2-4**: 3 Uncommons
- **Slots 5-14**: 10 Commons
- **Slot 15**: 1 Basic Land
- **Slot Foil** (substitui 1 common): ~33% chance de aparecer, pode ser qualquer raridade

### Vantagens deste Sistema:
1. **Garantias claras**: Jogador sempre sabe o mínimo que vai receber
2. **Controle de RTP**: Mais fácil balancear economia do jogo
3. **Raridades respeitadas**: Cards raros realmente são raros
4. **Experiência consistente**: Todo booster tem estrutura similar

## Sistema Atual do Kroova (Problemático)

### Como funciona agora:
```typescript
// Código aproximado do atual sistema
const pool = await getCardsForTier(tier);
const selectedCards = [];
for (let i = 0; i < 5; i++) {
  const randomCard = pool[Math.floor(Math.random() * pool.length)];
  selectedCards.push(randomCard);
}
```

### Problemas:
- ❌ Pool único sem diferenciação de raridade
- ❌ 5 cartas godmode em um único booster é possível
- ❌ 5 cartas trash em um único booster é possível
- ❌ Nenhuma garantia de distribuição
- ❌ Impossível calcular RTP real
- ❌ Raridades não têm significado mecânico

## Proposta: Sistema de Slots por Tier

### Tier Básico (R$ 0.50) - 5 Cartas
**Slot 1**: Common/Uncommon garantido
- 70% Trash
- 28% Meme  
- 2% Viral

**Slots 2-4**: Commons puros
- 85% Trash
- 15% Meme

**Slot 5**: "Wildcard" (chance de upgrade)
- 75% Trash
- 20% Meme
- 4% Viral
- 0.9% Legendary
- 0.1% Godmode

### Tier Padrão (R$ 1.00) - 5 Cartas
**Slot 1**: Uncommon/Rare garantido
- 50% Meme
- 40% Viral
- 9% Legendary
- 1% Godmode

**Slots 2-3**: Comum melhorado
- 60% Trash
- 35% Meme
- 5% Viral

**Slots 4-5**: "Wildcards"
- 50% Trash
- 35% Meme
- 12% Viral
- 2.5% Legendary
- 0.5% Godmode

### Tier Premium (R$ 2.00) - 5 Cartas
**Slot 1**: Rare/Legendary garantido
- 70% Viral
- 25% Legendary
- 5% Godmode

**Slot 2**: Uncommon melhorado
- 40% Meme
- 50% Viral
- 10% Legendary

**Slots 3-5**: Wildcards premium
- 30% Meme
- 45% Viral
- 20% Legendary
- 5% Godmode

### Tier Elite (R$ 5.00) - 6 Cartas
**Slot 1**: Legendary/Godmode garantido
- 80% Legendary
- 20% Godmode

**Slot 2**: Rare garantido
- 60% Viral
- 35% Legendary
- 5% Godmode

**Slots 3-4**: Uncommon melhorado
- 30% Viral
- 60% Legendary
- 10% Godmode

**Slots 5-6**: Wildcards elite
- 20% Viral
- 50% Legendary
- 30% Godmode

### Tier Whale (R$ 10.00) - 7 Cartas
**Slots 1-2**: Godmode/Legendary premium
- 60% Legendary
- 40% Godmode

**Slots 3-5**: Legendary garantido
- 85% Legendary
- 15% Godmode

**Slots 6-7**: Wildcards whale
- 50% Legendary
- 50% Godmode

## Mecânicas Adicionais

### 1. Pity System (Bad Luck Protection)
```typescript
// Após X boosters sem Godmode, aumenta chance no próximo
let pityCounter = user.boosters_opened_since_last_godmode || 0;
if (pityCounter >= 50) {
  // Aumenta 2% a chance de godmode a cada 10 boosters extras
  godmodeChance += Math.min(20, Math.floor((pityCounter - 50) / 10) * 2);
}
```

### 2. Foil System (Carta Brilhante)
- 10% chance de 1 carta do booster vir "foil" (skin especial)
- Foil pode ser de qualquer raridade
- Foil não altera raridade, só aparência
- Multiplica valor de mercado por 2-3x

### 3. "God Pack" (0.1% chance)
- Booster inteiro com apenas Legendary + Godmode
- Event especial registrado no histórico
- Notificação global para todos jogadores online

## Cálculo de RTP por Tier

### Fórmula:
```
RTP = (Valor Esperado das Cartas) / (Preço do Booster)
```

### Exemplo Tier Padrão (R$ 1.00):
```
Slot 1:
- 50% Meme (R$ 0.02) = R$ 0.01
- 40% Viral (R$ 0.05) = R$ 0.02
- 9% Legendary (R$ 0.10) = R$ 0.009
- 1% Godmode (R$ 0.20) = R$ 0.002
= R$ 0.041

Slots 2-3 (x2):
- 60% Trash (R$ 0.01) = R$ 0.006
- 35% Meme (R$ 0.02) = R$ 0.007
- 5% Viral (R$ 0.05) = R$ 0.0025
= R$ 0.0155 × 2 = R$ 0.031

Slots 4-5 (x2):
- 50% Trash (R$ 0.01) = R$ 0.005
- 35% Meme (R$ 0.02) = R$ 0.007
- 12% Viral (R$ 0.05) = R$ 0.006
- 2.5% Legendary (R$ 0.10) = R$ 0.0025
- 0.5% Godmode (R$ 0.20) = R$ 0.001
= R$ 0.0215 × 2 = R$ 0.043

TOTAL = R$ 0.041 + R$ 0.031 + R$ 0.043 = R$ 0.115
RTP = R$ 0.115 / R$ 1.00 = 11.5%
```

❌ **RTP MUITO BAIXO! Precisa aumentar!**

### Meta: 65-70% RTP

Para atingir 70% RTP no tier Padrão (R$ 1.00):
- Valor esperado precisa ser R$ 0.70
- Atualmente: R$ 0.115
- **Falta: R$ 0.585**

**Soluções:**
1. Aumentar % de raras nos slots
2. Aumentar número de cartas por booster
3. Adicionar "bonus slot" com 50% legendary chance
4. Aumentar valor base das raridades

## Implementação Técnica

### Estrutura de Dados (Supabase):
```sql
-- Tabela: booster_slot_config
CREATE TABLE booster_slot_config (
  id UUID PRIMARY KEY,
  tier TEXT NOT NULL, -- 'Básico', 'Padrão', etc
  slot_position INT NOT NULL, -- 1, 2, 3, 4, 5
  rarity TEXT NOT NULL, -- 'trash', 'meme', 'viral', etc
  weight FLOAT NOT NULL, -- Probabilidade (0-1)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exemplo de dados:
INSERT INTO booster_slot_config VALUES
('...', 'Padrão', 1, 'meme', 0.50),
('...', 'Padrão', 1, 'viral', 0.40),
('...', 'Padrão', 1, 'legendary', 0.09),
('...', 'Padrão', 1, 'godmode', 0.01);
```

### Algoritmo de Abertura:
```typescript
async function openBoosterWithSlots(userId: string, tier: string) {
  // 1. Buscar configuração de slots para o tier
  const slotsConfig = await getSlotConfigForTier(tier);
  
  // 2. Para cada slot, sortear uma carta
  const cards: Card[] = [];
  for (const slotConfig of slotsConfig) {
    // 3. Weighted random baseado nas probabilidades
    const chosenRarity = weightedRandom(slotConfig.rarityWeights);
    
    // 4. Buscar carta aleatória da raridade escolhida
    const card = await getRandomCardByRarity(chosenRarity);
    cards.push(card);
  }
  
  // 5. Aplicar pity system se necessário
  cards = applyPitySystem(userId, cards);
  
  // 6. Aplicar foil system (10% chance)
  if (Math.random() < 0.10) {
    const foilIndex = Math.floor(Math.random() * cards.length);
    cards[foilIndex].is_foil = true;
  }
  
  // 7. Registrar abertura no histórico
  await logBoosterOpen(userId, tier, cards);
  
  return cards;
}

function weightedRandom(weights: Record<string, number>): string {
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;
  
  for (const [rarity, weight] of Object.entries(weights)) {
    random -= weight;
    if (random <= 0) return rarity;
  }
  
  return Object.keys(weights)[0]; // Fallback
}
```

## Próximos Passos

1. ✅ **Corrigir backend de reciclagem** (CONCLUÍDO)
2. ⏳ **Auditar banco de dados atual**
   - Verificar distribuição real de raridades
   - Contar quantos godmode/legendary existem
   - Verificar se algum tier tem configuração bugada

3. ⏳ **Criar tabela booster_slot_config**
   - Definir slots finais para cada tier
   - Calcular RTP real para cada configuração
   - Ajustar probabilidades para 65-70% RTP

4. ⏳ **Implementar novo algoritmo de abertura**
   - Substituir função atual de open booster
   - Adicionar pity system
   - Adicionar foil system
   - Adicionar logs detalhados

5. ⏳ **Testar extensivamente**
   - Abrir 1000 boosters de cada tier
   - Validar distribuição de raridades
   - Calcular RTP real vs esperado
   - Ajustar se necessário

6. ⏳ **Implementar "God Pack" special event**
   - Sistema de notificações globais
   - Histórico de god packs
   - Achievements relacionados

## Referências

- MTG Draft Booster Distribution: 10 commons, 3 uncommons, 1 rare/mythic
- MTG Collector Booster: Múltiplos slots premium com chances aumentadas
- Hearthstone Pack Opening: 5 cartas, 1 rare+ garantido, pity system após 40 packs
- Pokémon TCG: 11 cards, 1 rare+ garantido, reverse holo slot
- Star Wars Unlimited: Sistema de slots com hyperspace foil mechanics

## Notas Finais

Este sistema resolve os principais problemas:
1. ✅ Raridades têm significado mecânico real
2. ✅ RTP calculável e controlável
3. ✅ Experiência de abertura consistente mas emocionante
4. ✅ Bad luck protection (pity system)
5. ✅ Economia sustentável para F2P e whales
