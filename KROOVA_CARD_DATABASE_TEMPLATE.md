======== INÍCIO DO ARQUIVO ========

🗂 KROOVA_CARD_DATABASE_TEMPLATE.md

Guia de estrutura para planilha kroova.xlsx (cadastro de cartas)

Este arquivo define como preencher a planilha de cards da Kroova.
Cada linha da planilha = 1 carta (uma combinação específica de: nome + raridade + skin + valores).

A estrutura abaixo segue exatamente o cabeçalho do XLS que você já criou:

#effect | #contrast | #rarity_value | #rarity_icon | #hash | #name | #trend | #archetype | #currency | #value | #description | #frame | #art

🔢 1. Visão Geral dos Campos
Coluna Obrigatório Tipo Exemplo
#effect Opcional texto default
#contrast Opcional texto auto
#rarity_value Sim número 88
#rarity_icon Sim texto trash, meme, viral
#hash Sim texto KRV-032
#name Sim texto Crocodile Trader
#trend Sim número 92
#archetype Sim texto Ganância Digital
#currency Sim texto R$
#value Sim número 500
#description Sim texto lore / descrição curta
#frame Sim texto default, neon, holo
#art Sim texto URL da arte (https://...)
🧩 2. Detalhe de cada campo
2.1 #effect

Preset de “efeito geral” para geração / pós-processo da arte.

Tipo: texto curto

Sugestão de valores:

default

vibrant

noise

chromatic

glitch_heavy

Pode ser usado pelo pipeline de arte (ex.: Foocus / prompts) pra mudar contraste, grão, glitch etc.

Se não souber, use default.

2.2 #contrast

Controle de contraste / exposição da arte.

Tipo: texto curto

Sugestão de valores:

auto (deixa o motor decidir)

high

low

No XLS de exemplo, está auto.

Pode ser ignorado pelo backend se não for usado no começo, mas mantém compatibilidade futura.

2.3 #rarity_value

Valor numérico de raridade para o jogo (0 a 100).

Tipo: número inteiro

Exemplo: 88

Uso:

Comparação direta nas batalhas (modo “super trunfo Kroova”)

Calibração de equilíbrio entre cartas da mesma raridade icônica

Regra sugerida:

0–30 → cartas fracas

31–60 → medianas

61–85 → fortes

86–100 → absurdas / quase “quebradas” (mas raras)

2.4 #rarity_icon

Nome da raridade “icônica” que será exibida no layout.

Tipo: texto

Sugestão (alinhado com o universo Kroova):

trash

meme

viral

legendary

mythic (para variantes muito especiais)

Exemplo existente no XLS: comum
(pode ser mantido em PT-BR na UI, desde que o backend saiba mapear para tiers internos).

2.5 #hash

Identificador único da carta.

Tipo: texto

Formato sugerido:

KRV-XXX (ex.: KRV-032)

Pode funcionar como:

ID público

parte do código do NFT

referência de URL (ex. /card/KRV-032)

2.6 #name

Nome da carta (título).

Tipo: texto

Exemplo: Crocodile Trader

Boas práticas:

Nome curto e forte (2–3 palavras)

Fácil de lembrar e pronunciar

Com “sabor” de entidade:

Influencer Specter

Bug Prophet

Feed Oracle

2.7 #trend

Valor numérico de Influência Social.

Tipo: número inteiro

Escala sugerida: 0–100

Significado:

Quão forte é o “poder social” dessa carta no universo:

alcance, memeficabilidade, impacto cultural no lore

Usado como um dos atributos jogáveis

Exemplo: 92 (Crocodile Trader bem influente)

2.8 #archetype

Arquetipo narrativo / papel daquela entidade no universo Kroova.

Tipo: texto

Exemplo: Ganância Digital

Outros exemplos possíveis:

Profeta de Bug

Ídolo do Feed

Culto ao PIX

Deus do Algoritmo Vivo

Parasita de Clique

Pode ser usado:

para filtros em coleções

para sinergias futuras no gameplay

2.9 #currency

Moeda usada para exibir o #value da carta (liquidez / prêmio).

Tipo: texto curto

Exemplos:

R$

USDT

USD

Para a Edição 01 (Brasil), recomenda-se:

usar R$ na maior parte dos casos.

2.10 #value

Valor numérico ligado ao impacto econômico da carta.

Tipo: número (inteiro ou decimal)

Exemplo no XLS: 500 com currency = R$

Como você pode usar:

como valor de liquidez base (quanto paga na reciclagem)

como valor de “jackpot” para cartas especiais (R$ 5, 10, 20, 50, 200 etc.)

Decisão de uso:

Se for valor de reciclagem direto → use valores pequenos (ex.: 0.10, 1.50 etc.)

Se for valor de prêmio → use inteiro (ex.: 5, 50, 200)

A definição exata (se é cents ou real cheio) deve ser padronizada no backend, mas a coluna já suporta ambas as abordagens.

2.11 #description

Texto de lore / descrição curta da carta.

Tipo: texto

Exemplo:

Um negociador predatório, movido por fluxos invisíveis de lucro.

Estilo da Edição 01:

80% sátira inteligente / crítica

20% tecnognóstico filosófico / místico

Dicas:

1–2 frases no máximo

Pode conter ironia:

Ele diz que ensina educação financeira. O algoritmo chama de sacrifício.

2.12 #frame

Estilo de moldura/layout da carta (modo visual Kroova).

Tipo: texto

Alinhado com o branding oficial:

default

neon

glow

glitch

ghost

holo

dark

Esse valor é o que o sistema deve usar para:

escolher cores

bordas

overlays

No exemplo XLS: default

2.13 #art

URL da arte base da carta.

Tipo: texto (URL)

Exemplo:

https://drive.google.com/file/d/.../view?usp=sharing

Pode apontar para:

Google Drive

S3

CDN própria

Backend / pipeline de imagem:

Faz download da arte

aplica frame/layout

gera card final

📋 3. Exemplo de Linha Completa (a partir do XLS atual)
#effect = default
#contrast = auto
#rarity_value= 88
#rarity_icon = comum
#hash = KRV-032
#name = Crocodile Trader
#trend = 92
#archetype = Ganância Digital
#currency = R$
#value = 500
#description = Um negociador predatório, movido por fluxos invisíveis de lucro.
#frame = default
#art = https://drive.google.com/file/d/1Ql4PHCFZYh4O4HIZE2_Jxz_KJcqc66cJ/view?usp=sharing

🛠 4. Como o Copilot deve usar este template

Quando você jogar este arquivo + o XLS para o Copilot / Augment, a instrução ideal é:

Tratar cada linha como um registro de card

Usar as colunas para:

gerar JSON interno de card

alimentar banco (cards_base / cards_instances)

alimentar pipeline de geração de imagem

NUNCA renomear os cabeçalhos das colunas:

#effect, #contrast, ..., #art
(isso garante compatibilidade com scripts futuros).

✅ 5. Resumo Rápido

Estrutura estável para todas as edições.

Mesma planilha pode ser usada para ED01, ED02, etc.

Você só precisa:

duplicar o arquivo XLS

preencher novas linhas com novos cards

Este .md é o “contrato” para qualquer automação futura.

Kroova não é só um cardgame.
É um banco de entidades digitais com valor, lore e liquidez.

======== FIM DO ARQUIVO ========
