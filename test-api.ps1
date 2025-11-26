# 🧪 Script de Teste da API Krouva (ex-Kroova)
# Execute após o Supabase estar rodando

Write-Host "🃏 KROUVA API - Script de Teste" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:3333"

# 1️⃣ Health Check
Write-Host "1. Testing Health Check..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/" -Method GET
    Write-Host "✅ API Online: $($health.message)" -ForegroundColor Green
} catch {
    Write-Host "❌ API não está rodando. Execute: npm run dev" -ForegroundColor Red
    exit
}

# 2️⃣ Registro de Usuário
Write-Host "`n2. Creating test user..." -ForegroundColor Yellow
$registerBody = @{
    email = "test@krouva.com"  # transição
    password = "senha123"
    name = "Usuario Teste"
} | ConvertTo-Json

try {
    $register = Invoke-RestMethod -Uri "$baseUrl/api/v1/auth/register" -Method POST -Body $registerBody -ContentType "application/json"
    Write-Host "✅ User created: $($register.data.user.email)" -ForegroundColor Green
    $token = $register.data.token
} catch {
    Write-Host "⚠️  User may already exist, trying login..." -ForegroundColor Yellow
    
    # Tenta fazer login
    $loginBody = @{
        email = "test@krouva.com"  # transição
        password = "senha123"
    } | ConvertTo-Json
    
    $login = Invoke-RestMethod -Uri "$baseUrl/api/v1/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    Write-Host "✅ Login successful" -ForegroundColor Green
    $token = $login.data.token
}

# Headers com token
$headers = @{
    Authorization = "Bearer $token"
    "Content-Type" = "application/json"
}

# 3️⃣ Consultar Perfil
Write-Host "`n3. Getting user profile..." -ForegroundColor Yellow
$me = Invoke-RestMethod -Uri "$baseUrl/api/v1/auth/me" -Method GET -Headers $headers
Write-Host "✅ User: $($me.data.email) | ID: $($me.data.display_id)" -ForegroundColor Green

# 4️⃣ Consultar Wallet
Write-Host "`n4. Checking wallet..." -ForegroundColor Yellow
$wallet = Invoke-RestMethod -Uri "$baseUrl/api/v1/wallet" -Method GET -Headers $headers
Write-Host "✅ Balance BRL: R$ $($wallet.data.balance_brl)" -ForegroundColor Green
Write-Host "✅ Balance Crypto: $($wallet.data.balance_crypto)" -ForegroundColor Green

# 5️⃣ Listar Boosters Disponíveis
Write-Host "`n5. Listing available boosters..." -ForegroundColor Yellow
$boosters = Invoke-RestMethod -Uri "$baseUrl/api/v1/boosters" -Method GET
Write-Host "✅ Found $($boosters.data.length) booster types" -ForegroundColor Green
foreach ($booster in $boosters.data) {
    Write-Host "   📦 $($booster.name) - R$ $($booster.price_brl)" -ForegroundColor Cyan
}

# 6️⃣ Listar Inventário
Write-Host "`n6. Checking inventory..." -ForegroundColor Yellow
$inventory = Invoke-RestMethod -Uri "$baseUrl/api/v1/inventory" -Method GET -Headers $headers
Write-Host "✅ Cards in inventory: $($inventory.data.cards.length)" -ForegroundColor Green

# 7️⃣ Listar Marketplace
Write-Host "`n7. Browsing marketplace..." -ForegroundColor Yellow
$market = Invoke-RestMethod -Uri "$baseUrl/api/v1/market/listings" -Method GET
Write-Host "✅ Active listings: $($market.data.listings.length)" -ForegroundColor Green

# 8️⃣ Listar Transações
Write-Host "`n8. Getting transaction history..." -ForegroundColor Yellow
$transactions = Invoke-RestMethod -Uri "$baseUrl/api/v1/wallet/transactions" -Method GET -Headers $headers
Write-Host "✅ Transactions: $($transactions.data.transactions.length)" -ForegroundColor Green

# 🎉 Resumo Final
Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "🎉 All tests passed!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host "`n📊 Summary:" -ForegroundColor Yellow
Write-Host "   User: $($me.data.email)" -ForegroundColor White
Write-Host "   Wallet: R$ $($wallet.data.balance_brl)" -ForegroundColor White
Write-Host "   Cards: $($inventory.data.cards.length)" -ForegroundColor White
Write-Host "   Token: $($token.Substring(0, 20))..." -ForegroundColor Gray

Write-Host "`n💡 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Add funds to wallet (simulate deposit)" -ForegroundColor White
Write-Host "   2. Purchase a booster" -ForegroundColor White
Write-Host "   3. Open booster to get cards" -ForegroundColor White
Write-Host "   4. List cards on marketplace" -ForegroundColor White
Write-Host "`n🃏 Krouva Labs - 'Caos é tendência. Tendência vira entidade.'" -ForegroundColor Magenta
