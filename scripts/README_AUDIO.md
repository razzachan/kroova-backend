# 🎵 Quick Start - Audio Generation

## 1️⃣ Get ElevenLabs API Key
```
https://elevenlabs.io/ → Sign up → Settings → API Keys
```

## 2️⃣ Configure Environment
```bash
# Create .env file
copy .env.example .env

# Edit .env and add:
ELEVENLABS_API_KEY=sk_your_key_here
```

## 3️⃣ Generate Audio Files
```bash
cd c:\Kroova\scripts
python generate_sounds_elevenlabs.py
```

## 4️⃣ Files Generated
```
frontend/public/sfx/
├── explosions/ (2 files)
├── reveals/ (3 files)
└── ambient/ (2 files)

Total: 7 cinematic MP3 files (~1.5 MB)
```

## 5️⃣ Test Audio
```bash
cd c:\Kroova\frontend
npm run dev
```

Open boosters page → Pack explosion uses ElevenLabs!

---

## 🎮 Usage Examples

```typescript
import { cardAudio } from '@/lib/cardAudio';

// Procedural (zero latency)
cardAudio.playCardFlip();
cardAudio.playCardHover();
cardAudio.playButtonClick();

// Cinematic (ElevenLabs)
cardAudio.playPackExplosion();
cardAudio.playLegendaryReveal();
cardAudio.playGodmodeReveal();

// Background music
cardAudio.startAmbient('mystical');
```

---

## 💰 Cost (One-time generation)
- ~800 ElevenLabs credits
- Free tier: 10,000 characters/month
- Starter: $5/month (30,000 chars)

Files generated **once** → cached forever in browser

---

## 📖 Full Documentation
See: `AUDIO_HYBRID_SYSTEM.md`
