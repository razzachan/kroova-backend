# Kroova Card Image Generator

Script Python para gerar imagens fotorealísticas 4K de todas as 251 cartas ED01 usando Leonardo.ai API.

## Especificações

- **Resolução**: 1536x2048 (3:4 aspect ratio)
- **Qualidade**: Máxima (50 inference steps, Alchemy, PhotoReal)
- **Modelo**: Leonardo Kino XL
- **Features**: Ray tracing, volumetric fog, depth of field, photorealistic

## Setup

1. Instalar dependências:
```bash
pip install requests python-dotenv
```

2. Configurar `.env`:
```env
LEONARDO_API_KEY=your_api_key_here
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

3. Executar:
```bash
python scripts/generate-card-images.py
```

## Estimativa de Custo

- **Credits por imagem**: ~50 (máxima qualidade)
- **Total de cartas**: 251
- **Total de credits**: ~12,550
- **Custo estimado**: ~$125 USD

## Output

- Imagens salvas em: `public/cards/{display_id}.png`
- Database atualizado com `image_url`: `/cards/{display_id}.png`

## Prompts

O script gera prompts baseados em:
- **Branding**: KROOVA_BRANDING.md (cyberpunk, neon, glitch)
- **Lore**: KROOVA_EDITION_01.md (Colapso da Interface)
- **Card data**: name, description, archetype, scores

Exemplo de prompt gerado:
```
photorealistic 8K render, Unreal Engine 5, ray tracing, volumetric lighting, 
depth of field, anthropomorphic crocodile, predatory calculating luxury items 
financial data cold expression, tactical cyberpunk outfit, holographic interfaces 
floating around, cyberpunk neon glitch urban dystopian, volumetric fog neon rim 
lighting ray tracing reflections, neon-lit dystopian cityscape background, 
cinematic composition, digital glitch effects, iridescent accents, 
neon magenta cyber cyan royal amber, sharp focus on character, atmospheric particles, 
subsurface scattering, photorealistic details, Colapso da Interface 2025 Brasil 
algoritmo vivo influência digital manifestada em entidades físicas, 
portrait orientation 3:4 aspect ratio
```

## Negative Prompt

```
cartoon, anime, illustration, painting, drawing, sketch, low quality, blurry, 
pixelated, jpeg artifacts, watermark, text, logo, childish, cute, kawaii, 
simplified, flat colors, 2D, oversaturated, overexposed, ugly, distorted, deformed
```

## Features

- ✅ Carrega todas as 251 cartas do Supabase
- ✅ Gera prompt customizado por carta (baseado em archetype + description)
- ✅ Aguarda geração completar (polling a cada 5s, timeout 3min)
- ✅ Download automático das imagens
- ✅ Atualiza database com image_url
- ✅ Delay de 10s entre gerações (evitar rate limit)
- ✅ Retry logic para falhas
- ✅ Progress tracking (X/251 completed)

## Tempo Estimado

- ~3-5 minutos por carta (geração + download)
- **Total**: ~12-20 horas para 251 cartas

## Opções de Execução

### Gerar apenas algumas cartas (teste):
Modificar o script para processar apenas as primeiras 5 cartas:

```python
# Na função main(), após carregar as cartas:
cards = cards[:5]  # Apenas 5 cartas para teste
```

### Gerar apenas legendary/godmode:
```python
# Filtrar por rarity
cards = [c for c in cards if c['rarity'] in ['legendary', 'godmode']]
```

### Ajustar delay entre gerações:
```python
# Mudar delay de 10s para 5s (linha no main)
if generate_card_image(card, output_dir, delay=5):
```
