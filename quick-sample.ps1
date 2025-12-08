# Script para executar múltiplas amostras do test-production-boosters.py
# e coletar estatísticas

Write-Host "======================================================"
Write-Host "AMOSTRAGEM RÁPIDA - 5 EXECUÇÕES"
Write-Host "======================================================"
Write-Host ""

$results = @()

for ($i = 1; $i -le 5; $i++) {
    Write-Host "========== AMOSTRA $i/5 ==========" -ForegroundColor Cyan
    $output = python test-production-boosters.py 2>&1
    
    # Extrair RTPs do output
    if ($output -match "Básico.*?(\d+\.\d+)%") {
        $basico = [double]$Matches[1]
    }
    if ($output -match "Padrão.*?(\d+\.\d+)%") {
        $padrao = [double]$Matches[1]
    }
    if ($output -match "Premium.*?(\d+\.\d+)%") {
        $premium = [double]$Matches[1]
    }
    if ($output -match "Elite.*?(\d+\.\d+)%") {
        $elite = [double]$Matches[1]
    }
    if ($output -match "Whale.*?(\d+\.\d+)%") {
        $whale = [double]$Matches[1]
    }
    
    $results += @{
        'Amostra' = $i
        'Básico' = $basico
        'Padrão' = $padrao
        'Premium' = $premium
        'Elite' = $elite
        'Whale' = $whale
    }
    
    Write-Host ""
    Start-Sleep -Seconds 3
}

Write-Host ""
Write-Host "======================================================"
Write-Host "ESTATÍSTICAS FINAIS"
Write-Host "======================================================"
Write-Host ""

# Calcular médias
$basicoMean = ($results | ForEach-Object { $_['Básico'] } | Measure-Object -Average).Average
$padraoMean = ($results | ForEach-Object { $_['Padrão'] } | Measure-Object -Average).Average
$premiumMean = ($results | ForEach-Object { $_['Premium'] } | Measure-Object -Average).Average
$eliteMean = ($results | ForEach-Object { $_['Elite'] } | Measure-Object -Average).Average
$whaleMean = ($results | ForEach-Object { $_['Whale'] } | Measure-Object -Average).Average

Write-Host ("Básico:  {0:F1}% (média de 5 amostras)" -f $basicoMean)
Write-Host ("Padrão:  {0:F1}% (média de 5 amostras)" -f $padraoMean)
Write-Host ("Premium: {0:F1}% (média de 5 amostras)" -f $premiumMean)
Write-Host ("Elite:   {0:F1}% (média de 5 amostras)" -f $eliteMean)
Write-Host ("Whale:   {0:F1}% (média de 5 amostras)" -f $whaleMean)

Write-Host ""
Write-Host "TARGET: 62-72% RTP"
