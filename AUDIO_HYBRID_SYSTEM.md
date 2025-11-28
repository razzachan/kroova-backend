# 🎵 KROOVA Hybrid Audio System

Sistema de áudio híbrido combinando:
- **ElevenLabs AI** (sons cinematográficos)
- **Tone.js** (síntese procedural real-time)

---

## 📁 Estrutura de Arquivos

```
frontend/public/sfx/
├── explosions/
│   ├── pack_explosion_epic.mp3      # Explosão épica do booster
│   └── pack_open_cloth.mp3          # Som de tecido rasgando
├── reveals/
│   ├── legendary_reveal.mp3         # Reveal legendário (orquestral)
│   ├── godmode_reveal.mp3          # Reveal godmode (épico máximo)
│   └── rare_reveal.mp3             # Reveal raro (místico)
└── ambient/
    ├── mystical_ambience.mp3       # Ambience místico (loop 30s)
    └── tension_ambience.mp3        # Ambience de tensão (loop 30s)
```

---

## 🚀 Como Gerar os Sons (ElevenLabs)

### 1. **Criar conta ElevenLabs**
- Acesse: https://elevenlabs.io/
- Crie conta gratuita ou paga
- Vá em Settings → API Keys
- Copie sua API key

### 2. **Configurar ambiente**
```bash
cd c:\Kroova

# Criar arquivo .env (copie do .env.example)
copy .env.example .env

# Editar .env e adicionar:
# ELEVENLABS_API_KEY=sk_xxxxxxxxxxxxxxxxxxxxxxxx
```

### 3. **Instalar dependências Python**
```bash
cd scripts
pip install -r requirements.txt
```

### 4. **Gerar todos os sons**
```bash
python generate_sounds_elevenlabs.py
```

Isso vai gerar **10 arquivos MP3** em `frontend/public/sfx/`

---

## 🎮 API de Uso (cardAudio.ts)

### **Sons Procedurais (Tone.js - Zero Latência)**
```typescript
import { cardAudio } from '@/lib/cardAudio';

// Card flip - Snap rápido
cardAudio.playCardFlip();

// Card hover - Shimmer sutil
cardAudio.playCardHover();

// Button click - Pop satisfying
cardAudio.playButtonClick();
```

### **Sons Cinematográficos (ElevenLabs)**
```typescript
// Explosão do pack (início da abertura)
cardAudio.playPackExplosion();

// Reveal de carta legendária
cardAudio.playLegendaryReveal();

// Reveal de carta godmode
cardAudio.playGodmodeReveal();

// Reveal de carta rara
cardAudio.playRareReveal();
```

### **Ambience (Background Loop)**
```typescript
// Iniciar música de fundo místico
cardAudio.startAmbient('mystical');

// Ou tensão
cardAudio.startAmbient('tension');

// Para o ambience
cardAudio.stopAmbient();
```

### **Sistema Unificado**
```typescript
// Automaticamente escolhe ElevenLabs ou procedural
cardAudio.playCardSound('legendary', false); // → ElevenLabs
cardAudio.playCardSound('trash', false);     // → Tone.js procedural
cardAudio.playCardSound('epica', true);      // → Godmode ElevenLabs
```

---

## 📊 Comparação: ElevenLabs vs Tone.js

| Característica | ElevenLabs | Tone.js |
|----------------|------------|---------|
| **Qualidade** | Cinematográfica | Sintética |
| **Latência** | ~100ms (carregamento) | 0ms (real-time) |
| **Tamanho** | ~100KB por arquivo | 0KB (código) |
| **Custo** | ~40 créditos/segundo | Grátis |
| **Customização** | Prompt de texto | Parâmetros JS |
| **Uso ideal** | Momentos épicos | UI interativa |

---

## 🎯 Estratégia Híbrida

### **Use ElevenLabs para:**
- ✅ Explosão do booster pack
- ✅ Reveal de cartas legendary/godmode
- ✅ Ambience de fundo (loops)
- ✅ Momentos cinematográficos únicos

### **Use Tone.js para:**
- ✅ Card flips (muitos por sessão)
- ✅ Hovers em botões/cards
- ✅ Clicks de UI
- ✅ Feedback instantâneo

---

## 💰 Custo Estimado (ElevenLabs)

### Geração inicial (uma vez):
- **10 sons** × média de **2 segundos** = ~20 segundos
- **Custo:** ~800 créditos (20s × 40 créditos/s)
- **Free tier:** 10,000 caracteres/mês (não sei se inclui SFX)
- **Starter ($5/mês):** 30,000 caracteres

### Arquivos gerados:
- Total: ~1.5 MB (10 arquivos MP3)
- **Carregamento:** Uma vez por sessão
- **Cache:** Browser cache permanente

---

## 🔧 Fallback System

Se os arquivos ElevenLabs **não existirem**, o sistema:
1. Tenta carregar o MP3
2. Se falhar → usa síntese antiga (Web Audio API)
3. Console warning mas continua funcionando

```typescript
playPackExplosion() {
  const howl = this.getHowl('packExplosion');
  if (howl) {
    howl.play(); // ✅ ElevenLabs
  } else {
    this.playPackOpen(); // ⚠️ Fallback synthesis
  }
}
```

---

## 🎬 Integração no Código Existente

### PackOpeningAnimation.tsx
```typescript
// Quando o pack explode
cardAudio.playPackExplosion(); // 🎵 ElevenLabs epic explosion
```

### OpeningSession.tsx
```typescript
// Quando revela carta legendary
if (rarity === 'legendary') {
  cardAudio.playLegendaryReveal(); // 🎵 Orchestral hit
}

// Quando revela godmode
if (isGodmode) {
  cardAudio.playGodmodeReveal(); // 🎵 Massive braam
}
```

### Boosters Page
```typescript
// Quando entra na página
useEffect(() => {
  cardAudio.startAmbient('mystical'); // 🎵 Background loop
  return () => cardAudio.stopAmbient();
}, []);

// Hover em card
<div onMouseEnter={() => cardAudio.playCardHover()}>
```

---

## 📝 Prompts Usados (ElevenLabs)

```python
SOUND_EFFECTS = {
    "explosions": [
        {
            "filename": "pack_explosion_epic.mp3",
            "prompt": "Massive booster pack explosion with magical sparkles, cinematic impact and whoosh, glass shattering with mystical chimes",
            "duration": 2.5,
        }
    ],
    "reveals": [
        {
            "filename": "legendary_reveal.mp3",
            "prompt": "Epic legendary card reveal with golden orchestral hit, bright chimes cascading, cinematic braam with angelic choir, triumphant and powerful",
            "duration": 3.0,
        },
        {
            "filename": "godmode_reveal.mp3",
            "prompt": "Ultimate godmode card reveal with dramatic orchestral stab, massive braam impact, choir crescendo, thunder rumble, world-shaking epic moment",
            "duration": 3.5,
        }
    ]
}
```

---

## 🎉 Resultado Final

### Antes (Web Audio API):
- Som sintético
- Não realista
- Difícil customizar

### Depois (Híbrido):
- **UI sounds:** Zero latência (Tone.js)
- **Cinematic moments:** Qualidade de filme (ElevenLabs)
- **Fallback:** Continua funcionando sem arquivos
- **Performance:** Carregamento uma vez, cache permanente

**Melhor dos dois mundos!** 🚀
