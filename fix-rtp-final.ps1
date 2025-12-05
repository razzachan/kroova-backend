$supabaseUrl = "https://mmcytphoeyxeylvaqjgr.supabase.co"
$supabaseKey = $env:SUPABASE_SERVICE_ROLE_KEY

$headers = @{
    "apikey" = $supabaseKey
    "Authorization" = "Bearer $supabaseKey"
    "Content-Type" = "application/json"
    "Prefer" = "return=representation"
}

Write-Host "=== CALIBRACAO FINAL DE RTP ===" -ForegroundColor Yellow
Write-Host ""

# Baseado na segunda simulação:
# Básico: 49.15% (muito baixo, aumentar para 60%)
# Padrão: 60.65% (perfeito!)
# Premium: 69.82% (um pouco alto, reduzir para 60%)
# Elite: 48.25% (muito baixo, aumentar para 60%)
# Whale: 63.74% (um pouco alto, reduzir para 60%)

# Básico: 49.15% → 60% (aumentar 22%)
$newAdj = 0.41 * (60.0 / 49.15)
Write-Host "Basico: 49.15% -> 60% (value_adj 0.41 -> $([math]::Round($newAdj, 2)))" -ForegroundColor Cyan
$body = @{ value_adjustment = [math]::Round($newAdj, 2) } | ConvertTo-Json
Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/booster_types?price_brl=eq.0.50" -Method Patch -Headers $headers -Body $body | Out-Null

# Padrão: 60.65% → 60% (já está ótimo, pequeno ajuste)
$newAdj = 0.49 * (60.0 / 60.65)
Write-Host "Padrao: 60.65% -> 60% (value_adj 0.49 -> $([math]::Round($newAdj, 2)))" -ForegroundColor Green
$body = @{ value_adjustment = [math]::Round($newAdj, 2) } | ConvertTo-Json
Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/booster_types?price_brl=eq.1.00" -Method Patch -Headers $headers -Body $body | Out-Null

# Premium: 69.82% → 60% (reduzir 14%)
$newAdj = 0.19 * (60.0 / 69.82)
Write-Host "Premium: 69.82% -> 60% (value_adj 0.19 -> $([math]::Round($newAdj, 2)))" -ForegroundColor Cyan
$body = @{ value_adjustment = [math]::Round($newAdj, 2) } | ConvertTo-Json
Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/booster_types?price_brl=eq.2.00" -Method Patch -Headers $headers -Body $body | Out-Null

# Elite: 48.25% → 60% (aumentar 24%)
$newAdj = 0.15 * (60.0 / 48.25)
Write-Host "Elite: 48.25% -> 60% (value_adj 0.15 -> $([math]::Round($newAdj, 2)))" -ForegroundColor Cyan
$body = @{ value_adjustment = [math]::Round($newAdj, 2) } | ConvertTo-Json
Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/booster_types?price_brl=eq.5.00" -Method Patch -Headers $headers -Body $body | Out-Null

# Whale: 63.74% → 60% (reduzir 6%)
$newAdj = 0.22 * (60.0 / 63.74)
Write-Host "Whale: 63.74% -> 60% (value_adj 0.22 -> $([math]::Round($newAdj, 2)))" -ForegroundColor Cyan
$body = @{ value_adjustment = [math]::Round($newAdj, 2) } | ConvertTo-Json
Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/booster_types?price_brl=eq.10.00" -Method Patch -Headers $headers -Body $body | Out-Null

Write-Host ""
Write-Host "=== APLICADO ===" -ForegroundColor Green
Write-Host "Rodando TESTE FINAL..."
Write-Host ""

& ".\test-rtp-simulation.ps1"
