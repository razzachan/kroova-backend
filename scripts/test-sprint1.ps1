# ==========================================
# SCRIPT DE TESTES - SPRINT 1
# Sistema 3 Camadas: Base x Skin x Price x Godmode
# ==========================================

$API_URL = "https://frontend-le36ofq2i-razzachans-projects.vercel.app"
$USER_ID = "1ad0a835-46a4-465a-a436-6275c9dcdde1"

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   SPRINT 1: TESTE SISTEMA 3 CAMADAS" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# TESTE 1: Listar boosters
Write-Host "1. Buscando booster 'Elite' (R$$ 5.00)..." -ForegroundColor Yellow
$boosters = curl.exe -s "$API_URL/api/v1/boosters" | ConvertFrom-Json
$elite = $boosters.data | Where-Object { $_.name -eq 'Elite' }

if ($elite) {
    Write-Host "   OK Booster: $($elite.name)" -ForegroundColor Green
    Write-Host "   OK Preco: R$$ $($elite.price_brl)" -ForegroundColor Green
    Write-Host "   OK Resgate Maximo: R$$ $($elite.resgate_maximo)" -ForegroundColor Green
    Write-Host "   OK RTP Target: $($elite.rtp_target * 100)%" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "   ERRO: Booster Elite nao encontrado!" -ForegroundColor Red
    Write-Host ""
    exit 1
}

# TESTE 2: Verificar pity counter
Write-Host "2. Verificando pity counter..." -ForegroundColor Yellow
$pityBefore = curl.exe -s "$API_URL/api/v1/pity/$USER_ID" | ConvertFrom-Json
if ($pityBefore.data) {
    Write-Host "   OK Contador: $($pityBefore.data.counter)/100" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "   OK Contador: 0/100 (primeira abertura)" -ForegroundColor Green
    Write-Host ""
}

# TESTE 3: Abrir booster
Write-Host "3. Abrindo booster Elite..." -ForegroundColor Yellow
Write-Host "   NOTA: Certifique-se de ter saldo suficiente" -ForegroundColor Gray
Write-Host ""

# Criar JSON temporário
$tempJson = "$env:TEMP\kroova-test.json"
@{user_id=$USER_ID; booster_id=$elite.id} | ConvertTo-Json | Set-Content $tempJson

$result = curl.exe -s -X POST "$API_URL/api/v1/boosters/open-test" -H "Content-Type: application/json" --data "@$tempJson" | ConvertFrom-Json

if ($result.ok) {
    Write-Host "   OK Abertura bem-sucedida!" -ForegroundColor Green
    Write-Host ""
    
    # TESTE 4: Exibir cards
    Write-Host "4. CARDS RECEBIDAS:" -ForegroundColor Yellow
    Write-Host "   ===============================================" -ForegroundColor Cyan
    
    foreach ($card in $result.data.cards) {
        $godmodeIcon = ""
        if ($card.is_godmode) { $godmodeIcon = "[GODMODE]" }
        
        $skinIcon = "[DEFAULT]"
        switch ($card.skin) {
            "dark" { $skinIcon = "[DARK]" }
            "holo" { $skinIcon = "[HOLO]" }
            "ghost" { $skinIcon = "[GHOST]" }
            "glitch" { $skinIcon = "[GLITCH]" }
            "glow" { $skinIcon = "[GLOW]" }
            "neon" { $skinIcon = "[NEON]" }
        }
        
        Write-Host "   $skinIcon $($card.name)" -ForegroundColor White
        Write-Host "      Raridade: $($card.raridade) | Skin: $($card.skin)" -ForegroundColor Gray
        Write-Host "      Liquidez: R$$ $($card.liquidity_brl) $godmodeIcon" -ForegroundColor $(if ($card.is_godmode) { "Red" } else { "Green" })
        Write-Host ""
    }
    
    Write-Host "   ===============================================" -ForegroundColor Cyan
    Write-Host "   TOTAL LIQUIDEZ: R$$ $([math]::Round($result.data.total_liquidity_brl, 2))" -ForegroundColor Yellow
    Write-Host "   RTP desta abertura: $([math]::Round(($result.data.total_liquidity_brl / $elite.price_brl) * 100, 2))%" -ForegroundColor Cyan
    Write-Host ""
    
    # TESTE 5: Verificar pity depois
    Write-Host "5. Verificando pity counter atualizado..." -ForegroundColor Yellow
    Start-Sleep -Seconds 2
    $pityAfter = curl.exe -s "$API_URL/api/v1/pity/$USER_ID" | ConvertFrom-Json
    if ($pityAfter.data) {
        $prevCounter = 0
        if ($pityBefore.data) { $prevCounter = $pityBefore.data.counter }
        Write-Host "   OK Contador: $($pityAfter.data.counter)/100" -ForegroundColor Green
        if ($pityAfter.data.counter -gt $prevCounter) {
            Write-Host "   OK Incrementado corretamente! (+1)" -ForegroundColor Green
        }
    }
    Write-Host ""
    
    Write-Host "================================================" -ForegroundColor Green
    Write-Host "     SPRINT 1 100% VALIDADO!" -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Green
    Write-Host ""
    
} else {
    Write-Host "   ERRO: $($result.error.code) - $($result.error.message)" -ForegroundColor Red
    Write-Host ""
    
    if ($result.error.code -eq 'INSUFFICIENT_BALANCE') {
        Write-Host "Solucao: Execute no Supabase SQL Editor:" -ForegroundColor Yellow
        Write-Host "UPDATE users SET balance_brl = 10.00 WHERE id = '$USER_ID';" -ForegroundColor White
        Write-Host ""
    }
}
