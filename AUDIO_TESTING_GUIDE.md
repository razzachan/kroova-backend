# 🧪 Audio System Testing Guide

## ⚠️ BEFORE TESTING

### Option A: Generate ElevenLabs Audio (Recommended)
```bash
# 1. Get API key from https://elevenlabs.io/
# 2. Add to .env file:
ELEVENLABS_API_KEY=sk_your_key_here

# 3. Generate audio
cd c:\Kroova\scripts
python generate_sounds_elevenlabs.py

# Result: 7 MP3 files in frontend/public/sfx/
```

### Option B: Test Without Audio Files (Fallback)
```bash
# Just run the app - will use procedural synthesis
cd c:\Kroova\frontend
npm run dev
```

---

## 🎮 Test Cases

### 1. **Pack Opening** (ElevenLabs)
```
1. Go to /boosters
2. Click "Abrir Pack"
3. Click pack image

Expected:
✅ Cinematic explosion sound (if ElevenLabs files exist)
⚠️ Procedural rip sound (if files don't exist)
✅ Camera shake
✅ Screen flash
```

### 2. **Card Flips** (Tone.js Procedural)
```
1. After pack opens → cards appear
2. Click each card to flip

Expected:
✅ Quick snap sound (zero latency)
✅ Sound plays EVERY flip
✅ No lag between click and sound
```

### 3. **Legendary Reveal** (ElevenLabs)
```
1. Flip a legendary card
2. Listen for orchestral hit

Expected:
✅ Epic orchestral sound (if ElevenLabs files exist)
⚠️ Synthesis tone (if files don't exist)
✅ God rays animation
✅ Particle burst
```

### 4. **Godmode Reveal** (ElevenLabs)
```
1. Flip a godmode card
2. Listen for massive braam

Expected:
✅ MASSIVE cinematic impact (if ElevenLabs files exist)
⚠️ Synthesis tone (if files don't exist)
✅ 12 god rays (pink/red)
✅ Screen shake
```

### 5. **Card Hover** (Tone.js Procedural)
```
1. Hover over unflipped cards

Expected:
✅ Soft shimmer sound
✅ Instant response (no delay)
```

### 6. **Ambient Music** (ElevenLabs)
```
Currently NOT implemented in UI - needs manual code:

// Add to boosters page
useEffect(() => {
  cardAudio.startAmbient('mystical');
  return () => cardAudio.stopAmbient();
}, []);
```

---

## 🔍 Debug Checklist

### Browser Console Warnings:
```javascript
// If you see:
"⚠️ Failed to load packExplosion: 404"
→ ElevenLabs files not generated yet

"⚠️ Legendary reveal audio not loaded"
→ ElevenLabs files missing, using fallback

"🎵 Tone.js initialized"
→ Procedural audio ready
```

### Audio Files Check:
```bash
# Windows
dir c:\Kroova\frontend\public\sfx\explosions
dir c:\Kroova\frontend\public\sfx\reveals
dir c:\Kroova\frontend\public\sfx\ambient

# Should see:
# explosions/ → 2 files
# reveals/ → 3 files
# ambient/ → 2 files
```

### Network Tab (DevTools):
```
Filter: .mp3

Expected requests (if files exist):
✅ /sfx/explosions/pack_explosion_epic.mp3
✅ /sfx/reveals/legendary_reveal.mp3
✅ /sfx/reveals/godmode_reveal.mp3
✅ /sfx/reveals/rare_reveal.mp3

If 404 → Files not generated
If loaded → ElevenLabs audio active
```

---

## 🎯 Expected Behavior

### With ElevenLabs Files:
- **Pack explosion:** Cinematic movie-quality sound
- **Legendary:** Orchestral hit with choir
- **Godmode:** Massive braam + thunder
- **Card flips:** Instant procedural snap

### Without ElevenLabs Files:
- **Pack explosion:** Procedural plastic rip
- **Legendary:** Synthesis tone (no orchestral)
- **Godmode:** Synthesis tone (no braam)
- **Card flips:** Same instant procedural snap

---

## 🚀 Performance Targets

| Metric | Target | How to Check |
|--------|--------|--------------|
| **Card flip latency** | <10ms | Click → sound instant |
| **Pack explosion load** | <200ms | Network tab → Timing |
| **Memory usage** | <10MB | DevTools → Memory |
| **Audio stuttering** | None | Should be smooth |

---

## 🐛 Common Issues

### "No sound at all"
```
1. Check browser console for errors
2. Check audio permissions (some browsers block autoplay)
3. Try clicking page first (browsers need user gesture)
```

### "Only some sounds work"
```
→ ElevenLabs files partially generated
→ Check frontend/public/sfx/ for missing files
```

### "Card flip sounds laggy"
```
→ Tone.js not initialized
→ Check console for "🎵 Tone.js initialized"
→ Try clicking page first
```

### "ElevenLabs sounds don't play"
```
→ Files not generated yet
→ Run: python scripts/generate_sounds_elevenlabs.py
→ Or use fallback (procedural synthesis)
```

---

## 📊 Test Results Template

```
Date: ___________
Browser: ___________

✅ Pack explosion (ElevenLabs): [PASS/FAIL/FALLBACK]
✅ Card flip (Tone.js): [PASS/FAIL]
✅ Card hover (Tone.js): [PASS/FAIL]
✅ Legendary reveal (ElevenLabs): [PASS/FAIL/FALLBACK]
✅ Godmode reveal (ElevenLabs): [PASS/FAIL/FALLBACK]
✅ Camera shake: [PASS/FAIL]
✅ Screen flash: [PASS/FAIL]
✅ God rays: [PASS/FAIL]

Notes:
_________________________________
```

---

## 🎬 Full Test Sequence

```
1. Open /boosters page
2. Purchase 1 pack (if needed)
3. Click "Abrir Pack"
4. LISTEN: Pack explosion (should be cinematic)
5. Wait for cards to fly in
6. Click first card
7. LISTEN: Card flip (should be instant snap)
8. Hover over other cards
9. LISTEN: Soft shimmer (procedural)
10. Flip legendary card
11. LISTEN: Orchestral hit (cinematic)
12. Flip godmode card (if any)
13. LISTEN: Massive braam (epic)

All sounds should play without:
- Lag
- Stuttering
- Overlap issues
- Console errors
```

---

## 🎉 Success Criteria

### Minimum (No ElevenLabs):
✅ Card flips play instantly  
✅ Pack opens with sound  
✅ No console errors  
✅ No performance issues  

### Ideal (With ElevenLabs):
✅ All above +  
✅ Cinematic pack explosion  
✅ Orchestral legendary reveals  
✅ Epic godmode braam  
✅ Professional audio quality  
