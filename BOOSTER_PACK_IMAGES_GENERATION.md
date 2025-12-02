# 🎴 GERAÇÃO DE IMAGENS DOS BOOSTER PACKS - ED01

## 📋 Visão Geral

Sistema de geração automatizada das imagens dos 3 booster packs da edição **ED01: COLAPSO DA INTERFACE** usando **Google Vertex AI Imagen 4 Ultra**.

---

## 🎨 Packs Gerados

### ✅ Estrutura Padronizada

Todos os packs seguem o **mesmo design base** (booster pack físico lacrado estilo TCG), alterando apenas:
- Cor tema principal
- Arte central
- Nome do pack

| Pack | ID Database | Tema | Cor Hex | Arquivo | Tamanho |
|------|------------|------|---------|---------|---------|
| **ALPHA** | `ED01_ALPHA` | Memes Clássicos | `#FF6B6B` (vermelho/rosa) | `pack-front-ed01-alpha.png` | 1230 KB |
| **BETA** | `ED01_BETA` | Viralidade Explosiva | `#4ECDC4` (ciano) | `pack-front-ed01-beta.png` | 1348 KB |
| **GAMMA** | `ED01_GAMMA` | Cultura Digital | `#95E1D3` (verde água) | `pack-front-ed01-gamma.png` | 1217 KB |

---

## 🏗️ Estrutura Visual (Padronizada)

Cada booster pack contém **exatamente** os mesmos elementos estruturais:

### 📦 Layout Físico

```
┌─────────────────────────┐
│ 🌈 BORDA HOLOGRÁFICA    │ ← Rainbow foil strip
├─────────────────────────┤
│     🎮 KROOVA           │ ← Logo branco centralizado
│  COLAPSO DA INTERFACE   │ ← Subtítulo
│   (tagline pequeno)     │
├─────────────────────────┤
│                         │
│   ┌───────────────┐     │
│   │  🖼️ ARTE      │     │ ← Arte central cyberpunk
│   │   CENTRAL     │     │   (muda por pack)
│   │  (portrait)   │     │
│   └───────────────┘     │
│                         │
├─────────────────────────┤
│ 🏷️ ED01  [NOME]  📊QR  │ ← Badge + Nome + Barcode
├─────────────────────────┤
│ 🌈 BORDA HOLOGRÁFICA    │ ← Rainbow foil strip
└─────────────────────────┘
```

### 🎨 Elementos Visuais Fixos

- **Bordas holográficas**: Rainbow foil superior e inferior
- **Logo KROOVA**: Tipografia futurista branca no topo
- **Subtítulo**: "COLAPSO DA INTERFACE" + tagline
- **Moldura neon**: Contorno geométrico ao redor da arte (cor varia por pack)
- **Background**: Matriz digital, circuitos, efeitos glitch
- **Badge ED01**: Canto inferior esquerdo
- **Nome do Pack**: Texto grande centro-inferior (ALPHA/BETA/GAMMA PACK)
- **Códigos**: Barcode + QR code inferior direito
- **Textura**: Foil package com reflexos de luz

---

## 🛠️ Script de Geração

### 📄 Arquivo: `scripts/generate-ed01-pack-images.py`

#### Dependências

```python
from google import genai
from google.genai import types
from dotenv import load_dotenv
import os
import time
```

#### Configuração

```python
# API Key do Google AI (via .env)
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')

# Modelo Imagen 4 Ultra
MODEL_ID = "imagen-4.0-ultra-generate-001"

# Output padronizado
OUTPUT_DIR = "frontend/public/assets/booster-packs"
```

#### Mapeamento de Packs

```python
PACKS = {
    "alpha": {
        "name": "ALPHA PACK",
        "theme": "Memes Clássicos",
        "color": "#FF6B6B",
        "description": "Memes eternos e referências culturais atemporais",
        "archetypes": "echo e totem",
        "mood": "nostálgico, icônico, eterno, viral clássico",
        "symbols": "símbolos de memes antigos, referências vintage, ícones virais clássicos"
    },
    "beta": {
        "name": "BETA PACK",
        "theme": "Viralidade Explosiva",
        "color": "#4ECDC4",
        "description": "Tendências virais e humor de alta energia",
        "archetypes": "wave e pulse",
        "mood": "explosivo, frenético, viral, alta energia, caótico",
        "symbols": "ondas, pulsos, gráficos virais, setas ascendentes, explosões de likes"
    },
    "gamma": {
        "name": "GAMMA PACK",
        "theme": "Cultura Digital",
        "color": "#95E1D3",
        "description": "Cultura online e meta-humor",
        "archetypes": "signal e vibe",
        "mood": "cerebral, meta, irônico, cult, underground",
        "symbols": "sinais digitais, ondas de rádio, antenas, glitches estéticos, ASCII art"
    }
}
```

#### Prompt Engineering

O prompt garante **consistência estrutural absoluta** entre os 3 packs:

```python
prompt = f"""Professional product photograph of a sealed trading card booster pack. 
EXACT replica of reference pack structure.

PHYSICAL BOOSTER PACK STRUCTURE (must match reference exactly):

TOP SECTION:
- Holographic rainbow foil border strip at very top
- Black background bar with "KROOVA" logo in white bold letters, centered
- Subtitle text "COLAPSO DA INTERFACE" in smaller white text
- Tagline below in even smaller text

MAIN CENTRAL AREA:
- Large featured artwork: {config['description']}
- Art style: Cyberpunk digital portrait with glitch effects, neon wireframe overlay
- Main color theme: {config['color']} dominant
- Neon geometric frame around the central art (matching color: {config['color']})
- Background: Dark with digital matrix code, circuit patterns
- Glitch/scan line effects across the image

BOTTOM SECTION:
- Left side: Circular badge with "ED01" and pack tier text
- Center-bottom: Large "{config['name']}" text
- Right side: Barcode and QR code graphics
- Holographic rainbow foil border strip at very bottom

VISUAL ELEMENTS:
- Symbols integrated into design: {config['symbols']}
- Overall mood: {config['mood']}
- Foil package texture with light reflections
- Realistic sealed booster pack appearance
- Professional product photography lighting

TECHNICAL SPECS:
- Portrait orientation (3:4 aspect ratio = 1024x1365px)
- Trading card booster pack format
- Photorealistic quality

CRITICAL: Keep EXACT same layout structure, text placement, badge positions, 
and border design as reference. Only change: main color to {config['color']}, 
and central artwork theme to match "{config['theme']}"."""
```

#### Configuração da API

```python
response = client.models.generate_images(
    model=MODEL_ID,
    prompt=prompt,
    config=types.GenerateImagesConfig(
        number_of_images=1,
        aspect_ratio="3:4",  # Proporção de carta de baralho
        person_generation="allow_adult",
        output_mime_type="image/png"
    )
)
```

#### Rate Limiting

```python
# 5 segundos entre requests para evitar quota issues
time.sleep(5)
```

---

## 🚀 Como Usar

### 1️⃣ Executar Script

```bash
cd C:\Kroova
python scripts\generate-ed01-pack-images.py
```

### 2️⃣ Output Esperado

```
🎴 GERADOR DE BOOSTER PACKS - ED01: COLAPSO DA INTERFACE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📁 Output: frontend/public/assets/booster-packs
🤖 Modelo: imagen-4.0-ultra-generate-001

Packs a gerar:
  - ALPHA: Memes Clássicos (#FF6B6B - vermelho/rosa)
  - BETA: Viralidade Explosiva (#4ECDC4 - ciano)
  - GAMMA: Cultura Digital (#95E1D3 - verde água)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎨 Gerando: ALPHA PACK
   Tema: Memes Clássicos
   Cor: #FF6B6B
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Salvo: frontend/public/assets/booster-packs\pack-front-ed01-alpha.png
   Tamanho: 1229.9 KB
   Resolução: 1024x1365 (3:4 aspect ratio)

⏳ Aguardando 5s (rate limiting)...

[... BETA e GAMMA seguem mesmo fluxo ...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 RESUMO DA GERAÇÃO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Sucesso: 3/3 packs
📁 Local: frontend/public/assets/booster-packs

Arquivos gerados:
  ✅ pack-front-ed01-alpha.png (1229.9 KB)
  ✅ pack-front-ed01-beta.png (1348.0 KB)
  ✅ pack-front-ed01-gamma.png (1216.7 KB)
```

---

## 📂 Estrutura de Arquivos

```
C:\Kroova\
├── frontend/
│   └── public/
│       └── assets/
│           └── booster-packs/            ← Pasta padronizada
│               ├── pack-front-ed01-alpha.png   (1230 KB)
│               ├── pack-front-ed01-beta.png    (1348 KB)
│               └── pack-front-ed01-gamma.png   (1217 KB)
└── scripts/
    └── generate-ed01-pack-images.py      ← Script de geração
```

---

## 🔗 Integração Frontend

### Mapeamento de Imagens

**Arquivo:** `frontend/app/boosters/page.tsx`

```tsx
// Mapeamento de pack_id para imagem do booster
const PACK_IMAGES: Record<string, string> = {
  'ED01_ALPHA': '/assets/booster-packs/pack-front-ed01-alpha.png',
  'ED01_BETA': '/assets/booster-packs/pack-front-ed01-beta.png',
  'ED01_GAMMA': '/assets/booster-packs/pack-front-ed01-gamma.png',
};
```

### Uso Dinâmico

```tsx
<img 
  src={PACK_IMAGES[pack.id] || PACK_IMAGES['ED01_ALPHA']} 
  alt={`${pack.name} Booster Pack`} 
  className="w-full h-auto object-contain"
  style={{ minHeight: '380px' }}
/>
```

### Fallback

Se `pack.id` não existir no mapeamento, usa ALPHA como padrão.

---

## 🎯 Benefícios da Padronização

### ✅ Consistência Visual
- Mesma estrutura de layout em todos os packs
- Elementos posicionados identicamente
- Apenas cor e arte central variam

### ✅ Escalabilidade
- Adicionar novos packs é trivial (editar dict `PACKS`)
- Prompt reutilizável para futuras edições
- Script genérico e parametrizado

### ✅ Manutenibilidade
- Código centralizado em 1 script
- Fácil regenerar todos os packs se necessário
- Versionamento via Git

### ✅ Performance
- Imagens otimizadas (~1.2-1.3 MB cada)
- Aspect ratio correto (3:4 = card game standard)
- Resolução adequada (1024x1365px)

---

## 🔄 Regeneração

Para regenerar todos os packs (ex: mudança de design):

```bash
# 1. Ajustar prompt ou configs no script
# 2. Executar
python scripts\generate-ed01-pack-images.py

# 3. Revisar output em frontend/public/assets/booster-packs/
# 4. Commit das novas imagens
git add frontend/public/assets/booster-packs/*.png
git commit -m "chore: regenerar imagens dos booster packs ED01"
```

---

## 📌 Notas Técnicas

### Aspect Ratio
- **3:4** (portrait) = proporção padrão de cartas TCG
- **1024x1365px** = resolução gerada pelo Imagen 4 Ultra

### Cores Temáticas
- **ALPHA (#FF6B6B)**: Vermelho/rosa coral - evoca nostalgia, memes clássicos
- **BETA (#4ECDC4)**: Ciano vibrante - energia viral, explosão, trending
- **GAMMA (#95E1D3)**: Verde água suave - cerebral, meta, underground

### Lore Integration
Cada pack reflete um aspecto da edição **"Colapso da Interface"**:
- **ALPHA**: Cultura de memes estabelecida, referências atemporais
- **BETA**: Viralidade moderna, tendências explosivas, algoritmos em ação
- **GAMMA**: Meta-humor, cultura digital profunda, sinais underground

---

## 🐛 Troubleshooting

### Erro: "Your default credentials were not found"
**Solução:** Script usa API key via `.env`, não Vertex AI service account.
```bash
# Verificar se .env contém:
GOOGLE_API_KEY=AIza...
```

### Imagens não aparecendo no frontend
**Checklist:**
1. ✅ Arquivos em `frontend/public/assets/booster-packs/`
2. ✅ Nomes: `pack-front-ed01-{alpha|beta|gamma}.png`
3. ✅ Mapeamento correto em `boosters/page.tsx`
4. ✅ Pack IDs no banco: `ED01_ALPHA`, `ED01_BETA`, `ED01_GAMMA`

### Quota exceeded do Imagen API
**Solução:** Aumentar `time.sleep()` entre requests ou rodar em batches.

---

## 📊 Custos (Estimativa)

**Imagen 4 Ultra:**
- ~$0.04 USD por imagem (1024x1365px)
- 3 packs × $0.04 = **~$0.12 USD** total por regeneração completa

---

## 🎓 Lições Aprendidas

### ✅ Boas Práticas
1. **Prompt detalhado**: Especificar CADA elemento visual evita inconsistências
2. **Rate limiting**: 5s entre requests evita 429 errors
3. **Aspect ratio explícito**: Garante proporção correta para TCG cards
4. **Mapeamento centralizado**: Dict `PACK_IMAGES` facilita manutenção

### ⚠️ Armadilhas Evitadas
1. ~~Hardcoded paths~~ → Paths dinâmicos via dict
2. ~~Imagens fora de padrão~~ → Estrutura visual idêntica com prompt rígido
3. ~~Nomes inconsistentes~~ → Convenção `pack-front-ed01-{tier}.png`

---

## 🚀 Próximos Passos (Futuro)

### Edição 02+
- Reutilizar script `generate-ed01-pack-images.py`
- Criar `generate-ed02-pack-images.py` com novos temas
- Manter convenção: `pack-front-{edition}-{tier}.png`

### Variantes
- **Foil especial**: Versão com holografia extra para eventos
- **Seasonal**: Packs temáticos (Halloween, Natal, etc.)
- **Promo**: Designs exclusivos para colaborações

### Otimização
- Batch generation paralela (async requests)
- Cache de prompts comuns
- A/B testing de variações visuais

---

## 📝 Changelog

| Data | Versão | Mudanças |
|------|--------|----------|
| 2025-12-02 | 1.0.0 | ✅ Script inicial com BETA e GAMMA |
| 2025-12-02 | 1.1.0 | ✅ Adicionado ALPHA, padronização completa |
| 2025-12-02 | 1.1.1 | ✅ Documentação completa criada |

---

## 👥 Autores

- **Script Python**: Gerado via Google Vertex AI Imagen 4 Ultra
- **Prompt Engineering**: Especificações baseadas no pack ALPHA original
- **Integração Frontend**: Sistema de mapeamento dinâmico

---

## 📄 Licença

Parte do projeto **Kroova Cards** - Propriedade privada.

---

**🎴 Sistema pronto para produção!**
