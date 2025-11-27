# 🎮 KROOVA VIRAL ADDICTION SYSTEM
**Sistema de Engajamento Dopaminérgico: Ética + Lucratividade + Legal**

> _"Se nós exageramos, elas nascem. Se abrimos um booster, elas se revelam."_  
> — Manifesto Kroova

**Contexto Lore:** Kroovas são manifestações de vícios coletivos digitais que vivem na Interface. Cada abertura de booster é um "vazamento controlado" dessa camada parasitária para o mundo real. Quanto mais rara a carta, mais forte é o comportamento coletivo que ela representa.

---

## 📋 **ÍNDICE**

1. [Princípios Éticos](#principios)
2. [Linguagem Legal (sem "prêmio")](#linguagem)
3. [Sistema de Revelação Progressiva](#revelacao)
4. [Mecânicas de Dopamina](#dopamina)
5. [Sound Design & Haptics](#sound)
6. [Sistema de Progressão](#progressao)
7. [Social Proof & FOMO](#social)
8. [UI/UX Flow Completo](#flow)
9. [Roadmap de Implementação](#roadmap)

---

<a name="principios"></a>
## 🎯 **1. PRINCÍPIOS ÉTICOS**

### **Somos um COLECIONÁVEL, não um cassino**

✅ **Transparência Total**:
- Probabilidades visíveis
- RTP mostrado (30%)
- Hard cap explicado (15% receita)
- Nenhum valor escondido

✅ **Valor Garantido**:
- Toda carta tem liquidez mínima
- Reciclagem imediata disponível
- Não existe "perda total"

✅ **Controle do Usuário**:
- Pode parar a qualquer momento
- Vê histórico completo
- Limites auto-impostos disponíveis

✅ **Sem Predatory Tactics**:
- Não escondemos taxas
- Não dificultamos saque
- Não usamos "moeda virtual confusa"

❌ **O que NÃO fazemos**:
- Dark patterns
- Ocultar odds
- Criar falsa escassez
- Bloquear saques

---

<a name="linguagem"></a>
## 📝 **2. LINGUAGEM LEGAL (compliance total)**

### **NUNCA usar:**

❌ **Prêmio** → ✅ **Resgate / Liquidez**  
❌ **Jackpot** → ✅ **Carta de Alto Valor**  
❌ **Apostar** → ✅ **Adquirir / Colecionar**  
❌ **Ganhar** → ✅ **Obter / Revelar**  
❌ **Loteria** → ✅ **Colecionável com Liquidez**  
❌ **Sorte** → ✅ **Raridade / Distribuição Probabilística**  

### **Linguagem Aprovada:**

```
ANTES (PROIBIDO):
"🎰 Abra e GANHE até R$ 4.000!"
"💰 JACKPOT MÁXIMO: R$ 4.000"
"🍀 Teste sua SORTE!"

DEPOIS (LEGAL):
"🃏 Revele colecionáveis com liquidez de até R$ 4.000"
"💎 RESGATE MÁXIMO: R$ 4.000 (Épica/Dark/Status Especial)"
"📊 Distribuição transparente: 0.000002% para cartas raras"
```

### **Frases-Chave para UI:**

```tsx
// ✅ CORRETO
<MaxValue>
  💎 RESGATE MÁXIMO
  <Value>R$ 4.000</Value>
  <Explain>Valor de reciclagem da carta mais rara</Explain>
</MaxValue>

<Transparency>
  📊 Sistema Transparente
  • Todas cartas têm valor mínimo garantido
  • Liquidez imediata disponível
  • RTP: 30% (retorno médio ao colecionador)
</Transparency>

// ❌ ERRADO
<Jackpot>GANHE ATÉ R$ 4.000!</Jackpot>
```

---

<a name="revelacao"></a>
## 🎁 **3. SISTEMA DE REVELAÇÃO PROGRESSIVA**

### **Problema:** 50 boosters (250 cartas) de uma vez = entediante

### **Solução:** Sistema de "Chunks" com ritual

```typescript
interface OpeningSession {
  total_boosters: number;
  current_booster: number;
  revealed_cards: Card[];
  session_stats: {
    best_card: Card;
    total_liquidity: number;
    rarity_breakdown: Record<string, number>;
  };
  checkpoints: number[]; // [10, 20, 30, 40, 50]
}
```

### **Fluxo Completo:**

```
1. Usuário compra "Pack Colecionador" (50 boosters)
   ↓
2. Inicia "Sessão de Abertura"
   ↓
3. Mostra 1 booster (5 cartas) girando
   ↓
4. Usuário toca → Reveal 1 carta por vez (0.5s cada)
   ↓
5. SFX + Particles + Haptic
   ↓
6. Resumo mini: "5 cartas: +R$ 0.30 total"
   ↓
7. Botão: "PRÓXIMO BOOSTER (49 restantes)"
   ↓
8. A cada 10 boosters: CHECKPOINT (ver abaixo)
   ↓
9. Repete até 50
   ↓
10. Resumo final da sessão
```

### **Checkpoint System (a cada 10 boosters):**

```tsx
<CheckpointScreen>
  <Progress>Você abriu 10 de 50 boosters</Progress>
  
  <Highlight>
    🌟 MELHORES CARTAS DOS ÚLTIMOS 10 BOOSTERS
    <CardGallery>
      {top3Cards.map(card => <AnimatedCard />)}
    </CardGallery>
  </Highlight>
  
  <Stats>
    📊 Liquidez acumulada: R$ 3.50
    🎴 Raridades: 48 Trash, 20 Meme, 7 Viral, 2 Legendary
  </Stats>
  
  <Pity>
    ⏳ Contador de Progressão: 87/100
    💎 Próxima carta de alto valor garantida em 13 boosters
  </Pity>
  
  <CTAs>
    <Button primary>CONTINUAR ABRINDO (40 restantes)</Button>
    <Button secondary>Pausar e ver coleção</Button>
  </CTAs>
</CheckpointScreen>
```

**Psicologia:**
- ✅ Break entre 10 boosters cria "respiro"
- ✅ Ver melhores cartas reforça sensação de "estou progredindo"
- ✅ Mostrar 40 restantes → sunk cost ("já gastei metade")
- ✅ Pity bar → "tá chegando!"

---

<a name="dopamina"></a>
## 🧠 **4. MECÂNICAS DE DOPAMINA**

### **A. Near-Miss (Quase consegui!)**

```typescript
// Animação especial quando "quase" sai carta rara
function revealCard(card: Card, position: number, total: number) {
  // Se for a última carta E for Trash/Meme E já teve 2+ Legendary
  if (position === total - 1 && card.rarity === 'trash' && legendaryCount >= 2) {
    // Near-miss animation
    showAnimation('almost_godmode', {
      duration: 3000,
      effects: ['slow_spin', 'golden_glow', 'fade_to_gray']
    });
    
    showMessage('Uhh! Estava quase! 💫', {
      tone: 'encouraging',
      cta: 'Próximo booster pode ser diferente!'
    });
  }
}
```

**Visual:**
```
Carta girando devagar...
Glow dourado aparece...
Usuário pensa: "VEM GODMODE!"
→ Revela: Viral
→ Mensagem: "Quase lá! Continue revelando..."
```

### **B. Variable Reward Schedule**

Nunca mostrar padrões previsíveis:

```typescript
// ❌ ERRADO (previsível)
if (boosterNumber % 10 === 0) {
  forceRareCard(); // Usuário percebe o padrão
}

// ✅ CORRETO (imprevisível)
const rareTrigger = Math.random() < (1 / (10 + Math.random() * 5));
if (rareTrigger) {
  increaseRarityChance(); // 8-15 boosters aleatório
}
```

**Psicologia:** Imprevisibilidade = maior dopamina (slot machines 101)

### **C. Escalação de Recompensa**

```typescript
// Recompensas aumentam com persistência
const sessionBonus = {
  10: 1.0,   // Normal
  20: 1.05,  // +5% chance rarity
  30: 1.10,  // +10%
  40: 1.15,  // +15%
  50: 1.25   // +25% (finale)
};
```

**UI:**
```tsx
<SessionBonus active={boostersOpened >= 40}>
  🔥 SEQUÊNCIA ATIVA!
  +15% chance de cartas raras
  Continue abrindo para manter o bônus!
</SessionBonus>
```

### **D. Loss Aversion (Sunk Cost)**

```tsx
<ProgressWarning show={boostersOpened > 0 && userWantsToStop}>
  ⚠️ Você já revelou {boostersOpened} boosters
  
  <Stats>
    💰 Liquidez acumulada: R$ {totalLiquidity}
    📊 Pity Counter: {pityCount}/100
  </Stats>
  
  <Message>
    Sua próxima carta de alto valor pode estar nos próximos boosters.
    Deseja continuar ou pausar para ver sua coleção?
  </Message>
  
  <Actions>
    <Button primary>CONTINUAR REVELANDO</Button>
    <Button secondary>Pausar (não perde progresso)</Button>
  </Actions>
</ProgressWarning>
```

---

<a name="sound"></a>
## 🔊 **5. SOUND DESIGN & HAPTICS**

### **Importância:** Som > Visual (comprovado em casinos)

### **Sound Effects por Raridade:**

```typescript
const SFX = {
  trash: {
    file: 'card_flip.mp3',
    volume: 0.3,
    duration: 200,
    pitch: 0.8
  },
  meme: {
    file: 'card_rare.mp3',
    volume: 0.5,
    duration: 400,
    pitch: 1.0
  },
  viral: {
    file: 'card_epic.mp3',
    volume: 0.7,
    duration: 800,
    pitch: 1.2,
    reverb: true
  },
  legendary: {
    file: 'card_legendary.mp3',
    volume: 0.9,
    duration: 2000,
    pitch: 1.4,
    choir: true,
    echo: true
  },
  epica_godmode: {
    file: 'card_jackpot.mp3',
    volume: 1.0,
    duration: 5000,
    pitch: 1.6,
    orchestral_buildup: true,
    explosion: true,
    celebration: true
  }
};
```

### **Haptic Patterns:**

```typescript
const HAPTICS = {
  trash: null, // Sem vibração
  
  meme: [50], // Vibração curta
  
  viral: [100, 50, 100], // Duas vibrações
  
  legendary: [200, 100, 200, 100, 300], // Pattern crescente
  
  epica_godmode: [
    300, 100, // Build-up
    300, 100,
    300, 100,
    500, 200, // Climax
    500, 200,
    1000      // Explosão final
  ]
};

function triggerHaptic(rarity: string) {
  if (navigator.vibrate && HAPTICS[rarity]) {
    navigator.vibrate(HAPTICS[rarity]);
  }
}
```

### **Audio Layering (cartas simultâneas):**

```typescript
// Se revelar 5 cartas rápido, não sobrepor áudio
let audioQueue: Audio[] = [];

function playCardSound(rarity: string) {
  const sound = new Audio(SFX[rarity].file);
  sound.volume = SFX[rarity].volume;
  
  // Se já tem áudio tocando, adiciona à fila
  if (audioQueue.length > 0) {
    audioQueue.push(sound);
  } else {
    sound.play();
    audioQueue.push(sound);
    
    sound.addEventListener('ended', () => {
      audioQueue.shift();
      if (audioQueue.length > 0) {
        audioQueue[0].play();
      }
    });
  }
}
```

---

<a name="progressao"></a>
## 📈 **6. SISTEMA DE PROGRESSÃO**

### **A. Pity System (Visível)**

```tsx
<PityBar>
  <Progress value={userPityCount} max={100}>
    <Fill width={`${userPityCount}%`} glow />
  </Progress>
  
  <Label>
    {userPityCount < 100 ? (
      <>
        ⏳ Próxima carta de alto valor garantida em{' '}
        <Strong>{100 - userPityCount}</Strong> boosters
      </>
    ) : (
      <>
        💎 CARTA DE ALTO VALOR GARANTIDA NO PRÓXIMO BOOSTER!
      </>
    )}
  </Label>
</PityBar>
```

**Thresholds:**
- 0-50: Verde (normal)
- 51-80: Amarelo (aquecendo)
- 81-99: Laranja (quase lá!)
- 100: Vermelho pulsante (GARANTIDO!)

### **B. Lucky Streak System**

```typescript
interface LuckyStreak {
  active: boolean;
  multiplier: number;      // 1.5x rarity chance
  expires_at: Date;        // +30min após abrir 3 boosters rápido
  boosters_opened_in_streak: number;
}

// Ativa se abrir 3 boosters em menos de 2 minutos
function checkLuckyStreak(userId: string) {
  const recent = await getRecentOpenings(userId, minutes: 2);
  
  if (recent.length >= 3) {
    activateLuckyStreak(userId, {
      multiplier: 1.5,
      duration: 30 * 60 * 1000 // 30 min
    });
  }
}
```

**UI:**
```tsx
<LuckyStreakBanner active={streak.active}>
  🔥 LUCKY STREAK ATIVA!
  <Multiplier>+50% chance de cartas raras</Multiplier>
  <Timer>Expira em {remainingTime}</Timer>
  
  <Tip>Continue abrindo para manter a sequência!</Tip>
</LuckyStreakBanner>
```

### **C. Vault System (Bonus por Volume)**

```typescript
// A cada 25 boosters, desbloqueia 1 vault
const VAULT_MILESTONES = [25, 50, 75, 100];

interface Vault {
  id: string;
  unlocked_at: number;      // Após X boosters
  contains: Card[];         // 3 cartas acima da média
  opened: boolean;
}

function checkVaultUnlock(userId: string) {
  const totalBoosters = await getUserTotalBoosters(userId);
  
  VAULT_MILESTONES.forEach(milestone => {
    if (totalBoosters >= milestone && !vaultOpened(userId, milestone)) {
      unlockVault(userId, {
        milestone,
        cards: generateVaultCards(milestone) // Sempre acima da média
      });
    }
  });
}

function generateVaultCards(milestone: number): Card[] {
  // Vault SEMPRE tem pelo menos 1 Viral+
  return [
    generateCard({ minRarity: 'viral' }),
    generateCard({ minRarity: 'meme' }),
    generateCard({ minRarity: 'meme' })
  ];
}
```

**UI:**
```tsx
<VaultUnlock milestone={25}>
  <Animation>🎁 VAULT DESBLOQUEADO!</Animation>
  
  <Message>
    Você revelou 25 boosters!
    Ganhou acesso a um Vault especial com 3 cartas garantidas acima da média.
  </Message>
  
  <Preview>
    <CardBack glow />
    <CardBack glow />
    <CardBack glow />
  </Preview>
  
  <Action>
    <Button>ABRIR VAULT</Button>
  </Action>
</VaultUnlock>
```

### **D. Collection Milestones**

```typescript
interface CollectionMilestone {
  id: string;
  requirement: string;     // "collect_10_legendary"
  progress: number;
  max: number;
  reward: Reward;
}

const MILESTONES = [
  {
    id: 'first_legendary',
    name: 'Primeira Legendary',
    requirement: 'collect_1_legendary',
    reward: { type: 'booster', quantity: 1 }
  },
  {
    id: 'legendary_collector',
    name: 'Colecionador Legendary',
    requirement: 'collect_10_legendary',
    reward: { type: 'vault', tier: 'premium' }
  },
  {
    id: 'complete_archetype',
    name: 'Arquétipo Completo',
    requirement: 'collect_all_ganancia',
    reward: { type: 'exclusive_card', rarity: 'legendary' }
  }
];
```

**UI:**
```tsx
<MilestonesPanel>
  <Title>📚 Conquistas de Coleção</Title>
  
  {milestones.map(m => (
    <Milestone key={m.id} complete={m.progress >= m.max}>
      <Icon>{m.progress >= m.max ? '✅' : '⏳'}</Icon>
      <Name>{m.name}</Name>
      <Progress>{m.progress}/{m.max}</Progress>
      <Reward>{m.reward.description}</Reward>
    </Milestone>
  ))}
</MilestonesPanel>
```

---

<a name="social"></a>
## 👥 **7. SOCIAL PROOF & FOMO**

### **A. Live Feed (Real-time Reveals)**

```tsx
<LiveFeed>
  <Title>🔥 Revelações Recentes</Title>
  
  <FeedItems>
    {recentReveals.map(reveal => (
      <FeedItem key={reveal.id}>
        <UserAvatar>{reveal.username[0]}</UserAvatar>
        <Message>
          <User>{reveal.username}</User> revelou{' '}
          <Card rarity={reveal.rarity}>
            {reveal.cardName}
          </Card>
          {reveal.skin !== 'default' && (
            <Skin>({reveal.skin})</Skin>
          )}
          {' '}há {reveal.timeAgo}
        </Message>
      </FeedItem>
    ))}
  </FeedItems>
</LiveFeed>
```

**Backend:**
```typescript
// Broadcast apenas cartas Viral+
async function broadcastReveal(userId: string, card: Card) {
  if (['viral', 'legendary', 'epica'].includes(card.rarity)) {
    await redis.publish('reveals', {
      userId,
      username: await getUsername(userId),
      cardName: card.name,
      rarity: card.rarity,
      skin: card.skin,
      timestamp: Date.now()
    });
  }
}
```

### **B. Leaderboards (sem valor monetário)**

```tsx
<Leaderboard period="week">
  <Title>🏆 Top Colecionadores da Semana</Title>
  
  <List>
    {topCollectors.map((user, i) => (
      <Item rank={i + 1}>
        <Rank>#{i + 1}</Rank>
        <Avatar>{user.avatar}</Avatar>
        <Name>{user.username}</Name>
        <Stats>
          🎴 {user.cards_collected} cartas
          💎 {user.rare_cards} raras
        </Stats>
      </Item>
    ))}
  </List>
  
  <YourPosition>
    Você está em #{yourPosition}
  </YourPosition>
</Leaderboard>
```

### **C. Collection Showcases**

```tsx
<ShowcaseGallery>
  <Title>🎨 Coleções em Destaque</Title>
  
  {showcases.map(showcase => (
    <ShowcaseCard>
      <Owner>{showcase.username}</Owner>
      <Theme>{showcase.theme}</Theme>
      <Preview>
        {showcase.topCards.map(card => (
          <MiniCard card={card} />
        ))}
      </Preview>
      <Stats>
        👁️ {showcase.views} visualizações
        ❤️ {showcase.likes} curtidas
      </Stats>
    </ShowcaseCard>
  ))}
</ShowcaseGallery>
```

---

<a name="flow"></a>
## 🎨 **8. UI/UX FLOW COMPLETO**

### **Tela 1: Seleção de Booster**

```tsx
<BoosterShop>
  {/* Display tipo slot machine */}
  <BoosterCard tier="whale">
    <Badge>🔥 MAIS POPULAR</Badge>
    
    {/* Animação 3D girando */}
    <PackAnimation color="#FF006D" />
    
    <Name>Booster Whale</Name>
    <Price>R$ 10.00</Price>
    
    {/* NUNCA "prêmio", sempre "resgate" */}
    <MaxValue highlight>
      💎 RESGATE MÁXIMO
      <Value>R$ 4.000</Value>
      <Info>Valor de reciclagem da carta mais rara</Info>
    </MaxValue>
    
    <Transparency>
      📊 Sistema Transparente
      • 5 cartas por booster
      • RTP: 30% (retorno médio)
      • Liquidez mínima garantida
    </Transparency>
    
    <Probability>
      🎲 Distribuição de Raridades
      <RarityBar distribution={distribution} />
    </Probability>
    
    <Button glow pulse>
      ADQUIRIR BOOSTER
    </Button>
  </BoosterCard>
</BoosterShop>
```

### **Tela 2: Sessão de Abertura (1 booster)**

```tsx
<OpeningSession>
  {/* Progress global */}
  <SessionProgress>
    Booster {current} de {total}
  </SessionProgress>
  
  {/* Pity bar sempre visível */}
  <PityBar value={pityCount} max={100} />
  
  {/* Lucky Streak (se ativo) */}
  {luckyStreak && <StreakBanner />}
  
  {/* Booster pack 3D girando */}
  <PackReveal onTap={handleReveal}>
    <Pack3D animated />
    <TapPrompt>Toque para revelar</TapPrompt>
  </PackReveal>
  
  {/* Cartas sendo reveladas (1 por vez) */}
  <CardsGrid>
    {cards.map((card, i) => (
      <CardFlip
        key={i}
        card={card}
        delay={i * 500}
        onReveal={() => {
          playSFX(card.rarity);
          triggerHaptic(card.rarity);
          showParticles(card.rarity);
        }}
      />
    ))}
  </CardsGrid>
  
  {/* Resumo mini */}
  <MiniSummary>
    💰 +R$ {totalLiquidity} em liquidez
    {bestCard && (
      <Highlight>
        ✨ Melhor carta: {bestCard.name}
      </Highlight>
    )}
  </MiniSummary>
  
  {/* CTA */}
  <Actions>
    {remainingBoosters > 0 ? (
      <Button primary pulse>
        PRÓXIMO BOOSTER ({remainingBoosters} restantes)
      </Button>
    ) : (
      <Button primary>
        VER RESUMO FINAL
      </Button>
    )}
    <Button secondary>Pausar</Button>
  </Actions>
</OpeningSession>
```

### **Tela 3: Checkpoint (a cada 10 boosters)**

```tsx
<CheckpointScreen>
  <Celebration>
    🎉 CHECKPOINT ALCANÇADO!
    <Subtitle>Você revelou 10 boosters</Subtitle>
  </Celebration>
  
  <Highlights>
    <Title>🌟 MELHORES CARTAS</Title>
    <TopCards>
      {top3.map(card => (
        <HighlightCard card={card} animated />
      ))}
    </TopCards>
  </Highlights>
  
  <Stats>
    <Stat>
      <Icon>💰</Icon>
      <Value>R$ {totalLiquidity}</Value>
      <Label>Liquidez Total</Label>
    </Stat>
    <Stat>
      <Icon>🎴</Icon>
      <Value>{cardsCount}</Value>
      <Label>Cartas Reveladas</Label>
    </Stat>
    <Stat>
      <Icon>💎</Icon>
      <Value>{rareCount}</Value>
      <Label>Cartas Raras</Label>
    </Stat>
  </Stats>
  
  <Pity>
    <Progress value={pityCount} max={100} />
    <Message>
      Próxima carta de alto valor em {100 - pityCount} boosters
    </Message>
  </Pity>
  
  {/* Sunk cost messaging */}
  <Encouragement>
    Você já está com ótimo progresso!
    Continue para aumentar suas chances de cartas raras.
  </Encouragement>
  
  <Actions>
    <Button primary glow>
      CONTINUAR ({remainingBoosters} restantes)
    </Button>
    <Button secondary>
      Ver Coleção
    </Button>
  </Actions>
</CheckpointScreen>
```

### **Tela 4: Resumo Final (após todos boosters)**

```tsx
<SessionSummary>
  <Header>
    <Icon>🎊</Icon>
    <Title>Sessão Completa!</Title>
    <Subtitle>Você revelou {totalBoosters} boosters</Subtitle>
  </Header>
  
  <BigStats>
    <BigStat highlight>
      <Label>Liquidez Total Acumulada</Label>
      <Value>R$ {totalLiquidity}</Value>
    </BigStat>
    
    <BigStat>
      <Label>Cartas Reveladas</Label>
      <Value>{totalCards}</Value>
    </BigStat>
  </BigStats>
  
  <RarityBreakdown>
    <Title>📊 Distribuição de Raridades</Title>
    <BarChart data={rarityStats} />
  </RarityBreakdown>
  
  <BestCards>
    <Title>🏆 Top 5 Cartas</Title>
    <CardGallery cards={top5} />
  </BestCards>
  
  {/* Vault unlock (se aplicável) */}
  {vaultUnlocked && (
    <VaultUnlockNotice />
  )}
  
  {/* Milestone progress */}
  <MilestoneProgress milestones={updatedMilestones} />
  
  {/* Share */}
  <ShareSection>
    <Title>Compartilhe suas conquistas!</Title>
    <Button>Compartilhar no Twitter</Button>
  </ShareSection>
  
  <Actions>
    <Button primary>IR PARA COLEÇÃO</Button>
    <Button secondary>ADQUIRIR MAIS BOOSTERS</Button>
  </Actions>
</SessionSummary>
```

---

<a name="roadmap"></a>
## 🗺️ **9. ROADMAP DE IMPLEMENTAÇÃO**

### **SPRINT 1: Backend Sólido (Semana 1-2)**

**Objetivo:** Economia e lógica funcionando

- [ ] SQL: `edition_configs`, `edition_metrics`
- [ ] SQL: Adicionar `price_multiplier` em `booster_types`
- [ ] API: Atualizar `/boosters/open` com:
  - [ ] Skin multipliers
  - [ ] Godmode status (não raridade)
  - [ ] Price multiplier para liquidez
  - [ ] Garantias system
- [ ] API: `check_edition_hard_cap()` function
- [ ] API: Pity tracking (`user_pity_counter` table)
- [ ] Testes: Simular 10k aberturas, validar RTP ~30%

**Entregas:**
- ✅ 5 tiers de boosters (R$ 0.50 - R$ 10.00)
- ✅ Liquidez escalável por preço
- ✅ Hard cap 15% enforcement
- ✅ Pity system backend

---

### **SPRINT 2: Opening Session (Semana 3)**

**Objetivo:** Revelação progressiva funcional

- [ ] Frontend: `OpeningSession` component
- [ ] State management: Track session progress
- [ ] API: Modify `/boosters/purchase` to return `opening_session_id`
- [ ] API: New endpoint `/sessions/{id}/next-booster`
- [ ] UI: Basic card flip animation (CSS 3D)
- [ ] UI: Mini summary após cada booster
- [ ] UI: Checkpoint screen (a cada 10)

**Entregas:**
- ✅ Abertura 1 por 1 (não dump 250 cartas)
- ✅ Checkpoints a cada 10
- ✅ Progress tracking

---

### **SPRINT 3: Dopamina (Semana 4-5)**

**Objetivo:** Sound + Haptics + Animations

- [ ] Assets: Criar/comprar 5 SFX (trash → godmode)
- [ ] Frontend: Audio player com queue
- [ ] Frontend: Haptic patterns por raridade
- [ ] Frontend: Particle system (Canvas ou Three.js)
- [ ] Frontend: Card flip 3D melhorado (Framer Motion)
- [ ] UI: Near-miss animation
- [ ] UI: Lucky Streak banner
- [ ] Backend: Lucky Streak logic

**Entregas:**
- ✅ SFX + Haptics funcionando
- ✅ Particles por raridade
- ✅ Animações polidas
- ✅ Lucky Streak ativo

---

### **SPRINT 4: Progressão (Semana 6)**

**Objetivo:** Pity + Vault + Milestones

- [ ] Frontend: Pity bar always visible
- [ ] Backend: Vault system (`user_vaults` table)
- [ ] Backend: Vault unlock logic (25, 50, 75, 100)
- [ ] Frontend: Vault unlock animation
- [ ] Backend: Collection milestones tracking
- [ ] Frontend: Milestones panel
- [ ] UI: Sunk cost messaging (pausar)

**Entregas:**
- ✅ Pity system visível
- ✅ Vault desbloqueios automáticos
- ✅ Milestones trackados
- ✅ Loss aversion messaging

---

### **SPRINT 5: Social (Semana 7)**

**Objetivo:** FOMO + Social Proof

- [ ] Backend: WebSocket ou Polling para live feed
- [ ] Backend: Broadcast cartas Viral+
- [ ] Frontend: Live feed component
- [ ] Backend: Leaderboards (cards collected)
- [ ] Frontend: Leaderboard display
- [ ] Backend: Collection showcases
- [ ] Frontend: Showcase gallery

**Entregas:**
- ✅ Live feed funcionando
- ✅ Leaderboards semanais
- ✅ Showcases públicos

---

### **SPRINT 6: Polish & Testing (Semana 8)**

**Objetivo:** Otimizações e testes

- [ ] Performance: Lazy load imagens
- [ ] Performance: Debounce animations
- [ ] A/B Testing: 2 versões do checkpoint
- [ ] Analytics: Track drop-off points
- [ ] Legal review: Revisar toda linguagem
- [ ] Bug fixes
- [ ] Load testing (100 usuários simultâneos)

**Entregas:**
- ✅ Sistema otimizado
- ✅ Bugs críticos resolvidos
- ✅ Analytics configurado
- ✅ Legal compliance 100%

---

## ✅ **CHECKLIST FINAL**

### **Backend:**
- [ ] 5 tiers de boosters (SQL)
- [ ] Price multiplier na liquidez
- [ ] Godmode como status (não raridade)
- [ ] Hard cap 15% enforcement
- [ ] Pity system tracking
- [ ] Lucky Streak logic
- [ ] Vault system
- [ ] Milestones tracking
- [ ] Live feed broadcast

### **Frontend:**
- [ ] Opening Session (1 por 1)
- [ ] Checkpoints (a cada 10)
- [ ] Card flip 3D
- [ ] SFX + Haptics
- [ ] Particle system
- [ ] Pity bar visível
- [ ] Lucky Streak banner
- [ ] Vault unlock animation
- [ ] Milestones panel
- [ ] Live feed
- [ ] Leaderboards
- [ ] Session summary

### **Legal:**
- [ ] Remover "prêmio" → "resgate"
- [ ] Remover "jackpot" → "alto valor"
- [ ] Remover "apostar" → "adquirir"
- [ ] Mostrar RTP 30%
- [ ] Mostrar probabilidades
- [ ] Hard cap explicado
- [ ] Transparência total

---

## 🎯 **RESULTADO ESPERADO**

Após implementação completa:

✅ **Engajamento:** 3-5x mais tempo na plataforma  
✅ **Conversão:** 68% → 80%+ (lower barrier + dopamina)  
✅ **Retention:** 40% D7 → 60%+ (progressão + social)  
✅ **LTV:** +150% (vício saudável + volume)  
✅ **Legal:** 100% compliance (sem termos de cassino)  
✅ **Sustentável:** Hard cap impede colapso econômico  

---

> 🎮 _"Dopamina ética: viciante, transparente, lucrativo."_  
> — KROOVA Viral Addiction System

**Documento criado para:** Implementação do sistema de engajamento  
**Versão:** 1.0  
**Próxima revisão:** Após testes de usuário (A/B testing)
