# 🎨 Kroova Card Image Generation - Production Ready

## Status Atual

✅ Script Python configurado e testado
✅ Google Gemini API (Nano Banana Pro) integrada
✅ Banco de dados com 251 cartas ED01 populadas
✅ Prompt otimizado com essência MEME + CYBERPUNK + CULTURA POP
✅ Proporção 3:4 (portrait, conforme layout oficial)
✅ Qualidade 2K photorealistic
✅ Output: Arte clean (sem texto/UI) pronta para layers do designer

---

## Especificações Técnicas

### Modelo & API
- **Modelo**: Google Imagen 4 (Nano Banana Pro)
- **API Key**: Configurada em `.env` (GOOGLE_API_KEY)
- **Custo**: ~$0.03 por imagem = **$7.50 total** para 251 cartas
- **Tempo estimado**: ~2-3 segundos por carta = **~12-15 minutos total**

### Output
- **Resolução**: 2K (aspect ratio 3:4)
- **Formato**: PNG
- **Localização**: `scripts/public/cards/{display_id}.png`
- **Database**: Atualiza `image_url` automaticamente em `cards_base`

### Conteúdo da Imagem
✅ **INCLUI**:
- Personagem anthropomorphic (baseado em description)
- Background cyberpunk dystopian (Brasil 2025, favela neon + towers)
- Hologramas de dados/redes sociais sutis
- Lighting dramático (neon magenta, cyber cyan, royal amber)
- Storytelling pose expressando personalidade
- Ray tracing, volumetric fog, depth of field

❌ **NÃO INCLUI** (designer adiciona depois):
- Nome da carta
- Influence score (coração)
- Rarity score (hexágono)
- Liquidez R$ (valor)
- Moldura/frame
- Serial number
- Qualquer texto/números/UI

---

## Essência do Prompt (DNA Kroova)

### Core Aesthetic
```
MEME + CYBERPUNK + CULTURA POP fusion
Satirical yet stylish
Internet-native character design
Viral internet icon manifestado fisicamente
```

### Arquétipos (Visual Themes)
- **Ganância**: Predatory, financial data, meme-worthy greed aesthetic
- **Influência**: Influencer culture satire, magnetic presence
- **Impulso**: Viral moment energy, chaotic, explosive
- **Informação**: Tech-bro aesthetic, data streams
- **Consumo**: Consumerism satire, addictive aesthetic
- **Preguiça**: Internet burnout vibe, comfortable decay

### Adaptação por Rarity
- **Godmode/Legendary**: "legendary powerful epic" + commanding magnetic
- **Viral**: "rare unique striking" + charismatic notable
- **Meme**: "common mysterious" + subtle understated
- **Trash**: "basic simple" + faded overlooked

### Adaptação por Influence Score
- **80-100**: Commanding, magnetic, attention-grabbing
- **60-79**: Charismatic, notable
- **40-59**: Subtle, understated
- **0-39**: Faded, overlooked

---

## Como Continuar a Produção

### Opção 1: Gerar TODAS as 251 cartas (RECOMENDADO)
```powershell
cd C:\Kroova\scripts
python generate-card-images-gemini.py
# Confirmar "yes"
# Aguardar ~12-15 minutos
# ✅ Pronto! 251 imagens em public/cards/
```

### Opção 2: Gerar batch específico (ex: apenas legendary + godmode)
Editar `generate-card-images-gemini.py` linha ~280:
```python
# Filtrar apenas legendary/godmode
cards = [c for c in cards if c['rarity'] in ['legendary', 'godmode']]
```

### Opção 3: Gerar lote por lote (50 cartas por vez)
```python
# Gerar cartas 0-50
cards = cards[0:50]

# Depois cartas 50-100
cards = cards[50:100]

# E assim por diante...
```

---

## Estrutura de Arquivos

```
C:\Kroova\
├── .env                                    # API keys (GOOGLE_API_KEY)
├── scripts/
│   ├── generate-card-images-gemini.py      # Script principal
│   ├── public/cards/                       # Output das imagens
│   │   ├── crd_croco01.png                # Croco Trader (exemplo)
│   │   ├── crd_xxx.png                    # ... 250 outras cartas
```

---

## Próximos Passos (Após Geração)

### Erro: "GOOGLE_API_KEY not found"
```powershell
# Verificar .env
cat .env | Select-String "GOOGLE_API_KEY"

# Se não existir, adicionar:
echo "GOOGLE_API_KEY=AIzaSyBBXL-b_W4JaI5rrgaNkBffCxzU_trhkrk" >> .env
```

### Erro: "400 Bad Request" do Supabase
```python
# Já está corrigido no script atual (filtro em Python, não Supabase)
# Se acontecer, verificar SUPABASE_SERVICE_ROLE_KEY no .env
```

### Imagem não tem a vibe certa
```python
# Editar função generate_prompt() linha ~93
# Ajustar:
# - narrative_context (história)
# - theme (arquétipo)
# - BRANDING['essence'] (estética)
```

---

## Output Esperado

Cada carta terá:
- ✅ Personagem único baseado em lore/description
- ✅ Pose expressiva mostrando personalidade
- ✅ Background cyberpunk Brasil 2025
- ✅ Lighting neon (magenta/cyan/amber)
- ✅ Atmosfera meme + cultura pop
- ✅ Qualidade 4K fotorealística
- ✅ Proporção 3:4 vertical (pronta para layout)
- ✅ SEM texto/números (designer adiciona depois)

---

## Exemplo de Prompt Gerado

**Croco Trader (legendary, Ganância, influence=92)**:
```
photorealistic 4K render, cinematic photography, volumetric lighting, 
depth of field, ray tracing, anthropomorphic crocodile, legendary powerful epic, 
commanding magnetic attention-grabbing, predatory calculating financial data 
meme-worthy greed aesthetic, STORY CONTEXT: Um negociador predatório movido 
por fluxos invisíveis de lucro, embodying Croco Trader within Colapso da Interface, 
CORE AESTHETIC: MEME + CYBERPUNK + CULTURA POP fusion satirical yet stylish 
internet-native character design, meme culture meets high-tech dystopia, 
tactical cyberpunk outfit with streetwear influence, holographic social media icons, 
dystopian Brazil 2025 cityscape with favela neon and corporate towers, 
cinematic storytelling pose, character feels like viral internet icon manifested, 
digital glitch effects, neon magenta cyber cyan royal amber, 
portrait orientation 3:4, NO TEXT NO NUMBERS NO UI clean character art only
```

---

## ✅ Padrão Visual Aprovado

**Referências testadas e aprovadas:**
- Croco Trader (crd_croco01.png) - legendary, Ganância
- AlgoRoi (crd_139062.png) - legendary, Influência

### Características do Padrão:
✅ **Personagem**: Anthropomorphic, pose expressiva, storytelling
✅ **Lighting**: Neon rim lighting (magenta/cyan/amber), volumetric fog
✅ **Background**: Dystopian Brasil 2025, favela neon + corporate towers
✅ **Atmosfera**: MEME + CYBERPUNK + CULTURA POP, satirical yet stylish
✅ **Qualidade**: 4K photorealistic, ray tracing, depth of field
✅ **Composição**: Portrait 3:4, sharp focus on character
✅ **Efeitos**: Digital glitch, iridescent accents, holographic elements
✅ **Clean**: SEM texto/números/UI (designer adiciona depois)

---

## Como Continuar a Produção

### ✅ MODO PRODUÇÃO ATIVADO (Teste mode removido)

1. **Designer**: Adicionar layers (nome, stats, moldura, serial)
2. **Backend**: Atualizar `image_url` para URL público (CDN/Supabase Storage)
3. **Frontend**: Criar componente `CardDisplay` que mostra imagem + overlays
4. **Sprint 2**: Implementar abertura de boosters com reveal animation

---

## Contato/Suporte

Para continuar ou ajustar geração:
- **Comando**: "Continue a produção das cartas" ou "Gerar próximo lote de 50"
- **Script**: `C:\Kroova\scripts\generate-card-images-gemini.py`
- **Logs**: Terminal mostra progresso em tempo real

---

**Status**: ✅ PRONTO PARA PRODUÇÃO COMPLETA
**Última atualização**: 27/11/2025
**Versão do script**: 1.0 (com essência MEME+CYBERPUNK+POP completa)
