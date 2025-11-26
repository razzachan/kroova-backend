# 🚀 Deploy Completo - KROOVA Backend + Frontend

## ✅ Status Atual
- ✅ Backend commitado no Git (commit: c653d31)
- ✅ 302 arquivos versionados
- ✅ Documentação completa (1.300+ linhas)
- ✅ Railway config pronta (railway.json, Procfile)

---

## 📋 Próximos Passos

### 1. Criar Repositório no GitHub

```bash
# Vá para: https://github.com/new
# Nome: kroova-backend
# Descrição: Backend completo para TCG digital KROOVA - Fastify + Supabase + Railway
# Público ou Privado (escolha)
# NÃO inicializar com README (já temos)
```

### 2. Push para GitHub

```bash
# Adicionar remote
git remote add origin https://github.com/SEU-USUARIO/kroova-backend.git

# Push
git branch -M main
git push -u origin main
```

### 3. Deploy Backend no Railway

**Opção A: Via Dashboard (Mais Fácil)**

1. Acesse https://railway.app/
2. Login com GitHub
3. New Project > Deploy from GitHub repo
4. Selecione `kroova-backend`
5. Configure variáveis (ver abaixo)
6. Deploy automático!

**Opção B: Via CLI**

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Inicializar e fazer link com repo
railway link

# Deploy
railway up
```

### 4. Configurar Variáveis no Railway

**No Dashboard > Settings > Environment Variables:**

```env
NODE_ENV=production
PORT=3333
SUPABASE_URL=https://sua-url.supabase.co
SUPABASE_SERVICE_KEY=eyJhbG...
SUPABASE_ANON_KEY=eyJhbG...
JWT_SECRET=seu-secret-min-32-chars

# Dev flags DESABILITADOS
KROOVA_DEV_LOGIN_BYPASS=0
KROOVA_DEV_ALLOW_RECYCLE_NO_CPF=0
KROOVA_DEV_NO_RATELIMIT=0

# CORS (adicionar depois de criar o frontend Vercel)
CORS_ORIGINS=https://kroova.vercel.app
```

**URL gerada:** `https://kroova-api-production.up.railway.app`

### 5. Aplicar RLS no Supabase

```bash
# 1. Abrir Supabase Dashboard
# 2. SQL Editor > New Query
# 3. Copiar conteúdo de: scripts/apply-rls-production.sql
# 4. Executar
# 5. Verificar: SELECT * FROM pg_policies WHERE schemaname = 'public';
```

### 6. Testar Backend

```bash
# Health check
curl https://kroova-api-production.up.railway.app/

# Deve retornar:
# {"ok":true,"message":"Kroova API is running"}
```

---

## 🎨 Deploy Frontend no Vercel

### 1. Criar Repositório Frontend

```bash
# Criar novo repositório no GitHub
# Nome: kroova-frontend

# Criar projeto Next.js
npx create-next-app@latest kroova-frontend --typescript --tailwind --app --src-dir

cd kroova-frontend
```

### 2. Seguir FRONTEND_SETUP.md

**Estrutura básica (ver documento completo):**

```typescript
// lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return res.json();
}
```

### 3. Deploy no Vercel

```bash
# No diretório do frontend
npm install -g vercel
vercel login
vercel

# Configurar variável
vercel env add NEXT_PUBLIC_API_URL
# Valor: https://kroova-api-production.up.railway.app
```

### 4. Atualizar CORS no Railway

```bash
# Adicionar domínio Vercel gerado
railway variables set CORS_ORIGINS=https://kroova.vercel.app,https://kroova-git-main-user.vercel.app
```

---

## 🔄 Fluxo Completo

```
1. GitHub (Backend)
   └─> Railway (Auto-deploy)
       └─> URL: https://kroova-api-production.up.railway.app

2. GitHub (Frontend)
   └─> Vercel (Auto-deploy)
       └─> URL: https://kroova.vercel.app
       └─> Conecta com Railway API
```

---

## ✅ Checklist Final

**Backend:**
- [ ] Repositório GitHub criado
- [ ] Push código (`git push origin main`)
- [ ] Railway projeto criado
- [ ] Variáveis configuradas (Railway)
- [ ] Deploy executado (automático ou `railway up`)
- [ ] Health check OK (`curl https://...`)
- [ ] RLS aplicado no Supabase
- [ ] Logs funcionando (`railway logs`)

**Frontend:**
- [ ] Repositório GitHub criado
- [ ] Next.js app criada
- [ ] API URL configurada (`NEXT_PUBLIC_API_URL`)
- [ ] Deploy Vercel executado
- [ ] CORS configurado no Railway
- [ ] Login funciona
- [ ] Rotas protegidas funcionam

---

## 🆘 Troubleshooting

### Backend não inicia no Railway
```bash
# Ver logs
railway logs

# Verificar variáveis
railway variables

# Testar build local
npm run build
npm run start
```

### CORS Error no Frontend
```bash
# Adicionar domínio Vercel no Railway
railway variables set CORS_ORIGINS=https://sua-app.vercel.app

# Verificar
railway restart
```

### RLS bloqueando queries
- Verificar se JWT_SECRET é o mesmo em dev/prod
- Verificar se token está sendo enviado: `Authorization: Bearer <token>`
- Ver logs: `railway logs | grep "401"`

---

## 📞 Comandos Úteis

```bash
# Railway
railway status         # Status do deploy
railway logs           # Ver logs
railway restart        # Restart app
railway open           # Abrir no browser
railway domain         # Ver domínios

# Git
git log --oneline      # Histórico
git status             # Status atual
git push origin main   # Push para GitHub

# Vercel
vercel                 # Deploy
vercel --prod          # Deploy produção
vercel logs            # Ver logs
vercel domains         # Gerenciar domínios
```

---

## 📚 Documentação de Referência

- [RAILWAY_DEPLOY.md](./RAILWAY_DEPLOY.md) - Deploy Railway completo
- [FRONTEND_SETUP.md](./FRONTEND_SETUP.md) - Setup frontend
- [FRONTEND_API_REFERENCE.md](./FRONTEND_API_REFERENCE.md) - API docs
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Deploy geral

---

## 🎯 Resultado Final

**Backend Railway:** `https://kroova-api-production.up.railway.app`  
**Frontend Vercel:** `https://kroova.vercel.app`  
**Database:** Supabase (com RLS ativo)  
**CI/CD:** GitHub Actions + Auto-deploy  

**Status:** ✅ Production Ready!

---

**Próximo:** Seguir sprints em FRONTEND_SETUP.md (4-6 semanas MVP)
