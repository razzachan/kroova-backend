# 🎨 Geração de Imagens de Cartas - Kroova

## 📋 Resumo

Script automatizado para gerar imagens únicas e fotorealísticas para todas as 354 cartas da Edição 01 usando **Google Imagen 4 Ultra** via Vertex AI API.

## 🎯 Características

- **Prompts Únicos**: Cada carta recebe um prompt customizado baseado em sua descrição completa
- **Qualidade Máxima**: Imagen 4 Ultra gera imagens de alta qualidade (2K, aspect ratio 3:4)
- **Resume Support**: Salva progresso automaticamente, pode retomar de onde parou
- **Fallback Models**: Suporta múltiplos modelos com fallback automático em caso de quota
- **Smart Props**: Extrai objetos, poses e elementos visuais da descrição da carta
- **Branding Compliance**: Segue a estética cyberpunk + meme culture da Kroova

## 🔧 Setup Inicial

### 1. Instalar Google Cloud SDK

```powershell
# Download e instale de: https://cloud.google.com/sdk/docs/install
# Ou via Chocolatey:
choco install gcloudsdk
```

### 2. Autenticar com Google Cloud

```powershell
# Login com suas credenciais
gcloud auth application-default login

# Configurar projeto (se necessário)
gcloud config set project kroova-project-id

# Habilitar Vertex AI API
gcloud services enable aiplatform.googleapis.com
```

### 3. Instalar Dependências Python

```powershell
pip install google-genai requests python-dotenv
```

### 4. Verificar Variáveis de Ambiente

Certifique-se que o arquivo `.env` contém:

```env
GOOGLE_API_KEY=your_key_here  # (opcional se usando gcloud auth)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 📦 Modelos Disponíveis

| Modelo | Qualidade | Velocidade | Uso Recomendado |
|--------|-----------|------------|-----------------|
| **imagen-4.0-ultra-generate-001** | ⭐⭐⭐⭐⭐ | 🐌 Lento | **Default** - Cartas principais |
| **imagen-4.0-generate-001** | ⭐⭐⭐⭐ | 🚶 Médio | Balanceado |
| **imagen-4.0-fast-generate-001** | ⭐⭐⭐ | 🏃 Rápido | Testes rápidos |

## 🚀 Como Usar

### Gerar Todas as Cartas (com resume)

```powershell
cd c:\Kroova
python scripts/generate-card-images-gemini.py --yes --resume
```

### Continuar de Onde Parou

O script salva automaticamente o progresso em `resume_state.json`:

```powershell
# Retomar automaticamente
python scripts/generate-card-images-gemini.py --resume --yes
```

### Gerar Cartas Específicas

```powershell
# Gerar da carta 50 até 59 (10 cartas)
python scripts/generate-card-images-gemini.py --start 50 --limit 10 --yes

# Gerar apenas a carta 100
python scripts/generate-card-images-gemini.py --start 100 --limit 1 --yes
```

### Usar Modelo Diferente

```powershell
# Usar modelo fast (mais rápido, menor qualidade)
python scripts/generate-card-images-gemini.py --model fast --yes

# Usar ultra com fallback para generate e fast
python scripts/generate-card-images-gemini.py --model ultra --fallback-models generate,fast --yes
```

### Especificar Diretório de Output

```powershell
# Salvar em diretório customizado
python scripts/generate-card-images-gemini.py --out-dir c:\Kroova\frontend\public\cards --yes
```

## 📊 Progresso e Estado

### Arquivo resume_state.json

```json
{
  "next_start": 125,
  "total_cards": 354,
  "timestamp": 1733699234
}
```

- **next_start**: Próxima carta a ser gerada (índice 1-based)
- **total_cards**: Total de cartas no banco
- **timestamp**: Unix timestamp da última atualização

### Output Console

```
🎮 KROOVA Card Image Generator - Imagen 4 ULTRA
====================================================
✅ Loaded 354 cards from database
✅ Ready to generate 354 cards with UNIQUE designs
🧠 Using model: imagen-4.0-ultra-generate-001
📁 Output directory: c:\Kroova\scripts\public\cards

🎨 Generating: Zap Golpista (crd_ED01_001)
   Rarity: godmode | Archetype: Ganância
   Scores: Influence=100, Rarity=100
   Story-based prompt: FICTIONAL CHARACTER DESIGN...
  ✅ Image generated successfully
  ✅ Saved: c:\Kroova\scripts\public\cards\crd_ED01_001.png
  ✅ Updated database with image URL
  ⏱ Waiting 2s before next generation...

[Progress: 1/354] (0.28%)
💾 Saved resume state: next_start=2
```

## ⚠️ Troubleshooting

### Erro: RESOURCE_EXHAUSTED / 429 Quota

**Problema**: Cota da API esgotada

**Solução**:
1. Aguarde reset de cota (geralmente 24h)
2. Use modelo mais rápido (fast) temporariamente
3. Configure fallback models para alternar automaticamente
4. Reduza frequência com delay maior entre gerações

```powershell
# Usar fast com delay de 5s
python scripts/generate-card-images-gemini.py --model fast --yes
```

### Erro: Authentication Failed

**Problema**: Credenciais não configuradas

**Solução**:
```powershell
gcloud auth application-default login
```

### Erro: API Not Enabled

**Problema**: Vertex AI API não habilitada

**Solução**:
```powershell
gcloud services enable aiplatform.googleapis.com
```

### Nomes de Cartas Corrompidos

**Problema**: Caracteres especiais/acentos mal formados

**Solução**: O script detecta e corrige automaticamente:
- Caracteres de controle removidos
- Encoding normalizado para UTF-8
- Nomes vazios recebem fallback
- Log de anomalias exibido antes da geração

## 📁 Estrutura de Arquivos

```
c:\Kroova\
├── scripts/
│   ├── generate-card-images-gemini.py  # Script principal
│   └── public/
│       └── cards/                      # Output padrão
│           ├── crd_ED01_001.png
│           ├── crd_ED01_002.png
│           └── ...
├── frontend/
│   └── public/
│       └── cards/                      # Deploy final
├── resume_state.json                   # Estado de progresso
└── .env                                # Credenciais
```

## 🎨 Estética e Branding

O script segue automaticamente a estética definida em `KROOVA_BRANDING.md`:

- **Cyberpunk orgânico**: Neon, glitches, atmosfera urbana distópica
- **Cores**: Neon magenta (#FF006D), Cyber cyan (#00F0FF), Royal amber (#FFC700)
- **Lighting**: Volumetric fog, neon rim lighting, dramatic lighting
- **Meme Culture**: Exageros, visual viral, internet aesthetic
- **Pop Brasileiro**: Referências culturais locais

## 🔄 Workflow Recomendado

1. **Teste com 5 cartas primeiro**:
```powershell
python scripts/generate-card-images-gemini.py --limit 5 --yes
```

2. **Revise qualidade das primeiras gerações**

3. **Gere em lotes de 50 com resume**:
```powershell
python scripts/generate-card-images-gemini.py --limit 50 --resume --yes
```

4. **Continue até completar todas as 354 cartas**

5. **Copie para frontend após concluir**:
```powershell
Copy-Item c:\Kroova\scripts\public\cards\* c:\Kroova\frontend\public\cards\
```

## 📈 Performance

- **Ultra Model**: ~20-30s por carta
- **Generate Model**: ~10-15s por carta  
- **Fast Model**: ~5-8s por carta
- **Total (354 cartas, ultra)**: ~3-4 horas
- **Total (354 cartas, fast)**: ~30-60 minutos

## 🎯 Próximos Passos

Depois de gerar todas as imagens:

1. ✅ Copiar para `frontend/public/cards/`
2. ✅ Verificar URLs no banco de dados
3. ✅ Testar cartas no jogo
4. ✅ Deploy com novas imagens
5. ✅ Backup das imagens geradas

---

**Script**: `scripts/generate-card-images-gemini.py`  
**Documentação**: Este arquivo  
**Status**: ✅ Ready to use  
**Última atualização**: 2025-12-08
