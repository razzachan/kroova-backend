# 🏗️ ARQUITETURA KROOVA BACKEND

## 📋 Visão Geral

Backend completo da plataforma Kroova implementado conforme especificações dos arquivos `.md`.

**Stack:**

- Node.js v22 + TypeScript 5.9
- Fastify (web framework)
- Supabase (PostgreSQL + Auth)
- Stripe (pagamentos PIX/cartão)
- Polygon (blockchain NFT)
- BullMQ + Redis (filas assíncronas)

---

## 📂 Estrutura de Pastas

```
src/
├── app.ts                      # Configuração Fastify
├── server.ts                   # Entry point
│
├── config/                     # Configurações
│   ├── env.ts                  # Variáveis de ambiente
│   └── supabase.ts             # Cliente Supabase
│
├── http/                       # Camada HTTP
│   ├── response.ts             # Handlers ok/fail
│   │
│   ├── middlewares/            # Middlewares globais
│   │   ├── auth.middleware.ts  # JWT validation
│   │   └── validate.middleware.ts  # Zod validation
│   │
│   ├── validators/             # Schemas Zod
│   │   ├── auth.schema.ts
│   │   ├── wallet.schema.ts
│   │   ├── booster.schema.ts
│   │   ├── market.schema.ts
│   │   └── card.schema.ts
│   │
│   └── routes/                 # Definição de rotas
│       ├── index.ts            # Registro central
│       ├── auth.routes.ts      # POST /auth/register, /auth/login
│       ├── wallet.routes.ts    # GET /wallet, POST /wallet/withdraw
│       ├── booster.routes.ts   # GET /boosters, POST /boosters/purchase
│       ├── card.routes.ts      # GET /cards/:id, POST /cards/:id/recycle
│       └── market.routes.ts    # GET /market/listings, POST /market/listings
│
├── modules/                    # Domínios de negócio (Services)
│   ├── auth/
│   │   └── auth.service.ts     # Register, login, CPF, pending inventory
│   ├── wallet/
│   │   └── wallet.service.ts   # Balance, withdraw, deposit webhook, limits
│   ├── booster/
│   │   └── booster.service.ts  # Purchase, open, inventory, algorithm
│   ├── card/
│   │   └── card.service.ts     # Get card, recycle, mint NFT
│   └── market/
│       └── market.service.ts   # List, create, buy, cancel listing
│
├── lib/                        # Utilitários e integrações
│   ├── crypto.ts               # AES-256-CBC encryption
│   ├── utils.ts                # displayId, CPF, fees, format
│   ├── stripe.ts               # Stripe API (PIX, checkout)
│   ├── polygon.ts              # Polygon Web3 (mint NFT, metadata)
│   ├── queue.ts                # Mock queue (placeholder)
│   └── queue-bullmq.ts         # BullMQ workers (mint, withdraw)
│
└── errors/                     # Tratamento de erros
    ├── http-error.ts
    └── codes.ts
```

---

## 🔐 Autenticação (Auth Module)

**Arquivo:** `src/modules/auth/auth.service.ts`

### Funcionalidades

1. **Registro (`register`)**
   - Cria usuário no Supabase Auth
   - Cria perfil em `users` (display_id, email, name)
   - Cria wallet com saldos zerados
   - Migra inventário pendente (se existir para o email)
   - Retorna JWT (7 dias de validade)

2. **Login (`login`)**
   - Autentica via Supabase Auth
   - Retorna JWT + dados do usuário

3. **Me (`getMe`)**
   - Retorna dados do usuário logado
   - Middleware: `authMiddleware`

4. **Definir CPF (`setCpf`)**
   - Valida formato do CPF
   - Verifica se CPF já está em uso
   - Obrigatório para: saques PIX, reciclagem BRL, vendas marketplace

### Rotas

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me` 🔒
- `POST /api/v1/users/cpf` 🔒

---

## 💰 Wallet (Wallet Module)

**Arquivo:** `src/modules/wallet/wallet.service.ts`

### Funcionalidades

1. **Consultar Saldos (`getWallet`)**
   - Retorna `balance_brl` e `balance_crypto`

2. **Listar Transações (`getTransactions`)**
   - Paginação (page, limit)
   - Filtros por tipo (deposit, withdraw, market_buy, etc)

3. **Saque (`withdraw`)**
   - **PIX:** Exige CPF, taxa 4%, limites diários/semanais/mensais
   - **Cripto:** Não exige CPF, taxa 4%, alerta >R$2.500/dia
   - Status: `pending` (aguardando processamento)

4. **Webhook de Depósito (`handleDepositWebhook`)**
   - Valida pagamento do Stripe
   - Credita saldo na wallet
   - Se usuário não existe → cria pending_inventory

### Limites de Saque

- R$ 1.500 por dia
- R$ 7.500 por semana
- R$ 30.000 por mês

### Rotas

- `GET /api/v1/wallet` 🔒
- `GET /api/v1/wallet/transactions` 🔒
- `POST /api/v1/wallet/withdraw` 🔒
- `POST /api/v1/wallet/deposit/webhook` 🛠️ (admin)

---

## 🎁 Boosters (Booster Module)

**Arquivo:** `src/modules/booster/booster.service.ts`

### Funcionalidades

1. **Listar Tipos (`listBoosterTypes`)**
   - Retorna boosters disponíveis (preço, raridade, edition)

2. **Comprar Boosters (`purchase`)**
   - Debita saldo (BRL ou cripto)
   - Cria registros em `booster_openings` (fechados)
   - Registra transação

3. **Abrir Booster (`open`)**
   - Gera cartas baseado no algoritmo de raridade
   - Marca booster como aberto
   - Adiciona cartas ao `user_inventory`

4. **Listar Inventário (`getInventory`)**
   - Retorna cartas do jogador
   - Paginação + filtros (rarity, edition, search)

### Algoritmo de Raridade

Baseado em `KROUVA_BOOSTER_ALGORITHM.md`:

- **Trash:** 70.85%
- **Meme:** 20%
- **Viral:** 8%
- **Legendary:** 1%
- **Godmode:** 0.15%

### Rotas

- `GET /api/v1/boosters`
- `POST /api/v1/boosters/purchase` 🔒
- `POST /api/v1/boosters/open` 🔒
- `GET /api/v1/inventory` 🔒

---

## 🃏 Cards (Card Module)

**Arquivo:** `src/modules/card/card.service.ts`

### Funcionalidades

1. **Detalhes da Carta (`getCard`)**
   - Retorna instância + base card + metadata
   - Verifica ownership

2. **Reciclar (`recycle`)**
   - Retorna liquidez base garantida (BRL)
   - Exige CPF se valor > 0
   - Remove carta do inventário
   - Registra em `recycle_history`
   - Credita saldo na wallet

3. **Mint NFT (`mintNft`)**
   - Cria job na fila BullMQ
   - Marca carta como `mint_pending`
   - Processa assincronamente (Polygon ERC-1155)

### Rotas

- `GET /api/v1/cards/:instance_id` 🔒
- `POST /api/v1/cards/:instance_id/recycle` 🔒
- `POST /api/v1/cards/:instance_id/mint` 🔒

---

## 🏪 Marketplace (Market Module)

**Arquivo:** `src/modules/market/market.service.ts`

### Funcionalidades

1. **Listar Anúncios (`listListings`)**
   - Filtros: raridade, preço, arquétipo, edição
   - Ordenação: preço, raridade, data
   - Paginação

2. **Criar Anúncio (`createListing`)**
   - Exige CPF
   - Verifica ownership
   - Valida preço > 0

3. **Cancelar Anúncio (`cancelListing`)**
   - Apenas dono pode cancelar
   - Status → `cancelled`

4. **Comprar Carta (`buyListing`)**
   - Verifica saldo do comprador
   - Calcula taxa de marketplace (4%)
   - Transfere valores (comprador → vendedor)
   - Transfere ownership da carta
   - Atômico (transação SQL)

### Taxas

- **Taxa de venda:** 4% (descontado do vendedor)
- **Valor líquido vendedor:** `preço - taxa`

### Rotas

- `GET /api/v1/market/listings`
- `POST /api/v1/market/listings` 🔒 (requer CPF)
- `DELETE /api/v1/market/listings/:id` 🔒
- `POST /api/v1/market/listings/:id/buy` 🔒

---

## 🔗 Integrações Externas

### Stripe (`src/lib/stripe.ts`)

- **Checkout Sessions:** Depósitos via cartão
- **PIX Payments:** Payment Intents
- **Webhooks:** Confirmação de pagamento

### Polygon (`src/lib/polygon.ts`)

- **Provider:** Polygon RPC
- **Mint NFT:** ERC-1155 (placeholder, aguarda deploy do contrato)
- **Metadata:** JSON conforme `KROUVA_NFT_PROTOCOL.md`

### BullMQ (`src/lib/queue-bullmq.ts`)

- **Fila de Mint:** Processa mint NFT assincronamente
- **Fila de Saque:** Processa saques cripto
- **Workers:** Retry automático com backoff exponencial

---

## 🛡️ Segurança

### Middlewares

1. **`authMiddleware`**
   - Valida Bearer token (JWT)
   - Adiciona `request.user` com `{ sub, email, role }`

2. **`adminMiddleware`**
   - Verifica role `admin` ou `system`
   - Usado em webhooks e operações privilegiadas

3. **`validate`**
   - Valida body/query/params com Zod
   - Retorna erro 400 com mensagem descritiva

### Encryption

- **Wallet custodial:** Chaves privadas criptografadas com AES-256-CBC
- **Arquivo:** `src/lib/crypto.ts`

### Validações

- **CPF:** Formato + verificação de duplicidade
- **Saldo:** Verificação antes de débito
- **Ownership:** Validação antes de operações

---

## 📊 Padrão de Resposta

```json
// Sucesso
{
  "ok": true,
  "data": { ... }
}

// Erro
{
  "ok": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Descrição opcional"
  }
}
```

### Códigos de Erro

- `UNAUTHORIZED` → Token inválido/ausente
- `INVALID_TOKEN` → JWT expirado
- `FORBIDDEN` → Sem permissão
- `INVALID_INPUT` → Validação Zod falhou
- `INSUFFICIENT_FUNDS` → Saldo insuficiente
- `NEEDS_CPF` → CPF obrigatório
- `LIMIT_REACHED` → Limite de saque excedido
- `CARD_NOT_FOUND` → Carta não encontrada
- `INTERNAL_ERROR` → Erro genérico

---

## 🚀 Comandos Disponíveis

```bash
# Desenvolvimento
npm run dev              # Servidor com hot reload
npm run build            # Compila TypeScript
npm run start            # Servidor compilado

# Testes
npm test                 # Roda testes
npm run test:watch       # Modo watch
npm run test:coverage    # Com cobertura

# Qualidade
npm run lint             # Verifica lint
npm run lint:fix         # Corrige automaticamente
npm run format           # Formata código
```

---

## 🔄 Próximos Passos

1. **Conectar Supabase:**
   - Criar projeto em supabase.com
   - Aplicar migration: `supabase/migrations/20241124_initial_schema.sql`
   - Aplicar seeds: `supabase/seed.sql`
   - Configurar credenciais no `.env`

2. **Setup Redis:**
   - Instalar Redis local ou usar serviço (Upstash, Redis Cloud)
   - Configurar `REDIS_HOST` e `REDIS_PORT`

3. **Configurar Stripe:**
   - Criar conta Stripe
   - Obter `STRIPE_SECRET_KEY` e `STRIPE_WEBHOOK_SECRET`
   - Configurar webhook endpoint

4. **Deploy Contrato Polygon:**
   - Deploy ERC-1155 na Polygon
   - Atualizar `src/lib/polygon.ts` com address + ABI
   - Configurar `POLYGON_RPC_URL` e `WALLET_PRIVATE_KEY`

5. **Implementar Algoritmo Completo:**
   - Finalizar lógica de `KROUVA_BOOSTER_ALGORITHM.md`
   - Modos visuais (Neon, Glow, Glitch, Ghost, Holo, Dark)
   - Godmode e prêmios (R$ 5, 10, 20, 50, 100, 200, 500, 1.000)

6. **Testes:**
   - Unit tests para cada service
   - Integration tests para fluxos completos
   - E2E tests para APIs críticas

---

## 📚 Documentação de Referência

Todos os módulos seguem estritamente:

- `KROUVA_API_ROUTES.md` — Especificação de rotas (legacy: `KROOVA_API_ROUTES.md`)
- `KROUVA_AUTH_RULES.md` — Autenticação e segurança (legacy: `KROOVA_AUTH_RULES.md`)
- `KROUVA_DB_SCHEMA.md` — Schema do banco (legacy: `KROOVA_DB_SCHEMA.md`)
- `KROUVA_PAYMENT_FLOW.md` — Fluxos financeiros (legacy: `KROOVA_PAYMENT_FLOW.md`)
- `KROUVA_BOOSTER_ALGORITHM.md` — Algoritmo de raridade (legacy: `KROOVA_BOOSTER_ALGORITHM.md`)
- `KROUVA_MARKETPLACE_RULES.md` — Regras P2P (legacy: `KROOVA_MARKETPLACE_RULES.md`)
- `KROUVA_NFT_PROTOCOL.md` — Padrão NFT ERC-1155 (legacy: `KROOVA_NFT_PROTOCOL.md`)

---

🃏 **Krouva Labs** — _"Caos é tendência. Tendência vira entidade."_
