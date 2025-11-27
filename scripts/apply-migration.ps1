# ==========================================
# SCRIPT DE MIGRATION - SUPABASE
# ==========================================

$SUPABASE_URL = "https://mmcytphoeyxeylvaqjgr.supabase.co"
$SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tY3l0cGhvZXl4ZXlsdmFxamdyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDExNDIyMCwiZXhwIjoyMDc5NjkwMjIwfQ.EYLRZo0u0aaDTH-JWTp2SXQQZVdYTSgjL4N-IMLfI6c"

Write-Host "🚀 Aplicando Migration 001_edition_lifecycle.sql..." -ForegroundColor Cyan

# Ler arquivo SQL
$sqlContent = Get-Content "$PSScriptRoot\migrations\001_edition_lifecycle.sql" -Raw

# Dividir em comandos individuais (por ponto-e-vírgula no final da linha)
$commands = $sqlContent -split ';\r?\n' | Where-Object { $_.Trim() -ne '' -and $_.Trim() -notmatch '^--' }

$successCount = 0
$failCount = 0

foreach ($command in $commands) {
    $trimmed = $command.Trim()
    if ($trimmed -eq '' -or $trimmed.StartsWith('--')) { continue }
    
    # Executar via API do Supabase usando PostgREST
    try {
        $headers = @{
            "apikey" = $SERVICE_KEY
            "Authorization" = "Bearer $SERVICE_KEY"
            "Content-Type" = "application/json"
            "Prefer" = "return=representation"
        }
        
        # Usar endpoint direto para executar SQL
        $body = @{
            query = $trimmed
        } | ConvertTo-Json -Depth 10
        
        # Tentar executar via REST API
        $response = Invoke-WebRequest `
            -Uri "$SUPABASE_URL/rest/v1/rpc/exec" `
            -Method POST `
            -Headers $headers `
            -Body $body `
            -ContentType "application/json" `
            -ErrorAction Stop
        
        $successCount++
        Write-Host "✅ OK" -ForegroundColor Green
    }
    catch {
        # Ignorar alguns erros comuns esperados
        $errorMsg = $_.Exception.Message
        if ($errorMsg -match "already exists|duplicate|does not exist") {
            Write-Host "⚠️  Skip (já existe)" -ForegroundColor Yellow
        }
        else {
            $failCount++
            Write-Host "❌ Erro: $errorMsg" -ForegroundColor Red
        }
    }
}

Write-Host "`n📊 Resultado:" -ForegroundColor Cyan
Write-Host "   Sucesso: $successCount" -ForegroundColor Green
Write-Host "   Falhas: $failCount" -ForegroundColor Red

if ($failCount -eq 0) {
    Write-Host "`n✅ MIGRATION APLICADA COM SUCESSO!" -ForegroundColor Green
} else {
    Write-Host "`n⚠️  Migration com erros. Use Supabase Dashboard para aplicar manualmente." -ForegroundColor Yellow
}

# Verificar se as tabelas foram criadas
Write-Host "`n🔍 Verificando tabelas..." -ForegroundColor Cyan

$tables = @("edition_configs", "edition_metrics", "edition_events", "user_pity_counter")
foreach ($table in $tables) {
    try {
        $response = Invoke-RestMethod `
            -Uri "$SUPABASE_URL/rest/v1/$table?select=*&limit=1" `
            -Method GET `
            -Headers @{
                "apikey" = $SERVICE_KEY
                "Authorization" = "Bearer $SERVICE_KEY"
            }
        Write-Host "   ✅ $table existe" -ForegroundColor Green
    }
    catch {
        Write-Host "   ❌ $table não encontrada" -ForegroundColor Red
    }
}

Write-Host "`n🎯 Próximo passo: Commit e deploy no Vercel" -ForegroundColor Cyan
Write-Host "   cd C:\Kroova\frontend" -ForegroundColor Gray
Write-Host "   git add ." -ForegroundColor Gray
Write-Host "   git commit -m 'feat: Sprint 1 - 3-layer booster system'" -ForegroundColor Gray
Write-Host "   git push origin main" -ForegroundColor Gray
