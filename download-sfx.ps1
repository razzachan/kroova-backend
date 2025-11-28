# 🎵 Download Rápido de Sons (Script PowerShell)

# Criar pasta de SFX
New-Item -Path "C:\Kroova\frontend\public\sfx" -ItemType Directory -Force

# Sons gratuitos de alta qualidade (URLs diretas Pixabay/Freesound)
$sounds = @{
    "card-flip.mp3" = "https://cdn.pixabay.com/download/audio/2022/03/24/audio_8c93cb3bb1.mp3"
    "reveal-common.mp3" = "https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3"
    "reveal-rare.mp3" = "https://cdn.pixabay.com/download/audio/2022/03/10/audio_d1718ab41b.mp3"
    "reveal-epic.mp3" = "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c610232532.mp3"
    "reveal-legendary.mp3" = "https://cdn.pixabay.com/download/audio/2021/08/04/audio_12b0c7443c.mp3"
    "reveal-godmode.mp3" = "https://cdn.pixabay.com/download/audio/2022/08/02/audio_884fe50c21.mp3"
}

# Download
foreach ($sound in $sounds.GetEnumerator()) {
    $output = "C:\Kroova\frontend\public\sfx\$($sound.Key)"
    Write-Host "Downloading $($sound.Key)..." -ForegroundColor Cyan
    try {
        Invoke-WebRequest -Uri $sound.Value -OutFile $output -ErrorAction Stop
        Write-Host "✓ $($sound.Key) downloaded" -ForegroundColor Green
    } catch {
        Write-Host "✗ Failed to download $($sound.Key)" -ForegroundColor Red
    }
}

Write-Host "`n✅ All sounds downloaded to frontend/public/sfx/" -ForegroundColor Green
Write-Host "Now uncomment cardAudio.enableRealAudio(true) in your code!" -ForegroundColor Yellow
