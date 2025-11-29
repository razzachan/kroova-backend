"""
Template de configuração para novas edições
Copie este arquivo e preencha com os dados da nova edição
"""

# Exemplo para Edição 02
ED02_CONFIG = {
    # Identificação
    'edition_id': 'ED02',
    'edition_name': '[NOME DA EDIÇÃO EM CAPS]',
    
    # Narrativa
    'tagline': '[Frase impactante que define a edição - ex: "Quando todos são únicos, ninguém é"]',
    'theme': '[Tema narrativo completo - ex: "Clone digital, identidade replicada, consciência distribuída, guerra de algoritmos"]',
    
    # Arte Central (descrever em inglês para o Imagen)
    'central_art': '[Descrição detalhada da arte - ex: "Multiple identical avatars merging into one quantum entity, surrounded by DNA helixes made of code"]',
    
    # Variações Visuais
    'color_accent': '[Gradiente complementar - ex: "Green and blue quantum computing gradient with neural network patterns"]',
    'icon_bottom': '[3 temas separados por •  - ex: "replicação • autenticidade • singularidade"]',
    'warning': '[Aviso temático - ex: "⚠️ CONTÉM CÓPIAS NÃO AUTORIZADAS"]',
    
    # Mecânica
    'cards_per_pack': 5,
    
    # Metadados para Frontend
    'price': 500,
    'description': '[Descrição curta da edição para a loja]',
    'release_date': '[YYYY-MM-DD]',
}

# Guia de preenchimento
FILL_GUIDE = """
edition_id:
    - Formato: "ED" + número de 2 dígitos (ED01, ED02, ED03...)
    - Usado em badges, URLs, database

edition_name:
    - SEMPRE EM CAPS
    - 2-4 palavras
    - Impactante, memorável
    - Exemplos: "COLAPSO DA INTERFACE", "GUERRA DOS FEEDS", "SINGULARIDADE QUÂNTICA"

tagline:
    - Uma frase que resume o conceito
    - Tom filosófico/distópico
    - 8-15 palavras
    - Exemplos:
        * "Se você olhar fixamente para o algoritmo, ele começa a te ver também"
        * "Quando todos são únicos, ninguém é"
        * "O futuro já aconteceu, você só não recebeu a notificação"

theme:
    - Descrição completa do tema narrativo
    - 15-30 palavras
    - Mencione: conceito principal + elementos visuais + atmosfera
    - Exemplo: "Algoritmo Vivo, entidades digitais emergindo da matrix, consciência artificial nascente"

central_art:
    - ESCREVER EM INGLÊS (para o Imagen)
    - Descrição detalhada e visual
    - 20-40 palavras
    - Mencione: elemento principal + materiais + efeitos + atmosfera
    - Exemplo: "A glitching digital entity face with multiple eyes emerging from flowing matrix code"

color_accent:
    - Gradiente complementar às cores da marca (Magenta/Cyan/Amber)
    - Adicione uma 3ª cor temática
    - Inclua padrão/efeito
    - Exemplos:
        * "Deep purple and hot pink gradient with digital rain"
        * "Green and blue quantum computing gradient with neural networks"
        * "Orange and red fire gradient with glitch artifacts"

icon_bottom:
    - 3 palavras-chave da edição
    - Separadas por •
    - Minúsculas
    - Conceitos temáticos/mecânicos
    - Exemplo: "influência • consumo • ganância"

warning:
    - Começa com ⚠️
    - Aviso temático/narrativo
    - 3-6 palavras após o emoji
    - Exemplos:
        * "⚠️ CONTÉM ENTIDADES DIGITAIS VIVAS"
        * "⚠️ CONTÉM CÓPIAS NÃO AUTORIZADAS"
        * "⚠️ RISCO DE SINCRONIZAÇÃO NEURAL"

cards_per_pack:
    - Geralmente 5 (padrão)
    - Pode variar para edições especiais (3, 7, 10)

price:
    - Valor em moeda do jogo
    - Geralmente 500 (padrão)
    - Pode variar para edições premium

description:
    - 1-2 frases para a loja
    - Tom marketing mas mantendo atmosfera
    - Exemplo: "A primeira edição que expõe o lado sombrio dos algoritmos"

release_date:
    - Formato: YYYY-MM-DD
    - Data de lançamento da edição
"""

# Checklist antes de gerar
PRE_GENERATION_CHECKLIST = """
□ edition_id único (não conflita com edições existentes)
□ edition_name em CAPS e memorável
□ tagline filosófica e impactante
□ theme descreve narrativa completa
□ central_art descrito em inglês e detalhado
□ color_accent complementa cores da marca
□ icon_bottom tem exatamente 3 conceitos
□ warning temático e contextual
□ price e description preenchidos
□ release_date no formato correto
□ Lore da edição documentado em KROOVA_EDITION_XX.md
"""
