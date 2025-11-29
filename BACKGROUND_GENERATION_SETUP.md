# 🎨 Background Generation - Setup Guide

## 🔑 API Key Setup

Para gerar os backgrounds com Imagen-4, você precisa configurar a API do Google:

### 1. Obter API Key

1. Acesse [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Crie um novo projeto ou selecione existente
3. Gere uma API Key
4. Copie a key

### 2. Configurar no Projeto

Crie o arquivo `.env` na raiz do projeto:

```bash
# Na raiz C:\Kroova
GOOGLE_API_KEY=your-api-key-here
```

**IMPORTANTE:** O arquivo `.env` já está no `.gitignore`, não será commitado.

### 3. Verificar Setup

```bash
cd C:\Kroova
python scripts\generate_backgrounds.py --route home
```

Se configurado corretamente, irá gerar o background da home em ~30 segundos.

---

## 📦 Dependências

Instale as dependências Python necessárias:

```bash
pip install google-genai python-dotenv pillow
```

Ou use o requirements existente:

```bash
pip install -r scripts/requirements.txt
```

---

## 🚀 Gerando Backgrounds

### Opção 1: Gerar Todos (Recomendado)

```bash
cd C:\Kroova
python scripts\generate_backgrounds.py --all
```

**Tempo estimado:** 2-3 minutos (5 imagens x ~30s cada)  
**Output:** `frontend/public/backgrounds/*.webp` e `*.png`

### Opção 2: Gerar Individual

```bash
# Home page
python scripts\generate_backgrounds.py --route home

# Boosters page
python scripts\generate_backgrounds.py --route boosters

# Marketplace
python scripts\generate_backgrounds.py --route marketplace

# Inventory
python scripts\generate_backgrounds.py --route inventory

# Wallet
python scripts\generate_backgrounds.py --route wallet
```

### Opção 3: Gerar Múltiplos

```bash
python scripts\generate_backgrounds.py --route home boosters marketplace
```

---

## 📊 Output

Cada background gera 2 arquivos:

- **PNG** (~8-12 MB): Fonte de alta qualidade (backup)
- **WebP** (~2-4 MB): Otimizado para web (usado no frontend)

### Estrutura:

```
frontend/public/backgrounds/
├── home.png          (~10 MB)
├── home.webp         (~3 MB)
├── boosters.png      (~10 MB)
├── boosters.webp     (~3 MB)
├── marketplace.png   (~10 MB)
├── marketplace.webp  (~3 MB)
├── inventory.png     (~10 MB)
├── inventory.webp    (~3 MB)
├── wallet.png        (~10 MB)
└── wallet.webp       (~3 MB)
```

**Total:** ~50 MB PNG + ~15 MB WebP = ~65 MB

---

## 🎯 Backgrounds Overview

### 1. Home - "Interface Awakening"
- **Feeling:** Portal de entrada na Interface
- **Mood:** First-person POV entrando na cidade cyberpunk
- **Elements:** Portal digital, prédios se reconstruindo, fog volumétrico
- **Colors:** Magenta #FF006D, Cyan #00F0FF

### 2. Boosters - "Digital Bazaar Street"
- **Feeling:** Mercado de rua onde entidades são vendidas
- **Mood:** Feira cyberpunk com boosters flutuando
- **Elements:** Hologramas de packs, prédios de cartas, neon
- **Colors:** Magenta, Cyan, Amber #FFC700

### 3. Marketplace - "Entity Trading Floor"
- **Feeling:** Piso de trading underground
- **Mood:** Bolsa de valores futurista
- **Elements:** Displays holográficos, traders glitchados, data streams
- **Colors:** Cyan, Magenta, Gold

### 4. Inventory - "Personal Vault Dimension"
- **Feeling:** Cofre pessoal no cyberspace
- **Mood:** Espaço minimalista e elegante
- **Elements:** Cards flutuando em grid, void escuro, glow sutil
- **Colors:** Dark #1a1a2e, Magenta, Cyan

### 5. Wallet - "Financial Stream"
- **Feeling:** Representação abstrata do fluxo de dinheiro
- **Mood:** Cyberspace financeiro
- **Elements:** Data streams, blockchain, circuitos, currency symbols
- **Colors:** Cyan, Amber, Dark

---

## ⚙️ Advanced Options

### Custom Output Directory

```bash
python scripts\generate_backgrounds.py --all --output-dir custom/path
```

### Adjust Delay Between Generations

```bash
python scripts\generate_backgrounds.py --all --delay 5
```

### Use Different Model

```bash
python scripts\generate_backgrounds.py --all --model imagen-4.0-generate-001
```

---

## 🐛 Troubleshooting

### "GOOGLE_API_KEY not set"
- Certifique-se que `.env` existe na raiz do projeto
- Verifique se a key está correta: `GOOGLE_API_KEY=your-key-here`

### "Missing dependencies"
- Instale: `pip install google-genai python-dotenv pillow`

### "Permission denied" ao salvar
- Execute como administrador ou verifique permissões da pasta `frontend/public/backgrounds/`

### "API quota exceeded"
- Aguarde alguns minutos
- Gere um background por vez: `--route home`
- Verifique quota no [Google AI Studio](https://aistudio.google.com/)

---

## 📝 Next Steps

Após gerar os backgrounds:

1. ✅ **Verificar outputs:** `frontend/public/backgrounds/*.webp`
2. ⏭️ **Criar ParallaxBackground component**
3. ⏭️ **Implementar route-based background switching**
4. ⏭️ **Testar performance com 5 layers**

---

**Status:** Aguardando configuração da API Key  
**Command Ready:** `python scripts\generate_backgrounds.py --all`
