# KROOVA API - Documentação para Integração Frontend

## Base URL
```
Production: https://kroova-api.onrender.com/api/v1
Development: http://localhost:3333/api/v1
```

## Autenticação

Todas as rotas protegidas requerem header:
```
Authorization: Bearer <access_token>
```

---

## 📋 Auth Routes

### POST `/auth/register`
Registra novo usuário.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "João Silva"
}
```

**Response 200:**
```json
{
  "ok": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "João Silva",
      "created_at": "2025-11-26T12:00:00Z"
    },
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc..."
  }
}
```

### POST `/auth/login`
Autentica usuário existente.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response 200:**
```json
{
  "ok": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "João Silva",
      "cpf": "12345678901" // null se não cadastrado
    },
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc..."
  }
}
```

**Response 401:**
```json
{
  "ok": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Email ou senha inválidos"
  }
}
```

### POST `/auth/refresh`
Renova access token usando refresh token.

**Request:**
```json
{
  "refresh_token": "eyJhbGc..."
}
```

**Response 200:**
```json
{
  "ok": true,
  "data": {
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc..."
  }
}
```

---

## 💰 Wallet Routes

### GET `/wallet`
🔒 Retorna saldo da carteira do usuário.

**Response 200:**
```json
{
  "ok": true,
  "data": {
    "user_id": "uuid",
    "balance_brl": 125.50,
    "balance_crypto": "0.00000000",
    "total_deposited": 200.00,
    "total_withdrawn": 50.00,
    "updated_at": "2025-11-26T12:00:00Z"
  }
}
```

### GET `/wallet/transactions`
🔒 Retorna histórico de transações.

**Query Params:**
- `limit` (opcional): número de transações (padrão: 50, max: 100)
- `offset` (opcional): paginação (padrão: 0)

**Response 200:**
```json
{
  "ok": true,
  "data": {
    "transactions": [
      {
        "id": "uuid",
        "type": "booster_purchase",
        "amount_brl": -9.90,
        "amount_crypto": "0.00000000",
        "balance_after_brl": 115.60,
        "description": "Compra de booster",
        "created_at": "2025-11-26T12:00:00Z"
      },
      {
        "type": "deposit",
        "amount_brl": 125.50,
        "balance_after_brl": 125.50,
        "description": "Depósito via PIX",
        "created_at": "2025-11-26T11:00:00Z"
      }
    ],
    "total": 42,
    "limit": 50,
    "offset": 0
  }
}
```

**Transaction Types:**
- `deposit` - Depósito
- `withdraw` - Saque
- `booster_purchase` - Compra de booster
- `market_buy` - Compra no marketplace
- `market_sell` - Venda no marketplace
- `recycle` - Reciclagem de carta

### POST `/wallet/deposit/dev`
🔒 **DEV ONLY** - Adiciona saldo para testes.

**Request:**
```json
{
  "amount": 100.00
}
```

**Response 200:**
```json
{
  "ok": true,
  "data": {
    "balance_brl": 225.50,
    "amount_added": 100.00
  }
}
```

### POST `/wallet/withdraw`
🔒 Solicita saque (requer CPF cadastrado).

**Request:**
```json
{
  "amount": 50.00,
  "method": "pix",
  "target": {
    "pix_key": "user@example.com"
  }
}
```

**Response 200:**
```json
{
  "ok": true,
  "data": {
    "withdrawal_id": "uuid",
    "amount_requested": 50.00,
    "fee": 2.50,
    "amount_received": 47.50,
    "status": "pending",
    "estimated_completion": "2025-11-26T14:00:00Z"
  }
}
```

**Response 400 (insufficient balance):**
```json
{
  "ok": false,
  "error": {
    "code": "INSUFFICIENT_BALANCE",
    "message": "Saldo insuficiente. Disponível: R$ 25.50"
  }
}
```

**Response 400 (CPF required):**
```json
{
  "ok": false,
  "error": {
    "code": "CPF_REQUIRED",
    "message": "CPF obrigatório para saques. Use POST /users/cpf"
  }
}
```

---

## 📦 Booster Routes

### GET `/boosters`
Lista tipos de boosters disponíveis.

**Response 200:**
```json
{
  "ok": true,
  "data": {
    "booster_types": [
      {
        "id": "uuid",
        "name": "Booster Edição 01",
        "price_brl": 9.90,
        "price_crypto": "0.00050000",
        "cards_per_booster": 5,
        "edition_id": "ED01",
        "available": true
      }
    ]
  }
}
```

### POST `/boosters/purchase`
🔒 Compra booster (debita da carteira).

**Request:**
```json
{
  "booster_type_id": "uuid",
  "quantity": 1
}
```

**Response 200:**
```json
{
  "ok": true,
  "data": {
    "booster_opening_id": "uuid",
    "booster_type": "Booster Edição 01",
    "amount_paid": 9.90,
    "new_balance": 115.60
  }
}
```

**Response 400 (insufficient balance):**
```json
{
  "ok": false,
  "error": {
    "code": "INSUFFICIENT_BALANCE",
    "message": "Saldo insuficiente. Necessário: R$ 9.90, Disponível: R$ 5.00"
  }
}
```

### POST `/boosters/:id/open`
🔒 Abre booster comprado e revela cartas.

**Response 200:**
```json
{
  "ok": true,
  "data": {
    "booster_opening_id": "uuid",
    "cards": [
      {
        "card_instance_id": "uuid",
        "name": "Dragão Arcano",
        "rarity": "legendary",
        "skin": "holographic",
        "image_url": "https://...",
        "estimated_value_brl": 150.00
      },
      {
        "card_instance_id": "uuid",
        "name": "Guerreiro da Luz",
        "rarity": "rare",
        "skin": "standard",
        "image_url": "https://...",
        "estimated_value_brl": 12.50
      }
      // ... 3 more cards
    ],
    "total_estimated_value": 200.00
  }
}
```

**Response 404:**
```json
{
  "ok": false,
  "error": {
    "code": "BOOSTER_NOT_FOUND",
    "message": "Booster não encontrado ou já foi aberto"
  }
}
```

---

## 🎴 Inventory Routes

### GET `/inventory`
🔒 Lista cartas do usuário.

**Query Params:**
- `rarity` (opcional): `common`, `rare`, `epic`, `legendary`
- `edition` (opcional): `ED01`
- `sort` (opcional): `name`, `rarity`, `acquired_at`

**Response 200:**
```json
{
  "ok": true,
  "data": {
    "cards": [
      {
        "card_instance_id": "uuid",
        "card_base_id": "uuid",
        "name": "Dragão Arcano",
        "rarity": "legendary",
        "skin": "holographic",
        "edition": "ED01",
        "image_url": "https://...",
        "acquired_at": "2025-11-26T12:00:00Z",
        "is_listed": false,
        "estimated_value_brl": 150.00
      }
    ],
    "total": 42,
    "summary": {
      "total_cards": 42,
      "by_rarity": {
        "common": 20,
        "rare": 15,
        "epic": 5,
        "legendary": 2
      },
      "total_estimated_value": 850.00
    }
  }
}
```

---

## ♻️ Card Routes

### POST `/cards/:cardInstanceId/recycle`
🔒 Recicla carta por valor em BRL (requer CPF em produção).

**Response 200:**
```json
{
  "ok": true,
  "data": {
    "card_instance_id": "uuid",
    "card_name": "Guerreiro da Luz",
    "value_received": 8.50,
    "new_balance": 124.10
  }
}
```

**Response 400 (CPF required):**
```json
{
  "ok": false,
  "error": {
    "code": "CPF_REQUIRED_FOR_RECYCLE",
    "message": "CPF obrigatório para reciclagem em produção"
  }
}
```

**Response 404:**
```json
{
  "ok": false,
  "error": {
    "code": "CARD_NOT_FOUND",
    "message": "Carta não encontrada ou não pertence ao usuário"
  }
}
```

---

## 🏪 Marketplace Routes

### GET `/market/listings`
Lista cartas à venda (público).

**Query Params:**
- `limit` (opcional): número de itens (padrão: 20, max: 100)
- `offset` (opcional): paginação
- `rarity` (opcional): filtrar por raridade
- `min_price` (opcional): preço mínimo em BRL
- `max_price` (opcional): preço máximo em BRL
- `sort` (opcional): `price_asc`, `price_desc`, `recent`

**Response 200:**
```json
{
  "ok": true,
  "data": {
    "listings": [
      {
        "id": "uuid",
        "card_instance_id": "uuid",
        "seller_id": "uuid",
        "seller_name": "João Silva",
        "card": {
          "name": "Dragão Arcano",
          "rarity": "legendary",
          "skin": "holographic",
          "image_url": "https://..."
        },
        "price_brl": 145.00,
        "listed_at": "2025-11-26T12:00:00Z"
      }
    ],
    "total": 15,
    "limit": 20,
    "offset": 0
  }
}
```

### POST `/market/listings`
🔒 Cria anúncio de venda (requer CPF em produção).

**Request:**
```json
{
  "card_instance_id": "uuid",
  "price_brl": 145.00
}
```

**Response 200:**
```json
{
  "ok": true,
  "data": {
    "listing_id": "uuid",
    "card_name": "Dragão Arcano",
    "price_brl": 145.00,
    "fee_percentage": 10,
    "net_value_if_sold": 130.50,
    "status": "active",
    "listed_at": "2025-11-26T12:00:00Z"
  }
}
```

**Response 400 (price too low):**
```json
{
  "ok": false,
  "error": {
    "code": "PRICE_TOO_LOW",
    "message": "Preço mínimo: R$ 5.00. Carta holographic legendary requer mínimo: R$ 50.00"
  }
}
```

**Response 400 (duplicate listing):**
```json
{
  "ok": false,
  "error": {
    "code": "CARD_ALREADY_LISTED",
    "message": "Esta carta já está anunciada"
  }
}
```

### POST `/market/listings/:id/buy`
🔒 Compra carta do marketplace.

**Response 200:**
```json
{
  "ok": true,
  "data": {
    "purchase_id": "uuid",
    "card_instance_id": "uuid",
    "card_name": "Dragão Arcano",
    "price_paid": 145.00,
    "seller_received": 130.50,
    "platform_fee": 14.50,
    "new_balance": 0.00,
    "purchased_at": "2025-11-26T12:00:00Z"
  }
}
```

**Response 400 (self-purchase):**
```json
{
  "ok": false,
  "error": {
    "code": "CANNOT_BUY_OWN_LISTING",
    "message": "Você não pode comprar seu próprio anúncio"
  }
}
```

### DELETE `/market/listings/:id`
🔒 Cancela anúncio (apenas vendedor pode cancelar).

**Response 200:**
```json
{
  "ok": true,
  "data": {
    "listing_id": "uuid",
    "status": "cancelled",
    "cancelled_at": "2025-11-26T12:00:00Z"
  }
}
```

---

## 👤 User Routes

### POST `/users/cpf`
🔒 Cadastra CPF do usuário (obrigatório para saques e reciclagem).

**Request:**
```json
{
  "cpf": "12345678901"
}
```

**Response 200:**
```json
{
  "ok": true,
  "data": {
    "cpf_registered": true,
    "user_id": "uuid"
  }
}
```

**Response 400 (invalid CPF):**
```json
{
  "ok": false,
  "error": {
    "code": "INVALID_CPF",
    "message": "CPF inválido"
  }
}
```

---

## 🎯 Error Codes Reference

| Código | Descrição |
|--------|-----------|
| `INVALID_TOKEN` | Token inválido ou expirado |
| `INVALID_CREDENTIALS` | Email/senha incorretos |
| `EMAIL_ALREADY_EXISTS` | Email já cadastrado |
| `INSUFFICIENT_BALANCE` | Saldo insuficiente |
| `CPF_REQUIRED` | CPF necessário |
| `INVALID_CPF` | CPF inválido |
| `CARD_NOT_FOUND` | Carta não encontrada |
| `CARD_ALREADY_LISTED` | Carta já anunciada |
| `LISTING_NOT_FOUND` | Anúncio não encontrado |
| `CANNOT_BUY_OWN_LISTING` | Compra própria bloqueada |
| `PRICE_TOO_LOW` | Preço abaixo do mínimo |
| `BOOSTER_NOT_FOUND` | Booster não encontrado |

---

## 🔐 Rate Limits

- **Auth routes**: 10 req/min por IP
- **Wallet routes**: 30 req/min por usuário
- **Market routes**: 60 req/min por usuário
- **Public routes**: 120 req/min por IP

---

## 💡 Exemplos de Uso (Frontend)

### Login e refresh automático:
```typescript
// auth.service.ts
let accessToken = '';
let refreshToken = '';

async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await res.json();
  if (data.ok) {
    accessToken = data.data.access_token;
    refreshToken = data.data.refresh_token;
    localStorage.setItem('refresh_token', refreshToken);
  }
  return data;
}

async function refreshAccessToken() {
  const refresh = localStorage.getItem('refresh_token');
  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refresh })
  });
  
  const data = await res.json();
  if (data.ok) {
    accessToken = data.data.access_token;
    refreshToken = data.data.refresh_token;
    localStorage.setItem('refresh_token', refreshToken);
  }
}

// Auto-refresh on 401
async function apiRequest(url: string, options: RequestInit = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`
    }
  });
  
  if (res.status === 401) {
    await refreshAccessToken();
    return apiRequest(url, options); // Retry
  }
  
  return res.json();
}
```

### Comprar e abrir booster:
```typescript
// Compra
const purchase = await apiRequest(`${API_URL}/boosters/purchase`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ booster_type_id: 'uuid', quantity: 1 })
});

// Abre
const opening = await apiRequest(
  `${API_URL}/boosters/${purchase.data.booster_opening_id}/open`,
  { method: 'POST' }
);

// Exibe cartas com animação
opening.data.cards.forEach(card => {
  console.log(`${card.rarity} - ${card.name} (${card.skin})`);
});
```

---

## 📊 Webhooks (Futuro)

Eventos disponíveis para notificação:
- `booster.purchased`
- `booster.opened`
- `card.listed`
- `card.sold`
- `wallet.deposit_confirmed`
- `wallet.withdrawal_completed`
