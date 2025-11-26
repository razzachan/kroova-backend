# Phase 1 Validator: Auth + Wallet
# Usage: npm run validate:phase1

param(
    [string]$BaseUrl = "http://127.0.0.1:3333"
)

Write-Host "KROUVA API - Phase 1 (Auth+Wallet)" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

function Fail($msg) {
    Write-Host "❌ $msg" -ForegroundColor Red
    exit 1
}

# 1) Health
Write-Host "1) Health check..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$BaseUrl/health" -Method GET -TimeoutSec 3
    if (-not $health.ok) { Fail "Health endpoint returned not ok" }
    Write-Host "✅ Health OK" -ForegroundColor Green
} catch {
    Fail "API not reachable at $BaseUrl. Start with: npm run start"
}

# 2) Register (or login fallback)
$testEmail = "test@krouva.com"
$testPassword = "senha123"
$token = $null
$refresh = $null
Write-Host "2) Register user..." -ForegroundColor Yellow
try {
    $registerBody = @{ email = $testEmail; password = $testPassword; name = "Usuario Teste" } | ConvertTo-Json
    $register = Invoke-RestMethod -Uri "$BaseUrl/api/v1/auth/register" -Method POST -Body $registerBody -ContentType "application/json"
    $token = $register.data.access_token
    $refresh = $register.data.refresh_token
    Write-Host "✅ Registered: $($register.data.user.email)" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Register failed, trying login..." -ForegroundColor Yellow
    try {
        $loginBody = @{ email = $testEmail; password = $testPassword } | ConvertTo-Json
        $login = Invoke-RestMethod -Uri "$BaseUrl/api/v1/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
        $token = $login.data.access_token
        $refresh = $login.data.refresh_token
        Write-Host "✅ Login OK" -ForegroundColor Green
    } catch {
        Fail "Login failed: $($_.Exception.Message)"
    }
}

if (-not $token) { Fail "Missing access token" }

$headers = @{ Authorization = "Bearer $token"; "Content-Type" = "application/json" }

# 3) Me
Write-Host "3) Get profile..." -ForegroundColor Yellow
try {
    $me = Invoke-RestMethod -Uri "$BaseUrl/api/v1/auth/me" -Method GET -Headers $headers
    Write-Host "✅ User: $($me.data.email) / ID: $($me.data.display_id)" -ForegroundColor Green
} catch {
    Fail "Profile fetch failed: $($_.Exception.Message)"
}

# 4) Wallet
Write-Host "4) Wallet balances..." -ForegroundColor Yellow
try {
    $wallet = Invoke-RestMethod -Uri "$BaseUrl/api/v1/wallet" -Method GET -Headers $headers
    Write-Host "✅ BRL: R$ $($wallet.data.balance_brl) | Crypto: $($wallet.data.balance_crypto)" -ForegroundColor Green
} catch {
    Fail "Wallet fetch failed: $($_.Exception.Message)"
}

# 5) Transactions
Write-Host "5) Transactions..." -ForegroundColor Yellow
try {
    $tx = Invoke-RestMethod -Uri "$BaseUrl/api/v1/wallet/transactions" -Method GET -Headers $headers
    $count = $tx.data.transactions.Length
    Write-Host "✅ Transactions: $count" -ForegroundColor Green
} catch {
    Fail "Transactions fetch failed: $($_.Exception.Message)"
}

Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "🎉 Phase 1 validator passed" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
