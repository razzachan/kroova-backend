# ============================================================================
# GUIA RÁPIDO: Configurar CORS via Supabase CLI/API
# ============================================================================

## Método 1: Via Dashboard (MAIS RÁPIDO - 2 minutos) ✅

1. Acesse: https://supabase.com/dashboard/project/mmcytphoeyxeylvaqjgr/auth/url-configuration

2. **Site URL:** 
   ```
   https://frontend-razzachans-projects.vercel.app
   ```

3. **Additional Redirect URLs** (Cole todas de uma vez, separadas por vírgula):
   ```
   https://frontend-razzachans-projects.vercel.app/**,
   https://frontend-cyan-nine-hl1m0yayym.vercel.app/**,
   https://frontend-razzachan-razzachans-projects.vercel.app/**,
   http://localhost:3000/**
   ```

4. Clique em **Save** → Aguarde 30 segundos → Teste login

---

## Método 2: Via Management API (Script PowerShell)

### Passo 1: Obter Access Token
1. Acesse: https://supabase.com/dashboard/account/tokens
2. Clique **Generate New Token**
3. Copie o token

### Passo 2: Executar Script
```powershell
# Defina o token
$env:SUPABASE_ACCESS_TOKEN = "sbp_seu_token_aqui"

# Execute o script
.\fix-cors-via-api.ps1
```

---

## Método 3: Via cURL (Manual)

### Windows PowerShell:
```powershell
$PROJECT_REF = "mmcytphoeyxeylvaqjgr"
$TOKEN = "seu-token-aqui"

$body = @{
    site_url = "https://frontend-razzachans-projects.vercel.app"
    additional_redirect_urls = @(
        "https://frontend-razzachans-projects.vercel.app/**",
        "https://frontend-cyan-nine-hl1m0yayym.vercel.app/**",
        "https://frontend-razzachan-razzachans-projects.vercel.app/**",
        "http://localhost:3000/**"
    )
} | ConvertTo-Json

Invoke-RestMethod `
    -Uri "https://api.supabase.com/v1/projects/$PROJECT_REF/config/auth" `
    -Method PATCH `
    -Headers @{
        "Authorization" = "Bearer $TOKEN"
        "Content-Type" = "application/json"
    } `
    -Body $body
```

### Linux/Mac (bash):
```bash
curl -X PATCH \
  https://api.supabase.com/v1/projects/mmcytphoeyxeylvaqjgr/config/auth \
  -H "Authorization: Bearer seu-token-aqui" \
  -H "Content-Type: application/json" \
  -d '{
    "site_url": "https://frontend-razzachans-projects.vercel.app",
    "additional_redirect_urls": [
      "https://frontend-razzachans-projects.vercel.app/**",
      "https://frontend-cyan-nine-hl1m0yayym.vercel.app/**",
      "https://frontend-razzachan-razzachans-projects.vercel.app/**",
      "http://localhost:3000/**"
    ]
  }'
```

---

## Método 4: Via SQL (Limitado - apenas para verificar)

**NOTA:** O Supabase não expõe `auth.config` via SQL público por segurança.
Mas você pode verificar as configs atuais (se tiver permissões):

```sql
-- Conecte via psql ou Supabase SQL Editor com service_role
SELECT name, value 
FROM auth.config 
WHERE name IN ('site_url', 'additional_redirect_urls');
```

---

## ⚡ RECOMENDAÇÃO

**Use o Método 1 (Dashboard)** - É o mais rápido e confiável!

Tempo total: **2 minutos**
- 1 min: Copiar/colar URLs no Dashboard
- 30s: Propagação
- 30s: Testar login

---

## 🧪 Testar Após Configurar

```javascript
// Console do navegador em: https://frontend-razzachans-projects.vercel.app
fetch('https://mmcytphoeyxeylvaqjgr.supabase.co/auth/v1/health', {
  method: 'GET'
}).then(r => r.json()).then(console.log)

// Deve retornar: {name: "GoTrue", version: "...", ...}
// Se retornar CORS error, aguarde mais 30s
```

---

## 📚 Referências

- Supabase Auth Config API: https://supabase.com/docs/reference/api/auth-config
- Management API Docs: https://supabase.com/docs/reference/api/introduction
- CLI Auth Commands: https://supabase.com/docs/guides/cli/managing-config#auth

---

**Última atualização:** 2025-12-05  
**Projeto:** Kroova (mmcytphoeyxeylvaqjgr)
