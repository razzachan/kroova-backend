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

Write-Host "=== SIMULACAO RTP: 1000 BOOSTERS POR TIER ===" -ForegroundColor Yellow
Write-Host ""

# Buscar configuração dos boosters
$boostersUrl = "$supabaseUrl/rest/v1/booster_types?select=name,price_brl,rarity_distribution,value_adjustment,skin_boost" + "&order=price_brl.asc"
$boosters = Invoke-RestMethod -Uri $boostersUrl -Headers $headers -Method Get

# Buscar todas as cartas para simular
$cardsUrl = "$supabaseUrl/rest/v1/cards_base?select=id,rarity,base_liquidity_brl"
$cards = Invoke-RestMethod -Uri $cardsUrl -Headers $headers -Method Get

# Agrupar cartas por raridade
$cardsByRarity = @{}
foreach ($card in $cards) {
    if (-not $cardsByRarity.ContainsKey($card.rarity)) {
        $cardsByRarity[$card.rarity] = @()
    }
    $cardsByRarity[$card.rarity] += $card
}

Write-Host "Cartas no banco:" -ForegroundColor Cyan
foreach ($rarity in $cardsByRarity.Keys | Sort-Object) {
    Write-Host "  $rarity`: $($cardsByRarity[$rarity].Count) cartas"
}
Write-Host ""

# Função para sortear raridade
function Get-RandomRarity {
    param($distribution)
    
    $rand = Get-Random -Minimum 0.0 -Maximum 100.0
    $cumulative = 0.0
    
    foreach ($entry in $distribution.PSObject.Properties) {
        $cumulative += $entry.Value
        if ($rand -lt $cumulative) {
            return $entry.Name
        }
    }
    
    return "trash" # fallback
}

# Função para sortear skin
function Get-RandomSkin {
    param($skinBoost)
    
    $rand = Get-Random -Minimum 0.0 -Maximum 100.0
    $cumulative = 0.0
    
    # Glitch (ultra raro, 6x)
    $glitch = if ($skinBoost.glitch) { $skinBoost.glitch } else { 0 }
    $cumulative += $glitch
    if ($rand -lt $cumulative) { return @{name="glitch"; multiplier=6.0} }
    
    # Dark (muito raro, 4x)
    $dark = if ($skinBoost.dark) { $skinBoost.dark } else { 0 }
    $cumulative += $dark
    if ($rand -lt $cumulative) { return @{name="dark"; multiplier=4.0} }
    
    # Ghost (raro, 3x)
    $ghost = if ($skinBoost.ghost) { $skinBoost.ghost } else { 0 }
    $cumulative += $ghost
    if ($rand -lt $cumulative) { return @{name="ghost"; multiplier=3.0} }
    
    # Holo (incomum, 2.5x)
    $holo = if ($skinBoost.holo) { $skinBoost.holo } else { 0 }
    $cumulative += $holo
    if ($rand -lt $cumulative) { return @{name="holo"; multiplier=2.5} }
    
    # Premium (comum, 1.5x)
    $premium = if ($skinBoost.premium) { $skinBoost.premium } else { 0 }
    $cumulative += $premium
    if ($rand -lt $cumulative) { return @{name="premium"; multiplier=1.5} }
    
    # Default (resto, 1x)
    return @{name="default"; multiplier=1.0}
}

# Simular cada tier
$uniqueTiers = $boosters | Select-Object price_brl -Unique | Sort-Object price_brl

foreach ($tierInfo in $uniqueTiers) {
    $price = $tierInfo.price_brl
    $booster = $boosters | Where-Object { $_.price_brl -eq $price } | Select-Object -First 1
    
    Write-Host "=== TIER R$ $price ($($booster.name)) ===" -ForegroundColor Green
    Write-Host "Simulando 1000 boosters (5000 cartas)..."
    
    $totalValue = 0.0
    $godmodeCount = 0
    $rarityCount = @{}
    $skinCount = @{}
    
    for ($b = 0; $b -lt 1000; $b++) {
        # 5 cartas por booster
        for ($c = 0; $c -lt 5; $c++) {
            # Sortear raridade
            $rarity = Get-RandomRarity -distribution $booster.rarity_distribution
            
            # Contar raridades
            if (-not $rarityCount.ContainsKey($rarity)) {
                $rarityCount[$rarity] = 0
            }
            $rarityCount[$rarity]++
            
            # Verificar se tem cartas dessa raridade
            if (-not $cardsByRarity.ContainsKey($rarity) -or $cardsByRarity[$rarity].Count -eq 0) {
                Write-Host "    AVISO: Sem cartas $rarity no banco!" -ForegroundColor Yellow
                continue
            }
            
            # Sortear carta aleatória
            $randomCard = $cardsByRarity[$rarity] | Get-Random
            $baseLiquidity = $randomCard.base_liquidity_brl
            
            # Sortear skin
            $skin = Get-RandomSkin -skinBoost $booster.skin_boost
            
            # Contar skins
            if (-not $skinCount.ContainsKey($skin.name)) {
                $skinCount[$skin.name] = 0
            }
            $skinCount[$skin.name]++
            
            # Godmode = 10x multiplier quando rarity é "godmode"
            $godmodeMultiplier = 1.0
            $isGodmode = ($rarity -eq "godmode")
            if ($isGodmode) {
                $godmodeMultiplier = 10.0
                $godmodeCount++
            }
            
            # Calcular liquidez final
            $finalLiquidity = $baseLiquidity * $skin.multiplier * $booster.value_adjustment * $godmodeMultiplier
            $totalValue += $finalLiquidity
        }
    }
    
    $totalCost = 1000 * $price
    $rtp = ($totalValue / $totalCost) * 100
    
    Write-Host ""
    Write-Host "RESULTADOS:" -ForegroundColor Yellow
    Write-Host "  Total gasto: R$" ([math]::Round($totalCost, 2))
    Write-Host "  Total recebido: R$" ([math]::Round($totalValue, 2))
    Write-Host "  RTP REAL: $([math]::Round($rtp, 2))%" -ForegroundColor $(if ($rtp -gt 70 -or $rtp -lt 50) { "Red" } else { "Green" })
    Write-Host "  Diferenca: R$" ([math]::Round($totalValue - $totalCost, 2))
    
    Write-Host ""
    Write-Host "  Godmodes: $godmodeCount / 5000 cartas ($([math]::Round($godmodeCount / 50.0, 2))%)"
    
    if ($godmodeCount -gt 0) {
        $expectedGodmode = if ($booster.rarity_distribution.godmode) { $booster.rarity_distribution.godmode } else { 0 }
        $actualGodmode = ($godmodeCount / 50.0)
        Write-Host "    Esperado: $expectedGodmode% | Real: $([math]::Round($actualGodmode, 2))%" -ForegroundColor Cyan
    }
    
    Write-Host ""
    Write-Host "  Raridades dropadas:" -ForegroundColor Cyan
    foreach ($rarity in $rarityCount.Keys | Sort-Object) {
        $count = $rarityCount[$rarity]
        $pct = ($count / 5000.0) * 100
        $expectedProp = $booster.rarity_distribution.PSObject.Properties[$rarity]
        $expected = if ($expectedProp) { $expectedProp.Value } else { 0 }
        Write-Host "    $rarity`: $count ($([math]::Round($pct, 2))%) - esperado: $expected%"
    }
    
    Write-Host ""
    Write-Host "  Skins dropadas:" -ForegroundColor Cyan
    foreach ($skin in $skinCount.Keys | Sort-Object) {
        $count = $skinCount[$skin]
        $pct = ($count / 5000.0) * 100
        Write-Host "    $skin`: $count ($([math]::Round($pct, 2))%)"
    }
    
    Write-Host ""
    Write-Host ("=" * 80)
    Write-Host ""
}

Write-Host ""
Write-Host "=== RESUMO FINAL ===" -ForegroundColor Yellow
Write-Host "Simulacao completa! Verifique se RTPs estao entre 55-65% (target 60%)"
