# 🔊 Guia de Assets de Áudio - Kroova TCG

## 📚 Sistema de Áudio Atual

O Kroova usa **síntese profissional em tempo real** com:
- **ADSR Envelope** (Attack, Decay, Sustain, Release)
- **Osciladores harmônicos** em camadas
- **Filtros de frequência** dinâmicos
- **Suporte para Howler.js** quando arquivos reais estiverem disponíveis

---

## 🎵 Sons Necessários

### **Estrutura de Arquivos:**
```
frontend/public/sfx/
├── card-flip.mp3          # Som base de flip de carta
├── pack-open.mp3          # Abertura de pack (explosão suave)
├── reveal-common.mp3      # Trash rarity
├── reveal-rare.mp3        # Meme rarity
├── reveal-epic.mp3        # Viral rarity
├── reveal-legendary.mp3   # Legendary rarity
└── reveal-godmode.mp3     # Épica/Godmode (mais épico)
```

---

## 🆓 Fontes de Áudio Gratuitas (Alta Qualidade)

### **1. Freesound.org** (Creative Commons)
**URL:** https://freesound.org/

#### **Buscar por:**
- **Card flip:** "card flip", "paper flip", "playing card"
- **Pack open:** "box open", "foil tear", "package rip"
- **Reveal common:** "soft ping", "glass clink", "light chime"
- **Reveal rare:** "bright chime", "bell ring", "magic sparkle"
- **Reveal epic:** "power up", "level up", "success fanfare"
- **Reveal legendary:** "fanfare", "triumph", "epic win"
- **Reveal godmode:** "heavenly choir", "angelic", "divine intervention"

**Recomendações específicas:**
- **Card Flip:** https://freesound.org/people/f4ngy/sounds/240776/
- **Magic Sparkle:** https://freesound.org/people/Raclure/sounds/483602/
- **Epic Fanfare:** https://freesound.org/people/LittleRobotSoundFactory/sounds/270319/

---

### **2. Pixabay** (Royalty-Free)
**URL:** https://pixabay.com/sound-effects/

#### **Categorias úteis:**
- **Interface Sounds** → Card flips, clicks
- **Magic & Fantasy** → Sparkles, chimes, ethereal
- **Success & Achievement** → Fanfares, victories

**Downloads diretos:**
- Card Shuffle: https://pixabay.com/sound-effects/search/card%20shuffle/
- Magic Chime: https://pixabay.com/sound-effects/search/magic%20chime/
- Epic Win: https://pixabay.com/sound-effects/search/epic%20victory/

---

### **3. Mixkit** (100% Free)
**URL:** https://mixkit.co/free-sound-effects/

#### **Packs recomendados:**
- **Game UI Sounds** → https://mixkit.co/free-sound-effects/ui/
- **Fantasy & Magic** → https://mixkit.co/free-sound-effects/fantasy/
- **Success & Win** → https://mixkit.co/free-sound-effects/success/

---

### **4. OpenGameArt.org**
**URL:** https://opengameart.org/

#### **Buscar:**
- "card game sounds"
- "collectible card"
- "TCG sound effects"

**Exemplo:** https://opengameart.org/content/card-sounds

---

### **5. ZapSplat** (Free com atribuição)
**URL:** https://www.zapsplat.com/

#### **Categorias:**
- **Game Sounds** > Card Games
- **Interface** > Notifications
- **Fantasy** > Magic & Spells

---

## 🎨 Características por Raridade

### **Trash (Comum)**
- **Tom:** Suave, discreto
- **Duração:** 0.2-0.3s
- **Referência:** Ping metálico leve, "clink" de vidro
- **Vibe:** "ok, normal"

### **Meme (Rara)**
- **Tom:** Brilhante, agradável
- **Duração:** 0.3-0.5s
- **Referência:** Chime cristalino, "ding" de sino pequeno
- **Vibe:** "legal, gostei"

### **Viral (Épica)**
- **Tom:** Mágico, crescente
- **Duração:** 0.5-0.8s
- **Referência:** Sparkle ascendente, "whoosh" mágico
- **Vibe:** "nossa, que massa!"

### **Legendary**
- **Tom:** Majestoso, impactante
- **Duração:** 0.8-1.2s
- **Referência:** Fanfarra curta, "boom" com reverb
- **Vibe:** "CARALHO!!!"

### **Épica/Godmode**
- **Tom:** Celestial, transcendental
- **Duração:** 1.2-2.0s
- **Referência:** Coro angelical, "chime" etéreo + impacto
- **Vibe:** "ISSO NÃO É POSSÍVEL!!!"

---

## 🛠️ Como Adicionar Sons Reais

### **Passo 1: Download e Conversão**
```bash
# Baixar arquivos
# Converter para MP3 (se necessário)
ffmpeg -i input.wav -codec:a libmp3lame -qscale:a 2 output.mp3

# Normalizar volume
ffmpeg -i input.mp3 -filter:a loudnorm output-normalized.mp3
```

### **Passo 2: Colocar na Pasta**
```
frontend/public/sfx/reveal-legendary.mp3
```

### **Passo 3: Ativar Howler.js**
```typescript
// No código que chama cardAudio
import { cardAudio } from '@/lib/cardAudio';

// Ativar áudio real (descomente quando tiver arquivos)
cardAudio.enableRealAudio(true);
```

**Pronto!** O sistema vai automaticamente usar os arquivos reais em vez da síntese.

---

## 🎛️ Configuração Avançada

### **Audio Sprites (Performance)**
Para otimizar carregamento, combine todos os sons em um único arquivo:

```typescript
// Exemplo de sprite sheet
const sprite = new Howl({
  src: ['sounds-sprite.mp3'],
  sprite: {
    cardFlip: [0, 200],        // 0ms - 200ms
    trash: [200, 300],         // 200ms - 500ms
    meme: [500, 500],          // 500ms - 1000ms
    viral: [1000, 800],        // 1s - 1.8s
    legendary: [1800, 1200],   // 1.8s - 3s
    godmode: [3000, 2000]      // 3s - 5s
  }
});
```

### **Criar Sprite com FFmpeg:**
```bash
ffmpeg -i card-flip.mp3 -i reveal-common.mp3 -i reveal-rare.mp3 \
       -i reveal-epic.mp3 -i reveal-legendary.mp3 -i reveal-godmode.mp3 \
       -filter_complex concat=n=6:v=0:a=1 sounds-sprite.mp3
```

---

## 🎯 Síntese Atual vs. Arquivos Reais

### **Síntese Atual:**
✅ **Prós:**
- Zero latência (gerado em tempo real)
- Sem carregamento de arquivos
- Customizável programaticamente
- ADSR envelope profissional
- Harmônicos e filtros dinâmicos

❌ **Contras:**
- Som "sintético" (óbvio)
- Menos caráter/personalidade
- Não tão impactante

### **Arquivos Reais:**
✅ **Prós:**
- Som profissional e impactante
- Mixagem de estúdio
- Efeitos complexos (reverb, delay, etc)
- Mais satisfatório

❌ **Contras:**
- Precisa carregar arquivos
- Atraso inicial (preload)
- Tamanho (bandwidth)

---

## 📊 Especificações Técnicas

### **Formato Recomendado:**
- **Codec:** MP3 (maior compatibilidade)
- **Bitrate:** 192 kbps (qualidade alta, tamanho ok)
- **Sample Rate:** 44.1 kHz
- **Canais:** Stereo

### **Normalização:**
- **Peak Level:** -1 dB (evita clipping)
- **LUFS Target:** -16 LUFS (loudness padrão)

### **Duração Máxima:**
- Common: 0.3s
- Rare: 0.5s
- Epic: 0.8s
- Legendary: 1.2s
- Godmode: 2.0s

---

## 🚀 Próximos Passos

### **Fase 1: Sons Básicos** ✅
- [x] Sistema de síntese ADSR implementado
- [x] Howler.js instalado
- [x] Fallback automático

### **Fase 2: Sons Reais** 🔄
- [ ] Download de 7 arquivos do Freesound/Pixabay
- [ ] Conversão e normalização
- [ ] Teste de compatibilidade
- [ ] Ajuste de volume relativo

### **Fase 3: Audio Sprites** 🔜
- [ ] Combinar em sprite único
- [ ] Implementar carregamento otimizado
- [ ] Preload ao abrir app

### **Fase 4: Spatial Audio** 🔜
- [ ] Pan L/R baseado em posição da carta
- [ ] Reverb dinâmico
- [ ] Doppler effect (cartas se movendo)

---

## 📝 Licenciamento

Ao usar sons de terceiros:
1. **Verificar licença** (CC0, CC-BY, etc)
2. **Dar atribuição** se necessário
3. **Salvar info** em `CREDITS.md`

Exemplo de créditos:
```markdown
## Sound Effects
- Card Flip: "Paper Flip" by f4ngy (CC0) - Freesound
- Magic Sparkle: "Sparkle" by Raclure (CC-BY) - Freesound
- Epic Fanfare: "Success" by LittleRobotSoundFactory (CC0) - Freesound
```

---

## 🎮 Referências de Outros TCGs

### **Hearthstone:**
- Som de pack opening: Explosão mágica + partículas
- Card reveal: Whoosh + chime por raridade
- Legendary: Fanfarra épica + raios dourados

### **Pokémon TCG Pocket:**
- Pack opening: Tear + sparkle
- Card reveal: Brilho holográfico + chime suave
- Rare: Crescendo musical progressivo

### **Magic: The Gathering Arena:**
- Card draw: Shuffle rápido
- Mythic reveal: Coro + impacto
- Foil shimmer: Whoosh contínuo

---

## 💡 Dicas Finais

1. **Teste em dispositivos reais** (mobile + desktop)
2. **Respeite o volume do usuário** (não seja invasivo)
3. **Preload crítico** (pack back sound)
4. **Fallback gracioso** (sempre ter síntese como backup)
5. **Performance first** (sprite > arquivos individuais)

---

**Howler.js está pronto!** Quando tiver os arquivos, é só colocar em `/public/sfx/` e chamar `cardAudio.enableRealAudio(true)` 🔊
