# Marketplace Flow Validator
param(
  [string]$BaseUrl = "http://127.0.0.1:3333",
  [int]$DepositAmount = 800,
  [int]$BoosterQuantity = 2
)

Write-Host "KROUVA - Marketplace Validator" -ForegroundColor Cyan
function Fail($m){ Write-Host "❌ $m" -ForegroundColor Red; exit 1 }
function Info($m){ Write-Host "➡ $m" -ForegroundColor Yellow }
function Ok($m){ Write-Host "✅ $m" -ForegroundColor Green }

# Health
Info "Health check"
try { $h = Invoke-RestMethod -Uri "$BaseUrl/health" -Method GET -TimeoutSec 3; if(-not $h.ok){ Fail "Health not ok" }; Ok "Health ok" } catch { Fail "Server unreachable" }

# Auth
$email = "test@krouva.com"; $userPassword = "senha123"; $token = $null
Info "Register/login"
try { $regBody = @{ email=$email; password=$userPassword; name='Usuario Teste' } | ConvertTo-Json; $reg = Invoke-RestMethod -Uri "$BaseUrl/api/v1/auth/register" -Method POST -Body $regBody -ContentType 'application/json'; $token=$reg.data.access_token; Ok "Registered" } catch { $loginBody=@{ email=$email; password=$userPassword } | ConvertTo-Json; $login=Invoke-RestMethod -Uri "$BaseUrl/api/v1/auth/login" -Method POST -Body $loginBody -ContentType 'application/json'; $token=$login.data.access_token; Ok "Logged in" }
if(-not $token){ Fail "Missing token" }
$headers=@{ Authorization="Bearer $token"; 'Content-Type'='application/json' }

# Dev deposit
Info "Dev deposit R$ $DepositAmount"
try { $depBody=@{ amount_brl=$DepositAmount } | ConvertTo-Json; $dep=Invoke-RestMethod -Uri "$BaseUrl/api/v1/wallet/deposit/dev" -Method POST -Headers $headers -Body $depBody -ContentType 'application/json'; Ok "Balance: R$ $($dep.data.balance_brl)" } catch { Fail "Deposit failed: $($_.Exception.Message)" }

# Booster purchase
Info "List boosters"
$boosters=Invoke-RestMethod -Uri "$BaseUrl/api/v1/boosters" -Method GET; if(-not $boosters.data){ Fail "No boosters" }
$bt=$boosters.data[0]; $btid=$bt.id; Ok "Booster type: $($bt.name)"
Info "Purchase $BoosterQuantity booster(s)"
$purchaseBody=@{ booster_type_id=$btid; quantity=$BoosterQuantity; currency='brl' } | ConvertTo-Json
$purchase=Invoke-RestMethod -Uri "$BaseUrl/api/v1/boosters/purchase" -Method POST -Headers $headers -Body $purchaseBody -ContentType 'application/json'
$openings=@(); foreach($b in $purchase.data.boosters){ $openings+=$b.id }
Ok "Purchased IDs: $([string]::Join(', ',$openings))"

# Open first booster to get cards
$openBody=@{ booster_opening_id=$openings[0] } | ConvertTo-Json
$opened=Invoke-RestMethod -Uri "$BaseUrl/api/v1/boosters/open" -Method POST -Headers $headers -Body $openBody -ContentType 'application/json'
$cards=$opened.data.cards; $cardCount=$cards.Length; Ok "Opened -> $cardCount cards"
if($cardCount -lt 1){ Fail "No cards from booster" }
$cardToList=$cards[0].id

# Recycle second card if exists (optional)
if($cardCount -ge 2){ Info "Recycle 2nd card"; try { $rec=Invoke-RestMethod -Uri "$BaseUrl/api/v1/cards/$($cards[1].id)/recycle" -Method POST -Headers $headers; Ok "Recycled value: R$ $($rec.data.value_received)" } catch { Write-Host "⚠️ Recycle failed: $($_.Exception.Message)" -ForegroundColor DarkYellow } }

# Listing create
Info "Create listing for first card"
$listPrice = 1.50
$listingBody=@{ card_instance_id=$cardToList; price_brl=$listPrice } | ConvertTo-Json
try { $listing=Invoke-RestMethod -Uri "$BaseUrl/api/v1/market/listings" -Method POST -Headers $headers -Body $listingBody -ContentType 'application/json'; $listingId=$listing.data.id; Ok "Listing created: $listingId price R$ $listPrice" } catch { Fail "Listing failed: $($_.Exception.Message)" }

# Marketplace query
Info "List marketplace"
$market=Invoke-RestMethod -Uri "$BaseUrl/api/v1/market/listings" -Method GET
$marketCount=$market.data.listings.Length; Ok "Listings count: $marketCount"

Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "🎉 Marketplace flow validated" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
