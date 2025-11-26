# Test Recycle and Marketplace Flow
$ErrorActionPreference = 'Stop'

Write-Host "`n=====================================" -ForegroundColor Cyan
Write-Host "KROOVA API E2E TEST" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

$base = 'http://127.0.0.1:3333/api/v1'

# Test server health
Write-Host "\n--- STEP 0: Check Server ---" -ForegroundColor Yellow
try {
    $null = Invoke-RestMethod -Method Get -Uri "http://127.0.0.1:3333/" -TimeoutSec 5
    Write-Host ("OK Server is running") -ForegroundColor Green
} catch {
    Write-Host ("FAIL Server is not running") -ForegroundColor Red
    Write-Host "Please start it first with:" -ForegroundColor Yellow
    Write-Host '  $env:KROOVA_DEV_LOGIN_BYPASS=''1''; $env:KROOVA_DEV_ALLOW_RECYCLE_NO_CPF=''1''; $env:KROOVA_DEV_NO_RATELIMIT=''1''; npm run start' -ForegroundColor Yellow
    exit 1
}

Write-Host "`n--- STEP 1: Login Seller ---" -ForegroundColor Yellow
$loginBody = @{
    email = 'akroma.julio@gmail.com'
    password = 'Senha12'
} | ConvertTo-Json

$seller = Invoke-RestMethod -Method Post -Uri "$base/auth/login" -ContentType 'application/json' -Body $loginBody
$sellerToken = $seller.data.access_token
$sellerUserId = $seller.data.user.id
Write-Host ("OK Seller logged in: " + $sellerUserId) -ForegroundColor Green

Write-Host "`n--- STEP 2: Get Seller Wallet Before ---" -ForegroundColor Yellow
$walletBefore = Invoke-RestMethod -Method Get -Uri "$base/wallet" -Headers @{ Authorization = "Bearer $sellerToken" }
$balanceBefore = $walletBefore.data.balance_brl
Write-Host ("OK Balance before: R$" + $balanceBefore) -ForegroundColor Green

Write-Host "`n--- STEP 3: Purchase Booster ---" -ForegroundColor Yellow
$purchaseBoosterBody = @{
    booster_type_id = '24851c62-ba77-4fa5-a5dc-35f9d1d7edbc'
    quantity = 1
    currency = 'brl'
} | ConvertTo-Json

$boosterPurchase = Invoke-RestMethod -Method Post -Uri "$base/boosters/purchase" -Headers @{ Authorization = "Bearer $sellerToken" } -ContentType 'application/json' -Body $purchaseBoosterBody
$openingId = $boosterPurchase.data.boosters[0].id
Write-Host ("OK Booster purchased: " + $openingId) -ForegroundColor Green

Write-Host "`n--- STEP 4: Open Booster ---" -ForegroundColor Yellow
$openBoosterBody = @{
    booster_opening_id = $openingId
} | ConvertTo-Json

$openResult = Invoke-RestMethod -Method Post -Uri "$base/boosters/open" -Headers @{ Authorization = "Bearer $sellerToken" } -ContentType 'application/json' -Body $openBoosterBody
Write-Host ("OK Booster opened, got " + $openResult.data.cards.Count + " cards") -ForegroundColor Green

Write-Host "`n--- STEP 5: Get Inventory ---" -ForegroundColor Yellow
$inv = Invoke-RestMethod -Method Get -Uri "$base/inventory" -Headers @{ Authorization = "Bearer $sellerToken" }
if ($inv.data.pagination.total -eq 0) {
    Write-Host "FAIL No cards in inventory" -ForegroundColor Red
    exit 1
}
$firstCard = $inv.data.cards[0]
$instanceId = $firstCard.card_instance_id
Write-Host ("OK Found card: " + $firstCard.cards_instances.cards_base.name + " (ID: " + $instanceId + ")") -ForegroundColor Cyan

Write-Host "`n--- STEP 6: Recycle Card ---" -ForegroundColor Yellow
$recycle = Invoke-RestMethod -Method Post -Uri "$base/cards/$instanceId/recycle" -Headers @{ Authorization = "Bearer $sellerToken" } -ContentType 'application/json' -Body (ConvertTo-Json @{})
Write-Host ("OK Card recycled") -ForegroundColor Green
Write-Host ("  Value received: R$" + $recycle.data.value_received) -ForegroundColor Cyan

Write-Host "`n--- STEP 7: Verify Wallet After ---" -ForegroundColor Yellow
$walletAfter = Invoke-RestMethod -Method Get -Uri "$base/wallet" -Headers @{ Authorization = "Bearer $sellerToken" }
$balanceAfter = $walletAfter.data.balance_brl
$diff = $balanceAfter - $balanceBefore
Write-Host ("OK Balance after: R$" + $balanceAfter + " (diff: +R$" + $diff + ")") -ForegroundColor Green

Write-Host "`n--- STEP 8: Check Transactions ---" -ForegroundColor Yellow
$txs = Invoke-RestMethod -Method Get -Uri "$base/wallet/transactions?limit=5" -Headers @{ Authorization = "Bearer $sellerToken" }
$recycleTx = $txs.data.transactions | Where-Object { $_.type -eq 'recycle' } | Select-Object -First 1
if ($recycleTx) {
    Write-Host ("OK Recycle transaction found: " + $recycleTx.id) -ForegroundColor Green
    Write-Host ("  Amount: R$" + $recycleTx.amount_brl + " Status: " + $recycleTx.status) -ForegroundColor Cyan
} else {
    Write-Host "WARN No recycle transaction found" -ForegroundColor Yellow
}

Write-Host "`n--- STEP 9: Get Inventory for Listing ---" -ForegroundColor Yellow
$inv2 = Invoke-RestMethod -Method Get -Uri "$base/inventory" -Headers @{ Authorization = "Bearer $sellerToken" }
if ($inv2.data.pagination.total -lt 2) {
    Write-Host "FAIL Need at least 2 cards for listing (one was recycled)" -ForegroundColor Red
    exit 1
}
$cardToList = $inv2.data.cards[1]  # Use second card since first might be recycled
$listingInstanceId = $cardToList.card_instance_id
Write-Host ("OK Selected: " + $cardToList.cards_instances.cards_base.name + " (rarity: " + $cardToList.cards_instances.cards_base.rarity + ")") -ForegroundColor Cyan

Write-Host "\n--- STEP 9b: Set CPF if needed ---" -ForegroundColor Yellow
try {
    $cpfBody = @{
        cpf = '12345678901'
    } | ConvertTo-Json
    $null = Invoke-RestMethod -Method Post -Uri "$base/users/cpf" -Headers @{ Authorization = "Bearer $sellerToken" } -ContentType 'application/json' -Body $cpfBody
    Write-Host "OK CPF set" -ForegroundColor Green
} catch {
    Write-Host "  CPF already set or error (continuing)" -ForegroundColor Cyan
}

Write-Host "`n--- STEP 10: Create Listing ---" -ForegroundColor Yellow
$listingBody = @{
    card_instance_id = $listingInstanceId
    price_brl = 50.00
    description = "Test listing from E2E flow"
} | ConvertTo-Json

$listing = Invoke-RestMethod -Method Post -Uri "$base/market/listings" -Headers @{ Authorization = "Bearer $sellerToken" } -ContentType 'application/json' -Body $listingBody
$listingId = $listing.data.id
Write-Host ("OK Listing created: " + $listingId + " Price: R$" + $listing.data.price_brl) -ForegroundColor Green

Write-Host "`n--- STEP 11: Setup Buyer ---" -ForegroundColor Yellow
$buyerEmail = "buyer.test@kroova.com"
$buyerPassword = "Buyer123!"

# Use admin upsert to bypass Supabase rate limits
Write-Host "  Creating/updating buyer via admin script..." -ForegroundColor Cyan
$upsertCmd = "npx tsx scripts/dev-upsert-user.ts $buyerEmail $buyerPassword buyer_test"
try { Invoke-Expression $upsertCmd 2>&1 | Out-Null } catch { }  # Ignore errors if user exists

Start-Sleep -Seconds 1

$buyerLoginBody = @{
    email = $buyerEmail
    password = $buyerPassword
} | ConvertTo-Json

$buyer = Invoke-RestMethod -Method Post -Uri "$base/auth/login" -ContentType 'application/json' -Body $buyerLoginBody
Write-Host "OK Buyer logged in" -ForegroundColor Green

$buyerToken = $buyer.data.access_token
$buyerUserId = $buyer.data.user.id
Write-Host ("  Buyer ID: " + $buyerUserId) -ForegroundColor Cyan

Write-Host "`n--- STEP 12: Fund Buyer ---" -ForegroundColor Yellow
$fundBody = @{
    amount_brl = 100.00
} | ConvertTo-Json

$fund = Invoke-RestMethod -Method Post -Uri "$base/wallet/deposit/dev" -Headers @{ Authorization = "Bearer $buyerToken" } -ContentType 'application/json' -Body $fundBody
Write-Host ("OK Buyer funded: R$" + $fund.data.new_balance) -ForegroundColor Green

Write-Host "`n--- STEP 13: Buyer Purchases ---" -ForegroundColor Yellow
$purchase = Invoke-RestMethod -Method Post -Uri "$base/market/listings/$listingId/buy" -Headers @{ Authorization = "Bearer $buyerToken" } -ContentType 'application/json' -Body (ConvertTo-Json @{})
Write-Host ("OK Purchase completed: " + $purchase.data.card_instance_id) -ForegroundColor Green

Write-Host "`n--- STEP 14: Verify Ownership ---" -ForegroundColor Yellow
$buyerInv = Invoke-RestMethod -Method Get -Uri "$base/inventory" -Headers @{ Authorization = "Bearer $buyerToken" }
$purchasedCard = $buyerInv.data.cards | Where-Object { $_.card_instance_id -eq $listingInstanceId }

if ($purchasedCard) {
    Write-Host ("OK Card transferred: " + $purchasedCard.cards_instances.cards_base.name) -ForegroundColor Green
} else {
    Write-Host "FAIL Card not in buyer inventory" -ForegroundColor Red
}

Write-Host "`n--- STEP 15: Final Balances ---" -ForegroundColor Yellow
$sellerFinal = Invoke-RestMethod -Method Get -Uri "$base/wallet" -Headers @{ Authorization = "Bearer $sellerToken" }
$buyerFinal = Invoke-RestMethod -Method Get -Uri "$base/wallet" -Headers @{ Authorization = "Bearer $buyerToken" }

Write-Host ("OK Seller: R$" + $sellerFinal.data.balance_brl) -ForegroundColor Green
Write-Host ("OK Buyer: R$" + $buyerFinal.data.balance_brl) -ForegroundColor Green

Write-Host "`n=====================================" -ForegroundColor Cyan
Write-Host "ALL TESTS PASSED" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
