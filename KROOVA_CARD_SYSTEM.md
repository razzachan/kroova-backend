# 🃏 KROOVA — Sistema Oficial de Cartas

Este documento define o padrão de criação, estrutura visual, raridade e regras de coleção das cartas **KROOVA**, aplicáveis ao design, ao marketplace, à programação e ao mint NFT.

---

## 🧾 Estrutura Geral de uma Carta Kroova

Cada carta deve conter:

| Campo                        | Descrição                                                                |
| ---------------------------- | ------------------------------------------------------------------------ |
| **Nome da Entidade**         | Nome oficial da criatura Kroova                                          |
| **Classificação/Arquetipo**  | Tipo comportamental (ex: Ganância, Influência, Preguiça Digital)         |
| **Raridade**                 | Comum → Mítica (ver tabela abaixo)                                       |
| **Nível de Tendência**       | Representa a força social daquele comportamento no momento               |
| **Descrição (Flavor Text)**  | Texto curto satírico e estiloso representando o comportamento            |
| **Valor Base (Liquidez)**    | Valor mínimo garantido da carta no sistema (convertível via marketplace) |
| **Código Único**             | Hash/token que representa a carta individualmente                        |
| **Arte**                     | Ilustração oficial da entidade                                           |
| **Skin/Variante (Opcional)** | Versões raras, glitchadas, holográficas, bugadas, etc.                   |

📌 **Obs.:** “Nível de Tendência” poderá influenciar o valor no futuro (dependendo do protocolo econômico de hype).

---

## ⭐ Sistema de Raridade

| Raridade        | Nome            | Chances em Booster | Valor Base             |
| --------------- | --------------- | ------------------ | ---------------------- |
| 🟣 **Mítica**   | Kroova Mítica   | 0.15%              | Muito Alto             |
| 🟡 **Lendária** | Kroova Lendária | 1%                 | Alto                   |
| 🔥 **Épica**    | Kroova Épica    | 8%                 | Médio/Alto             |
| 🔷 **Rara**     | Kroova Rara     | 20%                | Médio                  |
| 🟩 **Comum**    | Kroova Comum    | 70.85%             | Baixo (mas nunca zero) |

📌 **Toda carta tem valor garantido**, inclusive as comuns.

📌 **Valores reais serão definidos em:** `KROOVA_MARKET_ECONOMY.md`.

---

## 🎁 Estrutura dos Boosters Kroova

| Tipo                            | Quantidade de Cartas | Garantia                        |
| ------------------------------- | -------------------- | ------------------------------- |
| **Booster Urbano (base)**       | 5 cartas             | 1 Rara ou superior              |
| **Booster Tendência (premium)** | 8 cartas             | 1 Épica ou superior             |
| **Booster Glitch (elite)**      | 1 carta secreta      | 50% Épica / 50% Lendária/Mítica |

📌 **Boosters podem ser comprados com moeda do sistema ou moeda externa (real/cripto).**

---

## 🎨 Layout Base da Carta (Proporções)

| Elemento           | Diretriz                                           |
| ------------------ | -------------------------------------------------- |
| Fundo              | Escuro (`#111113`) com textura urbana/deglitch     |
| Moldura            | Neon magenta (`#FF006D`) com efeito glitch         |
| Destaques          | Cyan (`#00F0FF`) para informações digitais         |
| Nome               | Superior, tipografia Montserrat Black              |
| Arte Principal     | Central, grande, dominante                         |
| Valor Base         | Inferior direito (ícone amarelo `#FFC700`)         |
| Nível de Tendência | Inferior esquerdo (ícone verde glitch `#39FF14`)   |
| Raridade           | Bordas discretas + ícone próprio (definido abaixo) |

---

## 🔣 Ícones de Raridade (Padrão Visual)

| Raridade    | Ícone | Cor              |
| ----------- | ----- | ---------------- |
| 🟣 Mítica   | ◉     | `#FF006D` (Glow) |
| 🟡 Lendária | ★     | `#FFC700`        |
| 🔥 Épica    | ✦     | `#FF4FE3`        |
| 🔷 Rara     | ◆     | `#00F0FF`        |
| 🟩 Comum    | ●     | `#6CFB6C`        |

---

## 🎭 Categorias Comportamentais (Arquetipos)

Cada entidade Kroova deve pertencer a **um Arquetipo Primário**:

| Arquetipo            | Representa                                  |
| -------------------- | ------------------------------------------- |
| **GANÂNCIA**         | Obsessão por lucro instantâneo              |
| **INFLUÊNCIA**       | Busca extrema por atenção/poder social      |
| **PREGUIÇA DIGITAL** | Dependência de entretenimento/passividade   |
| **CAOS/IMPULSO**     | Hype, vício, víralização irracional         |
| **CONSUMO**          | Obsessão por compra, status e escassez      |
| **INFORMAÇÃO/BURST** | Fake news, manipulação, exagero informativo |

📌 _Novos podem ser criados conforme edições futuras._

---

## 🧬 Evolução e Skins (Opcional)

Algumas cartas podem ter versões alternativas chamadas **“Skins Glitch”**:

| Skin                  | Característica             |
| --------------------- | -------------------------- |
| **Holográfica**       | Arte com reflexo digital   |
| **Bugada**            | Arte distorcida/glitchada  |
| **Fragmentada**       | Cartas com partes faltando |
| **Shadow / Blackout** | Versão escura corrompida   |
| **Neonburst**         | Estouro de cor explosiva   |

📌 Skins podem alterar:

- Probabilidade (mais raras)
- Valor base (maior)
- Arte (única)

---

## 📌 Observação Técnica

Este documento define **o modelo visual e probabilístico**, mas **não define economia nem blockchain**. Esses elementos estão em:

- `KROOVA_MARKET_ECONOMY.md`
- `KROOVA_NFT_PROTOCOL.md`

---

> 🃏 _“Valor nasce da tendência. Tendência nasce do coletivo.”_
> — Manual de Cartas Kroova

---

## 🎮 Modo de Jogo (Opcional) — Estilo Super Trunfo Kroova

KROOVA pode ser jogado de forma simples, inspirada em jogos de comparação de atributos (como Super Trunfo). Este modo é **casual, universal e opcional**, apenas para quem deseja jogar com as cartas em vez de apenas colecioná-las.

### 🎯 Objetivo

Vencer rodadas comparando atributos sociais das criaturas.

### 🧮 Atributos Utilizados no Jogo

Cada carta usa 3 atributos básicos para comparação:

| Atributo              | Descrição                                                           | Escala |
| --------------------- | ------------------------------------------------------------------- | ------ |
| **Tendência**         | Força atual do comportamento que a Kroova representa                | 0–100  |
| **Influência Social** | Alcance e idolatria pública do vício                                | 0–100  |
| **Impacto Econômico** | Potencial de gerar lucro, hype ou especulação no mundo real/digital | 0–100  |

📌 Esses números poderão variar com o tempo conforme edições, expansões ou reprints.

---

### 🎮 Como Jogar (Modo Base)

1. Cada jogador recebe uma quantidade igual de cartas.
2. O jogador da vez escolhe um dos 3 atributos.
3. Todos revelam a carta do topo de seus decks.
4. Quem tiver o maior valor naquele atributo vence a rodada e recolhe as cartas reveladas.

📌 **No caso de empate:**  
A carta com **maior Raridade** vence. Se empatar novamente, vence a carta com **maior Valor Base (Liquidez).**

---

### 🏆 Variações Futuras (Não Obrigatórias)

| Modo              | Descrição                                                    |
| ----------------- | ------------------------------------------------------------ |
| **Modo Hype**     | Tendência pode ser atualizada em tempo real via marketplace. |
| **Modo Glitch**   | Skins podem alterar atributos temporariamente.               |
| **Modo Mercante** | Jogabilidade baseada em compra e venda durante o jogo.       |

📌 Esses modos estarão em documentos separados caso o sistema evolua para jogo competitivo.

---

> 🎮 _“Colecionar é poder. Comparar é sobrevivência.”_  
> — Manual Casual de Jogo Kroova
