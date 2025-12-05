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
    "Prefer" = "return=representation"
}

Write-Host "=== APLICANDO REBALANCEAMENTO DE RTP ===" -ForegroundColor Yellow
Write-Host ""

# Tier Básico (R$ 0.50)
Write-Host "1. Atualizando Basico (R$ 0.50)..." -ForegroundColor Cyan
$body = @{
    value_adjustment = 0.48
    rarity_distribution = @{
        trash = 50.0
        meme = 38.0
        viral = 9.0
        legendary = 3.0
        godmode = 0.0
    }
} | ConvertTo-Json

$url = "$supabaseUrl/rest/v1/booster_types?price_brl=eq.0.50"
Invoke-RestMethod -Uri $url -Method Patch -Headers $headers -Body $body | Out-Null
Write-Host "   OK" -ForegroundColor Green

# Tier Padrão (R$ 1.00)
Write-Host "2. Atualizando Padrao (R$ 1.00)..." -ForegroundColor Cyan
$body = @{
    value_adjustment = 0.52
    rarity_distribution = @{
        trash = 40.0
        meme = 35.0
        viral = 18.0
        legendary = 7.0
        godmode = 0.0
    }
} | ConvertTo-Json

$url = "$supabaseUrl/rest/v1/booster_types?price_brl=eq.1.00"
Invoke-RestMethod -Uri $url -Method Patch -Headers $headers -Body $body | Out-Null
Write-Host "   OK" -ForegroundColor Green

# Tier Premium (R$ 2.00)
Write-Host "3. Atualizando Premium (R$ 2.00)..." -ForegroundColor Cyan
$body = @{
    value_adjustment = 0.25
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
Write-Host "   OK - Godmode 1% -> 0.1%" -ForegroundColor Green

# Tier Elite (R$ 5.00)
Write-Host "4. Atualizando Elite (R$ 5.00)..." -ForegroundColor Cyan
$body = @{
    value_adjustment = 0.18
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
Write-Host "   OK - Godmode 4% -> 0.2%" -ForegroundColor Green

# Tier Whale (R$ 10.00)
Write-Host "5. Atualizando Whale (R$ 10.00)..." -ForegroundColor Cyan
$body = @{
    value_adjustment = 0.15
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
Write-Host "   OK - Godmode 10% -> 0.5%" -ForegroundColor Green

Write-Host ""
Write-Host "=== APLICADO COM SUCESSO ===" -ForegroundColor Green
Write-Host ""
Write-Host "Executando analise de RTP novamente..."
& ".\analyze-rtp.ps1"
