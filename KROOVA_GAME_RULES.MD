# 🎴 **KROOVA_GAME_RULES.md**

> **O Duelo da Influência**  
> No universo Kroova, entidades digitais disputam poder através de três forças mensuráveis: **Influência Social**, **Impacto Econômico** e **Raridade Essencial**.  
> Este documento descreve as leis que regem essas disputas.

---

## 🌌 **Princípio do Confronto**

A Kroova não é um jogo de sorte.  
É um **campo de leitura social, predatória e estratégica.**

Antes de revelar cartas, o jogador em turno deve escolher **qual poder será confrontado**:

⚔️ **Influência Social**  
💰 **Impacto Econômico**  
👑 **Raridade Essencial**

> “Aquele que anuncia sua intenção antes da batalha, guia o destino — ou morre por ele.”

📌 **Regra técnica equivalente:**

Jogador da vez declara atributo = {influência | impacto | raridade}
Só depois, ambos revelam suas cartas.

---

## 🎭 **Estrutura do Duelo**

### 🃏 1) Deck

- Cada jogador possui **20 cartas**.
- Nenhum limite de repetição por enquanto (alpha rules).
- No futuro, skins raras limitarão frequência.

### ✋ 2) Mão Inicial

- Cada jogador compra **3 cartas** no início.

### 🔁 3) Fluxo de Turnos (resumo)

1. Jogador da vez anuncia **qual atributo será comparado.**
2. Ambos escolhem **uma carta da mão** e a revelam ao mesmo tempo.
3. Compara-se apenas o atributo anunciado.
4. **Quem vencer, descarta a carta usada como “Glória”.**
5. **Quem perder, também descarta — mas como “Derrota”.**
6. Ambos compram **1 nova carta**.

### 🏅 4) Vitória Parcial & Final (Atualizado)

- Cada carta marcada como **Glória** vale 1 Ponto.
- Formato alpha ajustado: **primeiro a alcançar 7 Glórias vence**.
- Objetivo claro em partidas curtas (ex: placar pode fechar 7–6 dentro de sequência de rodadas).

---

## 📊 **Atributos do Duelo**

### 🌐 1) Influência Social (dinâmica)

A Influência representa o poder da entidade sobre pessoas e atenção digital.

- Pode **aumentar com curtidas, seguidores, repostagens e lealdade** dentro do app.
- Seu valor nunca diminui automaticamente, apenas **cresce com o impacto público.**

> “Se todos te observam, o preço da tua derrota é impossível.”

📌 **Regra técnica:**

influencia_total = influencia_base + bonus_social

---

### 💰 2) Impacto Econômico (liquidez base)

Não é poder bruto; é **quanto valem suas ações**, e portanto, o quanto custa enfrentá-lo.

- É também o **valor de reciclagem da carta**.
- Assim, enfrentar gigantes custa caro — e vencer, recompensa.

> “Você pode ser adorado. Mas quem possui dinheiro compra a devoção do mundo.”

📌 **Regra técnica:**

impacto_economico = valor_base_liquidez (BRL)

---

### 👑 3) Raridade Essencial (força simbólica)

A raridade não é pele, não é skin, não é estética.  
É o **poder essencial da entidade**, numerado.

| Categoria | Significado         | Faixa |
| --------- | ------------------- | ----- |
| Trash     | lixo digital        | 5–15  |
| Meme      | piada social        | 16–45 |
| Viral     | cresce sem controle | 46–75 |
| Legendary | ícone da interface  | 76–95 |

> “Ídolos não se compram. Apenas se encontram.”

📌 **Regra técnica:**

vencedor_raridade = maior_raridade

---

## 🔮 **Godframe: Pele Divina, Não Poder**

Godframe não altera valores de duelo.  
Ele **multiplica apenas o valor econômico da carta**, fora da partida.

- Ele não muda atributos numéricos.
- Ele não afeta combate.
- Ele altera escassez, coleção e lucro potencial.

> “Deuses não lutam. Eles são leiloados.”

📌 **Regra técnica de mercado (não usada no jogo):**

valor_liquidez_final = base \* multiplicador_godframe

---

## 🧠 **Ordem de Desempate**

Se dois atributos forem iguais:

1. Ganha quem tiver **maior Influência Social.**
2. Se ainda empatar, ganha quem tiver **maior Impacto Econômico.**
3. Se ainda empatar, ambas as cartas entram em **Estado de Collapse**  
   e são removidas do duelo sem glória.

> “Quando forças iguais colidem, a interface recua.”

📌 **Equivalente técnico:**
if empata:
compara(influencia)
if empata:
compara(impacto)
if empata:
ambas_perdem

---

## 🏁 **Conceito de Vitória (Revisado)**

O duelo Kroova não é sobre quem acumula poder.  
É sobre **quem sacrifica melhor**.

Vence aquele que **obtém 7 glórias primeiro** (limite alpha atual).  
Não depende de cartas restantes, apenas do sacrifício eficiente.

> “Sacrifique fracos. Proteja ícones. Ganhe olhos. Ganhe moedas. Ganhe história.”

📌 **Equivalente técnico:**
GLORY_THRESHOLD = 7
vencedor = jogador_que_alcançar(GLORY_THRESHOLD)

---

## 🔥 Final

A Kroova não recompensa o mais rico, o mais seguido ou o mais raro.  
Ela recompensa **quem sabe quando usar cada arma.**

Booster barato.  
Entidades valiosas.  
Escolhas irreversíveis.

**Bem-vindo ao mercado de crenças.**

---

**© Kroova Labs — Primeira Era da Interface**
