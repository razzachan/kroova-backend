# 🚂 Railway Deployment - KROOVA Backend

## Deploy Automático

### 1. Instalar Railway CLI
```bash
npm install -g @railway/cli
```

### 2. Login
```bash
railway login
```

### 3. Criar Projeto
```bash
railway init
```

Selecione:
- ✅ Create new project
- ✅ Name: `kroova-api`

### 4. Adicionar PostgreSQL (Supabase)
**Não precisa!** Usamos Supabase externo.

### 5. Configurar Variáveis de Ambiente
```bash
# Adicionar uma por vez
railway variables set SUPABASE_URL=https://xxxxx.supabase.co
railway variables set SUPABASE_SERVICE_KEY=ey...
railway variables set SUPABASE_ANON_KEY=ey...
railway variables set JWT_SECRET=your-secret-key-min-32-chars
railway variables set NODE_ENV=production
railway variables set PORT=3333

# Dev flags (DEVEM estar desabilitados)
railway variables set KROOVA_DEV_LOGIN_BYPASS=0
railway variables set KROOVA_DEV_ALLOW_RECYCLE_NO_CPF=0
railway variables set KROOVA_DEV_NO_RATELIMIT=0

# CORS (seu domínio Vercel)
railway variables set CORS_ORIGINS=https://kroova.vercel.app,https://www.kroova.com
```

### 6. Deploy
```bash
# Deploy manual
railway up

# Ou commit no GitHub (auto-deploy ativo)
git push origin main
```

### 7. Verificar Deploy
```bash
# Ver logs
railway logs

# Ver URL
railway open
```

**URL gerada:** `https://kroova-api-production.up.railway.app`

---

## Configuração no Dashboard

### 1. Acessar Railway Dashboard
https://railway.app/dashboard

### 2. Settings > Networking
- ✅ **Custom Domain**: Adicione `api.kroova.com` (se tiver domínio)
- ✅ **Health Check Path**: `/`
- ✅ **Port**: `3333`

### 3. Settings > Environment Variables
Adicione todas as variáveis (ver `.env.example`)

**Críticas:**
```env
NODE_ENV=production
PORT=3333
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...
SUPABASE_ANON_KEY=eyJ...
JWT_SECRET=your-32-char-secret
CORS_ORIGINS=https://kroova.vercel.app
```

**Dev Flags (DESABILITADOS):**
```env
KROOVA_DEV_LOGIN_BYPASS=0
KROOVA_DEV_ALLOW_RECYCLE_NO_CPF=0
KROOVA_DEV_NO_RATELIMIT=0
```

### 4. Settings > Deployments
- ✅ **Auto-deploy**: Enabled (GitHub main branch)
- ✅ **Build Command**: `npm ci && npm run build`
- ✅ **Start Command**: `npm run start`

---

## Conectar com GitHub

### 1. No Railway Dashboard
- Settings > GitHub
- Connect Repository
- Selecione `kroova-backend`

### 2. Branch Settings
- Production: `main`
- Auto-deploy: ✅ Enabled

### 3. Deploy Hooks (Opcional)
```bash
# Webhook para deploys manuais
curl -X POST https://railway.app/api/v1/webhooks/xxx \
  -H "Content-Type: application/json" \
  -d '{"ref":"refs/heads/main"}'
```

---

## Vercel Frontend → Railway Backend

### Variáveis no Vercel
```env
NEXT_PUBLIC_API_URL=https://kroova-api-production.up.railway.app
# ou
NEXT_PUBLIC_API_URL=https://api.kroova.com
```

### CORS no Backend
Já configurado em `src/app.ts`:
```typescript
fastify.register(cors, {
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
});
```

**IMPORTANTE:** Adicione o domínio Vercel nas variáveis:
```bash
railway variables set CORS_ORIGINS=https://kroova.vercel.app,https://kroova-git-main-user.vercel.app
```

---

## Monitoring no Railway

### 1. Metrics Dashboard
- CPU usage
- Memory usage
- Network I/O
- Request latency

### 2. Logs
```bash
# Ver logs em tempo real
railway logs --follow

# Filtrar por erro
railway logs | grep "ERROR"
```

### 3. Alertas
Configure no Dashboard:
- CPU > 80%
- Memory > 90%
- Error rate > 5%

---

## Troubleshooting

### Build Falha
```bash
# Ver logs de build
railway logs --deployment <id>

# Verificar dependências
npm ci
npm run build
```

### Aplicação não inicia
```bash
# Verificar variáveis
railway variables

# Testar localmente
npm run build
npm run start
```

### CORS Error no Frontend
```bash
# Verificar CORS_ORIGINS
railway variables get CORS_ORIGINS

# Adicionar domínio Vercel
railway variables set CORS_ORIGINS=https://sua-app.vercel.app
```

### Database Connection Error
- Verificar SUPABASE_URL
- Verificar SUPABASE_SERVICE_KEY
- Testar conexão: `scripts/validate-deployment.cjs`

---

## Comandos Úteis

```bash
# Status
railway status

# Restart
railway restart

# Rollback
railway rollback

# Ver domínios
railway domain

# Adicionar domínio customizado
railway domain add api.kroova.com

# Ver variáveis
railway variables

# Deletar variável
railway variables delete VAR_NAME

# Shell no container
railway run bash
```

---

## Custos Railway

### Hobby Plan (Free)
- $5 crédito/mês
- 512MB RAM
- Shared CPU
- 1GB storage

### Developer Plan ($20/mês)
- $20 crédito/mês
- 8GB RAM
- 8vCPU
- 100GB storage

**Estimativa Kroova:**
- Uso esperado: ~$10-15/mês (Hobby)
- Tráfego: ~50k requests/mês

---

## Checklist de Deploy

- [ ] Railway CLI instalado
- [ ] Login no Railway (`railway login`)
- [ ] Projeto criado (`railway init`)
- [ ] Variáveis configuradas (ver acima)
- [ ] GitHub conectado (auto-deploy)
- [ ] RLS aplicado no Supabase (ver `scripts/apply-rls-production.sql`)
- [ ] Build local passa (`npm run build`)
- [ ] Testes passam (`npm test`)
- [ ] Deploy executado (`railway up` ou push GitHub)
- [ ] Health check retorna 200 (GET /)
- [ ] CORS configurado com domínio Vercel
- [ ] Logs funcionando (`railway logs`)

---

## Integração Vercel

### 1. No repositório frontend (Next.js)
```bash
# Criar projeto Vercel
vercel

# Adicionar variável de ambiente
vercel env add NEXT_PUBLIC_API_URL
# Valor: https://kroova-api-production.up.railway.app
```

### 2. Teste de integração
```typescript
// pages/api/test.ts
export default async function handler(req, res) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/`);
  const data = await response.json();
  res.json(data);
}
```

### 3. Auth flow
```typescript
// lib/auth.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return res.json();
}
```

---

## Próximos Passos

1. ✅ **Deploy Backend Railway** (este guia)
2. ⏳ **Deploy Frontend Vercel** (ver `FRONTEND_SETUP.md`)
3. ⏳ **Aplicar RLS Supabase** (ver `scripts/apply-rls-production.sql`)
4. ⏳ **Configurar domínio customizado** (opcional)
5. ⏳ **Setup monitoring** (Sentry, LogRocket)

---

**Contato Railway Support:** https://railway.app/discord
**Docs Railway:** https://docs.railway.app
