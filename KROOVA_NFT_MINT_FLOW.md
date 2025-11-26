# 🔐 KROOVA_NFT_MINT_FLOW.md

> Fluxo oficial de transformação de cartas Kroova em NFT on-chain  
> e regras de reciclagem (destruição controlada de oferta)

---

## 1. Visão Geral

A Kroova foi desenhada para funcionar em **dois níveis**:

1. **Camada de Jogo & Coleção (off-chain / banco de dados)**
   - Rápida, barata, perfeita para volume de boosters e partidas.
   - Todas as cartas nascem aqui.
   - É onde acontecem jogos, reciclagem e marketplace interno.

2. **Camada de Relíquia & Registro (on-chain / NFT)**
   - Lenta, rara, cara e definitiva.
   - Só algumas cartas atravessam esse “portal”.
   - Elas se tornam **NFTs reais**, com hash imutável.

📌 Princípio central:

> **Nem toda carta vira NFT.  
> Apenas as que realmente merecem existir para sempre.**

---

## 2. Conceito de Custódia

### 2.1. Custódia na Kroova (padrão)

Por padrão:

- As cartas existem apenas na **base de dados da Kroova**.
- O jogador tem:
  - um **perfil** (user)
  - uma **wallet interna** (saldo BRL/cripto)
  - um **inventário de cartas** (instâncias off-chain)

Nenhuma dessas cartas nasce como NFT.  
Elas só são NFT se passarem pelo **processo de mint**.

---

### 2.2. Custódia On-Chain (quando vira NFT)

Quando uma carta é mintada:

- Ela deixa de ser apenas um registro de banco.
- Passa a ter:
  - um **token_id** em contrato ERC-1155 (Polygon)
  - um **hash_onchain** registrado na tabela de instâncias
  - um **owner on-chain** (endereço de carteira)

A Kroova:

- mantém um **contrato master** na blockchain (Polygon).
- usa um fluxo de **custódia híbrida**:
  - jogador pode:
    - deixar o NFT sob custódia da Kroova (endereço guardado pela plataforma)
    - ou transferir para uma carteira própria (Metamask, etc.), quando esse recurso existir.

---

## 3. Quando uma Carta Vira NFT?

Há dois tipos de mint:

1. **Mint Automático (sem escolha do jogador)**
2. **Mint Manual (por decisão do jogador)**

### 3.1. Mint Automático

Acontece automaticamente nos seguintes casos:

- **Cartas Godmode**
  - Qualquer carta com frame Godmode (skin divina) é marcada para mint.
  - São sempre raríssimas.
  - Viram NFTs para sempre, mesmo que o jogador não tenha pedido.

- **Cartas Legendary Selecionadas**
  - Algumas Legendary de cada edição são “promovidas” pelo sistema:
    - cartas com alto impacto social
    - cartas associadas a eventos da comunidade
  - Elas entram em uma fila de mint automático.

- **Cartas Históricas / Eventos (Trending)**
  - Cartas que:
    - foram usadas para vencer torneios importantes,
    - viraram memes massivos,
    - participaram de campanhas especiais ou recordes,
  - podem ser marcadas como **“Relíquias da Interface”**.
  - Essas cartas também entram em fila de mint.

> “O que marcou a interface, permanece. O resto é esquecido.”

---

### 3.2. Mint Manual (por decisão do jogador)

Além do automático, o jogador pode optar por:

- abrir a tela da carta no app
- clicar em uma ação do tipo: **“Transformar em NFT”** (quando disponível)

A plataforma:

- avalia se:
  - a carta é elegível (algumas podem ser bloqueadas por edição/regra),
  - o jogador possui saldo/saldo cripto para pagar gás (caso o sistema repasse esse custo).

Se estiver tudo ok:

- a carta é marcada para mint
- entra na fila de execução on-chain

📌 A Kroova pode:

- subsidiar parcialmente o gás,
- ou repassar o custo, dependendo da edição/campanha.

---

## 4. Reciclagem = Venda de Volta + Destruição

Na Kroova:

> **Reciclar uma carta é vender de volta para o sistema.**

### 4.1. O que acontece quando o jogador recicla?

1. O jogador escolhe uma carta do inventário.
2. Clica em **“Reciclar”** (modo BRL ou cripto, dependendo da edição).
3. O sistema:
   - calcula o **valor de liquidez mínima** daquela carta (Impacto Econômico),
   - credita esse valor na wallet interna do jogador,
   - **remove permanentemente** a carta do inventário.

### 4.2. Importante: carta reciclada não vira NFT

- Não há criação de NFT nas cartas recicladas.
- Não há gasto de gas.
- Não há conversão para blockchain.
- A carta é simplesmente **destruída** na camada de banco de dados.

Isso tem dois efeitos:

1. **Reduz a oferta total** daquela carta na edição.
2. Impede custo desnecessário com tokens NFT sem valor simbólico.

> “A carta que você destrói hoje é a raridade que você lamentará amanhã.”

---

## 5. Fluxo Completo: Vida de uma Carta

### 5.1. Nascimento (Booster)

- Carta nasce ao abrir um booster:
  - registrada como instância em `cards_instances`
  - atribuída ao `owner_id` (usuário)
  - com atributos:
    - raridade numérica
    - impacto econômico
    - influência base
    - skin/frame (default, neon, ghost etc.)

Neste estágio:

- **a carta não é NFT**.
- ela existe apenas no “mundo Kroova”.

---

### 5.2. Uso (Jogo, Coleção, Marketplace Interno)

Com a carta, o jogador pode:

- usar em duelos (KROOVA_GAME_RULES)
- listar no marketplace interno Kroova
- receber curtidas / seguidores (Influência Social)
- mantê-la só como coleção em pastas

Tudo isso ainda é **camada off-chain**.

---

### 5.3. Reciclagem (Liquidez & Destruição)

Se o jogador recicla:

- recebe liquidez mínima (Impacto Econômico)
- a carta é:
  - removida do inventário
  - marcada como destruída na base
  - nunca mintada
  - nunca usada novamente

**Conclusão:**  
Reciclar reduz o supply total daquela carta e beneficia os holders remanescentes.

---

### 5.4. Mint Automático (Casos Especiais)

Se a carta foi marcada como:

- Godmode
- Legendary especial
- Carta histórica/trending

Ela entra em uma **fila interna de mint on-chain**, por exemplo:

- uma tabela interna de jobs tipo `nft_mint_queue`.

Passos:

1. O sistema registra:
   - ID da carta
   - tipo de trigger (godmode, legendary, evento)
   - dados necessários para metadata (imagem, atributos, lore)
2. Um processo de backend (job worker / função serverless) processa a fila:
   - agrupa mints (para eficiência de gás)
   - envia transações à blockchain (Polygon)
3. Ao sucesso da transação:
   - grava `hash_onchain`
   - marca `is_minted = true`
   - vincula `token_id` ao usuário (custódia padrão Kroova ou endereço do jogador)

---

### 5.5. Mint Manual (Por Solicitação do Jogador)

Quando o jogador escolhe transformar em NFT:

1. Ele solicita o mint dentro do app.
2. O sistema checa:
   - se a carta já não é NFT,
   - se é elegível para mint,
   - se o jogador atende os requisitos (saldo, verificação, etc.).
3. Em caso positivo:
   - registra um job em `nft_mint_queue`.
   - segue o mesmo fluxo de job worker que o mint automático.

---

## 6. Metadata e Coerência Visual

O NFT gerado deve seguir o padrão de metadados definido em:

- `KROOVA_NFT_PROTOCOL.md`
- `KROOVA_CARD_LAYOUT.md`

Ou seja:

- `name` (ex.: “Crocodile Trader”)
- `description` (resumo da entidade)
- `image` (link IPFS ou storage)
- `external_url` (link para página da carta na Kroova)
- `attributes`:
  - Raridade numérica
  - Influência Social
  - Impacto Econômico
  - Edição
  - Skin/frame
  - Archetype
  - flags especiais (godmode, histórica, etc.)

---

## 7. Segurança de Chaves e Custódia

Pontos fundamentais:

- As chaves privadas da carteira master da Kroova:
  - nunca ficam expostas no código-fonte
  - devem ser armazenadas em cofre seguro (secret manager / HSM)
- Assinaturas e mints:
  - sempre feitos em ambiente de backend seguro (nunca no frontend)
- A Kroova pode:
  - operar como **custodiante** dos NFTs por padrão,
  - oferecer exportação para carteira externa em estágios posteriores.

---

## 8. Resumo Conceitual

- **Toda carta nasce digital, off-chain.**
- Jogador pode:
  - jogar,
  - colecionar,
  - vender internamente,
  - reciclar por liquidez (destruição permanente).

- **Apenas algumas cartas atravessam para o nível de NFT:**
  - Godmode
  - Legendary selecionadas
  - Históricas/eventos

- **Reciclar = vender de volta para o sistema + destruir.**
  - Nenhum NFT é criado
  - Nenhum gás é gasto
  - A raridade real aumenta

> “A blockchain é o cemitério luxuoso das cartas mais importantes.  
> O resto vive, luta e morre dentro da Interface.”

---

**© Kroova Labs — Fluxo Oficial de Mint NFT e Reciclagem**
