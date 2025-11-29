# Frontend Setup Guide - Kroova TCG

## 🎯 Arquitetura Recomendada

### Stack Tecnológica
- **Framework**: Next.js 16 (App Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS
- **Componentes**: shadcn/ui
- **Estado**: Zustand (state management leve)
- **Requisições**: TanStack Query (React Query v5)
- **Autenticação**: JWT com interceptors
- **Forms**: React Hook Form + Zod validation

## 📁 Estrutura de Diretórios

```
kroova-frontend/
├── src/
│   ├── app/                    # App Router (Next.js 16)
│   │   ├── (auth)/            # Layout de autenticação
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/       # Layout principal
│   │   │   ├── dashboard/     # Home do usuário
│   │   │   ├── shop/          # Loja de boosters
│   │   │   ├── inventory/     # Inventário de cartas
│   │   │   ├── marketplace/   # Marketplace
│   │   │   └── wallet/        # Carteira
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Landing page
│   │
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── auth/              # Componentes de auth
│   │   ├── cards/             # Card display components
│   │   ├── marketplace/       # Marketplace components
│   │   ├── wallet/            # Wallet components
│   │   └── layout/            # Header, Sidebar, Footer
│   │
│   ├── lib/
│   │   ├── api/               # API clients
│   │   │   ├── auth.ts
│   │   │   ├── wallet.ts
│   │   │   ├── cards.ts
│   │   │   ├── marketplace.ts
│   │   │   └── boosters.ts
│   │   ├── hooks/             # Custom hooks
│   │   ├── stores/            # Zustand stores
│   │   └── utils/             # Utility functions
│   │
│   ├── types/                 # TypeScript types
│   │   ├── api.ts
│   │   ├── card.ts
│   │   ├── user.ts
│   │   └── marketplace.ts
│   │
│   └── styles/
│       └── globals.css
│
├── public/
│   ├── cards/                 # Card images
│   └── assets/                # Other assets
│
└── package.json
```

## 🚀 Comandos de Setup

```bash
# Criar projeto Next.js 16 com TypeScript
npx create-next-app@latest kroova-frontend --typescript --tailwind --app --eslint

cd kroova-frontend

# Instalar dependências principais
npm install zustand @tanstack/react-query axios zod react-hook-form @hookform/resolvers

# Instalar shadcn/ui
npx shadcn-ui@latest init

# Instalar componentes shadcn/ui essenciais
npx shadcn-ui@latest add button card input label select dialog toast tabs avatar badge dropdown-menu sheet
```

## 🔧 Configuração de Variáveis de Ambiente

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3333/api/v1
NEXT_PUBLIC_APP_NAME=Kroova TCG
NEXT_PUBLIC_ENABLE_DEV_TOOLS=true
```

## 📝 Exemplo de API Client

```typescript
// src/lib/api/client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

## 🎨 Páginas Principais

### 1. Landing Page (`/`)
- Hero section
- Features do jogo
- CTA para registro/login
- Preview de cartas

### 2. Login/Registro (`/login`, `/register`)
- Formulários validados
- Integração com API de autenticação
- Redirect após login bem-sucedido

### 3. Dashboard (`/dashboard`)
- Visão geral da conta
- Saldo da carteira
- Estatísticas (cartas, transações)
- Atalhos rápidos

### 4. Loja (`/shop`)
- Listagem de boosters disponíveis
- Compra de boosters
- Histórico de compras
- Animação de abertura de booster

### 5. Inventário (`/inventory`)
- Grid de cartas do usuário
- Filtros (raridade, skin, edição)
- Detalhes da carta
- Ação de reciclar carta
- Ação de listar no marketplace

### 6. Marketplace (`/marketplace`)
- Listagem de cartas à venda
- Filtros de preço/raridade
- Compra de cartas
- Minhas listagens
- Histórico de vendas

### 7. Carteira (`/wallet`)
- Saldo atual
- Histórico de transações
- Depósito (integração futura)
- Saque (integração futura)

## 🎯 Features Prioritárias (MVP)

### Sprint 1 - Autenticação e Setup
- [ ] Setup do projeto Next.js 14
- [ ] Configuração shadcn/ui
- [ ] Sistema de autenticação (login/registro)
- [ ] Layout base (header, sidebar, footer)
- [ ] Configuração de API client

### Sprint 2 - Carteira e Inventário
- [ ] Dashboard principal
- [ ] Página de carteira (saldo + transações)
- [ ] Página de inventário (grid de cartas)
- [ ] Detalhes da carta (modal/página)

### Sprint 3 - Loja de Boosters
- [ ] Listagem de boosters
- [ ] Compra de booster
- [ ] Animação de abertura
- [ ] Integração com inventário

### Sprint 4 - Marketplace
- [ ] Listagem de cartas à venda
- [ ] Compra de carta
- [ ] Criar listagem (vender carta)
- [ ] Cancelar listagem
- [ ] Histórico de transações

### Sprint 5 - Polimento e Otimizações
- [ ] Responsividade mobile
- [ ] Loading states
- [ ] Error handling
- [ ] Animações e transições
- [ ] SEO básico

## 🎨 Design System (Tailwind + shadcn/ui)

### Cores Principais
```css
/* tailwind.config.ts */
{
  colors: {
    primary: '#6366f1',     // Indigo
    secondary: '#8b5cf6',   // Violet
    accent: '#ec4899',      // Pink
    success: '#10b981',     // Green
    warning: '#f59e0b',     // Amber
    error: '#ef4444',       // Red
    
    // Raridades
    common: '#94a3b8',      // Slate
    uncommon: '#3b82f6',    // Blue
    rare: '#a855f7',        // Purple
    epic: '#f97316',        // Orange
    legendary: '#eab308',   // Yellow
    mythic: '#ec4899',      // Pink
  }
}
```

### Componentes Customizados

#### Card Component
```typescript
// components/cards/CardDisplay.tsx
interface CardDisplayProps {
  card: Card;
  size?: 'sm' | 'md' | 'lg';
  showActions?: boolean;
  onClick?: () => void;
}

export function CardDisplay({ card, size = 'md', showActions, onClick }: CardDisplayProps) {
  return (
    <div className="group relative rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
      <img src={card.image_url} alt={card.name} className="w-full h-auto" />
      
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        <h3 className="text-white font-bold">{card.name}</h3>
        <Badge variant={card.rarity}>{card.rarity}</Badge>
      </div>
      
      {showActions && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="sm" variant="ghost">Ver Detalhes</Button>
        </div>
      )}
    </div>
  );
}
```

## 🔐 Autenticação Flow

```typescript
// lib/stores/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      
      login: async (email, password) => {
        const response = await apiClient.post('/auth/login', { email, password });
        const { access_token, user } = response.data.data;
        
        set({ accessToken: access_token, user });
        localStorage.setItem('access_token', access_token);
      },
      
      logout: () => {
        set({ user: null, accessToken: null });
        localStorage.removeItem('access_token');
      },
      
      refreshToken: async () => {
        // Implementar refresh token logic
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
```

## 📊 React Query Setup

```typescript
// app/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minuto
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

## 🎯 Próximos Passos

1. **Criar repositório frontend**
   ```bash
   git init kroova-frontend
   cd kroova-frontend
   # Seguir comandos de setup acima
   ```

2. **Setup inicial**
   - Configurar Next.js 14
   - Instalar dependências
   - Configurar Tailwind + shadcn/ui

3. **Desenvolvimento MVP**
   - Seguir sprints definidos acima
   - Integrar com backend existente
   - Testar fluxos principais

4. **Deploy**
   - Vercel (recomendado para Next.js)
   - Configurar variáveis de ambiente
   - Configurar domínio customizado

## 📚 Referências

- [Next.js 14 Documentation](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [TanStack Query](https://tanstack.com/query/latest)
- [Zustand Documentation](https://docs.pmnd.rs/zustand)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

**Status**: Pronto para iniciar desenvolvimento frontend
**Bloqueadores**: Nenhum - Backend já está funcional e testado
**Estimativa**: 4-6 semanas para MVP completo
