# 🃏 Kroova - Seed ED01 (Staging/Production)
# Uso:
#   .\scripts\seed_staging.ps1 -ProjectUrl "https://<project>.supabase.co" -ServiceKey "<service-role-key>" [-DryRun]
# Ou já exportar SUPABASE_URL / SUPABASE_SERVICE_KEY no ambiente e rodar sem parâmetros.
param(
    [string]$ProjectUrl = $env:SUPABASE_URL,
    [string]$ServiceKey = $env:SUPABASE_SERVICE_KEY,
    [switch]$DryRun
)

Write-Host "🔧 Seed ED01 - Iniciando" -ForegroundColor Cyan

if (-not $ProjectUrl) { Write-Host "❌ SUPABASE_URL não fornecida" -ForegroundColor Red; exit 1 }
if (-not $ServiceKey) { Write-Host "❌ SUPABASE_SERVICE_KEY não fornecida" -ForegroundColor Red; exit 1 }

$env:SUPABASE_URL = $ProjectUrl
$env:SUPABASE_SERVICE_KEY = $ServiceKey

Write-Host "✅ Ambiente configurado" -ForegroundColor Green
Write-Host "   URL: $ProjectUrl" -ForegroundColor Gray
Write-Host "   Key (prefix): $($ServiceKey.Substring(0,8))..." -ForegroundColor Gray

Push-Location (Resolve-Path "..").Path
try {
    if ($DryRun) {
        Write-Host "🟡 Dry-run ativado (sem escrita)." -ForegroundColor Yellow
        node scripts/seed_supabase.js --dry
    } else {
        Write-Host "🟢 Executando seed real..." -ForegroundColor Green
        npm run cards:seed
    }
    if ($LASTEXITCODE -ne 0) { Write-Host "❌ Seed falhou (exit $LASTEXITCODE)" -ForegroundColor Red; exit $LASTEXITCODE }
    Write-Host "🎉 Seed finalizado com sucesso" -ForegroundColor Green
    Write-Host "📌 Próximo: executar post_seed_check.ps1" -ForegroundColor Cyan
} finally {
    Pop-Location
}
