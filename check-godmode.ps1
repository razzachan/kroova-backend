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

Write-Host "Verificando ultimas 30 cartas criadas..." -ForegroundColor Cyan
Write-Host ""

# Query últimas cartas com is_godmode
$query = "id,is_godmode,liquidity_brl,skin,created_at,base_id(name,rarity)"
$url = "$supabaseUrl/rest/v1/cards_instances?select=$query" + "&order=created_at.desc" + "&limit=30"

try {
    $response = Invoke-RestMethod -Uri $url -Headers $headers -Method Get
    
    $godmodeCount = ($response | Where-Object { $_.is_godmode -eq $true }).Count
    $totalCount = $response.Count
    
    Write-Host "RESULTADOS:" -ForegroundColor Yellow
    Write-Host "   Total de cartas: $totalCount"
    $pct = [math]::Round($godmodeCount / $totalCount * 100, 2)
    Write-Host "   Godmode: $godmodeCount ($pct%)" -ForegroundColor $(if ($godmodeCount -gt 0) { "Green" } else { "Red" })
    Write-Host ""
    
    if ($godmodeCount -gt 0) {
        Write-Host "CARTAS GODMODE:" -ForegroundColor Green
        $response | Where-Object { $_.is_godmode -eq $true } | ForEach-Object {
            $liq = [math]::Round($_.liquidity_brl, 2)
            Write-Host "   - $($_.base_id.name) ($($_.base_id.rarity)) | Skin: $($_.skin) | R$" $liq -ForegroundColor Cyan
        }
    } else {
        Write-Host "NENHUMA CARTA GODMODE nas ultimas 30!" -ForegroundColor Red
        Write-Host "   Isso confirma que is_godmode esta sempre FALSE no codigo" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "Ultimas 10 cartas (resumo):" -ForegroundColor Yellow
    $response | Select-Object -First 10 | ForEach-Object {
        $godmodeIcon = if ($_.is_godmode) { "+" } else { " " }
        $liq = [math]::Round($_.liquidity_brl, 4)
        Write-Host "  [$godmodeIcon] $($_.base_id.name) | $($_.base_id.rarity) | $($_.skin) | R$" $liq
    }
    
} catch {
    Write-Host "ERRO:" $_.Exception.Message -ForegroundColor Red
}
