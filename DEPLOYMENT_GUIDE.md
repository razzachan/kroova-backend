# 🚀 KROOVA - Production Deployment Guide

## ✅ Pre-Deployment Checklist

### 1. Environment Variables
Configurar todas as variáveis em `.env` (ver `.env.example`):

**Críticas:**
- [ ] `SUPABASE_URL` - URL do projeto Supabase
- [ ] `SUPABASE_SERVICE_KEY` - Service role key
- [ ] `JWT_SECRET` - Chave secreta (min 32 chars)
- [ ] `NODE_ENV=production`
- [ ] `CORS_ORIGINS` - Domínios permitidos

**Dev Flags (DEVE estar desabilitado):**
```bash
KROOVA_DEV_LOGIN_BYPASS=0
KROOVA_DEV_ALLOW_RECYCLE_NO_CPF=0
KROOVA_DEV_NO_RATELIMIT=0
```

### 2. Database - RLS Policies
Aplicar políticas de segurança no Supabase Dashboard:

```bash
# Copie o conteúdo de:
scripts/apply-rls-production.sql

# Cole no Supabase Dashboard > SQL Editor
# Execute o script completo
```

**Validação:**
```sql
-- Verificar RLS ativo
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('users', 'wallets', 'transactions', 'cards_instances', 'market_listings');

-- Verificar policies criadas
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

### 3. GitHub Actions Secrets
Configurar no GitHub: `Settings > Secrets and variables > Actions`

**Required Secrets:**
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `SUPABASE_ANON_KEY`
- `JWT_SECRET`
- `RENDER_API_KEY` (se usando Render)
- `SENTRY_DSN` (opcional - error tracking)

### 4. Build & Test
```bash
# Instalar dependências
npm ci

# Build TypeScript
npm run build

# Executar testes
npm test

# Verificar sem erros
npm run lint
```

**Resultado esperado:**
- ✅ Build: Zero erros TypeScript
- ✅ Tests: 88/96 passing (91.7%)
- ✅ Lint: No warnings

---

## 🌐 Deployment Platforms

### Option 1: Render.com (Recomendado)

**1. Create Web Service:**
- Connect GitHub repository
- Select branch: `main`
- Build Command: `npm run build`
- Start Command: `npm run start`

**2. Environment Variables:**
Adicionar todas as variáveis do `.env.example`

**3. Health Check:**
- Path: `/`
- Expected response: `{"ok":true,"message":"Kroova API is running"}`

**4. Auto-Deploy:**
- Enabled on push to `main`
- Build logs available in dashboard

### Option 2: Railway.app

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up
```

### Option 3: Heroku

```bash
# Login
heroku login

# Create app
heroku create kroova-api

# Set environment variables
heroku config:set SUPABASE_URL=https://... JWT_SECRET=...

# Deploy
git push heroku main

# Scale
heroku ps:scale web=1
```

### Option 4: DigitalOcean App Platform

1. Connect GitHub repository
2. Configure environment variables
3. Set build/run commands
4. Deploy

---

## 🔐 Security Post-Deployment

### 1. Verify RLS is Active
```bash
curl -X GET https://your-api.com/api/v1/wallet \
  -H "Authorization: Bearer invalid_token"

# Expected: 401 Unauthorized
```

### 2. Test Rate Limiting
```bash
# Execute 100 requests rapidamente
for i in {1..100}; do
  curl https://your-api.com/api/v1/boosters
done

# Deve retornar 429 (Too Many Requests) após limite
```

### 3. Verify CORS
```bash
curl -X OPTIONS https://your-api.com/api/v1/auth/login \
  -H "Origin: https://evil-site.com" \
  -v

# Não deve incluir "evil-site.com" nos headers CORS
```

### 4. SSL/TLS
- ✅ Certificado HTTPS ativo
- ✅ Redirect HTTP → HTTPS
- ✅ HSTS header enabled

---

## 📊 Monitoring & Logging

### 1. Error Tracking (Sentry)
```bash
# Install Sentry
npm install @sentry/node @sentry/tracing

# Configure in src/app.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1
});
```

### 2. Application Logs
Logs são salvos em:
- `logs/combined.log` - Todos os logs
- `logs/error.log` - Apenas erros

**Visualizar em produção:**
```bash
# Render/Railway
railway logs

# Heroku
heroku logs --tail

# DigitalOcean
doctl apps logs <app-id>
```

### 3. Health Monitoring
Configure uptime monitoring em:
- UptimeRobot (free)
- Pingdom
- Better Uptime

**Endpoint:** `GET /`
**Expected:** Status 200, `{"ok":true}`
**Frequency:** Every 5 minutes

### 4. Performance Metrics
Key metrics to monitor:
- Response time: < 200ms (p95)
- Error rate: < 1%
- CPU usage: < 70%
- Memory: < 512MB

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow
Já configurado em `.github/workflows/test.yml`:

**On every push:**
1. ✅ Lint code
2. ✅ Run tests
3. ✅ Build TypeScript
4. ✅ Upload coverage

**On tag/release:**
1. ✅ All above
2. ✅ Deploy to production
3. ✅ Run smoke tests

### Manual Deployment
```bash
# Tag release
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0

# Trigger deployment
gh workflow run deploy.yml
```

---

## 🗄️ Database Maintenance

### Backups
Configure automated backups no Supabase Dashboard:
- Frequency: Daily at 3 AM
- Retention: 30 days
- Storage: S3/Supabase Cloud

### Migrations
```bash
# Create migration
supabase migration new add_feature_x

# Apply to production (após testar localmente)
supabase db push --db-url <production-url>
```

### Monitoring Queries
```sql
-- Active connections
SELECT count(*) FROM pg_stat_activity;

-- Slow queries
SELECT query, mean_exec_time 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;

-- Table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## 🚨 Rollback Plan

### Option 1: Git Revert
```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Redeploy automatically via CI/CD
```

### Option 2: Manual Rollback
```bash
# Render/Railway
railway rollback

# Heroku
heroku rollback
```

### Option 3: Database Rollback
```bash
# Restore from backup
supabase db restore --db-url <url> --backup-id <id>
```

---

## 📈 Scaling Strategy

### Horizontal Scaling
- Add more instances (Render auto-scales)
- Load balancer (automatically handled)

### Database Optimization
```sql
-- Add indexes for common queries
CREATE INDEX idx_transactions_user_created 
ON transactions(user_id, created_at DESC);

CREATE INDEX idx_market_listings_status_price 
ON market_listings(status, price_brl);

-- Vacuum regularly
VACUUM ANALYZE;
```

### Caching
Implementar Redis para:
- Session storage
- Rate limiting
- Frequently accessed data

```bash
# Add Redis
npm install ioredis

# Configure
REDIS_URL=redis://...
```

---

## ✅ Production Verification

### Final Checklist
- [ ] `.env` configurado corretamente
- [ ] RLS policies aplicadas
- [ ] GitHub Secrets configurados
- [ ] Build passa sem erros
- [ ] Tests ≥ 90% passing
- [ ] Health check retorna 200
- [ ] Rate limiting funciona
- [ ] CORS configurado corretamente
- [ ] SSL/HTTPS ativo
- [ ] Logs funcionando
- [ ] Error tracking ativo
- [ ] Uptime monitoring configurado
- [ ] Backups automáticos ativos
- [ ] Documentação atualizada

### Smoke Tests
```bash
# 1. Health check
curl https://api.kroova.com/

# 2. Auth
curl -X POST https://api.kroova.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123"}'

# 3. Protected route (should fail without auth)
curl https://api.kroova.com/api/v1/wallet
# Expected: 401

# 4. Public route
curl https://api.kroova.com/api/v1/boosters
# Expected: 200
```

---

## 📞 Support Contacts

**Technical Issues:**
- Email: dev@kroova.com
- Slack: #backend-support

**Infrastructure:**
- Render: support via dashboard
- Supabase: support@supabase.io

**Emergency Contacts:**
- On-call engineer: +55 (XX) XXXXX-XXXX
- DevOps lead: devops@kroova.com

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Render Deployment Guide](https://render.com/docs)
- [Fastify Best Practices](https://www.fastify.io/docs/latest/Guides/Getting-Started/)
- [Node.js Security Checklist](https://github.com/goldbergyoni/nodebestpractices#6-security-best-practices)

---

**Última atualização:** 2025-11-26
**Versão:** 1.0.0
