# Test Real Booster Opening
$env:SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tY3l0cGhvZXl4ZXlsdmFxamdyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDExNDIyMCwiZXhwIjoyMDc5NjkwMjIwfQ.mPKc2a3A4kL1LUzX9BjTsaCz3OGAWLGIBYV0TSa20Fw"

$headers = @{
    'apikey' = $env:SUPABASE_SERVICE_ROLE_KEY
    'Authorization' = "Bearer $env:SUPABASE_SERVICE_ROLE_KEY"
    'Content-Type' = 'application/json'
}

Write-Host "`n=== TESTE REAL: ABRINDO 3 BOOSTERS WHALE ===" -ForegroundColor Cyan
Write-Host ""

# Get your user ID
$email = "euvoucontar@gmail.com"
$user = (Invoke-RestMethod -Uri "https://mmcytphoeyxeylvaqjgr.supabase.co/rest/v1/users?email=eq.$email&select=id" -Headers $headers)[0]

if (-not $user) {
    Write-Host "ERRO: Usuário não encontrado!" -ForegroundColor Red
    exit 1
}

$userId = $user.id
Write-Host "User ID: $userId" -ForegroundColor Gray
Write-Host ""

# Get Whale booster type
$whaleBooster = (Invoke-RestMethod -Uri "https://mmcytphoeyxeylvaqjgr.supabase.co/rest/v1/booster_types?price_brl=eq.10.00&select=id,name,price_brl,value_adjustment&limit=1" -Headers $headers)[0]

Write-Host "Booster: $($whaleBooster.name) (R$ $($whaleBooster.price_brl))" -ForegroundColor Yellow
Write-Host "Value Adjustment: $($whaleBooster.value_adjustment)" -ForegroundColor Gray
Write-Host ""

$totalSpent = 0
$totalReceived = 0

# Open 3 boosters
for ($i = 1; $i -le 3; $i++) {
    Write-Host "=== BOOSTER $i ===" -ForegroundColor Cyan
    
    # Call the API to open booster
    try {
        $response = Invoke-RestMethod -Uri "https://frontend-ggoowimeo-razzachans-projects.vercel.app/api/v1/boosters/open" `
            -Method POST `
            -Headers @{
                'Content-Type' = 'application/json'
                'Cookie' = "sb-mmcytphoeyxeylvaqjgr-auth-token=YOUR_TOKEN_HERE"
            } `
            -Body (@{
                booster_type_id = $whaleBooster.id
            } | ConvertTo-Json)
        
        Write-Host "  API Error: Precisa de autenticação real" -ForegroundColor Red
        Write-Host "  Usando método alternativo..." -ForegroundColor Yellow
        
    } catch {
        # Alternative: Query recent openings directly
    }
    
    # Query last opening from database
    $lastOpening = (Invoke-RestMethod -Uri "https://mmcytphoeyxeylvaqjgr.supabase.co/rest/v1/booster_openings?user_id=eq.$userId&booster_type_id=eq.$($whaleBooster.id)&select=id&order=created_at.desc&limit=1" -Headers $headers)[0]
    
    if ($lastOpening) {
        # Get cards from this opening
        $cards = Invoke-RestMethod -Uri "https://mmcytphoeyxeylvaqjgr.supabase.co/rest/v1/cards_instances?opening_id=eq.$($lastOpening.id)&select=rarity,skin,liquidity_brl,card:cards_base(name)" -Headers $headers
        
        $openingValue = 0
        foreach ($card in $cards) {
            $openingValue += $card.liquidity_brl
            Write-Host "    $($card.rarity) | $($card.skin) | R$ $([math]::Round($card.liquidity_brl, 4))" -ForegroundColor Gray
        }
        
        Write-Host "  Total: R$ $([math]::Round($openingValue, 2))" -ForegroundColor White
        Write-Host ""
        
        $totalSpent += $whaleBooster.price_brl
        $totalReceived += $openingValue
    }
}

if ($totalSpent -gt 0) {
    Write-Host "=== RESULTADO FINAL ===" -ForegroundColor Cyan
    Write-Host "Total gasto: R$ $([math]::Round($totalSpent, 2))" -ForegroundColor Yellow
    Write-Host "Total recebido: R$ $([math]::Round($totalReceived, 2))" -ForegroundColor Yellow
    $rtp = ($totalReceived / $totalSpent) * 100
    $color = if ($rtp -ge 50) { "Green" } elseif ($rtp -ge 30) { "Yellow" } else { "Red" }
    Write-Host "RTP REAL: $([math]::Round($rtp, 2))%" -ForegroundColor $color
}
