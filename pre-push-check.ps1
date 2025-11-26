# 🔍 Pre-Push Check - Kroova Backend
# Executa verificações antes de fazer push

Write-Host "🔍 Executando verificações pré-push..." -ForegroundColor Cyan
Write-Host ""

$hasErrors = $false

# 1. Lint
Write-Host "📝 Verificando lint..." -ForegroundColor Yellow
npm run lint
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erros de lint encontrados!" -ForegroundColor Red
    $hasErrors = $true
} else {
    Write-Host "✅ Lint OK" -ForegroundColor Green
}
Write-Host ""

# 2. Format Check
Write-Host "🎨 Verificando formatação..." -ForegroundColor Yellow
npm run format:check
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Código não está formatado!" -ForegroundColor Red
    Write-Host "Execute: npm run format" -ForegroundColor Yellow
    $hasErrors = $true
} else {
    Write-Host "✅ Formatação OK" -ForegroundColor Green
}
Write-Host ""

# 3. Tests
Write-Host "🧪 Executando testes..." -ForegroundColor Yellow
npm test
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Testes falharam!" -ForegroundColor Red
    $hasErrors = $true
} else {
    Write-Host "✅ Testes OK" -ForegroundColor Green
}
Write-Host ""

# 4. Build
Write-Host "🔨 Verificando build..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build falhou!" -ForegroundColor Red
    $hasErrors = $true
} else {
    Write-Host "✅ Build OK" -ForegroundColor Green
}
Write-Host ""

# 5. Security Audit
Write-Host "🛡️ Verificando segurança..." -ForegroundColor Yellow
npm run security:audit
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️ Vulnerabilidades encontradas" -ForegroundColor Yellow
    Write-Host "Avalie se são críticas antes de continuar" -ForegroundColor Yellow
}
Write-Host ""

# Resultado final
if ($hasErrors) {
    Write-Host "❌ Push bloqueado! Corrija os erros acima." -ForegroundColor Red
    exit 1
} else {
    Write-Host "✅ Todas as verificações passaram!" -ForegroundColor Green
    Write-Host "🚀 Pode fazer push com segurança!" -ForegroundColor Cyan
    exit 0
}
