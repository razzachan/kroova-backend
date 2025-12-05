$supabaseUrl = "https://mmcytphoeyxeylvaqjgr.supabase.co"
$supabaseKey = $env:SUPABASE_SERVICE_ROLE_KEY

if (-not $supabaseKey) {
    Write-Host "ERRO: SUPABASE_SERVICE_ROLE_KEY nao configurada" -ForegroundColor Red
    exit 1
}

$headers = @{
    "apikey" = $supabaseKey
    "Authorization" = "Bearer $supabaseKey"
    "Content-Type" = "application/json"
}

Write-Host "=== ANALISE DE RTP POR TIER ===" -ForegroundColor Yellow
Write-Host ""

# Buscar booster types
$boostersUrl = "$supabaseUrl/rest/v1/booster_types?select=name,price_brl,rarity_distribution,value_adjustment" + "&order=price_brl.asc"
$boosters = Invoke-RestMethod -Uri $boostersUrl -Headers $headers -Method Get

# Buscar liquidez média por raridade
$cardsUrl = "$supabaseUrl/rest/v1/cards_base?select=rarity,base_liquidity_brl"
$cards = Invoke-RestMethod -Uri $cardsUrl -Headers $headers -Method Get

# Calcular liquidez média por raridade
$rarityAvg = @{}
$rarityGroups = $cards | Group-Object -Property rarity
foreach ($group in $rarityGroups) {
    $avg = ($group.Group | Measure-Object -Property base_liquidity_brl -Average).Average
    $rarityAvg[$group.Name] = $avg
}

Write-Host "LIQUIDEZ MEDIA POR RARIDADE:" -ForegroundColor Cyan
foreach ($key in $rarityAvg.Keys | Sort-Object) {
    Write-Host "  $key`: R$" ([math]::Round($rarityAvg[$key], 4))
}
Write-Host ""

# Analisar cada tier único
$uniqueTiers = $boosters | Select-Object price_brl -Unique | Sort-Object price_brl

foreach ($tier in $uniqueTiers) {
    $price = $tier.price_brl
    $booster = $boosters | Where-Object { $_.price_brl -eq $price } | Select-Object -First 1
    
    Write-Host "=== TIER R$ $price ($($booster.name)) ===" -ForegroundColor Green
    
    $dist = $booster.rarity_distribution
    $valueAdj = $booster.value_adjustment
    
    # Calcular valor esperado por carta (sem skin, sem godmode multiplier)
    $expectedPerCard = 0
    foreach ($rarity in $dist.PSObject.Properties) {
        $prob = $rarity.Value / 100.0
        $avgLiq = $rarityAvg[$rarity.Name]
        if ($avgLiq) {
            $contribution = $prob * $avgLiq * $valueAdj
            $expectedPerCard += $contribution
            Write-Host "  $($rarity.Name) ($($rarity.Value)%): R$" ([math]::Round($avgLiq, 4)) "x $valueAdj = R$" ([math]::Round($contribution, 4))
        }
    }
    
    # 5 cartas por booster
    $expectedPerBooster = $expectedPerCard * 5
    
    # RTP = (valor esperado / preço) * 100
    $rtp = ($expectedPerBooster / $price) * 100
    
    Write-Host ""
    Write-Host "  Valor esperado por carta: R$" ([math]::Round($expectedPerCard, 4)) -ForegroundColor Yellow
    Write-Host "  Valor esperado por booster (5 cartas): R$" ([math]::Round($expectedPerBooster, 4)) -ForegroundColor Yellow
    Write-Host "  Preço do booster: R$ $price"
    Write-Host "  RTP ATUAL: $([math]::Round($rtp, 2))%" -ForegroundColor $(if ($rtp -gt 70) { "Red" } elseif ($rtp -lt 50) { "Red" } else { "Green" })
    
    if ($rtp -gt 70) {
        Write-Host "  ALERTA: RTP muito alto! Vai quebrar a casa!" -ForegroundColor Red
    } elseif ($rtp -lt 50) {
        Write-Host "  ALERTA: RTP muito baixo! Jogadores vao reclamar!" -ForegroundColor Red
    }
    
    # Calcular ajuste necessário para RTP 60%
    $targetRTP = 60
    $targetValue = ($targetRTP / 100.0) * $price
    $neededAdj = $targetValue / ($expectedPerCard * 5 / $valueAdj)
    
    Write-Host "  Para RTP 60%: value_adjustment deveria ser" ([math]::Round($neededAdj, 2)) -ForegroundColor Cyan
    Write-Host ""
}

Write-Host ""
Write-Host "=== PROBLEMA GODMODE ===" -ForegroundColor Red
Write-Host "Tier R$ 10 (Whale) tem 10% de godmode (1 a cada 10 cartas)"
Write-Host "Isso significa:"
Write-Host "  - 10% das cartas sao godmode (10x liquidez)"
Write-Host "  - Se liquidez base godmode = R$ 100, com 10x = R$ 1000"
Write-Host "  - Usuario paga R$ 10, ganha carta de R$ 1000 = RTP 10000%!"
Write-Host ""
Write-Host "SOLUCAO: Reduzir godmode% drasticamente ou reduzir liquidez base das cartas godmode"
Write-Host "Recomendacao:"
Write-Host "  - Godmode: 0.1% a 1% (nao 10%!)"
Write-Host "  - Ou: liquidez base godmode = R$ 0.10 em vez de R$ 100"
