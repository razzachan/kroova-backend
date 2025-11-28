# 🎮 Pesquisa: Animações de Abertura de Booster - Hearthstone & Pokémon TCG Pocket

## 📊 Análise Comparativa

### **Hearthstone Card Pack Opening**

#### Mecânica Principal:
1. **Clique no Pack** → Pack explode revelando 5 cartas viradas de costas
2. **Cartas aparecem em arco/leque** (fan layout)
3. **Hover sobre carta** → Borda colorida por raridade pisca/pulsa
   - Comum: Sem borda
   - Rare: Azul brilhante
   - Epic: Roxo intenso
   - Legendary: Laranja dourado radiante
4. **Clique na carta** → Flip 3D suave com partículas
5. **Carta revelada** → Permanece na posição, próxima carta clicável

#### Efeitos Visuais Críticos:
- **Glow por raridade** no hover (antes do flip)
- **Partículas coloridas** durante flip
- **Som característico** por raridade
- **Camera shake** em legendary
- **Ray burst** (raios dourados) em cartas legendary

---

### **Pokémon TCG Pocket**

#### Mecânica Principal:
1. **Pack Selection** → Pack gira em 3D mostrando arte
2. **Tap para abrir** → Pack rasga/abre com animação
3. **Cartas surgem em sequência** (não todas de uma vez)
4. **Efeito "bend/curva"** nas cartas (físico realista)
5. **Hover/arrasto** → Carta levanta ligeiramente (parallax)
6. **Drag para revelar** → Flip suave com inércia
7. **Sparkle/brilho** constante em raras

#### Inovações:
- **Bend realista** (cartas curvam ao serem puxadas)
- **Parallax 3D** no hover
- **Arrasto físico** (não apenas clique)
- **Sequência progressiva** (cartas aparecem uma por uma)
- **Brilhos animados** (holográfico em movimento)

---

## 🎯 Síntese: O que Fazer no Kroova

### **1. Hover Effects (Antes do Flip)**

```tsx
// Adicionar ao CardFlip
const [isHovered, setIsHovered] = useState(false);

<div
  onMouseEnter={() => setIsHovered(true)}
  onMouseLeave={() => setIsHovered(false)}
  style={{
    transform: isHovered ? 'translateY(-8px) scale(1.05)' : 'none',
    boxShadow: isHovered 
      ? `0 0 30px ${getRarityColor(rarity)}, 0 8px 16px rgba(0,0,0,0.3)`
      : '0 4px 8px rgba(0,0,0,0.2)',
    transition: 'all 0.2s ease-out'
  }}
>
```

### **2. Glow Pulsante por Raridade**

```css
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 20px var(--rarity-color); }
  50% { box-shadow: 0 0 40px var(--rarity-color), 0 0 60px var(--rarity-color); }
}

.card-hover-legendary {
  animation: pulse-glow 1.5s ease-in-out infinite;
  --rarity-color: #FFD700;
}
```

### **3. Animação de Entrada em Arco (Hearthstone-style)**

```tsx
// Cartas aparecem em leque após pack explodir
const cardPositions = cards.map((_, i) => ({
  x: (i - cards.length / 2) * 120, // Espaçamento horizontal
  y: Math.abs(i - cards.length / 2) * 20, // Curva suave
  rotation: (i - cards.length / 2) * 5, // Rotação leve
  delay: i * 100 // Aparecem em sequência
}));

<motion.div
  initial={{ opacity: 0, scale: 0.5, y: -200 }}
  animate={{ 
    opacity: 1, 
    scale: 1, 
    y: 0,
    x: cardPositions[i].x,
    rotate: cardPositions[i].rotation
  }}
  transition={{ delay: cardPositions[i].delay / 1000, type: 'spring' }}
>
```

### **4. Partículas no Flip**

```tsx
function ParticleEmitter({ rarity, active }: { rarity: string; active: boolean }) {
  const particleCount = rarity === 'legendary' ? 30 : 15;
  const color = getRarityColor(rarity);
  
  if (!active) return null;
  
  return (
    <div className="absolute inset-0 pointer-events-none">
      {Array.from({ length: particleCount }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{ backgroundColor: color }}
          initial={{ 
            x: '50%', 
            y: '50%', 
            opacity: 1 
          }}
          animate={{ 
            x: `${50 + Math.random() * 100 - 50}%`,
            y: `${50 + Math.random() * 100 - 50}%`,
            opacity: 0,
            scale: 0
          }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}
```

### **5. Ray Burst (Legendary)**

```tsx
function RayBurst({ active }: { active: boolean }) {
  if (!active) return null;
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute top-1/2 left-1/2 w-1 h-full origin-top"
          style={{
            background: 'linear-gradient(to bottom, #FFD700, transparent)',
            transform: `rotate(${i * 30}deg)`,
          }}
          initial={{ scaleY: 0, opacity: 0 }}
          animate={{ scaleY: 1, opacity: 0.6 }}
          transition={{ duration: 0.4, delay: i * 0.03 }}
        />
      ))}
    </div>
  );
}
```

### **6. Parallax no Hover (Pokémon-style)**

```tsx
function Card3DParallax({ children }: { children: React.ReactNode }) {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    
    setRotation({ 
      x: y * 10, // Tilt vertical
      y: -x * 10 // Tilt horizontal
    });
  };
  
  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setRotation({ x: 0, y: 0 })}
      style={{
        transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
        transition: 'transform 0.1s ease-out'
      }}
    >
      {children}
    </div>
  );
}
```

### **7. Sequência de Abertura Completa**

```tsx
// Estado da animação
const [animationStage, setAnimationStage] = useState<'pack' | 'explosion' | 'fan' | 'reveal'>('pack');

// 1. Pack fechado pulsando
<PackClosed onTap={() => setAnimationStage('explosion')} />

// 2. Explosão do pack
{animationStage === 'explosion' && (
  <motion.div
    initial={{ scale: 1 }}
    animate={{ scale: 3, opacity: 0 }}
    onAnimationComplete={() => setAnimationStage('fan')}
  >
    💥
  </motion.div>
)}

// 3. Cartas aparecem em leque
{animationStage === 'fan' && (
  <CardsFanLayout 
    cards={cards} 
    onCardClick={(i) => revealCard(i)}
  />
)}
```

---

## 🎨 Cores por Raridade (Hearthstone Pattern)

```tsx
const RARITY_COLORS = {
  common: '#9D9D9D',     // Cinza (sem glow)
  rare: '#0070DD',       // Azul
  epic: '#A335EE',       // Roxo
  legendary: '#FF8000',  // Laranja/Dourado
  godmode: '#FF1493'     // Rosa neon (Kroova exclusivo)
};

const RARITY_GLOWS = {
  common: 'none',
  rare: '0 0 20px #0070DD, 0 0 40px #0070DD',
  epic: '0 0 30px #A335EE, 0 0 60px #A335EE',
  legendary: '0 0 40px #FF8000, 0 0 80px #FF8000, 0 0 120px #FFD700',
  godmode: '0 0 50px #FF1493, 0 0 100px #FF1493, 0 0 150px #FF69B4'
};
```

---

## 🔊 Áudio por Evento

```tsx
const SOUND_EFFECTS = {
  packOpen: '/sfx/pack-rip.mp3',
  cardFlip: '/sfx/card-flip.mp3',
  rarePing: '/sfx/rare-reveal.mp3',
  epicWhoosh: '/sfx/epic-whoosh.mp3',
  legendaryBoom: '/sfx/legendary-boom.mp3',
  godmodeChime: '/sfx/godmode-ethereal.mp3'
};

function playRevealSound(rarity: string) {
  const audio = new Audio(SOUND_EFFECTS[`${rarity}Ping`] || SOUND_EFFECTS.cardFlip);
  audio.volume = 0.7;
  audio.play();
}
```

---

## 📱 Haptic Feedback (Mobile)

```tsx
function triggerHaptic(rarity: string) {
  if (!navigator.vibrate) return;
  
  const patterns = {
    common: [50],
    rare: [100, 50, 100],
    epic: [150, 50, 150, 50, 150],
    legendary: [200, 100, 200, 100, 200],
    godmode: [300, 100, 300, 100, 300, 100, 300]
  };
  
  navigator.vibrate(patterns[rarity] || [50]);
}
```

---

## 🎯 Implementação Priorizada

### **Fase 1: Hover Effects** ✅
- Lift up (translateY -8px)
- Scale 1.05
- Glow por raridade
- Transição suave

### **Fase 2: Flip Particles** ✅
- Burst de partículas ao revelar
- Cor baseada em raridade
- 15-30 partículas por flip

### **Fase 3: Fan Layout** 🔄
- Cartas aparecem em arco
- Sequência progressiva (delay escalonado)
- Rotação leve por posição

### **Fase 4: Pack Explosion** 🔄
- Animação de explosão ao abrir pack
- Pack desaparece com scale + fade
- Transição para fan layout

### **Fase 5: Ray Burst (Legendary)** 🔜
- Raios dourados em cartas legendary/godmode
- Rotação de 360° dividida em 12 raios
- Fade in progressivo

### **Fase 6: Parallax 3D** 🔜
- Tilt baseado em posição do mouse
- Perpectiva 3D realista
- Transição ultra suave (0.1s)

---

## 🚀 Próximos Passos

1. ✅ Adicionar hover lift + scale + glow
2. ✅ Implementar partículas no flip
3. 🔄 Criar fan layout (CardsFanLayout component)
4. 🔄 Adicionar pack explosion animation
5. 🔜 Integrar ray burst para legendary
6. 🔜 Adicionar parallax 3D no hover
7. 🔜 Sons por raridade
8. 🔜 Haptic feedback mobile

---

## 📚 Referências
- Hearthstone Pack Opening: https://www.youtube.com/watch?v=xyPAWY24DZI
- Pokémon TCG Pocket: https://www.youtube.com/watch?v=g8K7JxK3xV4
- Framer Motion Docs: https://www.framer.com/motion/
- CSS 3D Transforms: https://developer.mozilla.org/en-US/docs/Web/CSS/transform
