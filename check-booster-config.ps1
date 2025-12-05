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

Write-Host "Verificando configuracao dos boosters..." -ForegroundColor Cyan
Write-Host ""

# Query booster_types
$query = "id,name,price_brl,rarity_distribution,skin_boost,value_adjustment,mystery_box_bonus_chance"
$url = "$supabaseUrl/rest/v1/booster_types?select=$query" + "&order=price_brl.asc"

try {
    $response = Invoke-RestMethod -Uri $url -Headers $headers -Method Get
    
    Write-Host "BOOSTER TYPES CONFIGURADOS:" -ForegroundColor Yellow
    Write-Host ""
    
    foreach ($booster in $response) {
        Write-Host "=== $($booster.name) (R$ $($booster.price_brl)) ===" -ForegroundColor Cyan
        Write-Host "  ID: $($booster.id)"
        
        Write-Host "  Rarity Distribution:" -ForegroundColor Green
        if ($booster.rarity_distribution) {
            $dist = $booster.rarity_distribution
            foreach ($key in $dist.PSObject.Properties.Name) {
                Write-Host "    $key`: $($dist.$key)%"
            }
        } else {
            Write-Host "    NULL (usando default?)" -ForegroundColor Red
        }
        Write-Host ""
    }
    
    # Agora verificar cartas godmode no banco
    Write-Host ""
    Write-Host "=== VERIFICANDO CARTAS GODMODE NO BANCO ===" -ForegroundColor Yellow
    $cardsUrl = "$supabaseUrl/rest/v1/cards_base?select=id,name,rarity" + "&rarity=eq.godmode" + "&limit=10"
    $cardsResponse = Invoke-RestMethod -Uri $cardsUrl -Headers $headers -Method Get
    
    if ($cardsResponse.Count -gt 0) {
        Write-Host "ENCONTRADAS $($cardsResponse.Count) cartas com rarity=godmode:" -ForegroundColor Green
        $cardsResponse | ForEach-Object {
            Write-Host "  - $($_.name) (ID: $($_.id))"
        }
    } else {
        Write-Host "NENHUMA CARTA com rarity=godmode no banco!" -ForegroundColor Red
        Write-Host "O sistema esta tentando sortear godmode mas nao tem cartas!" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "ERRO:" $_.Exception.Message -ForegroundColor Red
}
