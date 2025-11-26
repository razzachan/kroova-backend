# Dev Deposit Script - adds BRL balance using /wallet/deposit/dev
param(
  [string]$BaseUrl = "http://127.0.0.1:3333",
  [int]$Amount = 250
)

Write-Host "KROUVA - Dev Deposit" -ForegroundColor Cyan
Write-Host "Using $BaseUrl amount R$ $Amount" -ForegroundColor Cyan

function Fail($m){ Write-Host "❌ $m" -ForegroundColor Red; exit 1 }

# Ensure health
try { $h = Invoke-RestMethod -Uri "$BaseUrl/health" -Method GET -TimeoutSec 3; if(-not $h.ok){ Fail "Health not ok" } } catch { Fail "Server unreachable" }

$email = "test@krouva.com"
$userPassword = "senha123"
$token = $null

# Register or login
try {
  $reg = @{ email = $email; password = $userPassword; name = "Usuario Teste" } | ConvertTo-Json
  $r = Invoke-RestMethod -Uri "$BaseUrl/api/v1/auth/register" -Method POST -Body $reg -ContentType "application/json"
  $token = $r.data.access_token
  Write-Host "Registered user" -ForegroundColor Green
} catch {
  $loginBody = @{ email = $email; password = $userPassword } | ConvertTo-Json
  $l = Invoke-RestMethod -Uri "$BaseUrl/api/v1/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
  $token = $l.data.access_token
  Write-Host "Logged in user" -ForegroundColor Green
}
if(-not $token){ Fail "Missing token" }
$headers = @{ Authorization = "Bearer $token"; "Content-Type" = "application/json" }

# Perform deposit
try {
  $body = @{ amount_brl = $Amount } | ConvertTo-Json
  $dep = Invoke-RestMethod -Uri "$BaseUrl/api/v1/wallet/deposit/dev" -Method POST -Headers $headers -Body $body -ContentType "application/json"
  Write-Host "✅ New BRL Balance: R$ $($dep.data.balance_brl)" -ForegroundColor Green
} catch { Fail "Deposit failed: $($_.Exception.Message)" }

# Show wallet
try {
  $wallet = Invoke-RestMethod -Uri "$BaseUrl/api/v1/wallet" -Method GET -Headers $headers
  Write-Host "Wallet BRL: R$ $($wallet.data.balance_brl)" -ForegroundColor Yellow
} catch { Write-Host "⚠️ Wallet fetch failed" -ForegroundColor DarkYellow }

Write-Host "Done." -ForegroundColor Cyan
