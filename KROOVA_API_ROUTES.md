======== INÍCIO DO ARQUIVO ========

# 🛰️ KROOVA_API_ROUTES.md (Legacy)

> Nota de transição: existe versão atualizada sob marca Krouva: `KROUVA_API_ROUTES.md`. Este arquivo permanece para referência histórica; novos desenvolvimentos devem seguir os arquivos `KROUVA_*`.

> Especificação das rotas de API do backend Kroova  
> Stack alvo: **Node.js + TypeScript (Fastify/Express)** + Supabase (Postgres)  
> Formato: **JSON over HTTP**, versão: `/api/v1/...`

Este documento é um **contrato funcional** para o Copilot gerar controllers, services e handlers.  
Regras profundas de autenticação e segurança estarão em `KROUVA_AUTH_RULES.md` (legacy: `KROOVA_AUTH_RULES.md`).

---

## 🧩 Convenções Gerais

- Base URL: `/api/v1`
- Respostas em JSON com `{ "ok": boolean, "data"?: any, "error"?: { code, message } }`
- Autenticação padrão: **Bearer token (JWT)** no header  
  `Authorization: Bearer <token>`
- Rotas com `🔒` exigem usuário autenticado
- Rotas com `🛠️` são administrativas (somente sistema/admin)

---

## 🔐 Auth & User Profile

### `POST /api/v1/auth/register`

Cria conta + wallet + migra inventário pendente (se houver).

Body:
{ "email": "", "password": "", "name": "optional" }

Resposta:
{ "ok": true, "data": { "user": {...}, "token": "jwt" } }

---

### `POST /api/v1/auth/login`

Login com email/senha.

Body:
{ "email": "", "password": "" }

Resposta:
{ "ok": true, "data": { "token": "jwt", "user": {...} } }

---

### `GET /api/v1/auth/me` 🔒

Retorna dados do usuário logado.

Resposta:
{ "ok": true, "data": { "id": "", "email": "", "cpf_verified": false } }

---

### `POST /api/v1/users/cpf` 🔒

Define CPF do usuário (necessário para saque/reciclagem/vendas).

Body:
{ "cpf": "00000000000" }

Resposta:
{ "ok": true }

---

## 💰 Wallet & Transações

### `GET /api/v1/wallet` 🔒

Consulta saldos BRL/Cripto.

---

### `GET /api/v1/wallet/transactions` 🔒

Lista transações com paginação e filtros.

---

### `POST /api/v1/wallet/withdraw` 🔒

Solicita saque (PIX ou Cripto).  
Regra: taxa fixa de **4%**. PIX somente para **mesmo CPF**.

Body:
{ "method": "pix|crypto", "amount_brl": "", "amount_crypto": "", "target": {...} }

---

### `POST /api/v1/wallet/deposit/webhook` 🛠️

Webhook de confirmação de pagamento (PIX/Stripe).  
Credita saldo e cria transação.  
Se o usuário ainda não tiver conta → cria **pending_inventory**.

---

## 🎁 Boosters & Inventário

### `GET /api/v1/boosters`

Lista tipos de booster disponíveis com preços e distribuição.

---

### `POST /api/v1/boosters/purchase` 🔒

Compra boosters com saldo interno.

Body:
{ "booster_type_id": "", "quantity": 1, "currency": "brl|crypto" }

---

### `POST /api/v1/boosters/open` 🔒

Abre booster e gera cartas usando o algoritmo.  
Cria instâncias → adiciona a `user_inventory`.

---

### `GET /api/v1/inventory` 🔒

Lista cartas do jogador com filtros por raridade/search + paginação.

---

### `GET /api/v1/cards/:instance_id` 🔒

Consulta detalhes de uma carta (instância específica).

---

## ⏳ Pending Inventory (pré-conta)

### `POST /api/v1/pending/claim` 🔒

Importa inventário pendente pelo e-mail, caso o usuário tenha feito compras antes do cadastro.

Body:
{ "email": "" }

---

## ♻ Reciclagem

### `POST /api/v1/cards/:instance_id/recycle` 🔒

Recicla carta → retorna liquidez base (BRL ou cripto).  
Cria `recycle_history` + credita saldo.

---

## 🏪 Marketplace P2P

### `GET /api/v1/market/listings`

Lista cartas à venda com filtros por raridade, preço e vendedor.

---

### `POST /api/v1/market/listings` 🔒

Cria anúncio de carta.

Body:
{ "card_instance_id": "", "price_brl": "", "price_crypto": "" }

---

### `DELETE /api/v1/market/listings/:listing_id` 🔒

Cancela anuncio do usuário logado.

---

### `POST /api/v1/market/listings/:listing_id/buy` 🔒

Compra carta com saldo interno.  
Transfere ownership e taxa de marketplace **4%**.

---

## 🪙 NFT Mint & On-Chain (Resumo)

> Fluxo completo será descrito em `KROOVA_NFT_MINT_FLOW.md`.

### `POST /api/v1/cards/:instance_id/mint` 🔒

Solicita mint on-chain. Cria job/queue interno.

Body:
{ "chain": "polygon", "priority": "normal|high" }

---

### `GET /api/v1/cards/:instance_id/mint-status` 🔒

Consulta status/tx no blockchain.

---

## 🛠️ Admin (Opcional para futuro)

- `GET /api/v1/admin/users`
- `GET /api/v1/admin/audit/balances`
- `GET /api/v1/admin/audit/cards`
- `POST /api/v1/admin/audit/rebuild-hash`

---

## 📌 Conclusão

Com este documento (legacy) + `KROUVA_DB_SCHEMA.md`, o Copilot pode:

- Criar controle de rotas
- Implementar services associados ao banco
- Integrar pagamentos e inventário
- Implementar marketplace e reciclagem
- Preparar mint NFT on-chain

======== FIM DO ARQUIVO ========
