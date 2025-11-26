# 🧪 Guia de Testes - Krouva CCG

## 📋 Pré-requisitos

### 1. Popular o Banco de Dados
Execute o script SQL no **Supabase Dashboard > SQL Editor**:
```
c:\Kroova\scripts\seed-test-data.sql
```

Este script irá criar:
- ✅ 3 tipos de boosters (Básico, Premium, Lendário)
- ✅ 12 cartas base (comuns, raras, épicas, lendárias)
- ✅ 10 instâncias de cartas mintadas
- ✅ 8 cartas listadas no marketplace

### 2. Criar Usuário de Teste
Depois de executar o seed, você precisa criar um usuário real no sistema.

## 🎮 Fluxo de Teste Completo

### Passo 1: Criar Conta
1. Acesse: https://frontend-6lxaipjgp-razzachans-projects.vercel.app
2. Será redirecionado para `/login`
3. Clique em **"Não tem conta? Criar conta"**
4. Use um email válido (ex: `teste@kroova.com`)
5. Senha mínima de 6 caracteres
6. Clique em **"Criar Conta"**
7. ⚠️ **Importante**: Verifique seu email para confirmar a conta

### Passo 2: Adicionar Saldo Inicial
Como ainda não temos sistema de pagamento, adicione saldo manualmente no Supabase:

```sql
-- Execute no Supabase SQL Editor
-- Substitua 'SEU_USER_ID' pelo UUID do seu usuário

-- 1. Encontre seu user_id
SELECT id, email FROM auth.users WHERE email = 'teste@kroova.com';

-- 2. Adicione 1000 USDC ao seu saldo
UPDATE wallets 
SET balance_usdc = 1000.00 
WHERE user_id = 'SEU_USER_ID_AQUI';

-- 3. Verifique o saldo
SELECT * FROM wallets WHERE user_id = 'SEU_USER_ID_AQUI';
```

### Passo 3: Login e Dashboard
1. Faça login com as credenciais criadas
2. Você será redirecionado para `/dashboard`
3. Verifique os cards:
   - 💰 **Wallet**: Deve mostrar `1000.00 USDC`
   - 🃏 **Cartas**: `0` (ainda não comprou)
   - 🛒 **Marketplace**: Explorar
   - 📦 **Boosters**: Comprar

### Passo 4: Comprar Cartas no Marketplace
1. Clique em **"Marketplace"** ou acesse `/marketplace`
2. Você verá 8 cartas disponíveis com preços de 1 a 500 USDC
3. Escolha uma carta e clique em **"Comprar"**
4. Confirme a compra
5. ✅ Sucesso: "Carta comprada com sucesso! 🎉"
6. A carta desaparece do marketplace

**O que acontece no backend:**
- Saldo deduzido da wallet
- Carta transferida para seu inventário
- Listing removido do marketplace
- Transação registrada

### Passo 5: Verificar Inventário
1. Clique em **"Inventário"** ou acesse `/inventory`
2. Veja a carta que você comprou
3. Detalhes visíveis:
   - Nome da carta
   - Raridade (cor diferente por tipo)
   - Custo de energia ⚡
   - Ataque ⚔️ e Defesa 🛡️
   - Número da edição (#1/100)
   - Habilidade
   - Data de aquisição

### Passo 6: Vender Carta no Marketplace
1. No inventário, clique em **"Vender no Marketplace"**
2. Digite um preço (ex: `20`)
3. Clique em **"Confirmar"**
4. ✅ Sucesso: "Carta listada no marketplace! 🎉"
5. A carta desaparece do seu inventário
6. Volte ao marketplace e veja sua carta à venda

### Passo 7: Comprar Booster
1. Clique em **"Boosters"** ou acesse `/boosters`
2. Escolha um booster:
   - **Booster Básico**: 5 USDC → 5 cartas
   - **Booster Premium**: 15 USDC → 10 cartas
   - **Booster Lendário**: 50 USDC → 15 cartas
3. Clique em **"Comprar"**
4. Confirme a compra
5. 🎬 **Animação**: Booster abrindo com cartas aparecendo
6. ✅ Sucesso: "Parabéns! Você recebeu X cartas!"
7. Volte ao inventário para ver suas novas cartas

**O que acontece no backend:**
- Saldo deduzido
- Algoritmo rola raridades baseado em pesos
- Cartas são mintadas e adicionadas ao inventário
- Booster_opening registrado

### Passo 8: Verificar Wallet
1. Clique em **"Wallet"** ou acesse `/wallet`
2. Veja seu saldo atualizado
3. Histórico de transações:
   - ➖ Compra de carta no marketplace
   - ➖ Compra de booster
   - ➕ Venda de carta (se vendeu)
4. Cada transação mostra:
   - Descrição
   - Valor (vermelho = débito, verde = crédito)
   - Data e hora

### Passo 9: Ciclo Completo
Teste o ciclo econômico completo:
1. Compre 3 boosters diferentes → Abra cartas
2. Venda 2 cartas comuns no marketplace
3. Compre 1 carta rara de outro listing
4. Verifique o histórico de transações
5. Confirme que o saldo está correto

## 🔍 Verificações no Banco

### Ver todas as cartas no marketplace:
```sql
SELECT 
  ml.id AS listing_id,
  cb.name AS card_name,
  cb.rarity,
  ml.price,
  ci.mint_number,
  ci.total_minted,
  ml.seller_id,
  ml.status
FROM market_listings ml
JOIN cards_instances ci ON ml.card_instance_id = ci.id
JOIN cards_base cb ON ci.card_base_id = cb.id
WHERE ml.status = 'active'
ORDER BY ml.price DESC;
```

### Ver inventário de um usuário:
```sql
SELECT 
  ui.id,
  cb.name AS card_name,
  cb.rarity,
  ci.mint_number,
  ci.total_minted,
  ui.acquired_at
FROM user_inventory ui
JOIN cards_instances ci ON ui.card_instance_id = ci.id
JOIN cards_base cb ON ci.card_base_id = cb.id
WHERE ui.user_id = 'SEU_USER_ID'
ORDER BY ui.acquired_at DESC;
```

### Ver transações de um usuário:
```sql
SELECT 
  id,
  type,
  amount,
  description,
  created_at
FROM transactions
WHERE user_id = 'SEU_USER_ID'
ORDER BY created_at DESC;
```

### Ver boosters abertos:
```sql
SELECT 
  bo.id,
  bt.name AS booster_name,
  bo.cards_received,
  bo.opened_at
FROM booster_openings bo
JOIN booster_types bt ON bo.booster_type_id = bt.id
WHERE bo.user_id = 'SEU_USER_ID'
ORDER BY bo.opened_at DESC;
```

## 🎯 Casos de Teste

### ✅ Casos de Sucesso

| # | Teste | Resultado Esperado |
|---|-------|-------------------|
| 1 | Criar conta com email válido | Conta criada, email de confirmação enviado |
| 2 | Login com credenciais corretas | Redirecionado para dashboard |
| 3 | Comprar carta com saldo suficiente | Carta comprada, saldo deduzido, carta no inventário |
| 4 | Vender carta do inventário | Carta listada no marketplace, removida do inventário |
| 5 | Comprar booster com saldo | Animação de abertura, cartas adicionadas ao inventário |
| 6 | Ver histórico de transações | Todas as transações listadas em ordem cronológica |
| 7 | Logout | Sessão encerrada, redirecionado para login |

### ❌ Casos de Erro

| # | Teste | Resultado Esperado |
|---|-------|-------------------|
| 1 | Comprar carta sem saldo | Erro: "Saldo insuficiente" |
| 2 | Comprar booster sem saldo | Erro: "Saldo insuficiente" |
| 3 | Vender carta com preço inválido | Erro: "Digite um preço válido" |
| 4 | Acessar página protegida sem login | Redirecionado para /login |
| 5 | Login com senha errada | Erro: "Credenciais inválidas" |

## 🐛 Troubleshooting

### Problema: "Saldo insuficiente" mas tenho saldo
**Solução**: Verifique se o RLS está aplicado corretamente:
```sql
-- Verificar policies da wallet
SELECT * FROM pg_policies WHERE tablename = 'wallets';

-- Verificar se o user_id está correto
SELECT user_id, balance_usdc FROM wallets WHERE user_id = 'SEU_USER_ID';
```

### Problema: Não vejo cartas no marketplace
**Solução**: Execute o seed novamente:
```bash
# No Supabase SQL Editor
\i c:\Kroova\scripts\seed-test-data.sql
```

### Problema: Erro 401 nas requisições
**Solução**: 
1. Faça logout e login novamente
2. Verifique se o JWT não expirou
3. Confirme que o email foi verificado

### Problema: Booster não abre
**Solução**: Verifique os logs do backend:
```bash
# Railway CLI
railway logs
```

## 📊 Métricas de Performance

### Tempos esperados:
- Login: < 1 segundo
- Carregar marketplace: < 2 segundos
- Comprar carta: < 1 segundo
- Abrir booster: 3 segundos (animação)
- Carregar inventário: < 2 segundos

### Limites:
- Cartas por página: Todas (sem paginação ainda)
- Tamanho máximo de transação: 10.000 USDC
- Boosters por compra: 1 (sem bulk ainda)

## 🚀 Próximos Passos

Após testar tudo:
1. [ ] Implementar paginação no marketplace
2. [ ] Adicionar filtros (raridade, preço)
3. [ ] Sistema de depósito real (Stripe/Crypto)
4. [ ] Melhorar animação de abertura de boosters
5. [ ] Modal de detalhes da carta
6. [ ] Sistema de trade entre usuários
7. [ ] Notificações em tempo real
8. [ ] Responsividade mobile

---

**Status**: ✅ Sistema completo e funcional
**URL Frontend**: https://frontend-6lxaipjgp-razzachans-projects.vercel.app
**URL Backend**: https://krouva-production.up.railway.app
**Banco**: Supabase (RLS ativo)
