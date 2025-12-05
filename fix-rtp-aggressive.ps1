$supabaseUrl = "https://mmcytphoeyxeylvaqjgr.supabase.co"
$supabaseKey = $env:SUPABASE_SERVICE_ROLE_KEY

$headers = @{
    "apikey" = $supabaseKey
    "Authorization" = "Bearer $supabaseKey"
    "Content-Type" = "application/json"
    "Prefer" = "return=representation"
}

Write-Host "=== CORRECAO AGRESSIVA DE RTP ===" -ForegroundColor Red
Write-Host ""

# Baseado nos resultados da simulação, aplicar ajustes mais agressivos

# Básico: 69.61% → 60% (reduzir 14%)
Write-Host "Basico: 69.61% -> 60% (value_adj 0.48 -> 0.41)" -ForegroundColor Cyan
$body = @{
    value_adjustment = 0.41
} | ConvertTo-Json
$url = "$supabaseUrl/rest/v1/booster_types?price_brl=eq.0.50"
Invoke-RestMethod -Uri $url -Method Patch -Headers $headers -Body $body | Out-Null

# Padrão: 64.11% → 60% (reduzir 6%)
Write-Host "Padrao: 64.11% -> 60% (value_adj 0.52 -> 0.49)" -ForegroundColor Cyan
$body = @{
    value_adjustment = 0.49
} | ConvertTo-Json
$url = "$supabaseUrl/rest/v1/booster_types?price_brl=eq.1.00"
Invoke-RestMethod -Uri $url -Method Patch -Headers $headers -Body $body | Out-Null

# Premium: 180.07% → 60% (reduzir 67%)
Write-Host "Premium: 180.07% -> 60% (value_adj 0.57 -> 0.19)" -ForegroundColor Red
$body = @{
    value_adjustment = 0.19
} | ConvertTo-Json
$url = "$supabaseUrl/rest/v1/booster_types?price_brl=eq.2.00"
Invoke-RestMethod -Uri $url -Method Patch -Headers $headers -Body $body | Out-Null

# Elite: 346.61% → 60% (reduzir 83%)
Write-Host "Elite: 346.61% -> 60% (value_adj 0.88 -> 0.15)" -ForegroundColor Red
$body = @{
    value_adjustment = 0.15
} | ConvertTo-Json
$url = "$supabaseUrl/rest/v1/booster_types?price_brl=eq.5.00"
Invoke-RestMethod -Uri $url -Method Patch -Headers $headers -Body $body | Out-Null

# Whale: 271.27% → 60% (reduzir 78%)
Write-Host "Whale: 271.27% -> 60% (value_adj 1.01 -> 0.22)" -ForegroundColor Red
$body = @{
    value_adjustment = 0.22
} | ConvertTo-Json
$url = "$supabaseUrl/rest/v1/booster_types?price_brl=eq.10.00"
Invoke-RestMethod -Uri $url -Method Patch -Headers $headers -Body $body | Out-Null

Write-Host ""
Write-Host "=== APLICADO ===" -ForegroundColor Green
Write-Host "Rodando simulacao novamente..."
Write-Host ""

& ".\test-rtp-simulation.ps1"
