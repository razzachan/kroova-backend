# Booster Purchase & Open Validator
param(
  [string]$BaseUrl = "http://127.0.0.1:3333",
  [int]$DepositAmount = 500
)

Write-Host "KROUVA - Booster Flow Validator" -ForegroundColor Cyan
Write-Host "Base URL: $BaseUrl" -ForegroundColor Cyan

function Fail($m){ Write-Host "❌ $m" -ForegroundColor Red; exit 1 }
function Info($m){ Write-Host "➡ $m" -ForegroundColor Yellow }
function Ok($m){ Write-Host "✅ $m" -ForegroundColor Green }

# 1) Health
Info "Health check"
try { $h = Invoke-RestMethod -Uri "$BaseUrl/health" -Method GET -TimeoutSec 3; if(-not $h.ok){ Fail "Health not ok" } ; Ok "Health ok" } catch { Fail "Server unreachable: $($_.Exception.Message)" }

# 2) Register/Login
$email = "test@krouva.com"
$pwd = "senha123"
$token = $null
Info "Register user (or login)"
try {
  $regBody = @{ email = $email; password = $pwd; name = "Usuario Teste" } | ConvertTo-Json
  $reg = Invoke-RestMethod -Uri "$BaseUrl/api/v1/auth/register" -Method POST -Body $regBody -ContentType "application/json"
  $token = $reg.data.access_token
  Ok "Registered"
} catch {
  $loginBody = @{ email = $email; password = $pwd } | ConvertTo-Json
  $login = Invoke-RestMethod -Uri "$BaseUrl/api/v1/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
  $token = $login.data.access_token
  Ok "Logged in"
}
if(-not $token){ Fail "Missing token" }
$headers = @{ Authorization = "Bearer $token"; "Content-Type" = "application/json" }

# 3) Dev deposit for funds
Info "Dev deposit R$ $DepositAmount"
try {
  $depBody = @{ amount_brl = $DepositAmount } | ConvertTo-Json
  $dep = Invoke-RestMethod -Uri "$BaseUrl/api/v1/wallet/deposit/dev" -Method POST -Headers $headers -Body $depBody -ContentType "application/json"
  Ok "Balance after deposit: R$ $($dep.data.balance_brl)"
} catch { Fail "Deposit failed: $($_.Exception.Message)" }

# 4) List booster types
Info "List booster types"
try {
  $boosters = Invoke-RestMethod -Uri "$BaseUrl/api/v1/boosters" -Method GET
  if(-not $boosters.data){ Fail "No boosters returned" }
  $first = $boosters.data[0]
  Ok "Booster type: $($first.name) | Price R$ $($first.price_brl)"
} catch { Fail "Listing boosters failed: $($_.Exception.Message)" }

$boosterTypeId = $boosters.data[0].id
if(-not $boosterTypeId){ Fail "Missing booster type id" }

# 5) Purchase boosters
$quantity = 2
Info "Purchase $quantity booster(s)"
try {
  $purchaseBody = @{ booster_type_id = $boosterTypeId; quantity = $quantity; currency = "brl" } | ConvertTo-Json
  $purchase = Invoke-RestMethod -Uri "$BaseUrl/api/v1/boosters/purchase" -Method POST -Headers $headers -Body $purchaseBody -ContentType "application/json"
  $openingIds = @()
  foreach ($b in $purchase.data.boosters) { $openingIds += $b.id }
  Ok "Purchased. Booster opening IDs: $([string]::Join(', ', $openingIds)) | Total Paid: R$ $($purchase.data.total_paid)"
} catch { Fail "Purchase failed: $($_.Exception.Message)" }

if(-not $openingIds -or $openingIds.Length -eq 0){ Fail "No booster openings returned" }

# 6) Open first booster
$openId = $openingIds[0]
Info "Open booster $openId"
try {
  $openBody = @{ booster_opening_id = $openId } | ConvertTo-Json
  $openRes = Invoke-RestMethod -Uri "$BaseUrl/api/v1/boosters/open" -Method POST -Headers $headers -Body $openBody -ContentType "application/json"
  $cardCount = $openRes.data.cards.Length
  Ok "Opened booster -> $cardCount cards"
} catch { Fail "Open failed: $($_.Exception.Message)" }

# 7) Inventory check
Info "Check inventory"
try {
  $inv = Invoke-RestMethod -Uri "$BaseUrl/api/v1/inventory" -Method GET -Headers $headers
  $invCount = $inv.data.cards.Length
  Ok "Inventory now has $invCount cards"
} catch { Fail "Inventory fetch failed: $($_.Exception.Message)" }

Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "🎉 Booster flow validated" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
