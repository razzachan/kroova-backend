# 📦 Sistema de Geração de Booster Packs - Múltiplas Edições

## 🎯 Arquitetura

O sistema permite gerar imagens de booster packs para diferentes edições mantendo a estética consistente da Kroouva, mas adaptando elementos específicos de cada edição.

## 📁 Estrutura de Arquivos

```
frontend/public/
  ├── pack-front-ed01.png          # Edição 01: COLAPSO DA INTERFACE
  ├── pack-front-ed02.png          # Edição 02: [Nome futuro]
  └── pack-front-ed03.png          # Edição 03: [Nome futuro]

scripts/
  ├── generate-booster-pack-image.py           # Script principal
  └── booster-pack-configs/
      ├── ed01_config.py                       # Config Edição 01
      ├── ed02_config.py                       # Config Edição 02
      └── template_base.py                     # Template base
```

## 🎨 Template Base (Estética Constante)

Elementos que **SEMPRE aparecem** em todas as edições:

### Estrutura Visual
- **Proporção**: 3:4 (1792x2560px)
- **Estilo**: Fotografia de produto isolado, sem fundo
- **Embalagem**: Holográfica iridescente
- **Logo**: "KROUVA" (com U) no topo
- **Selo**: Badge com código da edição (ED01, ED02, etc)

### Cores da Marca (KROOVA_BRANDING.md)
- **Primary**: #FF006D (Neon Magenta)
- **Secondary**: #00F0FF (Cyber Cyan)  
- **Value**: #FFC700 (Royal Amber)

### Elementos Técnicos
- Rim lighting (magenta/cyan)
- Partículas digitais glitchadas
- Geometria sagrada + circuitos
- Aberração cromática nas bordas
- Textura metálica holográfica

## 🔧 Personalização Por Edição

Elementos que **MUDAM** em cada edição:

### Edição 01: "COLAPSO DA INTERFACE"
```python
ED01_CONFIG = {
    'edition_id': 'ED01',
    'edition_name': 'COLAPSO DA INTERFACE',
    'tagline': 'Se você olhar fixamente para o algoritmo, ele começa a te ver também',
    'theme': 'Algoritmo Vivo, entidades digitais emergindo',
    'central_art': 'Glitching digital entity face emerging from code matrix',
    'color_accent': 'Purple/Pink gradient background',
    'icon_bottom': 'influência • consumo • ganância',
    'warning': 'CONTÉM ENTIDADES DIGITAIS VIVAS',
    'cards_per_pack': 5,
}
```

### Template para Edição 02 (Exemplo)
```python
ED02_CONFIG = {
    'edition_id': 'ED02',
    'edition_name': '[NOME DA EDIÇÃO 02]',
    'tagline': '[Frase impactante da edição]',
    'theme': '[Tema narrativo - ex: Realidade aumentada, consciência coletiva]',
    'central_art': '[Elemento visual central - ex: Rede neural, multidão de avatares]',
    'color_accent': '[Variação de gradiente - ex: Green/Blue, Orange/Red]',
    'icon_bottom': '[Temas da edição - ex: conexão • vigilância • memória]',
    'warning': '[Aviso temático]',
    'cards_per_pack': 5,
}
```

## 🚀 Como Gerar Nova Edição

### Passo 1: Criar Config da Edição
```python
# scripts/booster-pack-configs/ed02_config.py
ED02_CONFIG = {
    'edition_id': 'ED02',
    'edition_name': 'ASCENSÃO DOS CLONES',
    'tagline': 'Quando todos são únicos, ninguém é',
    'theme': 'Clone digital, identidade replicada, consciência distribuída',
    'central_art': 'Multiple identical avatars merging into one quantum entity',
    'color_accent': 'Green/Blue quantum computing gradient',
    'icon_bottom': 'replicação • autenticidade • singularidade',
    'warning': 'CONTÉM CÓPIAS AUTORIZADAS',
    'cards_per_pack': 5,
}
```

### Passo 2: Gerar Imagem
```bash
python scripts/generate-booster-pack-image.py \
  --edition ed02 \
  -o frontend/public/pack-front-ed02.png
```

### Passo 3: Atualizar Frontend
```typescript
// frontend/lib/boosterPackImages.ts
export const BOOSTER_PACK_IMAGES = {
  'ED01': '/pack-front-ed01.png',
  'ED02': '/pack-front-ed02.png',
  'ED03': '/pack-front-ed03.png',
}

// frontend/app/boosters/page.tsx
<img 
  src={BOOSTER_PACK_IMAGES[pack.edition_id] || '/pack-front-ed01.png'} 
  alt={`Krouva ${pack.edition_name} Booster Pack`}
  className="w-full h-auto shadow-2xl"
/>
```

## 📝 Prompt Template Modular

O script usa um sistema de template que combina:

```python
def generate_prompt(edition_config):
    return f"""
    Ultra-realistic product photography of a sealed trading card booster pack 
    for "KROUVA: {edition_config['edition_name']}" edition. 
    ISOLATED PRODUCT SHOT with NO BACKGROUND.

    PRODUCT DESIGN:
    - Holographic foil packaging with iridescent rainbow shimmer
    - Front features {edition_config['central_art']}
    - Geometric sacred patterns mixed with circuit board traces
    - Neon magenta (#FF006D) and cyber cyan (#00F0FF) accent lines
    - {edition_config['color_accent']} overtones
    - Royal amber (#FFC700) "KROUVA" logo at top with glitch effect
    - Edition name "{edition_config['edition_name']}" in futuristic bold font
    - Subtitle: "{edition_config['tagline']}"
    - Holographic seal showing "{edition_config['edition_id']}" and "{edition_config['cards_per_pack']} CARTAS"
    - Warning text: "{edition_config['warning']}"
    
    [... resto do template base ...]
    
    BRANDING ELEMENTS:
    - Small "{edition_config['icon_bottom']}" icons near bottom
    [... elementos constantes ...]
    """
```

## 🎨 Variações Visuais Entre Edições

### O que pode mudar:
✅ **Arte central** (entidade, símbolo, objeto icônico)
✅ **Gradiente de fundo** (mantém magenta/cyan mas adiciona 3ª cor)
✅ **Tema das partículas** (código, neurônios, cristais, etc)
✅ **Ícones temáticos** (bottom)
✅ **Texto de aviso** (warning)
✅ **Geometria predominante** (hexágonos vs círculos vs fractais)

### O que NÃO muda:
❌ Logo "KROUVA" (posição e estilo base)
❌ Proporção 3:4
❌ Cores primárias da marca
❌ Qualidade holográfica/iridescente
❌ Produto isolado sem fundo
❌ Rim lighting cyberpunk

## 🔄 Workflow Completo

```bash
# 1. Criar config da nova edição
vim scripts/booster-pack-configs/ed02_config.py

# 2. Gerar imagem
python scripts/generate-booster-pack-image.py --edition ed02

# 3. Review e ajustes
# (Se precisar, ajustar config e regerar)

# 4. Commit
git add frontend/public/pack-front-ed02.png
git add scripts/booster-pack-configs/ed02_config.py
git commit -m "feat: adiciona booster pack arte da Edição 02"

# 5. Deploy
cd frontend && vercel --prod
```

## 💡 Dicas para Manter Consistência

1. **Use sempre os mesmos prompts base** do `template_base.py`
2. **Mantenha a estrutura visual** (logo topo, título centro, badge)
3. **Variações sutis**: mude o tema, não a linguagem visual
4. **Teste múltiplas gerações**: Imagen pode dar resultados diferentes
5. **Archive as aprovadas**: salve versões `.approved.png` para referência

## 📊 Checklist de Nova Edição

- [ ] Config criada em `booster-pack-configs/`
- [ ] Lore da edição documentada em `KROOVA_EDITION_XX.md`
- [ ] Imagem gerada e aprovada
- [ ] Arquivo movido para `frontend/public/`
- [ ] Mapeamento adicionado no código
- [ ] Preview testado localmente
- [ ] Deploy em produção
- [ ] Documentação atualizada

## 🎯 Exemplo Real: ED01 → ED02

**ED01** (Colapso da Interface):
- Entidade digital emergindo de matriz de código
- Purple/Pink/Cyan
- Tema: Algoritmo vivo

**ED02** (Hipotético - Guerra dos Feeds):
- Gladiadores digitais em arena de trending topics
- Orange/Red/Cyan
- Tema: Competição por atenção

Ambos mantêm:
- Logo KROUVA idêntico
- Estrutura holográfica
- Selo ED0X
- Qualidade cyberpunk premium
