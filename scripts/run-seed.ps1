# Script para popular o banco Supabase via psql
# Substitua as variáveis abaixo com suas credenciais do Supabase

$SUPABASE_HOST = "aws-0-us-west-1.pooler.supabase.com"
$SUPABASE_PORT = "6543"
$SUPABASE_DB = "postgres"
$SUPABASE_USER = "postgres.mmcytphoeyxeylvaqjgr"
$SUPABASE_PASSWORD = "SUA_SENHA_AQUI"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host " KROOVA - Seed do Banco de Dados" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

# Verificar se psql está instalado
$psqlInstalled = Get-Command psql -ErrorAction SilentlyContinue

if (-not $psqlInstalled) {
    Write-Host "❌ psql não encontrado!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Opção 1: Instalar PostgreSQL Client" -ForegroundColor Yellow
    Write-Host "  https://www.postgresql.org/download/windows/" -ForegroundColor Blue
    Write-Host ""
    Write-Host "Opção 2: Usar o Dashboard do Supabase" -ForegroundColor Yellow
    Write-Host "  1. Acesse: https://supabase.com/dashboard/project/mmcytphoeyxeylvaqjgr" -ForegroundColor Blue
    Write-Host "  2. Clique em 'SQL Editor' no menu lateral" -ForegroundColor Gray
    Write-Host "  3. Cole o conteúdo de: scripts\seed-test-data.sql" -ForegroundColor Gray
    Write-Host "  4. Clique em 'RUN' (ou Ctrl+Enter)" -ForegroundColor Gray
    Write-Host ""
    exit 1
}

Write-Host "✓ psql encontrado!" -ForegroundColor Green
Write-Host ""
Write-Host "Conectando ao Supabase..." -ForegroundColor Yellow

# Executar o seed
$env:PGPASSWORD = $SUPABASE_PASSWORD
psql -h $SUPABASE_HOST -p $SUPABASE_PORT -U $SUPABASE_USER -d $SUPABASE_DB -f "scripts\seed-test-data.sql"

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Seed executado com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Próximos passos:" -ForegroundColor Yellow
    Write-Host "  1. Acesse: https://frontend-6lxaipjgp-razzachans-projects.vercel.app" -ForegroundColor Blue
    Write-Host "  2. Crie uma conta de teste" -ForegroundColor White
    Write-Host "  3. Execute: .\scripts\add-balance.ps1" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "`n❌ Erro ao executar seed!" -ForegroundColor Red
    Write-Host "Use a Opção 2 (Dashboard) acima" -ForegroundColor Yellow
}
