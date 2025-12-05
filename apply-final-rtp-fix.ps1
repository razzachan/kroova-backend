$supabaseUrl = "https://mmcytphoeyxeylvaqjgr.supabase.co"
$supabaseKey = $env:SUPABASE_SERVICE_ROLE_KEY

$headers = @{
    "apikey" = $supabaseKey
    "Authorization" = "Bearer $supabaseKey"
    "Content-Type" = "application/json"
    "Prefer" = "return=representation"
}

Write-Host "=== REBALANCEAMENTO FINAL (COM GODMODE 10X) ===" -ForegroundColor Yellow
Write-Host ""

# Liquidez média por raridade
$godmodeLiq = 82.1133
$legendaryLiq = 1.7244
$viralLiq = 0.4122
$memeLiq = 0.0867
$trashLiq = 0.0085

# Tier Premium (R$ 2.00) - Target RTP 60%
Write-Host "Tier Premium (R$ 2.00):" -ForegroundColor Cyan
$target = 2.00 * 0.60 # R$ 1.20 esperado
# Distribuição: trash 25%, meme 30%, viral 34%, legendary 10%, godmode 0.1%
# Valor sem godmode: (0.25*0.0085 + 0.30*0.0867 + 0.34*0.4122 + 0.10*1.7244) * 5 = R$ 0.99
# Valor godmode: 0.001 * 82.1133 * 10 * 5 = R$ 4.11
# Total com adj=1: R$ 5.10
# Para RTP 60%: adj = 1.20 / 5.10 = 0.24
$body = @{
    value_adjustment = 0.57
    rarity_distribution = @{
        trash = 25.0
        meme = 30.0
        viral = 34.0
        legendary = 10.0
        godmode = 0.1
    }
} | ConvertTo-Json
$url = "$supabaseUrl/rest/v1/booster_types?price_brl=eq.2.00"
Invoke-RestMethod -Uri $url -Method Patch -Headers $headers -Body $body | Out-Null
Write-Host "  value_adjustment = 0.57 (godmode 0.1%)" -ForegroundColor Green

# Tier Elite (R$ 5.00) - Target RTP 60%
Write-Host "Tier Elite (R$ 5.00):" -ForegroundColor Cyan
# Distribuição: trash 12%, meme 20%, viral 46%, legendary 18%, godmode 0.2%
# Valor sem godmode: (0.12*0.0085 + 0.20*0.0867 + 0.46*0.4122 + 0.18*1.7244) * 5 = R$ 2.07
# Valor godmode: 0.002 * 82.1133 * 10 * 5 = R$ 8.21
# Total com adj=1: R$ 10.28
# Para RTP 60%: adj = 3.00 / 10.28 = 0.29
$body = @{
    value_adjustment = 0.88
    rarity_distribution = @{
        trash = 12.0
        meme = 20.0
        viral = 46.0
        legendary = 18.0
        godmode = 0.2
    }
} | ConvertTo-Json
$url = "$supabaseUrl/rest/v1/booster_types?price_brl=eq.5.00"
Invoke-RestMethod -Uri $url -Method Patch -Headers $headers -Body $body | Out-Null
Write-Host "  value_adjustment = 0.88 (godmode 0.2%)" -ForegroundColor Green

# Tier Whale (R$ 10.00) - Target RTP 60%
Write-Host "Tier Whale (R$ 10.00):" -ForegroundColor Cyan
# Distribuição: trash 3%, meme 0%, viral 55%, legendary 32%, godmode 0.5%
# Valor sem godmode: (0.03*0.0085 + 0.55*0.4122 + 0.32*1.7244) * 5 = R$ 3.89
# Valor godmode: 0.005 * 82.1133 * 10 * 5 = R$ 20.53
# Total com adj=1: R$ 24.42
# Para RTP 60%: adj = 6.00 / 24.42 = 0.25
$body = @{
    value_adjustment = 1.01
    rarity_distribution = @{
        trash = 3.0
        meme = 0.0
        viral = 55.0
        legendary = 32.0
        godmode = 0.5
    }
} | ConvertTo-Json
$url = "$supabaseUrl/rest/v1/booster_types?price_brl=eq.10.00"
Invoke-RestMethod -Uri $url -Method Patch -Headers $headers -Body $body | Out-Null
Write-Host "  value_adjustment = 1.01 (godmode 0.5%)" -ForegroundColor Green

Write-Host ""
Write-Host "=== APLICADO ===" -ForegroundColor Green
Write-Host ""
Write-Host "RESUMO GODMODE:"
Write-Host "  Premium (R$ 2): 0.1% = 1 godmode a cada 1000 cartas (~200 boosters)"
Write-Host "  Elite (R$ 5): 0.2% = 1 godmode a cada 500 cartas (~100 boosters)"
Write-Host "  Whale (R$ 10): 0.5% = 1 godmode a cada 200 cartas (~40 boosters)"
Write-Host ""
Write-Host "Godmode agora e ULTRA-RARO como deveria ser!" -ForegroundColor Yellow
