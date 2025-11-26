# 🧪 Kroova - Verificação Pós-Seed
# Uso:
#   .\scripts\post_seed_check.ps1 -ApiBase "https://api-staging.seu-dominio" [-InternalToken "secret"]
# Rotas verificadas:
#   /api/v1/boosters                (lista boosters)
#   /internal/distribution-summary  (raridades / skins)
#   /internal/economic-series?limit=1 (primeira entrada série econômica)
param(
    [string]$ApiBase = "http://127.0.0.1:3333",
    [string]$InternalToken
)

function Get-Json($url) {
    try {
        $headers = @{}
        if ($InternalToken) { $headers['x-internal-token'] = $InternalToken }
        Invoke-RestMethod -Uri $url -Headers $headers -Method GET -TimeoutSec 15
    } catch {
        Write-Host "❌ Falha em $url" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor DarkRed
        return $null
    }
}

Write-Host "🔍 Pós-Seed Check" -ForegroundColor Cyan
Write-Host "API Base: $ApiBase" -ForegroundColor Gray

# Boosters
Write-Host "➡️  Verificando boosters..." -ForegroundColor Yellow
$boosters = Get-Json "$ApiBase/api/v1/boosters"
if ($boosters -and $boosters.data) {
    Write-Host "✅ Boosters: $($boosters.data.Length) tipos" -ForegroundColor Green
    $boosters.data | Select-Object -First 5 | ForEach-Object { Write-Host "   • $_.name (R$ $_.price_brl)" -ForegroundColor Gray }
} else { Write-Host "⚠️  Boosters indisponíveis" -ForegroundColor Yellow }

# Distribuição
Write-Host "➡️  Verificando distribuição interna..." -ForegroundColor Yellow
$dist = Get-Json "$ApiBase/internal/distribution-summary"
if ($dist) {
    Write-Host "✅ Total cartas geradas (session counters): $($dist.totalCards)" -ForegroundColor Green
    Write-Host "Raridades:" -ForegroundColor Cyan
    $dist.rarities | ForEach-Object { Write-Host "   • $($_.key) = $($_.count) (${([math]::Round($_.pct,2))}%)" }
} else { Write-Host "⚠️  Distribuição não acessível" -ForegroundColor Yellow }

# Série Econômica
Write-Host "➡️  Verificando série econômica..." -ForegroundColor Yellow
$series = Get-Json "$ApiBase/internal/economic-series?limit=1"
if ($series -and $series.items) {
    if ($series.items.Length -gt 0) {
        $entry = $series.items[0]
        Write-Host "✅ Série econômica ativa (RTP: $([math]::Round($entry.rtp_pct,2))%)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Série econômica vazia" -ForegroundColor Yellow
    }
} else { Write-Host "⚠️  Série econômica não acessível" -ForegroundColor Yellow }

Write-Host "\n📌 Recomendações:" -ForegroundColor Yellow
Write-Host "   1. Abrir boosters para popular counters" -ForegroundColor White
Write-Host "   2. Verificar métricas via /internal/metrics.json" -ForegroundColor White
Write-Host "   3. Exportar auditoria via /internal/audit-export" -ForegroundColor White

Write-Host "\n✅ Pós-Seed Check concluído" -ForegroundColor Green
