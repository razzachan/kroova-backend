# 🚀 Krouva Supabase Setup

Use este guia para conectar o backend à instância real do Supabase e abandonar o stub in-memory.

## 1. Criar Projeto
1. Acesse https://supabase.com e crie um projeto (anote o `project ref`).
2. Vá em: Project Settings → API e copie:
   - URL (ex: https://xxxxx.supabase.co)
   - anon key
   - service role key

## 2. Instalar CLI
```powershell
scoop install supabase
supabase login
```
(Irá abrir o browser para autenticar.)

## 3. Linkar Projeto
Dentro da pasta `C:\Kroova`:
```powershell
supabase link --project-ref YOUR_PROJECT_REF
```
Isso escreve `.supabase/config.toml` com o ref.

## 4. Migrar Schema
Migração inicial já criada em `supabase/migrations/0001_init.sql`.
```powershell
npm run db:push
```
Confirme no dashboard se as tabelas existem.

## 5. Seed Básico
```powershell
npm run db:seed
```
Isso insere booster types e cartas base iniciais.

## 6. Configurar `.env`
Copie `.env.example` → `.env` e ajuste:
```dotenv
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=xxxxxxxx
SUPABASE_SERVICE_KEY=xxxxxxxx
SUPABASE_STUB_ENABLED=false
JWT_SECRET=uma-chave-forte
ENCRYPTION_KEY=32-byte-key-for-AES------------
```

## 7. Iniciar Backend
```powershell
npm run build
npm run start
```
Ou para desenvolvimento com reload:
```powershell
npm run dev
```
Você deve ver logs:
```
[supabase] connectivity ok booster_types_count_hint=2
```
E a porta deve permanecer viva.

## 8. Validar Fluxos
```powershell
npm run validate:phase1
npm run validate:boosters
npm run validate:market
```
Todos devem funcionar sem erros de stub.

## 9. Testes Com Stub (Opcional)
Se quiser voltar ao modo in-memory para testes rápidos:
```dotenv
SUPABASE_STUB_ENABLED=true
```
(Não recomendado para QA final.)

## 10. Próximos Ajustes
- Ajustar serviços para remover qualquer branch de "test mode" se ainda houver (ver `auth.service.ts`, `booster.service.ts`).
- Adicionar políticas RLS no Supabase (fase posterior de segurança).
- Criar migrações incrementais para novos campos (ex: indices de performance ou tracking adicional).

## 11. Reset (CUIDADO)
```powershell
npm run db:reset
npm run db:push
npm run db:seed
```
Recria todo o estado (não usar em produção).

---
Se quiser que eu elimine trechos de código de "test mode" agora, peça diretamente. ✅
