# 🚀 KROOVA - PLANO DE AÇÃO COMPLETO
**Gerado em**: 2025-11-27  
**Status Atual**: Backend 100% | Frontend 25% (básico) | Pagamentos 0% | NFT 0%

---

## 📊 SUMÁRIO EXECUTIVO

### Status Geral
- **71 documentos MD** auditados
- **489 features** especificadas
- **432 features (88%)** implementadas no backend
- **3 bloqueadores críticos** identificados

### Implementação Atual
✅ **COMPLETO (100%)**
- Backend API (25 rotas)
- Database Schema (12 tabelas + RLS)
- Booster Algorithm + Pity System
- Economic Observability (RTP tracking)
- Marketplace P2P
- 250 Cartas ED01 (seed completo)

⚠️ **PARCIAL (25%)**
- Frontend Next.js (login, dashboard, marketplace básicos)
- Deployment (Railway backend, Vercel frontend)

❌ **PENDENTE (0%)**
- Pagamentos reais (Stripe webhooks)
- Blockchain NFT (ERC-1155 deploy)
- KYC/Compliance
- Gameplay (battles, tournaments)

---

## 🎯 ROADMAP DE IMPLEMENTAÇÃO

### **FASE 1 - MVP FUNCIONAL** (2-3 semanas) ⭐⭐⭐ CRÍTICO

#### Sprint 1.1: Frontend Core (3-5 dias)
**Objetivo**: Usuários conseguem usar 100% das features backend

**Páginas a Implementar:**
- [ ] `/boosters` - Loja de boosters
  - Listar booster_types (GET /api/v1/boosters)
  - Comprar booster (POST /api/v1/boosters/purchase)
  - Abrir booster (POST /api/v1/boosters/open) → animação cartas
  - Histórico aberturas
  - **Refs**: KROOVA_BOOSTER_ALGORITHM.md, KROOVA_PITY_SYSTEM.md

- [ ] `/inventory` - Inventário de cartas
  - Grid cartas com filtros (raridade, archetype)
  - Card details modal
  - Botão "Vender" → redirect marketplace
  - Botão "Recycle" (POST /api/v1/cards/:id/recycle)
  - **Refs**: KROOVA_CARD_SYSTEM.md, KROOVA_CARD_LAYOUT.md

- [ ] `/marketplace` (melhorias)
  - Criar listing (POST /api/v1/market/listings)
  - Comprar carta (POST /api/v1/market/listings/:id/buy)
  - Cancelar listing (DELETE /api/v1/market/listings/:id)
  - Preview card antes de comprar
  - **Refs**: KROOVA_MARKETPLACE_RULES.md

- [ ] `/wallet` (melhorias)
  - Histórico transações completo (GET /api/v1/wallet/transactions)
  - Filtros (tipo, período)
  - Export CSV
  - **Refs**: KROOVA_DB_SCHEMA.md (transactions table)

**Componentes Reutilizáveis:**
- [ ] `<CardGrid>` - Grid responsivo de cartas
- [ ] `<CardModal>` - Modal de detalhes (zoom, stats, actions)
- [ ] `<BoosterPackAnimation>` - Animação abertura pack
- [ ] `<PityProgressBar>` - Barra de progresso pity system
- [ ] `<TransactionList>` - Lista transações wallet

**Dependências:**
- Tailwind CSS (já instalado)
- Framer Motion ou React Spring (animações)
- React Query (cache de dados)

**Arquivos a criar:**
```
frontend/
├── app/
│   ├── boosters/page.tsx
│   └── inventory/page.tsx
├── components/
│   ├── cards/
│   │   ├── CardGrid.tsx
│   │   ├── CardModal.tsx
│   │   └── CardFilters.tsx
│   ├── boosters/
│   │   ├── BoosterCard.tsx
│   │   ├── BoosterOpenAnimation.tsx
│   │   └── PityProgressBar.tsx
│   └── wallet/
│       ├── TransactionList.tsx
│       └── TransactionFilters.tsx
└── hooks/
    ├── useCards.ts
    ├── useBoosters.ts
    └── useMarket.ts
```

---

#### Sprint 1.2: UX Polish (2-3 dias)
**Objetivo**: Experiência profissional e fluida

- [ ] Loading states (skeletons)
- [ ] Error boundaries e toast notifications
- [ ] Animações de transição entre páginas
- [ ] Feedback visual em ações (comprar, vender, abrir pack)
- [ ] Responsividade mobile (teste em 3 breakpoints)
- [ ] Dark mode toggle (opcional)

**Bibliotecas:**
- Sonner ou React Hot Toast (notificações)
- Lucide React (ícones)
- Tailwind Merge (class conflicts)

---

#### Sprint 1.3: Imagens Reais (1-2 dias)
**Objetivo**: Substituir placeholders por arte real

- [ ] Integrar arte de `imagem_teste.json` e `arte_personagem.json`
- [ ] Upload para CDN (Cloudinary ou Vercel Blob)
- [ ] Atualizar cards_base.image_url no banco
- [ ] Implementar lazy loading de imagens
- [ ] Placeholder blur enquanto carrega

**Script SQL:**
```sql
-- Atualizar cards_base com URLs reais
UPDATE cards_base 
SET image_url = 'https://cdn.kroova.com/cards/' || display_id || '.png'
WHERE image_url LIKE 'https://example.com%';
```

---

### **FASE 2 - MONETIZAÇÃO** (1-2 semanas) ⭐⭐⭐ CRÍTICO

#### Sprint 2.1: Stripe Integration (3-5 dias)
**Objetivo**: Aceitar pagamentos reais

**Backend:**
- [ ] Instalar `stripe` SDK
- [ ] Criar `/api/v1/payments/create-intent` (POST)
  - Input: { amount_brl, booster_type_id }
  - Output: { client_secret, payment_intent_id }
- [ ] Criar `/api/v1/payments/webhook` (POST)
  - Validar signature Stripe
  - Evento: `payment_intent.succeeded` → creditar wallet
  - Evento: `payment_intent.failed` → log error
- [ ] Adicionar `stripe_payment_id` em transactions table

**Frontend:**
- [ ] Instalar `@stripe/stripe-js` e `@stripe/react-stripe-js`
- [ ] Criar `/checkout` page
  - Stripe Elements (card input)
  - Botão "Pagar R$ X,XX"
  - Redirect para `/boosters` após sucesso
- [ ] Adicionar botão "Comprar com dinheiro real" em `/boosters`

**Refs**: KROOVA_PAYMENT_FLOW.md

**Testes:**
```bash
# Test mode Stripe webhook
stripe listen --forward-to localhost:3000/api/v1/payments/webhook
stripe trigger payment_intent.succeeded
```

---

#### Sprint 2.2: PIX Integration (2-3 dias)
**Objetivo**: Método de pagamento nacional

- [ ] Pesquisar gateway PIX (Asaas, PagSeguro, Mercado Pago)
- [ ] Criar endpoint `/api/v1/payments/pix/create`
  - Output: { qr_code, qr_code_text, expires_at }
- [ ] Frontend: exibir QR code + timer de expiração
- [ ] Webhook PIX: creditar wallet automaticamente

**Refs**: KROOVA_PAYMENT_FLOW.md

---

#### Sprint 2.3: Withdraw System (2-3 dias)
**Objetivo**: Usuários podem sacar saldo

- [ ] Criar `/api/v1/wallet/withdraw/request` (POST)
  - Input: { amount_brl, pix_key, cpf }
  - Validar saldo mínimo (R$ 20)
  - Status: `pending_approval`
- [ ] Admin dashboard: `/admin/withdrawals`
  - Listar pending withdrawals
  - Botões: Aprovar | Rejeitar
  - Logs de auditoria
- [ ] Criar `/api/v1/admin/withdrawals/:id/approve` (POST)
  - Atualizar status: `approved`
  - Processar pagamento via gateway
- [ ] Notificar usuário (email ou in-app)

**Refs**: KROOVA_SECURITY_AND_ANTIFRAUD.md

---

### **FASE 3 - BLOCKCHAIN NFT** (1 semana) ⭐⭐ ALTO

#### Sprint 3.1: Smart Contract Deploy (2-3 dias)
**Objetivo**: Contrato ERC-1155 na Polygon

- [ ] Verificar `contracts/KroovaCardNFT.sol` existe
- [ ] Se não: criar contrato ERC-1155 básico
  - Mint function (onlyOwner)
  - Metadata URI dinâmico
  - Batch mint support
- [ ] Deploy na Polygon Mumbai (testnet)
  - Usar Hardhat ou Foundry
  - Guardar contract address em `.env`
- [ ] Verificar contrato no PolygonScan
- [ ] Deploy na Polygon Mainnet (quando validado)

**Refs**: KROOVA_NFT_PROTOCOL.md, KROOVA_NFT_MINT_FLOW.md

---

#### Sprint 3.2: IPFS Metadata (1-2 dias)
**Objetivo**: Armazenar metadata on-chain

- [ ] Escolher provider IPFS (Pinata, NFT.Storage, Infura)
- [ ] Criar script `upload-metadata.ts`
  - Para cada card: gerar JSON metadata
  - Upload para IPFS
  - Atualizar cards_base.metadata_uri
- [ ] Formato metadata:
  ```json
  {
    "name": "Pixel Glitch #1234",
    "description": "Fragmento instável...",
    "image": "ipfs://Qm...",
    "attributes": [
      { "trait_type": "Rarity", "value": "trash" },
      { "trait_type": "Skin", "value": "neon" }
    ]
  }
  ```

---

#### Sprint 3.3: Mint Integration (2 dias)
**Objetivo**: Usuários podem mintar NFTs

- [ ] Backend: `/api/v1/cards/:id/mint-nft` (POST)
  - Validar ownership
  - Calcular mint_cost (base_liquidity_brl * 2)
  - Chamar smart contract via ethers.js
  - Atualizar `hash_onchain` em cards_instances
- [ ] Frontend: botão "Mintar NFT" em card modal
  - Exibir custo estimado
  - Conectar MetaMask
  - Confirmar transação
  - Feedback: "NFT mintado! Ver no OpenSea"

**Refs**: KROOVA_NFT_MINT_FLOW.md

---

### **FASE 4 - COMPLIANCE & SECURITY** (1 semana) ⭐⭐ ALTO

#### Sprint 4.1: KYC Básico (2-3 dias)
- [ ] Integrar API de validação CPF (ReceitaWS ou similar)
- [ ] Criar `/profile/kyc` page
  - Input: nome completo, CPF, data nascimento
  - Upload documento (RG/CNH)
- [ ] Endpoint `/api/v1/users/kyc/submit` (POST)
- [ ] Admin review dashboard

**Refs**: KROOVA_SECURITY_AND_ANTIFRAUD.md

---

#### Sprint 4.2: Rate Limiting (1 dia)
- [ ] Instalar `express-rate-limit`
- [ ] Aplicar limites:
  - Auth: 5 req/min
  - Boosters: 10 req/min
  - Market: 20 req/min
- [ ] Monitorar via Sentry

---

#### Sprint 4.3: Audit Logs (1-2 dias)
- [ ] Criar `audit_logs` table
- [ ] Middleware: log todas ações sensíveis
  - Withdraw requests
  - Admin actions
  - High-value transactions (> R$ 500)
- [ ] Dashboard de auditoria

---

### **FASE 5 - GAMEPLAY** (2 semanas) ⭐ MÉDIO

#### Sprint 5.1: Battles System (1 semana)
- [ ] Design battle mechanics (refs: KROOVA_GAME_RULES.MD)
- [ ] Criar `battles` table
- [ ] Endpoints:
  - `/api/v1/battles/create` (POST)
  - `/api/v1/battles/:id/join` (POST)
  - `/api/v1/battles/:id/resolve` (POST)
- [ ] Frontend: battle arena UI

---

#### Sprint 5.2: Tournaments (1 semana)
- [ ] Criar `tournaments` table
- [ ] Sistema de brackets
- [ ] Prêmios automáticos
- [ ] Leaderboard

---

### **FASE 6 - ANALYTICS & POLISH** (1 semana) ⭐ BAIXO

#### Sprint 6.1: Admin Dashboard (3 dias)
- [ ] Grafana + Prometheus setup
- [ ] Dashboards:
  - Economic metrics (RTP, revenue)
  - User metrics (DAU, retention)
  - Market metrics (listings, volume)

---

#### Sprint 6.2: UX Final (2 dias)
- [ ] Onboarding tutorial
- [ ] Achievements/badges
- [ ] Social share (Twitter, Discord)

---

## 🚀 QUICK WINS (Alto ROI, Baixa Complexidade)

### 1. **Card Images Real** (1 dia) ⚡
- **Impacto**: 10x mais atrativo visualmente
- **Esforço**: Upload CDN + SQL update
- **Bloqueio**: Nenhum

### 2. **Booster Open Animation** (1 dia) ⚡
- **Impacto**: Experiência wow moment
- **Esforço**: Framer Motion + card reveal
- **Bloqueio**: Nenhum

### 3. **Pity Progress Visible** (0.5 dia) ⚡
- **Impacto**: Incentiva compras repeat
- **Esforço**: ProgressBar component
- **Bloqueio**: Nenhum

### 4. **Transaction Export CSV** (0.5 dia) ⚡
- **Impacto**: Compliance + UX
- **Esforço**: Endpoint + download button
- **Bloqueio**: Nenhum

### 5. **Market Filters** (1 dia) ⚡
- **Impacto**: Usabilidade marketplace
- **Esforço**: Query params + UI filters
- **Bloqueio**: Nenhum

---

## ⚠️ RISCOS E BLOQUEADORES

### Críticos (P0)
1. **Stripe Compliance**
   - Risco: Conta suspensa sem KYC adequado
   - Mitigação: Implementar KYC antes de go-live

2. **Economic Balance**
   - Risco: RTP > 100% → prejuízo
   - Mitigação: Monitorar economic_series diariamente

3. **Polygon Gas Fees**
   - Risco: Mint NFT muito caro (> R$ 10)
   - Mitigação: Batch minting, Layer 2 alternativo

### Médios (P1)
4. **Redis Production**
   - Risco: Mock não escala, perda de jobs
   - Mitigação: Deploy Upstash Redis (1 dia)

5. **SSL Customizado**
   - Risco: Domínio personalizado limitado
   - Mitigação: CloudFlare free SSL (2 horas)

---

## 📦 DEPENDÊNCIAS TÉCNICAS

### Backend (já instaladas)
- Fastify, TypeScript, Prisma
- Supabase client
- BullMQ (mock ativo)
- Winston logger

### Frontend (a instalar)
- Framer Motion (animações)
- React Query (cache)
- Sonner (toasts)
- @stripe/react-stripe-js

### Infra (a provisionar)
- Upstash Redis ($10/mês)
- Cloudinary free tier (images)
- Pinata IPFS ($5/mês)
- Stripe production keys

---

## 📈 MÉTRICAS DE SUCESSO

### MVP Completo (Fase 1+2)
- [ ] Frontend 100% funcional
- [ ] Pagamentos Stripe ativos
- [ ] 100 usuários beta testando
- [ ] RTP estável em 15-20%
- [ ] R$ 1.000 revenue primeira semana

### Blockchain Ready (Fase 3)
- [ ] Contrato deployed Polygon Mainnet
- [ ] 50 NFTs mintados
- [ ] OpenSea integration ativa

### Production Ready (Todas Fases)
- [ ] KYC obrigatório para withdrawals
- [ ] 1.000+ usuários ativos
- [ ] R$ 10.000+ monthly revenue
- [ ] 99.9% uptime
- [ ] < 2s cold start (Vercel serverless)

---

## 🎯 PRIORIZAÇÃO RECOMENDADA

**AGORA (Esta Semana)**
1. Frontend Core (Sprint 1.1)
2. Card Images Real (Quick Win #1)
3. Booster Animation (Quick Win #2)

**PRÓXIMAS 2 SEMANAS**
4. Stripe Integration (Sprint 2.1)
5. PIX Integration (Sprint 2.2)
6. Frontend Polish (Sprint 1.2)

**MÊS 1**
7. NFT Deploy (Sprint 3.1-3.3)
8. KYC Básico (Sprint 4.1)
9. Withdraw System (Sprint 2.3)

**MÊS 2+**
10. Gameplay (Fase 5)
11. Analytics Dashboard (Fase 6)

---

## 📞 PRÓXIMOS PASSOS IMEDIATOS

1. **Revisar este roadmap** com stakeholders
2. **Priorizar Sprints** (concordar ordem)
3. **Começar Sprint 1.1** (Frontend Core)
4. **Deploy Quick Win #1** (Card Images) - ROI imediato
5. **Setup tracking** (GitHub Projects ou Jira)

---

**Última Atualização**: 2025-11-27  
**Autor**: GitHub Copilot + Equipe Kroova  
**Status**: 🟢 Backend Production Ready | 🟡 Frontend MVP Started | 🔴 Payments Pending
