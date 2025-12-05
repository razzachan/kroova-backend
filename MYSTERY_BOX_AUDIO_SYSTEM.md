# Mystery Box Audio System - ElevenLabs Integration

## 📋 Overview

Sistema completo de efeitos sonoros para as Mystery Boxes gerado usando **ElevenLabs Sound Effects API**. Todos os sons foram criados com IA para dar uma experiência imersiva e cyberpunk.

---

## 🔊 Sound Effects Generated

### 1. **Spinning Sound** (`mystery-box-spinning.mp3`)
- **Duration:** 2.5 seconds
- **Size:** 39.6 KB
- **Usage:** Loop durante a animação de abertura
- **Description:** Som mecânico de slot machine com tensão crescente, cliques rítmicos, rotação metálica acelerando
- **Características:** 
  - Ritmo acelerado
  - Efeitos digitais
  - Engrenagens cyberpunk
  - Tensão crescente

---

### 2. **Lose Sound** (`mystery-box-lose.mp3`)
- **Duration:** 1.2 seconds
- **Size:** 19.6 KB
- **Usage:** 90% dos casos - quando perde 20% (R$ 0.10-2.00)
- **Description:** Som suave de decepção com tom descendente eletrônico, efeito wah-wah, vibe "quase!"
- **Características:**
  - Não é agressivo ou muito triste
  - Tom simpático e encorajador
  - Efeito de "tenta de novo"
  - Glitch digital sutil

---

### 3. **Medium Win Sound** (`mystery-box-medium-win.mp3`)
- **Duration:** 2.0 seconds
- **Size:** 32.3 KB
- **Usage:** 9% dos casos - vitória 3x (R$ 1.50-30.00)
- **Description:** Celebração satisfatória com melodia chiptune, sinos cyber, cascata de moedas digitais
- **Características:**
  - Ascendente e alegre
  - Arpeggio de synth
  - Efeito de brilho neon
  - "Cha-ching!" futurístico

---

### 4. **Jackpot Sound** (`mystery-box-jackpot.mp3`)
- **Duration:** 4.0 seconds
- **Size:** 63.7 KB
- **Usage:** 1% dos casos - JACKPOT 30x (R$ 15-300)
- **Description:** CELEBRAÇÃO ÉPICA com fanfarra cyber, synth braam massivo, bass drop, confete
- **Características:**
  - Máxima energia e excitação
  - Cascata de moedas
  - Explosão de confete
  - 808 hits distorcidos
  - Impacto monumental

---

### 5. **Purchase Sound** (`mystery-box-purchase.mp3`)
- **Duration:** 0.6 seconds
- **Size:** 10.2 KB
- **Usage:** Ao comprar uma Mystery Box na loja
- **Description:** Confirmação rápida de compra, "ka-ching" digital, beep eletrônico
- **Características:**
  - Instantâneo e satisfatório
  - Tom de confirmação
  - Registro de caixa cyber
  - Seguro e profissional

---

### 6. **Reveal Buildup Sound** (`mystery-box-reveal-buildup.mp3`)
- **Duration:** 3.0 seconds
- **Size:** 47.8 KB
- **Usage:** Buildup de tensão antes de revelar o prêmio
- **Description:** Tensão dramática ascendente com pulso de batimento cardíaco, riser de synth glitchado
- **Características:**
  - Suspense intenso
  - Cliques de slot machine acelerando
  - Rumble de sub-bass
  - Pico de tensão máxima

---

## 🎮 Implementation

### Frontend Integration (`app/mystery-box/opening/page.tsx`)

```tsx
// Audio refs
const spinningAudioRef = useRef<HTMLAudioElement | null>(null);
const revealAudioRef = useRef<HTMLAudioElement | null>(null);
const resultAudioRef = useRef<HTMLAudioElement | null>(null);

// Initialize audio on mount
useEffect(() => {
  spinningAudioRef.current = new Audio('/sfx/mystery-box/mystery-box-spinning.mp3');
  spinningAudioRef.current.loop = true;
  spinningAudioRef.current.volume = 0.6;
  
  revealAudioRef.current = new Audio('/sfx/mystery-box/mystery-box-reveal-buildup.mp3');
  revealAudioRef.current.volume = 0.7;

  return () => {
    // Cleanup on unmount
    spinningAudioRef.current?.pause();
    revealAudioRef.current?.pause();
    resultAudioRef.current?.pause();
  };
}, []);

// Play result sound based on prize tier
const playResultSound = (tier: 'lose' | 'medium' | 'jackpot') => {
  const soundMap = {
    'lose': '/sfx/mystery-box/mystery-box-lose.mp3',
    'medium': '/sfx/mystery-box/mystery-box-medium-win.mp3',
    'jackpot': '/sfx/mystery-box/mystery-box-jackpot.mp3'
  };

  resultAudioRef.current = new Audio(soundMap[tier]);
  resultAudioRef.current.volume = tier === 'jackpot' ? 0.8 : 0.7;
  resultAudioRef.current.play().catch(e => console.log('Audio play failed:', e));
};
```

### Audio Sequence Flow

```
1. USER CLICKS "ABRIR"
   ↓
2. START SPINNING ANIMATION
   ↓ Play spinning.mp3 (loop)
   ↓
3. WAIT 2.5 seconds
   ↓ Stop spinning.mp3
   ↓ Play reveal-buildup.mp3
   ↓
4. CALL API (/api/v1/mystery-box/open)
   ↓ Wait 0.5s
   ↓
5. RECEIVE RESULT
   ↓ Stop all previous sounds
   ↓ Play result sound based on tier:
   ↓   - lose.mp3 (90%)
   ↓   - medium-win.mp3 (9%)
   ↓   - jackpot.mp3 (1%)
   ↓
6. SHOW RESULT + ANIMATION
   ↓ If jackpot → extra celebration animation
   ↓
7. DONE
```

---

## 🛠️ Generation Script

**File:** `scripts/generate-mystery-box-sounds.py`

### Usage

```bash
# Generate all sounds
python generate-mystery-box-sounds.py --all --delay 2

# Generate specific sound
python generate-mystery-box-sounds.py --sound jackpot

# Generate multiple specific sounds
python generate-mystery-box-sounds.py --sound spinning lose medium_win

# List all available sounds
python generate-mystery-box-sounds.py --list
```

### Requirements

```bash
pip install elevenlabs python-dotenv
```

### Environment Variables

```bash
ELEVENLABS_API_KEY=your_api_key_here
```

---

## 📊 Audio Specifications

| Sound | Duration | Size | Volume | Loop | Prompt Length |
|-------|----------|------|--------|------|---------------|
| Spinning | 2.5s | 39.6 KB | 0.6 | ✅ Yes | 450 chars |
| Lose | 1.2s | 19.6 KB | 0.7 | ❌ No | 450 chars |
| Medium Win | 2.0s | 32.3 KB | 0.7 | ❌ No | 450 chars |
| Jackpot | 4.0s | 63.7 KB | 0.8 | ❌ No | 328 chars |
| Purchase | 0.6s | 10.2 KB | 0.7 | ❌ No | 450 chars |
| Reveal Buildup | 3.0s | 47.8 KB | 0.7 | ❌ No | 450 chars |

**Total Size:** 212.8 KB (6 files)

---

## 🎨 Design Principles

### 1. **Cyberpunk DNA**
- Todos os sons têm elementos eletrônicos e digitais
- Glitches e distorções adicionam textura urban
- Synth layers dão vibe futurística
- Bass drops e 808s para impacto

### 2. **Emotional Mapping**
- **Lose:** Simpático, não punitivo
- **Medium Win:** Satisfatório, recompensador
- **Jackpot:** ÉPICO, inesquecível
- **Spinning:** Ansioso, tenso
- **Buildup:** Suspense máximo
- **Purchase:** Confiável, instantâneo

### 3. **Duration Strategy**
- Sons curtos para ações rápidas (purchase 0.6s)
- Sons médios para eventos principais (wins 1-2s)
- Sons longos para momentos épicos (jackpot 4s)
- Loops seamless para estados contínuos (spinning 2.5s)

### 4. **Volume Balance**
- Spinning: 0.6 (não cansa durante loop)
- Normal wins: 0.7 (satisfatório sem ser alto)
- Jackpot: 0.8 (máximo impacto)
- Buildup: 0.7 (tensão sem ser desconfortável)

---

## 🚀 Deployment

### Files Location

```
frontend/public/sfx/mystery-box/
├── mystery-box-spinning.mp3        (39.6 KB)
├── mystery-box-lose.mp3            (19.6 KB)
├── mystery-box-medium-win.mp3      (32.3 KB)
├── mystery-box-jackpot.mp3         (63.7 KB)
├── mystery-box-purchase.mp3        (10.2 KB)
└── mystery-box-reveal-buildup.mp3  (47.8 KB)
```

### Production URL

**Live:** https://frontend-puohrdldl-razzachans-projects.vercel.app/mystery-box

---

## ✅ Status

- [x] Script de geração criado
- [x] Todos os 6 sons gerados via ElevenLabs
- [x] Sons integrados no frontend
- [x] Sequência de áudio implementada
- [x] Volume balanceado
- [x] Cleanup on unmount
- [x] Error handling para autoplay
- [x] Deploy em produção

---

## 🎯 User Experience Flow

```
USER JOURNEY:
1. Entra na página /mystery-box/opening?id=xxx
2. Vê a caixa idle com brilho suave
3. Clica em "ABRIR MYSTERY BOX"
   ↓ 🔊 Spinning sound (loop) começa
   ↓ 🎨 Caixa gira rapidamente
4. Após 2.5s:
   ↓ 🔊 Spinning para
   ↓ 🔊 Reveal buildup começa
   ↓ 🎨 Tensão aumenta
5. API retorna resultado
   ↓ 🔊 Som apropriado toca (lose/medium/jackpot)
   ↓ 🎨 Animação de resultado
6. Usuário vê prêmio + novo saldo
7. Pode clicar em "Voltar" ou "Abrir Outra"
```

---

## 🎵 Sound Design Philosophy

> "Cada som deve contar uma história. A Mystery Box não é apenas uma aposta - é uma experiência sensorial completa. O som de spinning te deixa ansioso, o buildup te deixa na ponta da cadeira, e o resultado te faz SENTIR a vitória ou a quase-vitória."

### Key Points:
1. **Tension → Release:** Buildup de tensão seguido de release emocional
2. **Reward Scaling:** Som escala com valor do prêmio (lose < medium < JACKPOT)
3. **Feedback Loops:** Cada ação tem resposta sonora imediata
4. **Immersion:** Sons criam ambiente de casino futurístico
5. **Accessibility:** Volumes balanceados, não cansam o ouvido

---

## 💡 Future Enhancements

### Potential Additions:
- [ ] Ambient background music por tier
- [ ] Voiceover para jackpots ("JACKPOT! R$ 300!")
- [ ] Haptic feedback (mobile)
- [ ] Spatial audio (3D sound positioning)
- [ ] User preference: volume control
- [ ] User preference: mute toggle
- [ ] Analytics: track audio engagement

---

## 📝 Technical Notes

### ElevenLabs API Details
- **Model:** Sound Effects Generation
- **Max Prompt Length:** 450 characters
- **Output Format:** MP3
- **Quality:** High fidelity
- **Latency:** ~30-60s per sound
- **Cost:** ~$0.02-0.04 per sound

### Browser Compatibility
- All modern browsers support `<audio>` tag
- Autoplay requires user interaction (solved by click to open)
- MP3 format widely supported
- Fallback: `.catch()` for autoplay failures

---

## 🎉 Conclusion

Sistema de áudio completo e profissional para Mystery Boxes, 100% gerado por IA usando ElevenLabs. Experiência imersiva que transforma uma simples mecânica de RTP em um momento emocionante e memorável.

**Total Development Time:** ~30 minutes (geração + integração)
**Total Cost:** ~$0.24 (6 sounds × $0.04)
**Impact:** ENORME - sons fazem toda a diferença na experiência

---

**Generated:** December 4, 2025
**Status:** ✅ Production Ready
**Next:** Consider user feedback for volume tweaks
