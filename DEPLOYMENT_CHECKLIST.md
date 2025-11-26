# 🚀 Kroova Production Deployment Checklist

**Data de Deploy:** ___/___/2025  
**Versão:** v___  
**Responsável:** _______________

---

## 📋 Pré-Deploy (48h antes)

### Infraestrutura
- [ ] Supabase production instance criada e configurada
- [ ] Redis instance provisionada (AWS ElastiCache / Upstash)
- [ ] Polygon RPC endpoint configurado (Alchemy/Infura)
- [ ] CDN configurado (CloudFlare)
- [ ] Load balancer configurado (AWS ALB / CloudFlare)
- [ ] SSL/TLS certificados válidos e renovação automática

### Secrets & Environment
- [ ] `.env.production` criado baseado em `.env.production.template`
- [ ] `ENCRYPTION_KEY` gerada e armazenada em secrets manager
- [ ] `JWT_SECRET` gerado (256-bit)
- [ ] `ECONOMIC_SERIES_SECRET` gerado (256-bit)
- [ ] `WALLET_PRIVATE_KEY` da master wallet protegida
- [ ] Stripe keys (live mode) configuradas
- [ ] Webhooks URLs configurados:
  - [ ] `ECONOMIC_SERIES_WEBHOOK_URL` (Slack/Discord)
  - [ ] `SLACK_WEBHOOK_CRITICAL`
  - [ ] `BACKUP_WEBHOOK_URL`

### Database
- [ ] Migrations aplicadas no Supabase production
  ```bash
  npx supabase db push --db-url "postgresql://..."
  ```
- [ ] Índices criados:
  ```sql
  CREATE INDEX idx_cards_base_edition ON cards_base(edition_id);
  CREATE INDEX idx_cards_instances_owner ON cards_instances(owner_id);
  CREATE INDEX idx_transactions_user ON transactions(user_id);
  CREATE INDEX idx_economic_series_timestamp ON economic_series(timestamp DESC);
  ```
- [ ] Row Level Security (RLS) habilitado em todas as tabelas sensíveis
- [ ] Backup automático configurado (daily + PITR)

### Cards Seed
- [ ] ED01 250 cards validadas (dry-run executado)
  ```bash
  node scripts/seed_supabase.js --dry
  ```
- [ ] Imagens das cartas hospedadas em CDN
- [ ] Seed real executado:
  ```bash
  node scripts/seed_supabase.js
  ```
- [ ] Validação: query retorna 250 cartas ED01
  ```sql
  SELECT COUNT(*) FROM cards_base WHERE edition_id = 'ED01';
  ```

---

## 🧪 Testes Pré-Deploy (24h antes)

### Smoke Tests
- [ ] Suite completa de testes passa (70/70)
  ```bash
  npx vitest run
  ```
- [ ] Build de produção bem-sucedido
  ```bash
  npm run build
  ```
- [ ] TypeScript compilation sem erros
  ```bash
  npx tsc --noEmit
  ```

### Integration Tests (Staging)
- [ ] Auth flow completo (register → login → refresh token)
- [ ] Booster purchase com Stripe (test mode)
- [ ] Booster opening retorna 5 cartas com raridades corretas
- [ ] Marketplace listing + purchase
- [ ] Card recycling
- [ ] Economic series capture após transação
- [ ] RTP alert webhook dispara corretamente

### Performance Tests
- [ ] Load test: 100 usuários simultâneos
  ```bash
  npx artillery run load-test.yml
  ```
- [ ] Response time < 500ms (p95)
- [ ] Database connection pool estável
- [ ] Redis cache hit rate > 80%

### Security Checks
- [ ] Endpoints `/internal/*` protegidos (403 de IPs externos)
- [ ] Rate limiting ativo (100 req/min por IP)
- [ ] CORS configurado apenas para domínios permitidos
- [ ] SQL injection protegido (prepared statements)
- [ ] XSS headers configurados (CSP, X-Frame-Options)
- [ ] Secrets não commitadas no Git
  ```bash
  git secrets --scan
  ```

---

## 🚀 Deploy (D-Day)

### 1. Backup Pré-Deploy
- [ ] Backup completo do database atual (se houver)
- [ ] Export de economic series (histórico)
  ```bash
  curl https://api.kroova.gg/internal/economic-series/export > backup_$(date +%Y%m%d).json
  ```
- [ ] Snapshot do Redis (se houver estado crítico)

### 2. Deploy de Aplicação
- [ ] Build de produção
  ```bash
  npm run build
  ```
- [ ] Deploy para servidor/container
  - AWS ECS: `aws ecs update-service --cluster kroova --service api --force-new-deployment`
  - Vercel/Railway: `git push production main`
  - Docker: `docker-compose -f docker-compose.prod.yml up -d`
- [ ] Health check endpoint respondendo
  ```bash
  curl https://api.kroova.gg/health
  ```

### 3. Smoke Tests Produção
- [ ] GET /health → 200 OK
- [ ] GET /api/v1/boosters → 200 OK (retorna lista)
- [ ] POST /api/v1/auth/register (criar usuário teste)
- [ ] POST /api/v1/boosters/purchase (compra teste R$ 0.50)
- [ ] POST /api/v1/boosters/open (abrir booster teste)
- [ ] GET /internal/audit-dashboard (verificar métricas iniciais)

### 4. Monitoramento Ativo
- [ ] Dashboard de métricas aberto (Grafana/Datadog)
- [ ] Logs em tempo real (CloudWatch/Papertrail)
  ```bash
  tail -f /var/log/kroova/app.log
  ```
- [ ] Alertas configurados e testados:
  - [ ] RTP High (>25%)
  - [ ] RTP Low (<10%)
  - [ ] Error rate >1%
  - [ ] Response time >2s

---

## ✅ Validação Pós-Deploy (2h após)

### Funcionalidade Crítica
- [ ] 10 usuários reais registrados com sucesso
- [ ] 5 compras de booster processadas (Stripe live)
- [ ] Todos os boosters abertos com sucesso
- [ ] Cartas aparecendo no inventário dos usuários
- [ ] Economic series capturando métricas corretamente
  ```bash
  curl https://api.kroova.gg/internal/economic-series?limit=10
  ```

### Métricas de Saúde
- [ ] Error rate < 0.5%
- [ ] Latência p95 < 1s
- [ ] Database CPU < 50%
- [ ] Redis memory < 70%
- [ ] Application memory stable (sem leaks)

### Integridade de Dados
- [ ] Hash chain de economic series íntegra
  ```sql
  -- Query de verificação em ECONOMIC_OBSERVABILITY.md
  ```
- [ ] Sem transações duplicadas
- [ ] Saldo de wallets consistente com transações

---

## 🔄 Monitoramento Contínuo (Primeiras 24h)

### Alertas Críticos (Resposta imediata)
- [ ] RTP alert HIGH disparado? → Investigar economia
- [ ] Error rate spike? → Revisar logs
- [ ] Database connection errors? → Verificar pool/credentials
- [ ] Payment webhook failures? → Verificar Stripe webhook signature

### Métricas Diárias
- [ ] Usuários ativos
- [ ] Boosters vendidos
- [ ] RTP médio
- [ ] Margem de lucro
- [ ] Distribuição de raridade observada vs esperada

### Ajustes Finos
- [ ] Tuning de cache (TTL, invalidation)
- [ ] Ajuste de rate limits (se necessário)
- [ ] Otimização de queries lentas (via pg_stat_statements)

---

## 🚨 Rollback Plan

### Critérios de Rollback
- Error rate > 5% por 10 minutos
- Payment processing failures > 20%
- Database integrity compromised
- Security breach detected

### Procedimento de Rollback
1. **Parar aplicação atual**
   ```bash
   systemctl stop kroova-api
   # ou: docker-compose down
   ```

2. **Restaurar versão anterior**
   ```bash
   git checkout tags/v1.0.0-stable
   npm install
   npm run build
   ```

3. **Restaurar database (se necessário)**
   ```bash
   pg_restore -d kroova_production backup_latest.dump
   ```

4. **Reiniciar aplicação**
   ```bash
   systemctl start kroova-api
   ```

5. **Validar health check**
   ```bash
   curl https://api.kroova.gg/health
   ```

6. **Comunicar stakeholders**
   - Notificar time via Slack
   - Atualizar status page (status.kroova.gg)
   - Post-mortem agendado

---

## 📊 Métricas de Sucesso (Primeira Semana)

### Objetivos Mínimos
- [ ] Uptime > 99.5%
- [ ] 100+ usuários registrados
- [ ] 500+ boosters vendidos
- [ ] RTP entre 10-25% (dentro dos thresholds)
- [ ] 0 incidents críticos

### Objetivos Ideais
- [ ] Uptime > 99.9%
- [ ] 500+ usuários registrados
- [ ] 2000+ boosters vendidos
- [ ] NPS > 8.0
- [ ] 5+ reviews positivos

---

## 📝 Post-Deploy

### Documentação
- [ ] Atualizar changelog (CHANGELOG.md)
- [ ] Documentar issues encontrados e resoluções
- [ ] Atualizar runbook com learnings

### Comunicação
- [ ] Anunciar lançamento em redes sociais
- [ ] Email para waitlist (se houver)
- [ ] Post-mortem meeting agendado (mesmo se tudo ok)

### Melhorias Futuras Identificadas
- [ ] _______________
- [ ] _______________
- [ ] _______________

---

## 🆘 Contatos de Emergência

**Engineering Lead:** +55 (__)_____-____  
**DevOps:** +55 (__)_____-____  
**Product Owner:** +55 (__)_____-____

**Escalation:**
1. Slack #engineering-alerts
2. PagerDuty rotation
3. Emergency hotline (CEO)

---

**Status Final:**
- [ ] ✅ Deploy bem-sucedido
- [ ] ⚠️ Deploy com issues menores (documentados)
- [ ] ❌ Rollback executado

**Notas Finais:**
```
_______________________________________________
_______________________________________________
_______________________________________________
```

**Assinatura Responsável:** _________________ Data: ___/___/2025
