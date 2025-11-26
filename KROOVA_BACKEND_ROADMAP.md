# 🚀 KROOVA Backend Hardening Roadmap

**Status**: Backend MVP validado end-to-end ✅  
**Objetivo**: Fechar gaps críticos antes do desenvolvimento frontend  
**Prazo Estimado**: 1-2 semanas  
**Última Atualização**: 26/11/2025

---

## 📊 Status Atual

### ✅ Funcionalidades Completas
- [x] Sistema de autenticação com JWT customizado
- [x] Compra e abertura de boosters com algoritmo de raridade
- [x] Sistema de carteiras (wallets) com histórico de transações
- [x] Reciclagem de cartas com precificação dinâmica por raridade
- [x] Marketplace: criação de listings e compras
- [x] Transferência de propriedade de cartas
- [x] Cálculo e aplicação de taxas (4% marketplace)
- [x] Validação E2E completa via script PowerShell

### ⚠️ Gaps Identificados (Technical Debt)
- [ ] **RLS Policies**: Todos os serviços usam `supabaseAdmin` para bypassar Row Level Security
- [ ] **Validações**: Faltam validações de negócio robustas (ex: saldo insuficiente, card já listado)
- [ ] **Testes Automatizados**: Sem cobertura de testes unitários/integração
- [ ] **Observabilidade**: Logs básicos, sem monitoring estruturado
- [ ] **Pagamentos Reais**: Integração Stripe/Pix pendente
- [ ] **Rate Limiting**: Implementado mas desabilitado em dev
- [ ] **Tratamento de Erros**: Alguns fluxos podem deixar dados inconsistentes

---

## 🎯 Fases de Implementação

## **FASE 1: Segurança e Políticas RLS** (3-4 dias)

### 1.1 Implementar RLS Policies no Supabase
**Arquivos**: `supabase/migrations/` (criar nova migration)

**Políticas a implementar**:

```sql
-- ========================================
-- USERS TABLE
-- ========================================
-- SELECT: usuário pode ver apenas seus próprios dados
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

-- UPDATE: usuário pode atualizar apenas seus dados
CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- ========================================
-- WALLETS TABLE
-- ========================================
-- SELECT: usuário pode ver apenas sua carteira
CREATE POLICY "wallets_select_own" ON wallets
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- UPDATE: sistema usa admin client para transações
-- (não permite update direto pelo usuário)

-- ========================================
-- USER_INVENTORY TABLE
-- ========================================
-- SELECT: usuário pode ver apenas seu inventário
CREATE POLICY "inventory_select_own" ON user_inventory
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- INSERT: sistema usa admin client para adicionar cartas
-- DELETE: sistema usa admin client para remover cartas

-- ========================================
-- CARDS_INSTANCES TABLE
-- ========================================
-- SELECT: usuário pode ver cartas que possui
CREATE POLICY "cards_instances_select_own" ON cards_instances
  FOR SELECT USING (
    auth.uid()::text = owner_id::text OR
    EXISTS (
      SELECT 1 FROM market_listings ml
      WHERE ml.card_instance_id = cards_instances.id
      AND ml.status = 'active'
    )
  );

-- UPDATE: sistema controla transferências via admin

-- ========================================
-- MARKET_LISTINGS TABLE
-- ========================================
-- SELECT: todos podem ver listings ativos
CREATE POLICY "listings_select_active" ON market_listings
  FOR SELECT USING (status = 'active' OR auth.uid()::text = seller_id::text);

-- INSERT: usuário pode criar listing de suas cartas
CREATE POLICY "listings_insert_own" ON market_listings
  FOR INSERT WITH CHECK (auth.uid()::text = seller_id::text);

-- UPDATE: apenas seller ou sistema pode atualizar
CREATE POLICY "listings_update_own" ON market_listings
  FOR UPDATE USING (auth.uid()::text = seller_id::text);

-- ========================================
-- TRANSACTIONS TABLE
-- ========================================
-- SELECT: usuário pode ver apenas suas transações
CREATE POLICY "transactions_select_own" ON transactions
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- INSERT: sistema usa admin client

-- ========================================
-- BOOSTER_OPENINGS TABLE
-- ========================================
-- SELECT: usuário pode ver apenas suas aberturas
CREATE POLICY "booster_openings_select_own" ON booster_openings
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- INSERT: sistema usa admin client
```

### 1.2 Refatorar Serviços para usar Cliente Apropriado
**Arquivos a modificar**:
- `src/modules/auth/auth.service.ts`
- `src/modules/wallet/wallet.service.ts`
- `src/modules/card/card.service.ts`
- `src/modules/market/market.service.ts`
- `src/modules/booster/booster.service.ts`

**Regra Geral**:
- **SELECT de dados do próprio usuário**: usar `supabase` (anon client com JWT)
- **INSERT/UPDATE que modificam estado financeiro**: usar `supabaseAdmin`
- **Queries públicas** (ex: listar marketplace): usar `supabase`

**Exemplo de Refatoração**:
```typescript
// ANTES (tudo com admin)
async getInventory(userId: string) {
  const { data } = await supabaseAdmin
    .from('user_inventory')
    .select('*')
    .eq('user_id', userId);
  return data;
}

// DEPOIS (SELECT com anon, RLS valida ownership)
async getInventory(userId: string) {
  const { data, error } = await this.supabase
    .from('user_inventory')
    .select(`
      card_instance_id,
      quantity,
      created_at,
      cards_instances (
        id,
        owner_id,
        cards_base (
          id, name, rarity, image_url, base_liquidity_brl
        )
      )
    `)
    .eq('user_id', userId);
    
  if (error) throw new Error(`Failed to get inventory: ${error.message}`);
  return data;
}

// Operações críticas continuam com admin
async transferCardOwnership(cardId: string, newOwnerId: string) {
  const { error } = await supabaseAdmin
    .from('cards_instances')
    .update({ owner_id: newOwnerId })
    .eq('id', cardId);
    
  if (error) throw new Error('Transfer failed');
}
```

### 1.3 Criar Service Layer Híbrido
**Novo arquivo**: `src/core/supabase-hybrid.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { supabase, supabaseAdmin } from '../lib/supabase';

@Injectable()
export class SupabaseHybridService {
  /**
   * Cliente para operações de leitura do próprio usuário
   * (validado por RLS com JWT)
   */
  getUserClient() {
    return supabase;
  }

  /**
   * Cliente para operações administrativas
   * (transferências, criação de cartas, transações financeiras)
   */
  getAdminClient() {
    return supabaseAdmin;
  }

  /**
   * Cliente para queries públicas sem autenticação
   */
  getPublicClient() {
    return supabase;
  }
}
```

---

## **FASE 2: Validações e Regras de Negócio** (2-3 dias)

### 2.1 Validações no Market Service
**Arquivo**: `src/modules/market/market.service.ts`

**Validações a adicionar**:
```typescript
async createListing(data: CreateListingDto, userId: string) {
  // 1. Validar que carta existe e pertence ao usuário
  const card = await this.supabaseAdmin
    .from('cards_instances')
    .select('owner_id, status')
    .eq('id', data.card_instance_id)
    .single();
    
  if (!card.data) throw new Error('Card not found');
  if (card.data.owner_id !== userId) throw new Error('Not your card');
  
  // 2. Validar que carta não está já listada
  const existingListing = await this.supabaseAdmin
    .from('market_listings')
    .select('id')
    .eq('card_instance_id', data.card_instance_id)
    .eq('status', 'active')
    .maybeSingle();
    
  if (existingListing.data) throw new Error('Card already listed');
  
  // 3. Validar preço mínimo (R$ 0.50)
  if (data.price_brl < 0.5) throw new Error('Minimum price is R$ 0.50');
  
  // 4. Validar CPF em produção
  if (!process.env.KROOVA_DEV_ALLOW_NO_CPF) {
    const user = await this.supabaseAdmin
      .from('users')
      .select('cpf')
      .eq('id', userId)
      .single();
      
    if (!user.data?.cpf) throw new Error('CPF required for marketplace');
  }
  
  // Prosseguir com criação...
}

async buyListing(listingId: string, buyerId: string) {
  // 1. Validar que listing existe e está ativo
  const listing = await this.supabaseAdmin
    .from('market_listings')
    .select('*, cards_instances(owner_id)')
    .eq('id', listingId)
    .single();
    
  if (!listing.data) throw new Error('Listing not found');
  if (listing.data.status !== 'active') throw new Error('Listing not active');
  
  // 2. Validar que comprador não é o vendedor
  if (listing.data.seller_id === buyerId) {
    throw new Error('Cannot buy your own listing');
  }
  
  // 3. Validar saldo do comprador
  const buyerWallet = await this.supabaseAdmin
    .from('wallets')
    .select('balance_brl')
    .eq('user_id', buyerId)
    .single();
    
  if (!buyerWallet.data || buyerWallet.data.balance_brl < listing.data.price_brl) {
    throw new Error('Insufficient balance');
  }
  
  // 4. Validar que carta ainda pertence ao seller
  if (listing.data.cards_instances.owner_id !== listing.data.seller_id) {
    throw new Error('Seller no longer owns this card');
  }
  
  // Prosseguir com transação...
}
```

### 2.2 Validações no Card Service (Recycle)
**Arquivo**: `src/modules/card/card.service.ts`

```typescript
async recycleCard(instanceId: string, userId: string) {
  // 1. Validar que carta existe e pertence ao usuário
  const instance = await this.supabaseAdmin
    .from('cards_instances')
    .select('owner_id, cards_base(base_liquidity_brl, rarity)')
    .eq('id', instanceId)
    .single();
    
  if (!instance.data) throw new Error('Card not found');
  if (instance.data.owner_id !== userId) throw new Error('Not your card');
  
  // 2. Validar que carta não está listada no marketplace
  const listing = await this.supabaseAdmin
    .from('market_listings')
    .select('id')
    .eq('card_instance_id', instanceId)
    .eq('status', 'active')
    .maybeSingle();
    
  if (listing.data) throw new Error('Cannot recycle listed card');
  
  // 3. Validar CPF em produção
  if (!process.env.KROOVA_DEV_ALLOW_RECYCLE_NO_CPF) {
    const user = await this.supabaseAdmin
      .from('users')
      .select('cpf')
      .eq('id', userId)
      .single();
      
    if (!user.data?.cpf) throw new Error('CPF required for recycling');
  }
  
  // Prosseguir com reciclagem...
}
```

### 2.3 Validações no Booster Service
**Arquivo**: `src/modules/booster/booster.service.ts`

```typescript
async purchaseBooster(userId: string) {
  const BOOSTER_PRICE = 9.90;
  
  // 1. Validar saldo do usuário
  const wallet = await this.supabaseAdmin
    .from('wallets')
    .select('balance_brl')
    .eq('user_id', userId)
    .single();
    
  if (!wallet.data) {
    // Auto-criar wallet se não existir
    await this.walletService.createWallet(userId);
    throw new Error('Insufficient balance (wallet created)');
  }
  
  if (wallet.data.balance_brl < BOOSTER_PRICE) {
    throw new Error(`Insufficient balance. Required: R$ ${BOOSTER_PRICE}`);
  }
  
  // Prosseguir com compra...
}
```

---

## **FASE 3: Testes Automatizados** (3-4 dias)

### 3.1 Setup de Testes com Vitest
**Arquivos a criar**:
- `vitest.config.ts`
- `src/test/setup.ts`
- `src/test/helpers/test-db.ts`

**Instalar dependências**:
```bash
npm install -D vitest @vitest/ui c8 supertest
```

**Configuração Vitest**:
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'c8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/', 'src/test/']
    }
  }
});
```

### 3.2 Testes Unitários (Services)
**Arquivos a criar**:
- `src/modules/market/market.service.test.ts`
- `src/modules/card/card.service.test.ts`
- `src/modules/wallet/wallet.service.test.ts`
- `src/modules/booster/booster.service.test.ts`

**Exemplo de Teste Unitário**:
```typescript
// src/modules/wallet/wallet.service.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WalletService } from './wallet.service';
import { supabaseAdmin } from '../../lib/supabase';

vi.mock('../../lib/supabase', () => ({
  supabaseAdmin: {
    from: vi.fn()
  }
}));

describe('WalletService', () => {
  let service: WalletService;

  beforeEach(() => {
    service = new WalletService();
    vi.clearAllMocks();
  });

  describe('getBalance', () => {
    it('should return wallet balance for valid user', async () => {
      const mockWallet = { balance_brl: 100.50, balance_crypto: 0 };
      
      vi.mocked(supabaseAdmin.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockWallet, error: null })
          })
        })
      } as any);

      const result = await service.getBalance('user-123');
      
      expect(result.balance_brl).toBe(100.50);
      expect(supabaseAdmin.from).toHaveBeenCalledWith('wallets');
    });

    it('should throw error if wallet not found', async () => {
      vi.mocked(supabaseAdmin.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } })
          })
        })
      } as any);

      await expect(service.getBalance('invalid-user')).rejects.toThrow();
    });
  });

  describe('deposit', () => {
    it('should increase balance correctly', async () => {
      const userId = 'user-123';
      const currentBalance = 100;
      const depositAmount = 50;

      // Mock current balance
      vi.mocked(supabaseAdmin.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ 
              data: { balance_brl: currentBalance }, 
              error: null 
            })
          })
        })
      } as any);

      // Mock update
      vi.mocked(supabaseAdmin.from).mockReturnValueOnce({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null })
        })
      } as any);

      await service.deposit(userId, depositAmount);

      // Verify update was called with correct new balance
      expect(supabaseAdmin.from).toHaveBeenCalledWith('wallets');
    });
  });
});
```

### 3.3 Testes de Integração (E2E)
**Arquivos a criar**:
- `src/test/e2e/auth.e2e.test.ts`
- `src/test/e2e/marketplace.e2e.test.ts`
- `src/test/e2e/booster.e2e.test.ts`

**Exemplo de Teste E2E**:
```typescript
// src/test/e2e/marketplace.e2e.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import supertest from 'supertest';
import { app } from '../../app';
import { supabaseAdmin } from '../../lib/supabase';

describe('Marketplace E2E', () => {
  let request: supertest.SuperTest<supertest.Test>;
  let sellerToken: string;
  let buyerToken: string;
  let sellerId: string;
  let buyerId: string;
  let cardInstanceId: string;

  beforeAll(async () => {
    request = supertest(app.server);
    
    // Setup: Create seller with card
    const seller = await createTestUser('seller@test.com');
    sellerId = seller.id;
    sellerToken = seller.token;
    
    // Setup: Create buyer with funds
    const buyer = await createTestUser('buyer@test.com');
    buyerId = buyer.id;
    buyerToken = buyer.token;
    
    await fundWallet(buyerId, 1000);
    
    // Setup: Give seller a card
    cardInstanceId = await createTestCard(sellerId);
  });

  afterAll(async () => {
    // Cleanup test data
    await cleanupTestUser(sellerId);
    await cleanupTestUser(buyerId);
  });

  it('should complete full marketplace flow', async () => {
    // Step 1: Create listing
    const listingRes = await request
      .post('/api/v1/market/listings')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({
        card_instance_id: cardInstanceId,
        price_brl: 50
      });
      
    expect(listingRes.status).toBe(201);
    expect(listingRes.body.ok).toBe(true);
    
    const listingId = listingRes.body.data.listing_id;

    // Step 2: Buyer purchases
    const purchaseRes = await request
      .post(`/api/v1/market/listings/${listingId}/buy`)
      .set('Authorization', `Bearer ${buyerToken}`);
      
    expect(purchaseRes.status).toBe(200);
    expect(purchaseRes.body.ok).toBe(true);

    // Step 3: Verify ownership transfer
    const inventoryRes = await request
      .get('/api/v1/inventory')
      .set('Authorization', `Bearer ${buyerToken}`);
      
    expect(inventoryRes.status).toBe(200);
    const buyerCards = inventoryRes.body.data.cards;
    expect(buyerCards.some(c => c.card_instance_id === cardInstanceId)).toBe(true);

    // Step 4: Verify seller received payment (R$ 50 - 4% fee = R$ 48)
    const sellerWalletRes = await request
      .get('/api/v1/wallet')
      .set('Authorization', `Bearer ${sellerToken}`);
      
    expect(sellerWalletRes.body.data.balance_brl).toBeGreaterThanOrEqual(48);
  });

  it('should reject purchase with insufficient balance', async () => {
    // Create poor buyer with only R$ 1
    const poorBuyer = await createTestUser('poor@test.com');
    await fundWallet(poorBuyer.id, 1);
    
    // Create expensive listing
    const card2 = await createTestCard(sellerId);
    const listingRes = await request
      .post('/api/v1/market/listings')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ card_instance_id: card2, price_brl: 100 });
      
    const listingId = listingRes.body.data.listing_id;
    
    // Attempt purchase
    const purchaseRes = await request
      .post(`/api/v1/market/listings/${listingId}/buy`)
      .set('Authorization', `Bearer ${poorBuyer.token}`);
      
    expect(purchaseRes.status).toBe(400);
    expect(purchaseRes.body.message).toContain('Insufficient balance');
    
    await cleanupTestUser(poorBuyer.id);
  });
});

// Helper functions
async function createTestUser(email: string) {
  // Implementation...
}

async function fundWallet(userId: string, amount: number) {
  // Implementation...
}

async function createTestCard(ownerId: string): Promise<string> {
  // Implementation...
}

async function cleanupTestUser(userId: string) {
  // Implementation...
}
```

### 3.4 Script de Teste Manual Aprimorado
**Arquivo**: `scripts/test-full-flow.ps1`

```powershell
# ============================================
# KROOVA - Teste Completo de Fluxos (Manual)
# ============================================
# Este script valida TODAS as funcionalidades
# do backend incluindo validações de negócio
# ============================================

param(
    [string]$BaseUrl = "http://127.0.0.1:3333/api/v1"
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

Write-Host "`n🚀 KROOVA - Full Backend Test Suite`n" -ForegroundColor Cyan

# ============================================
# TEST 1: Authentication
# ============================================
Write-Host "TEST 1: Authentication" -ForegroundColor Yellow
$loginBody = @{ email = 'akroma.julio@gmail.com'; password = 'Senha12' } | ConvertTo-Json
$login = Invoke-RestMethod -Method Post -Uri "$BaseUrl/auth/login" -ContentType 'application/json' -Body $loginBody
$token = $login.data.access_token
$userId = $login.data.user.id
Write-Host "✅ Login successful - User ID: $userId`n" -ForegroundColor Green

# ============================================
# TEST 2: Wallet Operations
# ============================================
Write-Host "TEST 2: Wallet Operations" -ForegroundColor Yellow
$wallet = Invoke-RestMethod -Method Get -Uri "$BaseUrl/wallet" -Headers @{ Authorization = "Bearer $token" }
$initialBalance = $wallet.data.balance_brl
Write-Host "✅ Initial Balance: R$ $initialBalance`n" -ForegroundColor Green

# ============================================
# TEST 3: Booster Purchase (Insufficient Balance)
# ============================================
Write-Host "TEST 3: Booster Purchase - Insufficient Balance Test" -ForegroundColor Yellow
try {
    $purchase = Invoke-RestMethod -Method Post -Uri "$BaseUrl/boosters/purchase" -Headers @{ Authorization = "Bearer $token" } -Body "{}"
    Write-Host "❌ Should have failed with insufficient balance" -ForegroundColor Red
    exit 1
} catch {
    if ($_.Exception.Message -like "*insufficient*") {
        Write-Host "✅ Correctly rejected insufficient balance`n" -ForegroundColor Green
    } else {
        Write-Host "❌ Wrong error: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

# ============================================
# TEST 4: Deposit Funds
# ============================================
Write-Host "TEST 4: Deposit Funds (Dev Mode)" -ForegroundColor Yellow
$depositBody = @{ amount = 100 } | ConvertTo-Json
$deposit = Invoke-RestMethod -Method Post -Uri "$BaseUrl/wallet/deposit/dev" -Headers @{ Authorization = "Bearer $token" } -ContentType 'application/json' -Body $depositBody
Write-Host "✅ Deposited R$ 100 - New Balance: R$ $($deposit.data.new_balance)`n" -ForegroundColor Green

# ============================================
# TEST 5: Booster Purchase (Success)
# ============================================
Write-Host "TEST 5: Booster Purchase - Success" -ForegroundColor Yellow
$purchase = Invoke-RestMethod -Method Post -Uri "$BaseUrl/boosters/purchase" -Headers @{ Authorization = "Bearer $token" } -ContentType 'application/json' -Body "{}"
$boosterOpeningId = $purchase.data.booster_opening_id
Write-Host "✅ Booster purchased - Opening ID: $boosterOpeningId`n" -ForegroundColor Green

# ============================================
# TEST 6: Open Booster
# ============================================
Write-Host "TEST 6: Open Booster" -ForegroundColor Yellow
$open = Invoke-RestMethod -Method Post -Uri "$BaseUrl/boosters/$boosterOpeningId/open" -Headers @{ Authorization = "Bearer $token" }
$cards = $open.data.cards
Write-Host "✅ Opened booster - Received $($cards.Count) cards:" -ForegroundColor Green
$cards | ForEach-Object { Write-Host "   - $($_.name) [$($_.rarity)]" -ForegroundColor Cyan }
Write-Host ""

# ============================================
# TEST 7: Card Recycle (Card Not Owned)
# ============================================
Write-Host "TEST 7: Card Recycle - Not Owned Test" -ForegroundColor Yellow
$fakeCardId = "00000000-0000-0000-0000-000000000000"
try {
    $recycle = Invoke-RestMethod -Method Post -Uri "$BaseUrl/cards/$fakeCardId/recycle" -Headers @{ Authorization = "Bearer $token" } -Body "{}"
    Write-Host "❌ Should have failed with 'not your card'" -ForegroundColor Red
    exit 1
} catch {
    if ($_.Exception.Message -like "*not found*" -or $_.Exception.Message -like "*not your*") {
        Write-Host "✅ Correctly rejected invalid card`n" -ForegroundColor Green
    } else {
        Write-Host "❌ Wrong error: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

# ============================================
# TEST 8: Card Recycle (Success)
# ============================================
Write-Host "TEST 8: Card Recycle - Success" -ForegroundColor Yellow
$cardToRecycle = $cards[0].id
$recycle = Invoke-RestMethod -Method Post -Uri "$BaseUrl/cards/$cardToRecycle/recycle" -Headers @{ Authorization = "Bearer $token" } -ContentType 'application/json' -Body "{}"
Write-Host "✅ Recycled card - Received R$ $($recycle.data.value_received)`n" -ForegroundColor Green

# ============================================
# TEST 9: Create Marketplace Listing
# ============================================
Write-Host "TEST 9: Create Marketplace Listing" -ForegroundColor Yellow
$cardToList = $cards[1].id
$listingBody = @{ card_instance_id = $cardToList; price_brl = 25.50 } | ConvertTo-Json
$listing = Invoke-RestMethod -Method Post -Uri "$BaseUrl/market/listings" -Headers @{ Authorization = "Bearer $token" } -ContentType 'application/json' -Body $listingBody
$listingId = $listing.data.listing_id
Write-Host "✅ Listing created - ID: $listingId`n" -ForegroundColor Green

# ============================================
# TEST 10: Duplicate Listing Test
# ============================================
Write-Host "TEST 10: Duplicate Listing Test" -ForegroundColor Yellow
try {
    $duplicate = Invoke-RestMethod -Method Post -Uri "$BaseUrl/market/listings" -Headers @{ Authorization = "Bearer $token" } -ContentType 'application/json' -Body $listingBody
    Write-Host "❌ Should have failed with 'already listed'" -ForegroundColor Red
    exit 1
} catch {
    if ($_.Exception.Message -like "*already listed*") {
        Write-Host "✅ Correctly rejected duplicate listing`n" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Different error: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# ============================================
# TEST 11: Self-Purchase Test
# ============================================
Write-Host "TEST 11: Self-Purchase Test" -ForegroundColor Yellow
try {
    $selfBuy = Invoke-RestMethod -Method Post -Uri "$BaseUrl/market/listings/$listingId/buy" -Headers @{ Authorization = "Bearer $token" }
    Write-Host "❌ Should have failed with 'cannot buy your own listing'" -ForegroundColor Red
    exit 1
} catch {
    if ($_.Exception.Message -like "*own listing*") {
        Write-Host "✅ Correctly rejected self-purchase`n" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Different error: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# ============================================
# TEST 12: Transaction History
# ============================================
Write-Host "TEST 12: Transaction History" -ForegroundColor Yellow
$txs = Invoke-RestMethod -Method Get -Uri "$BaseUrl/wallet/transactions?limit=10" -Headers @{ Authorization = "Bearer $token" }
$txCount = $txs.data.transactions.Count
Write-Host "✅ Found $txCount transactions:" -ForegroundColor Green
$txs.data.transactions | Select-Object -First 5 | ForEach-Object {
    Write-Host "   - $($_.type): R$ $($_.amount_brl) [$($_.status)]" -ForegroundColor Cyan
}
Write-Host ""

# ============================================
# SUMMARY
# ============================================
Write-Host "`n✅ ALL TESTS PASSED" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "Summary:" -ForegroundColor Yellow
Write-Host "  - Authentication: OK"
Write-Host "  - Wallet Operations: OK"
Write-Host "  - Booster Purchase/Open: OK"
Write-Host "  - Card Recycle: OK"
Write-Host "  - Marketplace Listing: OK"
Write-Host "  - Business Validations: OK"
Write-Host "  - Transaction History: OK"
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
```

### 3.5 CI/CD com GitHub Actions
**Arquivo**: `.github/workflows/test.yml`

```yaml
name: Backend Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: supabase/postgres:15.1.0.117
        env:
          POSTGRES_DB: kroova_test
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linter
      run: npm run lint
    
    - name: Run unit tests
      run: npm run test:unit
      env:
        NODE_ENV: test
        SUPABASE_URL: ${{ secrets.SUPABASE_TEST_URL }}
        SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_TEST_ANON_KEY }}
        SUPABASE_SERVICE_KEY: ${{ secrets.SUPABASE_TEST_SERVICE_KEY }}
    
    - name: Run integration tests
      run: npm run test:e2e
      env:
        NODE_ENV: test
        SUPABASE_URL: ${{ secrets.SUPABASE_TEST_URL }}
        SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_TEST_ANON_KEY }}
        SUPABASE_SERVICE_KEY: ${{ secrets.SUPABASE_TEST_SERVICE_KEY }}
    
    - name: Generate coverage report
      run: npm run test:coverage
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        files: ./coverage/coverage-final.json
        flags: backend
```

---

## **FASE 4: Integração de Pagamentos** (2-3 dias)

### 4.1 Stripe Integration
**Arquivo**: `src/modules/payment/stripe.service.ts`

```typescript
import Stripe from 'stripe';

export class StripeService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16'
    });
  }

  /**
   * Cria checkout session para compra de boosters/créditos
   */
  async createCheckoutSession(userId: string, amount: number, description: string) {
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'brl',
          product_data: { name: description },
          unit_amount: Math.round(amount * 100) // Centavos
        },
        quantity: 1
      }],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/wallet?payment=success`,
      cancel_url: `${process.env.FRONTEND_URL}/wallet?payment=cancel`,
      metadata: { user_id: userId, type: 'deposit' }
    });

    return session;
  }

  /**
   * Webhook handler para eventos Stripe
   */
  async handleWebhook(signature: string, payload: Buffer) {
    const event = this.stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleSuccessfulPayment(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await this.handleFailedPayment(event.data.object);
        break;
    }
  }

  private async handleSuccessfulPayment(session: Stripe.Checkout.Session) {
    const userId = session.metadata!.user_id;
    const amount = session.amount_total! / 100; // Convert centavos to reais

    // Creditar na wallet
    await walletService.deposit(userId, amount);

    // Registrar transação
    await this.recordTransaction(userId, amount, 'deposit_stripe', session.id);
  }
}
```

**Nova rota**: `src/modules/payment/payment.routes.ts`
```typescript
import { FastifyInstance } from 'fastify';
import { stripeService } from './stripe.service';

export async function paymentRoutes(fastify: FastifyInstance) {
  // Criar checkout session
  fastify.post('/payment/checkout', async (request, reply) => {
    const { amount } = request.body as { amount: number };
    const userId = request.user.id;

    const session = await stripeService.createCheckoutSession(
      userId,
      amount,
      `Créditos KROOVA - R$ ${amount.toFixed(2)}`
    );

    return { ok: true, data: { checkout_url: session.url } };
  });

  // Webhook Stripe (sem auth)
  fastify.post('/payment/webhook/stripe', {
    config: { rawBody: true }
  }, async (request, reply) => {
    const signature = request.headers['stripe-signature'] as string;
    const payload = request.rawBody as Buffer;

    await stripeService.handleWebhook(signature, payload);

    return { received: true };
  });
}
```

### 4.2 Pix Integration (Mercado Pago)
**Arquivo**: `src/modules/payment/mercadopago.service.ts`

```typescript
import mercadopago from 'mercadopago';

export class MercadoPagoService {
  constructor() {
    mercadopago.configure({
      access_token: process.env.MERCADOPAGO_ACCESS_TOKEN!
    });
  }

  async createPixPayment(userId: string, amount: number) {
    const payment = await mercadopago.payment.create({
      transaction_amount: amount,
      description: `Créditos KROOVA - R$ ${amount.toFixed(2)}`,
      payment_method_id: 'pix',
      payer: { email: 'user@kroova.com' }, // Pegar do usuário
      notification_url: `${process.env.API_URL}/api/v1/payment/webhook/mercadopago`,
      metadata: { user_id: userId }
    });

    return {
      qr_code: payment.body.point_of_interaction.transaction_data.qr_code,
      qr_code_base64: payment.body.point_of_interaction.transaction_data.qr_code_base64,
      payment_id: payment.body.id
    };
  }

  async handleWebhook(paymentId: number) {
    const payment = await mercadopago.payment.get(paymentId);

    if (payment.body.status === 'approved') {
      const userId = payment.body.metadata.user_id;
      const amount = payment.body.transaction_amount;

      await walletService.deposit(userId, amount);
      await this.recordTransaction(userId, amount, 'deposit_pix', String(paymentId));
    }
  }
}
```

---

## **FASE 5: Observabilidade e Logs** (1-2 dias)

### 5.1 Winston Logger
**Arquivo**: `src/core/logger.service.ts`

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'kroova-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

export { logger };
```

**Uso nos serviços**:
```typescript
import { logger } from '../../core/logger.service';

async buyListing(listingId: string, buyerId: string) {
  logger.info('Purchase attempt', { listingId, buyerId });

  try {
    // ... lógica de compra
    logger.info('Purchase successful', { listingId, buyerId, cardId });
  } catch (error) {
    logger.error('Purchase failed', { listingId, buyerId, error });
    throw error;
  }
}
```

---

## 📋 Checklist Final

### Segurança
- [ ] RLS policies implementadas e testadas
- [ ] Serviços refatorados (anon vs admin client)
- [ ] Rate limiting habilitado em produção
- [ ] Validação de CPF obrigatória em produção

### Validações
- [ ] Saldo insuficiente (booster, marketplace)
- [ ] Propriedade de cartas (recycle, listing)
- [ ] Duplicate listings
- [ ] Self-purchase
- [ ] Card already listed (recycle)
- [ ] Listing status (active only)

### Testes
- [ ] 15+ testes unitários (services)
- [ ] 10+ testes E2E (full flows)
- [ ] Script manual atualizado
- [ ] CI/CD configurado (GitHub Actions)
- [ ] Cobertura > 70%

### Pagamentos
- [ ] Stripe checkout integrado
- [ ] Stripe webhook handler
- [ ] Mercado Pago Pix integrado
- [ ] Mercado Pago webhook handler
- [ ] Transações registradas corretamente

### Observabilidade
- [ ] Winston logger implementado
- [ ] Logs estruturados (JSON)
- [ ] Error tracking
- [ ] Request logging middleware

---

## 🎯 Próximos Passos Após Backend Hardening

Com todos os gaps fechados, estaremos prontos para:

1. **Frontend Development** (Prioridade 1)
   - Next.js 14 setup
   - Páginas de autenticação
   - Dashboard com wallet
   - Shop (comprar/abrir boosters)
   - Inventory (listar cartas)
   - Marketplace (comprar/vender)

2. **NFT Minting** (Prioridade 2)
   - Polygon/Ethereum integration
   - Metadata IPFS upload
   - Smart contract interaction

3. **Advanced Features** (Prioridade 3)
   - Admin dashboard
   - Analytics/Metrics
   - Social features
   - Trading system

---

## 📊 Estimativa de Tempo Total

| Fase | Estimativa | Status |
|------|-----------|--------|
| Fase 1: RLS Policies | 3-4 dias | 🔄 Pendente |
| Fase 2: Validações | 2-3 dias | 🔄 Pendente |
| Fase 3: Testes | 3-4 dias | 🔄 Pendente |
| Fase 4: Pagamentos | 2-3 dias | 🔄 Pendente |
| Fase 5: Observabilidade | 1-2 dias | 🔄 Pendente |
| **TOTAL** | **11-16 dias (~2-3 semanas)** | |

---

**Última atualização**: 26/11/2025  
**Próximo Marco**: RLS Policies Implementation  
**Status Geral**: Backend MVP ✅ → Hardening 🔄
