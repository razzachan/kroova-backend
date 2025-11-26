# 🚀 KROUVA (ex-Kroova) — Guia de Setup Completo

## 📋 Pré-requisitos

- [x] Node.js v22+ instalado
- [x] NPM instalado
- [ ] Conta no Supabase (supabase.com)
- [ ] Redis rodando (local ou cloud)
- [ ] Conta Stripe (opcional, para testes)

---

## 1️⃣ Configurar Supabase

### Opção A: Supabase Cloud (Recomendado)

1. **Criar projeto:**
   - Acesse [supabase.com/dashboard](https://supabase.com/dashboard)
   - Clique em "New Project"
   - Escolha nome: `krouva-backend` (antes: `kroova-backend`)
   - Escolha região mais próxima
   - Senha do banco: **anote bem!**

2. **Obter credenciais:**
   - No dashboard, vá em **Settings → API**
   - Copie:
     - `Project URL` → `SUPABASE_URL`
     - `anon/public key` → `SUPABASE_ANON_KEY`
     - `service_role key` → `SUPABASE_SERVICE_KEY`

3. **Aplicar migration:**
   ```bash
   # Conectar ao projeto remoto
   npx supabase link --project-ref [seu-project-ref]
   
   # Aplicar schema
   npx supabase db push
   ```

4. **Aplicar seeds (dados iniciais):**
   - No dashboard Supabase, vá em **SQL Editor**
   - Abra o arquivo `supabase/seed.sql`
   - Copie e cole todo o conteúdo
   - Execute o SQL

### Opção B: Supabase Local (Docker)

```bash
# Iniciar Docker Desktop primeiro
docker --version

# Iniciar Supabase local
npx supabase start

# Aplicar seeds
npx supabase db reset
```

---

## 2️⃣ Configurar Redis

### Opção A: Redis Cloud (Grátis, Recomendado)

1. Acesse [redis.com/try-free](https://redis.com/try-free/)
2. Crie conta e banco grátis
3. Copie credenciais:
   - `REDIS_HOST` (ex: `redis-12345.c1.us-east-1-2.ec2.cloud.redislabs.com`)
   - `REDIS_PORT` (geralmente `6379`)

### Opção B: Redis Local (Docker)

```bash
docker run -d -p 6379:6379 redis:alpine
```

### Opção C: Upstash (Serverless, Grátis)

1. Acesse [upstash.com](https://upstash.com)
2. Crie banco Redis
3. Use REST API URL no `.env`

---

## 3️⃣ Configurar Stripe (Opcional)

1. Acesse [dashboard.stripe.com](https://dashboard.stripe.com)
2. Ative modo **Test**
3. Em **Developers → API Keys**, copie:
   - `Secret key` → `STRIPE_SECRET_KEY`
4. Em **Developers → Webhooks**, crie endpoint:
   - URL: `https://seu-dominio.com/api/v1/wallet/deposit/webhook`
   - Eventos: `checkout.session.completed`, `payment_intent.succeeded`
   - Copie `Signing secret` → `STRIPE_WEBHOOK_SECRET`

---

## 4️⃣ Configurar Polygon (Opcional, para NFTs)

### Testnet (Mumbai)

```bash
# RPC público grátis
POLYGON_RPC_URL=https://rpc-mumbai.maticvigil.com

# Criar carteira de teste
# Use MetaMask e copie a private key
WALLET_PRIVATE_KEY=0x...
```

### Mainnet (Produção)

- Use RPC privado: [Alchemy](https://alchemy.com) ou [Infura](https://infura.io)
- **NUNCA** commite private keys reais!

---

## 5️⃣ Configurar Variáveis de Ambiente

```bash
# Copiar exemplo
cp .env.example .env

# Editar com suas credenciais
code .env  # ou seu editor preferido
```

### Variáveis obrigatórias para rodar:

```env
# Gerar chave de encriptação
ENCRYPTION_KEY=...  # node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Supabase (obter no dashboard)
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_KEY=eyJ...

# JWT (qualquer string longa e aleatória)
JWT_SECRET=minha-chave-super-secreta-123

# Redis (obter no Redis Cloud ou usar localhost)
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Variáveis opcionais (para testes completos):

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
POLYGON_RPC_URL=https://rpc-mumbai.maticvigil.com
WALLET_PRIVATE_KEY=0x...
```

---

## 6️⃣ Instalar Dependências (se ainda não fez)

```bash
npm install
```

---

## 7️⃣ Testar a Aplicação

### Rodar servidor:

```bash
npm run dev
```

Você deve ver:

```
[Krouva] Server running on http://localhost:3333
```

### Testar health check:

```bash
# PowerShell
curl http://localhost:3333/

# Deve retornar:
# { "ok": true, "message": "Krouva API Online 🃏" }
```

---

## 8️⃣ Testar Rotas da API

### 1. Criar usuário:

```powershell
$body = @{
   email = "test@krouva.com"  # transição
    password = "senha123"
    name = "Usuario Teste"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3333/api/v1/auth/register" -Method POST -Body $body -ContentType "application/json"
```

### 2. Fazer login:

```powershell
$body = @{
   email = "test@krouva.com"  # transição
    password = "senha123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3333/api/v1/auth/login" -Method POST -Body $body -ContentType "application/json"

# Salvar token
$token = $response.data.token
```

### 3. Consultar perfil:

```powershell
$headers = @{
    Authorization = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:3333/api/v1/auth/me" -Method GET -Headers $headers
```

### 4. Consultar wallet:

```powershell
Invoke-RestMethod -Uri "http://localhost:3333/api/v1/wallet" -Method GET -Headers $headers
```

### 5. Listar boosters disponíveis:

```powershell
Invoke-RestMethod -Uri "http://localhost:3333/api/v1/boosters"
```

---

## 9️⃣ Verificar Logs

### Logs da aplicação:

```bash
# Modo dev (com watch)
npm run dev

# Verificar erros de conexão:
# - ❌ Supabase não conectado → verificar SUPABASE_URL
# - ❌ Redis não conectado → verificar REDIS_HOST
# - ✅ Tudo OK → servidor iniciado
```

---

## 🔟 Deploy (Produção)

### Opções recomendadas:

1. **Railway** (mais fácil)
   - GitHub deploy automático
   - Postgres + Redis inclusos
   - [railway.app](https://railway.app)

2. **Render** (grátis)
   - Web service + Redis
   - [render.com](https://render.com)

3. **Fly.io** (escalável)
   - Docker deploy
   - [fly.io](https://fly.io)

4. **DigitalOcean App Platform**
   - PostgreSQL gerenciado
   - [digitalocean.com](https://digitalocean.com)

---

## ✅ Checklist de Setup

- [ ] Projeto Supabase criado
- [ ] Migration aplicada (14 tabelas criadas)
- [ ] Seeds aplicados (1 booster + 6 cards)
- [ ] Redis conectado (local ou cloud)
- [ ] `.env` configurado com credenciais reais
- [ ] `npm install` executado
- [ ] Servidor rodando (`npm run dev`)
- [ ] Health check respondendo
- [ ] Registro de usuário funcionando
- [ ] Login retornando JWT
- [ ] Wallet criada automaticamente

---

## 🐛 Troubleshooting

### Erro: "Cannot connect to Supabase"

```bash
# Verificar URL
echo $env:SUPABASE_URL  # PowerShell
# Deve começar com https://

# Verificar service key
echo $env:SUPABASE_SERVICE_KEY | Select-String "eyJ"
# Deve começar com eyJ
```

### Erro: "Redis connection refused"

```bash
# Verificar se Redis está rodando
# Local:
docker ps | Select-String "redis"

# Cloud:
# Testar conexão manual com redis-cli ou RedisInsight
```

### Erro: "JWT_SECRET is not defined"

```bash
# Gerar novo secret
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Adicionar no .env
JWT_SECRET=<resultado-aqui>
```

---

## 📚 Próximos Passos Após Setup

1. **Testar todos os endpoints** com Postman/Insomnia
2. **Implementar algoritmo completo de booster** (modos visuais + Godmode)
3. **Deploy do contrato ERC-1155** na Polygon
4. **Configurar workers BullMQ** para processar filas
5. **Adicionar mais cartas** da Edição 01
6. **Implementar frontend** (React/Next.js)

---

🃏 **Krouva Labs** — _"Caos é tendência. Tendência vira entidade."_
