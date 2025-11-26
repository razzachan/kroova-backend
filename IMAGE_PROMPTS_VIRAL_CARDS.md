# 🎨 Prompts de Imagem - Kroova ED01 Viral Cards

**Configuração Base para Todas:**
- Engine: Midjourney v6 ou Stable Diffusion XL
- Aspect Ratio: `--ar 2:3` (formato card vertical)
- Style: Cinematic semi-realistic
- Quality: `--q 2` (Midjourney) ou steps: 50 (SD)

---

## 🌟 PRIORIDADE 1: KERNEL PRIMORDIAL (Godmode)
**Uso:** Thumbnail principal, clímax do vídeo

### Prompt Completo (Copy-Paste Ready):
```
cosmic luminous kernel sphere core radiating divine energy, fractal golden glyphs and runic symbols orbiting in perfect sacred geometry, radiant white-gold center emitting volumetric god rays, ethereal nebula haze surrounding with magenta and cyan accent clouds, supreme god-tier presence, semi-realistic 3D render with spiritual mystical energy, cinematic wide composition narrowing to dramatic close focus, shallow depth of field with maximum bloom and lens flare on core, prismatic holographic light reflections, organic energy waves pulsing outward in concentric rings, multiple additive glow layers stacking, soft chromatic aberration on brightest areas, 1-2% filmic grain texture, ultimate legendary divine aura, transcendent mystical cyberpunk tech fusion, reality-breaking visual intensity, post-apocalyptic digital heaven aesthetic --ar 2:3 --q 2 --s 750
```

### Alternativa Simplificada:
```
divine glowing kernel sphere, golden fractal runes, cosmic rays, white-gold radiance, cinematic depth, maximum bloom, godmode card art --ar 2:3
```

---

## 💜 PRIORIDADE 2: ORÁCULO DO ALGORITMO OCULTO (Legendary)
**Uso:** Penúltima carta, segundo pico de hype

### Prompt Completo:
```
ancient mystical oracle sage figure fused with glowing neural network circuitry, flowing indigo and deep purple ethereal robes with intricate golden circuit trace patterns, luminous floating runic sigils and data streams surrounding head like a halo, semi-realistic wise aged face with piercing ethereal glowing eyes, cinematic three-quarter portrait angle, soft volumetric key light from upper right with warm golden accent rim, cyan technical fill light revealing intricate tech details on left, smoky depth background with digital particle mist and hazy neon environment, holographic data streams and code fragments weaving through composition, shallow depth of field with soft bokeh, medium bloom on all glowing circuit elements, organic glitch wave distortion subtly warping edges, premium legendary mystical presence, myth-digital fusion aesthetic, iconic keyart quality --ar 2:3 --q 2 --s 700
```

### Alternativa Simplificada:
```
mystical oracle with neural circuits, indigo robes, golden runes floating, glowing eyes, cinematic portrait, legendary card art --ar 2:3
```

---

## 🔥 PRIORIDADE 3: EXPLOSÃO DE LATÊNCIA ZERO (Viral)
**Uso:** Terceira carta, primeiro pico de energia

### Prompt Completo:
```
temporal distortion energy vortex violently collapsing into sharp crystalline geometric core, aggressive motion blur streaks radiating outward in all directions, pure brilliant white center transitioning to electric neon blue outer energy rings, dynamic radial burst composition, volumetric light rays piercing through, cinematic depth with intentional foreground particle blur, semi-realistic faceted crystal structure, high-speed impact energy blast aesthetic, neon magenta rim highlights on crystal edges, soft layered bloom on core with hard edges, multiple additive glow layers, shallow depth of field sharply focusing on center, 1-2px subtle glitch offset on outer edges, explosive cyberpunk energy card art, speed and power visual language --ar 2:3 --q 2 --s 650
```

### Alternativa Simplificada:
```
energy vortex explosion, crystalline core, motion blur, white and electric blue, radial burst, high impact, viral card art --ar 2:3
```

---

## 🐱 PRIORIDADE 4: GATO BUFFERING INFINITO (Meme)
**Uso:** Segunda carta, retenção meme

### Prompt Completo:
```
adorable holographic cat hybrid creature with infinite loading spinner icon seamlessly integrated into glowing body, iridescent shimmering fur with subtle digital scan line texture, playful bright neon ring orbit effect circling around, vibrant cyan and magenta dual-tone palette, semi-realistic cat face with exaggerated cute kawaii features and large expressive eyes, cinematic three-quarter angle with soft key light from right creating rim glow, shallow depth of field with glowing bokeh background particles, additive holographic glow effects on fur, prismatic rainbow reflections on smooth surfaces, organic energy field distortion waves, 35mm lens cinematic feel, charming viral meme aesthetic, cyber-pet card art style --ar 2:3 --q 2 --s 600
```

### Alternativa Simplificada:
```
holographic cat with loading spinner, iridescent fur, neon ring, cute kawaii face, playful meme aesthetic, card art --ar 2:3
```

---

## 👻 PRIORIDADE 5: BUG FANTASMA 404 (Trash)
**Uso:** Primeira carta, setup cômico

### Prompt Completo:
```
translucent glitch ghost entity constructed from fragmented 404 error code typography and symbols, pixel noise aura dissolving and flickering at wispy edges, teal cyan and vibrant magenta cyberpunk dual-color scheme, floating eerily in infinite digital void space, semi-realistic rendering with intentional digital artifacts, soft additive bloom glow, cinematic three-quarter floating view, shallow depth of field with dark ambient background, neon rim light outlining ghost form, additive transparent glitch layer overlay, subtle scan line texture, 1-2px chromatic aberration on edges, 1-2% film grain for texture, humorous relatable error aesthetic, common tier card art with charm --ar 2:3 --q 2 --s 550
```

### Alternativa Simplificada:
```
glitch ghost made of 404 code, translucent, teal and magenta, pixel noise, floating, humorous error aesthetic, card art --ar 2:3
```

---

## 🎛️ Configurações Recomendadas por Plataforma

### Midjourney (Discord)
```
/imagine [PROMPT] --ar 2:3 --q 2 --s [valor] --v 6
```
- `--s 550-750`: Stylization (menor = mais literal, maior = mais artístico)
- `--q 2`: Qualidade máxima
- `--v 6`: Versão mais recente

### Stable Diffusion (Automatic1111 / ComfyUI)
```yaml
Positive Prompt: [PROMPT completo acima]
Negative Prompt: blurry, low quality, pixelated, jpeg artifacts, text, watermark, signature, logo, username, duplicate, cropped, out of frame, distorted proportions, ugly, bad anatomy
Steps: 50
Sampler: DPM++ 2M Karras
CFG Scale: 7-9
Size: 768x1152 (2:3 ratio)
Model: Stable Diffusion XL Base 1.0 + Refiner
```

### Leonardo.ai
```
Preset: Leonardo Diffusion XL
Prompt Magic: V3 (Strength: 6)
Dimensions: 768x1152
Number of Images: 4
Alchemy: Enabled
PhotoReal: Disabled (manter estilo ilustrativo)
```

---

## 🔧 Troubleshooting / Refinamento

### Se a imagem sair muito escura:
Adicionar ao prompt: `bright vibrant lighting, high key, well lit`

### Se perder detalhes faciais (Oráculo/Gato):
Adicionar: `highly detailed face, sharp facial features, clear eyes`

### Se ficar muito realista (queremos semi-realistic):
Adicionar ao negative: `photorealistic, photograph, hyper realistic`

### Se elementos ficarem confusos:
Simplificar prompt removendo adjetivos duplos, manter só keywords essenciais

---

## 📦 Batch Generation (Produtividade)

### Ordem Recomendada:
1. **Kernel Primordial** (4 variações, escolher melhor para thumbnail)
2. **Oráculo** (2 variações)
3. **Explosão Latência** (2 variações)
4. **Gato Buffering** (3 variações, testar cute levels)
5. **Bug Fantasma** (1 variação apenas, é comum)

### Tempo Estimado:
- Midjourney: ~2min por imagem = 30min total
- Stable Diffusion local: ~1min por imagem = 15min total
- Leonardo.ai: ~3min por lote de 4 = 30min total

---

## 🎨 Pós-Processamento (Opcional mas Recomendado)

### Photoshop / GIMP:
1. **Ajuste de Níveis:** Aumentar contraste em 10-15%
2. **Saturação Seletiva:** +20% em magentas e cyans
3. **Nitidez:** Unsharp Mask (Amount: 80%, Radius: 1.0)
4. **Bloom Adicional:** Duplicate layer, Gaussian Blur 20px, blend mode: Screen, opacity: 30%
5. **Frame de Raridade:** Adicionar border neon (magenta para legendary, dourado para godmode)

### Preset Lightroom (Quick Export):
```
Exposure: +0.3
Contrast: +20
Highlights: -10
Shadows: +15
Vibrance: +25
Saturation: +10
Clarity: +15
Dehaze: +5
```

---

## 📤 Export Final

### Formato para Vídeo:
- **Resolução:** 1080x1620px (2:3 em HD)
- **Formato:** PNG (transparência se necessário) ou JPG (qualidade 95%)
- **Color Space:** sRGB

### Naming Convention:
```
kroova_ed01_[nome_carta]_[raridade]_v[versão].png

Exemplos:
kroova_ed01_kernel_primordial_godmode_v1.png
kroova_ed01_oraculo_algoritmo_legendary_v2.png
```

---

**Total de imagens necessárias:** 5 cartas principais  
**Tempo total de geração:** ~30-40 minutos  
**Budget estimado (se usar serviços pagos):** $2-5 USD (Midjourney Fast Mode)

---

## 🚀 Próximos Passos

1. ✅ Gerar Kernel Primordial (GODMODE) - **PRIORITÁRIO**
2. ✅ Gerar Oráculo (LEGENDARY)
3. ✅ Gerar Explosão Latência (VIRAL)
4. ✅ Gerar Gato Buffering (MEME)
5. ✅ Gerar Bug Fantasma (TRASH)
6. 🎬 Importar para editor de vídeo
7. 🎨 Adicionar frames de raridade e efeitos
8. 🎵 Sincronizar com trilha sonora
9. 📱 Exportar e testar em dispositivo mobile
10. 🚀 Upload e monitorar métricas

---

**Documento criado para:** Kroova ED01 Viral Campaign  
**Versão:** 1.0  
**Última atualização:** 2025-11-25
