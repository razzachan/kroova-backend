# ==========================================
# SCRIPT DE TESTES - SPRINT 1
# ==========================================

$API_URL = "https://frontend-mg8f07i85-razzachans-projects.vercel.app"
$EMAIL = "akroma.julio@gmail.com"

Write-Host "`n🧪 INICIANDO TESTES DO SPRINT 1" -ForegroundColor Cyan
Write-Host "=" * 50

# TESTE 1: Verificar endpoint de boosters
Write-Host "`n[1/5] Testando GET /api/v1/boosters..." -ForegroundColor Yellow
try {
    $boosters = curl.exe -s "$API_URL/api/v1/boosters" | ConvertFrom-Json
    
    if ($boosters.ok) {
        Write-Host "✅ Boosters carregados: $($boosters.data.Count)" -ForegroundColor Green
        
        # Verificar se tem resgate_maximo
        $whale = $boosters.data | Where-Object { $_.name -eq "Whale" }
        if ($whale -and $whale.resgate_maximo) {
            Write-Host "✅ Resgate máximo calculado: R$ $($whale.resgate_maximo)" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Campo resgate_maximo não encontrado (migration não aplicada?)" -ForegroundColor Yellow
        }
        
        # Mostrar tabela
        Write-Host "`n📊 Boosters disponíveis:" -ForegroundColor Cyan
        $boosters.data | Select-Object name, price_brl, @{N='resgate_max';E={$_.resgate_maximo}}, @{N='rtp';E={$_.rtp_target}} | Format-Table
    } else {
        Write-Host "❌ Erro ao carregar boosters" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erro: $($_.Exception.Message)" -ForegroundColor Red
}

# TESTE 2: Login
Write-Host "`n[2/5] Testando login..." -ForegroundColor Yellow
$password = Read-Host "Digite a senha para $EMAIL" -AsSecureString
$plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))

try {
    $loginBody = @{
        email = $EMAIL
        password = $plainPassword
    } | ConvertTo-Json

    $login = curl.exe -s -X POST "$API_URL/api/v1/auth/login" `
        -H "Content-Type: application/json" `
        -d $loginBody | ConvertFrom-Json
    
    if ($login.ok) {
        $global:token = $login.data.session.access_token
        $global:userId = $login.data.user.id
        Write-Host "✅ Login OK - User: $($login.data.user.email)" -ForegroundColor Green
    } else {
        Write-Host "❌ Erro no login: $($login.error.message)" -ForegroundColor Red
        exit
    }
} catch {
    Write-Host "❌ Erro: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# TESTE 3: Verificar pity counter
Write-Host "`n[3/5] Testando GET /api/v1/pity/:userId..." -ForegroundColor Yellow
try {
    $pity = curl.exe -s "$API_URL/api/v1/pity/$global:userId`?edition_id=ED01" `
        -H "Authorization: Bearer $global:token" | ConvertFrom-Json
    
    if ($pity.ok) {
        Write-Host "✅ Pity counter: $($pity.data.counter) / 100" -ForegroundColor Green
        Write-Host "   Restantes para garantia: $($pity.data.remaining)" -ForegroundColor Gray
    } else {
        Write-Host "⚠️  Pity counter não disponível (migration não aplicada?)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Endpoint /pity não disponível" -ForegroundColor Yellow
}

# TESTE 4: Comprar booster
Write-Host "`n[4/5] Testando compra de booster..." -ForegroundColor Yellow
$confirmPurchase = Read-Host "Deseja comprar 1 booster Básico (R$ 0.50)? (s/n)"

if ($confirmPurchase -eq 's') {
    try {
        $purchaseBody = @{
            booster_type_id = "ed01-basico"
            quantity = 1
        } | ConvertTo-Json

        $purchase = curl.exe -s -X POST "$API_URL/api/v1/boosters/purchase" `
            -H "Authorization: Bearer $global:token" `
            -H "Content-Type: application/json" `
            -d $purchaseBody | ConvertFrom-Json
        
        if ($purchase.ok) {
            Write-Host "✅ Booster comprado!" -ForegroundColor Green
            $openingId = $purchase.data.openings[0].id
            Write-Host "   Opening ID: $openingId" -ForegroundColor Gray
            
            # TESTE 5: Abrir booster
            Write-Host "`n[5/5] Testando abertura de booster (3-layer system)..." -ForegroundColor Yellow
            Start-Sleep -Seconds 1
            
            $openBody = @{
                opening_id = $openingId
            } | ConvertTo-Json

            $open = curl.exe -s -X POST "$API_URL/api/v1/boosters/open" `
                -H "Authorization: Bearer $global:token" `
                -H "Content-Type: application/json" `
                -d $openBody | ConvertFrom-Json
            
            if ($open.ok) {
                Write-Host "✅ Booster aberto! $($open.data.cards.Count) cartas geradas" -ForegroundColor Green
                
                # Verificar se tem 3-layer system
                $hasGodmode = $open.data.cards | Where-Object { $_.is_godmode -eq $true }
                $hasSkins = $open.data.cards | Where-Object { $_.skin -ne 'default' }
                $hasLiquidity = $open.data.cards | Where-Object { $_.liquidity_brl -gt 0 }
                
                if ($hasLiquidity) {
                    Write-Host "✅ 3-layer system funcionando (liquidez calculada)" -ForegroundColor Green
                } else {
                    Write-Host "⚠️  liquidez_brl não encontrado (migration não aplicada?)" -ForegroundColor Yellow
                }
                
                if ($hasGodmode) {
                    Write-Host "🎉 GODMODE SORTEADO!" -ForegroundColor Magenta
                }
                
                Write-Host "`n📊 Cartas recebidas:" -ForegroundColor Cyan
                $open.data.cards | Select-Object `
                    @{N='Nome';E={$_.card.name}}, `
                    @{N='Raridade';E={$_.card.rarity}}, `
                    @{N='Skin';E={$_.skin}}, `
                    @{N='Godmode';E={$_.is_godmode}}, `
                    @{N='Liquidez';E={"R$ $($_.liquidity_brl)"}} | Format-Table
                
                # Total de liquidez
                $totalLiquidity = ($open.data.cards | Measure-Object -Property liquidity_brl -Sum).Sum
                Write-Host "💰 Total de liquidez: R$ $([math]::Round($totalLiquidity, 2))" -ForegroundColor Green
                Write-Host "📈 RTP desta abertura: $([math]::Round(($totalLiquidity / 0.50) * 100, 2))%" -ForegroundColor Cyan
                
            } else {
                Write-Host "❌ Erro ao abrir: $($open.error.message)" -ForegroundColor Red
            }
        } else {
            Write-Host "❌ Erro na compra: $($purchase.error.message)" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Erro: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "⏭️  Teste de compra pulado" -ForegroundColor Gray
}

Write-Host "`n" + ("=" * 50)
Write-Host "🎯 TESTES CONCLUÍDOS!" -ForegroundColor Cyan
Write-Host "`n📋 Checklist:" -ForegroundColor Yellow
Write-Host "   [?] Migration aplicada no Supabase?" -ForegroundColor Gray
Write-Host "   [✅] Deploy do backend no Vercel" -ForegroundColor Green
Write-Host "   [?] 3-layer system funcionando?" -ForegroundColor Gray
Write-Host "`n👉 Próximo passo: Aplicar migration no Dashboard" -ForegroundColor Cyan
Write-Host "   https://supabase.com/dashboard/project/mmcytphoeyxeylvaqjgr/sql/new" -ForegroundColor Gray
