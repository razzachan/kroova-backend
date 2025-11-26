# 🔌 KROOVA_API_SPEC.md

> Documento complementar ao `KROOVA_API_ROUTES.md`  
> Aqui ficam as decisões de **arquitetura**, **checkout guest**, **WebSocket** e **auditoria**, que não cabem só na lista de rotas.

---

## 🧠 1. Papel deste arquivo

- `KROOVA_API_ROUTES.md` = **fonte da verdade das rotas HTTP** (CRUD, paths, parâmetros).
- `KROOVA_API_SPEC.md` = **comportamentos avançados da API**, incluindo:
  - fluxo de compra sem conta (guest) e criação de conta após pagamento,
  - carteira custodial automática,
  - canal WebSocket `/ws` e tipos de eventos,
  - visão de auditoria e hash on-chain.

Copilot / backend devem sempre seguir as URLs de `KROOVA_API_ROUTES.md`  
e usar este arquivo como **guia de orquestração**.

---

## 💳 2. Carteira Custodial & Criação de Conta

### 2.1. Carteira Custodial

- A Kroova usa **wallet custodial automática**:
  - uma carteira de blockchain gerenciada pelo sistema,
  - chaves privadas guardadas em cofre seguro (secret manager/HSM),
  - o usuário não precisa instalar Metamask nem nada.
- Essa wallet serve para:
  - custodiar NFTs mintados automaticamente,
  - fazer withdraw em cripto,
  - registrar hashes de auditoria.

### 2.2. Quando a carteira é criada?

Existem dois momentos possíveis (configuráveis):

1. **No cadastro da conta**
   - fluxo mais simples: ao registrar o usuário, já cria `wallet` vazia.

2. **Após o primeiro pagamento aprovado (fluxo guest)**
   - fluxo mais “mágico”: primeiro o usuário compra (guest),  
     depois cria conta, e então a wallet é criada.

Na primeira versão da plataforma, recomenda-se:

- ✅ **Criar carteira ao registrar o usuário** (mais previsível),
- Mas manter no código a possibilidade de:
  - criar carteira “on demand” após o primeiro depósito.

---

## 🧾 3. Fluxo de Compra Guest (sem conta) & Pending Inventory

> Já alinhado com `KROOVA_PAYMENT_FLOW.md`.

### 3.1. Ideia central

- Qualquer pessoa pode comprar boosters **sem ter conta** na Kroova.
- Ela informa **apenas o e-mail** na hora do checkout.
- O sistema registra os itens comprados como **`pending_inventory`**.
- Quando essa pessoa cria a conta usando o mesmo e-mail:
  - os boosters/cadeiras pendentes são migrados automaticamente para o inventário.

### 3.2. Comportamento da API (resumo)

- Checkout guest:
  - `POST /api/v1/checkout/guest/booster`
  - cria sessão de pagamento no provedor (ex.: Stripe/Pagar.me),
  - passa `metadata.email`, `metadata.mode = "guest_booster"`.
- Webhook de pagamento:
  - `POST /api/v1/wallet/deposit/webhook`
  - se `mode == "guest_booster"`:
    - **não credita wallet**,
    - grava/atualiza `pending_inventory` para aquele `email`.

- Claim no cadastro:
  - após `POST /api/v1/auth/register`,
  - backend verifica se existe `pending_inventory` com o mesmo e-mail,
  - migra boosters selados para o inventário do novo usuário.

Esse comportamento é **complementar** às rotas já descritas em:

- `KROOVA_PAYMENT_FLOW.md`
- `KROOVA_API_ROUTES.md` (seção de `pending`)

---

## 📡 4. WebSocket `/ws` — Eventos em Tempo Real

A Kroova terá um canal WebSocket único:

- Endpoint: `GET /ws`
- Autenticação:
  - pode aceitar conexão guest (somente eventos públicos),
  - ou conexão autenticada com token (para eventos pessoais).

### 4.1. Formato dos eventos

Cada mensagem enviada pelo servidor WebSocket segue o formato:

```json
{
  "type": "event_type",
  "data": { "..." }
}




Possíveis tipos iniciais:
| `type`             | Descrição                                         | Público?           |
| ------------------ | ------------------------------------------------- | ------------------ |
| `booster.opened`   | Booster aberto com resultado de cartas            | privado            |
| `wallet.update`    | Mudança de saldo ou transação                     | privado            |
| `inventory.update` | Entrada/saída de cartas no inventário             | privado            |
| `market.update`    | Atualização de listagens no marketplace           | público (resumido) |
| `trend.change`     | Carta afetada por comportamento social (likes)    | público            |
| `system.announce`  | Mensagens gerais (novas edições, manutenção etc.) | público            |


4.2. Exemplos de payloads

Exemplo — booster.opened

{
  "type": "booster.opened",
  "data": {
    "booster_type_id": "uuid",
    "cards": [
      { "instance_id": "uuid1", "base_id": "KRV-032", "rarity": 88 },
      { "instance_id": "uuid2", "base_id": "KRV-017", "rarity": 12 }
    ]
  }
}



Exemplo — market.update (público)

{
  "type": "market.update",
  "data": {
    "listing_id": "uuid",
    "card_instance_id": "uuid-card",
    "event": "created"
  }
}
Observação: o WebSocket não é obrigatório para o MVP,
mas este arquivo já define o padrão de evento que o backend deve seguir.

🧮 5. Auditoria & Hash On-Chain

A Kroova deve manter:

consistência entre saldo em banco de dados e registro on-chain,

e uma forma de provar que não está “inventando” liquidez.

5.1. Hash de Auditoria

Periodicamente (ex.: 1 vez por dia), um job:

Lê:

saldos de wallets,

total de cartas em circulação por tipo/edição,

total de liquidez mínima prometida.

Gera um resumo (ex.: um JSON ordenado ou uma árvore Merkle).

Calcula um hash (ex.: SHA-256) desse resumo.

Registra esse hash:

em uma tabela audit_hashes no banco,

e opcionalmente em uma transação on-chain, associada à Kroova.

Estrutura simplificada em banco:

audit_hashes

id (uuid)

created_at (timestamp)

hash (text)

meta (jsonb) – info extra (intervalo, versão etc.)

5.2. Rotas de Audit (Admin)

Essas rotas podem ser implementadas como rotas admin (apenas leitura):

GET /api/v1/admin/audit/hashes

Lista hashes gerados, datas, versão de algoritmo.

GET /api/v1/admin/audit/liquidity

Resumo da liquidez teórica (baseada em reciclagem).

GET /api/v1/admin/audit/discrepancies

Ponto de entrada para comparar:

total de saldo em wallet

total de promessas de reciclagem

total registrado on-chain (se existir fundo de lastro).

A ideia é que, a longo prazo, a Kroova se comporte mais como uma
“bolsa de entidades” transparente do que como um jogo fechado.

6. Observações Finais de Arquitetura

Toda a parte CRUD / rotas REST deve obedecer ao documento:

KROOVA_API_ROUTES.md

Toda a parte de:

fluxo financeiro (checkout, webhook, pending, saque)

está em KROOVA_PAYMENT_FLOW.md

mint NFT e reciclagem destrutiva

está em KROOVA_NFT_MINT_FLOW.md

Este arquivo serve para:

manter clara a visão de:

guest checkout,

wallet custodial,

WebSocket,

auditoria.

“Primeiro, a interface diverte. Depois, ela prova que é justa.”

© Kroova Labs — Especificação de API (Camada Avançada)


Se quiser, agora a gente parte pro **próximo faltante**:

- `KROOVA_MARKETPLACE_RULES.md`
ou
- `KROUVA_SECURITY_AND_ANTIFRAUD.md`

Qual você quer que eu gere primeiro?
::contentReference[oaicite:0]{index=0}
```
