# 📦 Gerador de Imagem do Booster Pack - Kroova ED01

## 🎯 Objetivo

Gera a imagem do **BOOSTER PACK FECHADO** da Edição 01 "COLAPSO DA INTERFACE" usando Google Gemini Imagen 4 Ultra.

## 🎨 Conceito Visual

- **Estética**: Cyberpunk místico-tecnológico
- **Cores**: Neon magenta (#FF006D), Cyber cyan (#00F0FF), Royal amber (#FFC700)
- **Tema**: Pacote lacrado contendo entidades digitais vivas
- **Lore**: "Se você olhar fixamente para o algoritmo, ele começa a te ver também"

## 📋 Pré-requisitos

```bash
# Instalar dependências
pip install google-genai python-dotenv

# Configurar API key no .env
GOOGLE_API_KEY=your_key_here
```

## 🚀 Como Usar

```bash
# Gerar imagem padrão (pack-front-ed01.png)
python scripts/generate-booster-pack-image.py

# Especificar nome do arquivo
python scripts/generate-booster-pack-image.py -o frontend/public/pack-front-ed01.png
```

## 📝 Elementos Visuais Gerados

### Estrutura do Pack
- **Logo KROOVA** no topo com efeito glitch
- **Título**: "COLAPSO DA INTERFACE"
- **Subtítulo**: Tagline oficial da edição
- **Selo holográfico**: "ED01" + "5 CARTAS"
- **Aviso**: "CONTÉM ENTIDADES DIGITAIS VIVAS"

### Estilo Visual
- Embalagem holográfica iridescente
- Entidade digital emergindo da matriz de código
- Padrões geométricos sagrados + circuitos
- Iluminação neon volumétrica
- Partículas digitais glitchadas
- Reflexos metálicos e aberração cromática

### Atmosfera
- Misterioso e viciante
- Portal para reino digital
- Relíquia sagrada meets high-tech
- Colecionável de luxo distópico

## 🎯 Referências de Design

- **KROOVA_BRANDING.md**: Sistema de cores, tipografia
- **KROOVA_EDITION_01.md**: Lore, tema, conceito
- **KROOVA_LORE.md**: Algoritmo Vivo, Colapso da Interface

## 📊 Especificações Técnicas

- **Modelo**: Imagen 4 Ultra (imagen-4.0-ultra-generate-001)
- **Resolução**: 2K (2048px)
- **Aspect Ratio**: 3:4 (portrait)
- **Formato**: PNG
- **Estilo**: Fotografia de produto profissional 8K

## 🔄 Workflow Completo

1. **Gerar imagem**:
   ```bash
   python scripts/generate-booster-pack-image.py
   ```

2. **Revisar resultado**: Verificar se atende aos requisitos visuais

3. **Copiar para frontend**:
   ```bash
   cp pack-front-ed01.png frontend/public/
   ```

4. **Atualizar UI**: Substituir emoji 📦 pela imagem real nos componentes

## 💡 Dicas

- Execute durante horários de baixa demanda para evitar quota
- Revise o prompt no código se quiser ajustar elementos específicos
- Mantenha backup das versões aprovadas
- Gere múltiplas variações alterando o seed/prompt para escolher a melhor

## 🎨 Próximos Passos

1. ✅ Gerar imagem do pack fechado
2. ⏳ Gerar imagem do pack aberto/explodindo (para animação)
3. ⏳ Gerar variações para diferentes edições futuras
4. ⏳ Criar versões animadas/GIF do efeito holográfico
