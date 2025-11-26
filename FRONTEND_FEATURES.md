# 🃏 Krouva - Sistema de Autenticação e Features

## ✅ Páginas Implementadas

### 1. **Login/Registro** (`/login`)
- Tela unificada de autenticação
- Supabase Auth integrado
- Toggle entre login e registro
- Validação de email
- Mensagens de erro/sucesso

### 2. **Dashboard** (`/dashboard`)
- Página inicial após login
- Cards de acesso rápido:
  - 💰 Wallet
  - 🃏 Inventário
  - 🛒 Marketplace
  - 📦 Boosters
- Logout integrado
- Navegação completa

### 3. **Marketplace** (`/marketplace`)
- Lista de cartas à venda
- Integração com API `/market/listings`
- Cards visuais com preços
- Botão de compra
- Estado vazio (sem cartas)

### 4. **Boosters** (`/boosters`)
- Lista de boosters disponíveis
- Integração com API `/boosters/types`
- Botão de compra com confirmação
- Exibição de preço e quantidade de cartas

### 5. **Wallet** (`/wallet`)
- Saldo em USDC
- Histórico de transações
- Botões de Depositar/Sacar
- Status de transações (crédito/débito)

### 6. **Inventário** (`/inventory`)
- Lista de cartas do usuário
- Integração com API `/inventory`
- Botão para vender no marketplace
- Estado vazio com CTA para boosters

## 🔐 Sistema de Autenticação

### AuthContext (`/contexts/AuthContext.tsx`)
- Context Provider para toda a aplicação
- Gerenciamento de estado do usuário
- Métodos: `signUp`, `signIn`, `signOut`
- Listener de mudanças de autenticação
- Verifica sessão ao carregar

### Proteção de Rotas
Todas as páginas (exceto `/login`) verificam autenticação:
```tsx
useEffect(() => {
  if (!authLoading && !user) {
    router.push('/login');
  }
}, [user, authLoading, router]);
```

### Fluxo de Navegação
1. `/` → Redireciona para `/login` ou `/dashboard`
2. `/login` → Após login → `/dashboard`
3. Qualquer página protegida sem auth → `/login`

## 🛠️ Estrutura de Arquivos

```
frontend/
├── app/
│   ├── page.tsx              # Redirect automático
│   ├── login/page.tsx        # Autenticação
│   ├── dashboard/page.tsx    # Dashboard principal
│   ├── marketplace/page.tsx  # Marketplace de cartas
│   ├── boosters/page.tsx     # Loja de boosters
│   ├── wallet/page.tsx       # Carteira USDC
│   ├── inventory/page.tsx    # Inventário de cartas
│   └── layout.tsx            # Layout com AuthProvider
├── contexts/
│   └── AuthContext.tsx       # Context de autenticação
├── lib/
│   ├── supabase.ts          # Cliente Supabase
│   └── api.ts               # Cliente Axios com JWT
└── .env.local               # Variáveis de ambiente
```

## 🔌 Integrações de API

### Endpoints Utilizados

| Página | Endpoint | Método | Descrição |
|--------|----------|--------|-----------|
| Marketplace | `/market/listings` | GET | Lista cartas à venda |
| Boosters | `/boosters/types` | GET | Lista tipos de boosters |
| Boosters | `/boosters/buy` | POST | Compra booster |
| Wallet | `/wallet` | GET | Saldo da carteira |
| Wallet | `/wallet/transactions` | GET | Histórico de transações |
| Inventory | `/inventory` | GET | Cartas do usuário |

### Axios Interceptor
Todas as requisições incluem automaticamente o JWT:
```typescript
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});
```

## 🎨 Design System

### Cores
- Background: `bg-gradient-to-b from-gray-900 to-gray-800`
- Cards: `bg-gray-800`
- Hover: `bg-gray-700`
- Primário: `bg-blue-600` / `text-blue-400`
- Sucesso: `bg-green-600` / `text-green-400`
- Erro: `bg-red-900/50` / `text-red-300`

### Componentes Reutilizáveis
- Navbar: Presente em todas as páginas protegidas
- Loading States: Spinner centralizado
- Empty States: Mensagens amigáveis + CTAs
- Card Grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6`

## 🚀 Deploy

### URLs de Produção
- **Frontend**: https://frontend-1ecumaj7s-razzachans-projects.vercel.app
- **Backend**: https://krouva-production.up.railway.app
- **Supabase**: https://mmcytphoeyxeylvaqjgr.supabase.co

### Variáveis de Ambiente (Vercel)
```bash
NEXT_PUBLIC_API_URL=https://krouva-production.up.railway.app
NEXT_PUBLIC_SUPABASE_URL=https://mmcytphoeyxeylvaqjgr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

### Comandos de Deploy
```bash
# Build local
npm run build

# Deploy para produção
npx vercel --prod --yes
```

## ✅ Checklist de Features

### Implementado
- [x] Sistema de autenticação (login/registro)
- [x] Dashboard com visão geral
- [x] Marketplace (listagem)
- [x] Boosters (compra)
- [x] Wallet (saldo + transações)
- [x] Inventário (cartas do usuário)
- [x] Navegação entre páginas
- [x] Loading states
- [x] Empty states
- [x] Proteção de rotas

### Próximos Passos
- [ ] Compra de cartas no marketplace
- [ ] Venda de cartas do inventário
- [ ] Animação de abertura de boosters
- [ ] Detalhes da carta (modal)
- [ ] Sistema de depósito/saque
- [ ] Filtros no marketplace
- [ ] Paginação
- [ ] Notificações toast
- [ ] Loading skeletons
- [ ] Responsividade mobile

## 🧪 Como Testar

1. **Criar Conta**
   - Acesse `/login`
   - Clique em "Criar conta"
   - Use um email válido
   - Senha mínima de 6 caracteres
   - Verifique o email (Supabase envia confirmação)

2. **Login**
   - Acesse `/login`
   - Use email e senha
   - Será redirecionado para `/dashboard`

3. **Navegação**
   - Dashboard → Acesso rápido a todas as features
   - Marketplace → Ver cartas à venda
   - Boosters → Ver boosters disponíveis
   - Wallet → Ver saldo e transações
   - Inventário → Ver suas cartas

## 🔧 Desenvolvimento Local

```bash
# Instalar dependências
cd frontend
npm install

# Configurar variáveis de ambiente
cp .env.local.example .env.local
# Editar .env.local com suas credenciais

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Testar produção localmente
npm start
```

## 📝 Notas Técnicas

### Next.js 15 + App Router
- Todos os componentes são Client Components (`'use client'`)
- Navegação via `next/navigation`
- Supabase Auth funciona no cliente

### Supabase Auth
- Email/Password authentication
- JWT automático via `auth.getSession()`
- Listener de mudanças: `onAuthStateChange`

### Axios + Interceptors
- Base URL: `process.env.NEXT_PUBLIC_API_URL`
- JWT injetado automaticamente
- Erros capturados via try/catch

### Tailwind CSS
- Dark theme por padrão
- Utility-first approach
- Responsive design mobile-first
- Hover states em todos os botões

---

**Status**: ✅ Sistema completo de autenticação e features implementado
**Deploy**: ✅ Frontend online no Vercel
**Próximo**: Implementar funcionalidades de compra/venda
