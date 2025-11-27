# 📋 Sprint 1: Deploy e Testes

## ✅ BACKEND COMPLETO - PRONTO PARA DEPLOY

---

## 🚀 FASE 1: APLICAR MIGRATION (15 min)

1. Abrir [Supabase Dashboard](https://supabase.com/dashboard)
2. SQL Editor → New Query
3. Colar conteúdo de `scripts/migrations/001_edition_lifecycle.sql`
4. Executar (Run)
5. Verificar sucesso:

```sql
-- Verificar tabelas criadas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('edition_configs', 'edition_metrics', 'user_pity_counter');

-- Verificar ED01 seed
SELECT * FROM edition_configs WHERE id = 'ED01';

-- Verificar 9 booster types (5 tiers + 4 packs)
SELECT id, name, price_brl, price_multiplier FROM booster_types WHERE edition_id = 'ED01';
```

---

## 🚀 FASE 2: DEPLOY BACKEND (10 min)

```powershell
cd C:\Kroova\frontend
git add .
git commit -m "feat: Sprint 1 - 3-layer booster system + pity + hard cap"
git push origin main
```

Aguardar deploy automático no Vercel → Verificar logs

---

## 🧪 FASE 3: TESTES DE VALIDAÇÃO

### **Teste 1: Boosters Endpoint**
```powershell
$boosters = curl.exe -s https://frontend-mg8f07i85-razzachans-projects.vercel.app/api/v1/boosters | ConvertFrom-Json
$boosters.data | Select-Object name, price_brl, resgate_maximo, rtp_target | Format-Table
```

**Esperado:**
- Básico: `resgate_maximo: 200`
- Whale: `resgate_maximo: 4000`
- RTP: `0.30` (30%)

---

### **Teste 2: Comprar + Abrir Booster**
```powershell
# 1. Login
$login = curl.exe -s -X POST https://frontend-mg8f07i85-razzachans-projects.vercel.app/api/v1/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"akroma.julio@gmail.com","password":"SUA_SENHA"}' | ConvertFrom-Json

$token = $login.data.session.access_token

# 2. Comprar booster Whale
$purchase = curl.exe -s -X POST https://frontend-mg8f07i85-razzachans-projects.vercel.app/api/v1/boosters/purchase `
  -H "Authorization: Bearer $token" `
  -H "Content-Type: application/json" `
  -d '{"booster_type_id":"ed01-whale","quantity":1}' | ConvertFrom-Json

$openingId = $purchase.data.openings[0].id

# 3. Abrir booster
$open = curl.exe -s -X POST https://frontend-mg8f07i85-razzachans-projects.vercel.app/api/v1/boosters/open `
  -H "Authorization: Bearer $token" `
  -H "Content-Type: application/json" `
  -d "{`"opening_id`":`"$openingId`"}" | ConvertFrom-Json

# Ver cartas
$open.data.cards | Select-Object @{N='card_name';E={$_.card.name}}, @{N='rarity';E={$_.card.rarity}}, skin, is_godmode, liquidity_brl | Format-Table
```

**Esperado:**
- 5 cartas geradas
- Skins variadas (default, neon, glow, glitch, ghost, holo, dark)
- 1% chance de `is_godmode: true`
- `liquidity_brl` calculado corretamente

---

### **Teste 3: Pity Counter**
```powershell
$userId = "15f2efb3-f1e6-4146-b35c-41d93f32d569"
$pity = curl.exe -s "https://frontend-mg8f07i85-razzachans-projects.vercel.app/api/v1/pity/$userId`?edition_id=ED01" `
  -H "Authorization: Bearer $token" | ConvertFrom-Json

$pity.data
```

**Esperado:**
- `counter`: número de boosters abertos
- `remaining`: 100 - counter
- Incrementa a cada abertura

---

## 📊 QUERIES ÚTEIS

### **Ver RTP Atual**
```sql
SELECT 
  ec.id,
  ec.total_revenue,
  ec.total_jackpots_paid,
  ROUND((ec.total_jackpots_paid / NULLIF(ec.total_revenue, 0)) * 100, 2) AS payout_pct,
  ec.jackpot_hard_cap * 100 AS hard_cap_pct,
  CASE 
    WHEN (ec.total_jackpots_paid / NULLIF(ec.total_revenue, 0)) >= ec.jackpot_hard_cap 
    THEN '⚠️ CAP ATINGIDO'
    ELSE '✅ OK'
  END AS status
FROM edition_configs ec
WHERE ec.id = 'ED01';
```

### **Ver Últimas Aberturas com Liquidez**
```sql
SELECT 
  bo.created_at,
  u.email,
  bt.name AS booster,
  bt.price_brl,
  COALESCE((
    SELECT SUM(ci.liquidity_brl) 
    FROM cards_instances ci 
    WHERE ci.id = ANY(bo.cards_received)
  ), 0) AS total_liquidity,
  COALESCE((
    SELECT COUNT(*) 
    FROM cards_instances ci 
    WHERE ci.id = ANY(bo.cards_received) AND ci.is_godmode = TRUE
  ), 0) AS godmodes
FROM booster_openings bo
JOIN users u ON u.id = bo.user_id
JOIN booster_types bt ON bt.id = bo.booster_type_id
ORDER BY bo.created_at DESC
LIMIT 10;
```

### **Ver Distribuição de Skins**
```sql
SELECT 
  skin,
  COUNT(*) AS count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) AS percentage
FROM cards_instances
WHERE edition_id = 'ED01'
GROUP BY skin
ORDER BY count DESC;
```

---

## 🎯 PRÓXIMOS PASSOS (Sprint 2)

### **Frontend UI Updates**
- Atualizar `/boosters` page: mostrar `resgate_maximo` em destaque
- Criar `PityBar` component (barra 0-100)
- Opening animation (card flip 3D)
- Sound effects por raridade

**Backend pronto! Quer aplicar a migration ou prefere que eu faça?**
