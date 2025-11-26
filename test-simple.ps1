# Teste Rápido da API Krouva (ex-Kroova)
$baseUrl = "http://localhost:3333"

Write-Host "1. Health Check..." -ForegroundColor Yellow
$health = Invoke-RestMethod -Uri "$baseUrl/" -Method GET
Write-Host "OK: $($health.message)`n" -ForegroundColor Green

Write-Host "2. Register User..." -ForegroundColor Yellow
$registerBody = @{
    email = "test@krouva.com"  # transição
    password = "senha123"
    name = "Usuario Teste"
} | ConvertTo-Json

try {
    $register = Invoke-RestMethod -Uri "$baseUrl/api/v1/auth/register" -Method POST -Body $registerBody -ContentType "application/json"
    $token = $register.data.token
    Write-Host "OK: User created`n" -ForegroundColor Green
} catch {
    Write-Host "User exists, logging in...`n" -ForegroundColor Yellow
    $loginBody = @{
        email = "test@krouva.com"  # transição
        password = "senha123"
    } | ConvertTo-Json
    $login = Invoke-RestMethod -Uri "$baseUrl/api/v1/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $token = $login.data.token
    Write-Host "OK: Login successful`n" -ForegroundColor Green
}

$headers = @{
    Authorization = "Bearer $token"
}

Write-Host "3. Get Profile..." -ForegroundColor Yellow
$me = Invoke-RestMethod -Uri "$baseUrl/api/v1/auth/me" -Method GET -Headers $headers
Write-Host "OK: $($me.data.email)`n" -ForegroundColor Green

Write-Host "4. Get Wallet..." -ForegroundColor Yellow
$wallet = Invoke-RestMethod -Uri "$baseUrl/api/v1/wallet" -Method GET -Headers $headers
Write-Host "OK: BRL=$($wallet.data.balance_brl) | Crypto=$($wallet.data.balance_crypto)`n" -ForegroundColor Green

Write-Host "5. List Boosters..." -ForegroundColor Yellow
$boosters = Invoke-RestMethod -Uri "$baseUrl/api/v1/boosters" -Method GET
Write-Host "OK: $($boosters.data.Count) types`n" -ForegroundColor Green

Write-Host "6. Get Inventory..." -ForegroundColor Yellow
$inventory = Invoke-RestMethod -Uri "$baseUrl/api/v1/inventory" -Method GET -Headers $headers
Write-Host "OK: $($inventory.data.cards.Count) cards`n" -ForegroundColor Green

Write-Host "7. Browse Market..." -ForegroundColor Yellow
$market = Invoke-RestMethod -Uri "$baseUrl/api/v1/market/listings" -Method GET
Write-Host "OK: $($market.data.listings.Count) listings`n" -ForegroundColor Green

Write-Host "8. Get Transactions..." -ForegroundColor Yellow
$transactions = Invoke-RestMethod -Uri "$baseUrl/api/v1/wallet/transactions" -Method GET -Headers $headers
Write-Host "OK: $($transactions.data.transactions.Count) transactions`n" -ForegroundColor Green

Write-Host "ALL TESTS PASSED!" -ForegroundColor Green
