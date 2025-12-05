# Script para atualizar CORS via Supabase Management API
# Requer: SUPABASE_ACCESS_TOKEN (Personal Access Token do Dashboard)

$PROJECT_REF = "mmcytphoeyxeylvaqjgr"
$ACCESS_TOKEN = $env:SUPABASE_ACCESS_TOKEN

if (-not $ACCESS_TOKEN) {
    Write-Host "❌ Erro: SUPABASE_ACCESS_TOKEN não encontrado!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Para obter o token:" -ForegroundColor Yellow
    Write-Host "1. Acesse: https://supabase.com/dashboard/account/tokens" -ForegroundColor Cyan
    Write-Host "2. Clique em 'Generate New Token'" -ForegroundColor Cyan
    Write-Host "3. Copie o token e execute:" -ForegroundColor Cyan
    Write-Host "   `$env:SUPABASE_ACCESS_TOKEN = 'seu-token-aqui'" -ForegroundColor Green
    Write-Host "4. Execute este script novamente" -ForegroundColor Cyan
    Write-Host ""
    exit 1
}

Write-Host "🔧 Atualizando configuração de Auth CORS..." -ForegroundColor Cyan
Write-Host ""

$allowedUrls = @(
    "https://frontend-razzachans-projects.vercel.app/**",
    "https://frontend-cyan-nine-hl1m0yayym.vercel.app/**",
    "https://frontend-razzachan-razzachans-projects.vercel.app/**",
    "http://localhost:3000/**"
)

$body = @{
    site_url = "https://frontend-razzachans-projects.vercel.app"
    additional_redirect_urls = $allowedUrls
} | ConvertTo-Json

Write-Host "📝 Configuração a ser aplicada:" -ForegroundColor Yellow
Write-Host $body
Write-Host ""

$headers = @{
    "Authorization" = "Bearer $ACCESS_TOKEN"
    "Content-Type" = "application/json"
}

$url = "https://api.supabase.com/v1/projects/$PROJECT_REF/config/auth"

try {
    $response = Invoke-RestMethod -Uri $url -Method PATCH -Headers $headers -Body $body
    Write-Host "✅ Configuração atualizada com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎯 Próximos passos:" -ForegroundColor Cyan
    Write-Host "1. Aguarde 30-60 segundos para propagação" -ForegroundColor White
    Write-Host "2. Teste o login em: https://frontend-razzachans-projects.vercel.app/login" -ForegroundColor White
    Write-Host "3. Se ainda falhar, limpe o cache do navegador (Ctrl+Shift+R)" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host "❌ Erro ao atualizar configuração!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Detalhes do erro:" -ForegroundColor Yellow
    Write-Host $_.Exception.Message
    Write-Host ""
    Write-Host "💡 Alternativa: Configure manualmente via Dashboard" -ForegroundColor Cyan
    Write-Host "   https://supabase.com/dashboard/project/$PROJECT_REF/auth/url-configuration" -ForegroundColor White
    exit 1
}
