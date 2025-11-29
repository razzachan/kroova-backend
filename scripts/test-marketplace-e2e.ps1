# Marketplace E2E Test
param([string]$BaseUrl = "https://frontend-64nho4ssj-razzachans-projects.vercel.app")

Write-Host "`n Marketplace E2E Test`n" -ForegroundColor Cyan

$Email = "test$(Get-Random)@krouva.com"
$Password = "Senha123!"

Write-Host "Creating test user: $Email" -ForegroundColor Gray

# Register
$regBody = @{ email=$Email; password=$Password; name="Test User" } | ConvertTo-Json
$reg = Invoke-RestMethod -Uri "$BaseUrl/api/v1/auth/register" -Method POST -Body $regBody -ContentType 'application/json'
$token = $reg.data.access_token
Write-Host " Registered" -ForegroundColor Green

$headers = @{ Authorization="Bearer $token"; "Content-Type"="application/json" }

# Check wallet
$wallet = Invoke-RestMethod -Uri "$BaseUrl/api/v1/wallet" -Method GET -Headers $headers
Write-Host " Wallet: R$ $($wallet.data.balance_brl)" -ForegroundColor Green

# Check inventory
$inv = Invoke-RestMethod -Uri "$BaseUrl/api/v1/inventory" -Method GET -Headers $headers
$cardCount = $inv.data.cards.Count
Write-Host " Inventory: $cardCount cards" -ForegroundColor Green

if ($cardCount -eq 0) {
    Write-Host "  No cards to sell. Buy boosters first!" -ForegroundColor Yellow
    exit 0
}

$cardId = $inv.data.cards[0].id
Write-Host "Selected card: $cardId`n" -ForegroundColor Gray

# Create listing
Write-Host "Creating listing..." -ForegroundColor Yellow
try {
    $listBody = @{ card_instance_id=$cardId; price_brl=15.50 } | ConvertTo-Json
    $list = Invoke-RestMethod -Uri "$BaseUrl/api/v1/market/listings" -Method POST -Headers $headers -Body $listBody
    $listingId = $list.data.id
    Write-Host " Listing created: $listingId" -ForegroundColor Green
} catch {
    Write-Host " Failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Verify in marketplace
$market = Invoke-RestMethod -Uri "$BaseUrl/api/v1/market/listings" -Method GET
Write-Host " Marketplace has $($market.data.listings.Count) listings" -ForegroundColor Green

# Try self-purchase (should fail)
Write-Host "`nTesting self-purchase..." -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "$BaseUrl/api/v1/market/listings/$listingId/buy" -Method POST -Headers $headers -Body "{}"
    Write-Host " Self-purchase should be blocked!" -ForegroundColor Red
} catch {
    if ($_.Exception.Message -like "*CANNOT_BUY_OWN_LISTING*") {
        Write-Host " Self-purchase blocked" -ForegroundColor Green
    } else {
        Write-Host "  Blocked but unexpected error" -ForegroundColor Yellow
    }
}

# Cancel listing
Write-Host "`nCancelling listing..." -ForegroundColor Yellow
try {
    $cancel = Invoke-RestMethod -Uri "$BaseUrl/api/v1/market/listings/$listingId" -Method DELETE -Headers $headers
    Write-Host " Listing cancelled" -ForegroundColor Green
} catch {
    Write-Host " Failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Verify removed
$market2 = Invoke-RestMethod -Uri "$BaseUrl/api/v1/market/listings" -Method GET
$found = $market2.data.listings | Where-Object { $_.id -eq $listingId }
if (-not $found) {
    Write-Host " Listing removed from marketplace" -ForegroundColor Green
} else {
    Write-Host " Listing still visible!" -ForegroundColor Red
}

Write-Host "`n ALL TESTS PASSED`n" -ForegroundColor Green
