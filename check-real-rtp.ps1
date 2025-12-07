# Check Real RTP from Database
$env:SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tY3l0cGhvZXl4ZXlsdmFxamdyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDExNDIyMCwiZXhwIjoyMDc5NjkwMjIwfQ.mPKc2a3A4kL1LUzX9BjTsaCz3OGAWLGIBYV0TSa20Fw"

$headers = @{
    'apikey' = $env:SUPABASE_SERVICE_ROLE_KEY
    'Authorization' = "Bearer $env:SUPABASE_SERVICE_ROLE_KEY"
}

Write-Host ""
Write-Host "=== ANÁLISE RTP REAL - ÚLTIMAS 10 ABERTURAS ===" -ForegroundColor Cyan
Write-Host ""

# Get last 10 booster openings
$openings = Invoke-RestMethod -Uri "https://mmcytphoeyxeylvaqjgr.supabase.co/rest/v1/booster_openings?select=id,booster_type_id&order=created_at.desc&limit=10" -Headers $headers

foreach ($opening in $openings) {
    # Get booster type info
    $boosterType = (Invoke-RestMethod -Uri "https://mmcytphoeyxeylvaqjgr.supabase.co/rest/v1/booster_types?id=eq.$($opening.booster_type_id)&select=name,price_brl" -Headers $headers)[0]
    
    # Get cards from this opening
    $cards = Invoke-RestMethod -Uri "https://mmcytphoeyxeylvaqjgr.supabase.co/rest/v1/cards_instances?opening_id=eq.$($opening.id)&select=rarity,skin_type,liquidity_brl" -Headers $headers
    
    $totalValue = ($cards | Measure-Object -Property liquidity_brl -Sum).Sum
    $cost = $boosterType.price_brl
    $rtp = [math]::Round(($totalValue / $cost) * 100, 2)
    
    $color = if ($rtp -gt 100) { "Red" } elseif ($rtp -gt 50) { "Green" } else { "Cyan" }
    
    Write-Host "Booster: $($boosterType.name) (Custo: R$ $cost)" -ForegroundColor Yellow
    Write-Host "  Valor total recebido: R$ $([math]::Round($totalValue, 2))" -ForegroundColor White
    Write-Host "  RTP: $rtp%" -ForegroundColor $color
    Write-Host "  Cartas:" -ForegroundColor Gray
    
    foreach ($card in $cards) {
        Write-Host "    - $($card.rarity) | $($card.skin_type) | R$ $([math]::Round($card.liquidity_brl, 4))" -ForegroundColor DarkGray
    }
    
    Write-Host ""
}

Write-Host ""
Write-Host "=== RESUMO POR TIER ===" -ForegroundColor Cyan
Write-Host ""

# Group by tier and calculate average RTP
$tierStats = @{}

foreach ($opening in $openings) {
    $boosterType = (Invoke-RestMethod -Uri "https://mmcytphoeyxeylvaqjgr.supabase.co/rest/v1/booster_types?id=eq.$($opening.booster_type_id)&select=name,price_brl" -Headers $headers)[0]
    $cards = Invoke-RestMethod -Uri "https://mmcytphoeyxeylvaqjgr.supabase.co/rest/v1/cards_instances?opening_id=eq.$($opening.id)&select=liquidity_brl" -Headers $headers
    
    $totalValue = ($cards | Measure-Object -Property liquidity_brl -Sum).Sum
    $cost = $boosterType.price_brl
    $rtp = ($totalValue / $cost) * 100
    
    $tierName = $boosterType.name
    if (-not $tierStats.ContainsKey($tierName)) {
        $tierStats[$tierName] = @{
            cost = $cost
            rtps = @()
        }
    }
    
    $tierStats[$tierName].rtps += $rtp
}

foreach ($tier in $tierStats.Keys | Sort-Object { $tierStats[$_].cost }) {
    $avgRtp = [math]::Round(($tierStats[$tier].rtps | Measure-Object -Average).Average, 2)
    $count = $tierStats[$tier].rtps.Count
    $cost = $tierStats[$tier].cost
    
    $color = if ($avgRtp -gt 100) { "Red" } elseif ($avgRtp -gt 50) { "Green" } else { "Cyan" }
    
    Write-Host "$tier (R$ $cost) - $count aberturas:" -ForegroundColor Yellow
    Write-Host "  RTP Médio: $avgRtp%" -ForegroundColor $color
    Write-Host ""
}
