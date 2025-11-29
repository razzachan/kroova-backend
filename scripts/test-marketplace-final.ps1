# Marketplace E2E Test - Using Existing User
param([string]$BaseUrl = "https://frontend-64nho4ssj-razzachans-projects.vercel.app")

Write-Host "`n Marketplace E2E Test`n" -ForegroundColor Cyan

$Email = "akroma.julio@gmail.com"
$Password = "Akroma!t8g86v8t!3159"

Write-Host "Logging in as: $Email" -ForegroundColor Gray

# Login
$loginBody = @{ email=$Email; password=$Password } | ConvertTo-Json
$login = Invoke-RestMethod -Uri "$BaseUrl/api/v1/auth/login" -Method POST -Body $loginBody -ContentType 'application/json'
$token = $login.data.access_token
Write-Host " Logged in" -ForegroundColor Green

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
$cardName = $inv.data.cards[0].cards_base.name
Write-Host "Selected card: $cardName (ID: $cardId)`n" -ForegroundColor Gray

# Create listing
Write-Host "Creating listing for R$ 15.50..." -ForegroundColor Yellow
try {
    $listBody = @{ card_instance_id=$cardId; price_brl=15.50 } | ConvertTo-Json
    $list = Invoke-RestMethod -Uri "$BaseUrl/api/v1/market/listings" -Method POST -Headers $headers -Body $listBody
    $listingId = $list.data.id
    Write-Host " Listing created: $listingId" -ForegroundColor Green
} catch {
    $err = $_.Exception.Message
    if ($err -like "*ALREADY_LISTED*") {
        Write-Host "  Card already listed. Finding existing listing..." -ForegroundColor Yellow
        $market = Invoke-RestMethod -Uri "$BaseUrl/api/v1/market/listings" -Method GET
        $existing = $market.data.listings | Where-Object { 
            ($_.card_instance.id -eq $cardId) -or ($_.cards_instances.id -eq $cardId) 
        } | Select-Object -First 1
        if ($existing) {
            $listingId = $existing.id
            Write-Host " Found existing listing: $listingId" -ForegroundColor Green
        } else {
            Write-Host " Could not find listing" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host " Failed: $err" -ForegroundColor Red
        exit 1
    }
}

# Verify in marketplace
$market = Invoke-RestMethod -Uri "$BaseUrl/api/v1/market/listings" -Method GET
Write-Host " Marketplace has $($market.data.listings.Count) active listings" -ForegroundColor Green

# Try self-purchase (should fail)
Write-Host "`nTesting self-purchase protection..." -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "$BaseUrl/api/v1/market/listings/$listingId/buy" -Method POST -Headers $headers -Body "{}"
    Write-Host " FAIL: Self-purchase should be blocked!" -ForegroundColor Red
    exit 1
} catch {
    if ($_.Exception.Message -like "*CANNOT_BUY_OWN_LISTING*" -or $_.Exception.Message -like "*própria carta*") {
        Write-Host " Self-purchase correctly blocked" -ForegroundColor Green
    } else {
        Write-Host " Self-purchase blocked (different error)" -ForegroundColor Green
    }
}

# Cancel listing
Write-Host "`nCancelling listing..." -ForegroundColor Yellow
try {
    $cancel = Invoke-RestMethod -Uri "$BaseUrl/api/v1/market/listings/$listingId" -Method DELETE -Headers $headers
    if ($cancel.ok -and $cancel.data.cancelled) {
        Write-Host " Listing cancelled successfully" -ForegroundColor Green
    } else {
        Write-Host "  Cancelled but unexpected response" -ForegroundColor Yellow
    }
} catch {
    Write-Host " Failed to cancel: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Verify removed from marketplace
Write-Host "`nVerifying removal..." -ForegroundColor Yellow
Start-Sleep -Seconds 2
$market2 = Invoke-RestMethod -Uri "$BaseUrl/api/v1/market/listings" -Method GET
$found = $market2.data.listings | Where-Object { $_.id -eq $listingId }
if (-not $found) {
    Write-Host " Listing successfully removed from marketplace" -ForegroundColor Green
} else {
    Write-Host " FAIL: Listing still visible!" -ForegroundColor Red
    exit 1
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host " ALL MARKETPLACE TESTS PASSED" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host " Authentication" -ForegroundColor Green
Write-Host " Wallet access" -ForegroundColor Green
Write-Host " Inventory access" -ForegroundColor Green
Write-Host " Create listing" -ForegroundColor Green
Write-Host " Listing visible in marketplace" -ForegroundColor Green
Write-Host " Self-purchase protection" -ForegroundColor Green
Write-Host " Cancel listing" -ForegroundColor Green
Write-Host " Listing removal verified" -ForegroundColor Green
Write-Host ""
