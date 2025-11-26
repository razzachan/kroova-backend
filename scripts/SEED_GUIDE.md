# ============================================
# KROOVA - GUIA RÁPIDO DE SEED
# ============================================

## Opção 1: Via Dashboard (MAIS FÁCIL)

1. Acesse: https://supabase.com/dashboard/project/mmcytphoeyxeylvaqjgr

2. No menu lateral, clique em "SQL Editor"

3. Na parte superior, procure por um botão "+ New query" ou simplesmente
   terá uma caixa grande de texto para colar SQL

4. Copie TODO o conteúdo do arquivo: scripts/seed-test-data.sql
   - Abra o arquivo no VS Code
   - Ctrl+A para selecionar tudo
   - Ctrl+C para copiar

5. Cole no editor SQL do Supabase

6. Clique em "RUN" (botão verde) ou aperte Ctrl+Enter

7. Você verá no final:
   ✅ Booster Types: 3
   ✅ Cards Base: 12
   ✅ Cards Instances: 10
   ✅ Market Listings: 8

---

## Opção 2: Via psql (se tiver PostgreSQL instalado)

1. Edite o arquivo scripts/run-seed.ps1
   - Adicione sua senha do Supabase

2. Execute:
   ```powershell
   .\scripts\run-seed.ps1
   ```

---

## Depois do Seed:

### 1. Criar conta de teste:
   - Acesse: https://frontend-6lxaipjgp-razzachans-projects.vercel.app
   - Clique em "Criar conta"
   - Use um email válido
   - Verifique o email para confirmar

### 2. Adicionar saldo:
   - Volte ao SQL Editor do Supabase
   - Execute:
   ```sql
   -- Ver seu user_id
   SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 1;
   
   -- Adicionar 1000 USDC (substitua o UUID)
   UPDATE wallets 
   SET balance_usdc = 1000.00 
   WHERE user_id = 'SEU_USER_ID_AQUI';
   
   -- Verificar
   SELECT * FROM wallets WHERE user_id = 'SEU_USER_ID_AQUI';
   ```

### 3. Testar!
   - Login no site
   - Vá ao Marketplace (deve ter 8 cartas)
   - Compre uma carta
   - Vá ao Inventário (sua carta estará lá)
   - Compre um Booster
   - Venda uma carta no Marketplace

---

## URLs Importantes:

- **Frontend**: https://frontend-6lxaipjgp-razzachans-projects.vercel.app
- **Backend**: https://krouva-production.up.railway.app
- **Supabase Dashboard**: https://supabase.com/dashboard/project/mmcytphoeyxeylvaqjgr
- **SQL Editor**: Supabase Dashboard → SQL Editor (menu lateral)

---

## Não encontra o SQL Editor?

Procure no menu lateral esquerdo do Supabase Dashboard por:
- "SQL Editor" OU
- Ícone de </> (código)
- Pode estar dentro de "Database" → "SQL Editor"

Se ainda não achar, me fale e eu crio outra solução!
