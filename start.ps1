# 🚀 Script de Inicialização Rápida do Krouva (ex-Kroova)
# Execute este script para configurar e iniciar tudo

Write-Host "🃏 KROUVA - Quick Start Setup" -ForegroundColor Cyan
Write-Host "==============================`n" -ForegroundColor Cyan

# 1. Verificar Node.js
Write-Host "1. Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js $nodeVersion installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Install from nodejs.org" -ForegroundColor Red
    exit
}

# 2. Verificar Docker
Write-Host "`n2. Checking Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker installed: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker not found. Install Docker Desktop" -ForegroundColor Red
    exit
}

# 3. Verificar se Docker está rodando
Write-Host "`n3. Checking if Docker is running..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Start Docker Desktop" -ForegroundColor Red
    exit
}

# 4. Verificar dependências
Write-Host "`n4. Checking dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "⚠️  Installing dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
}

# 5. Verificar .env
Write-Host "`n5. Checking .env configuration..." -ForegroundColor Yellow
if (Test-Path ".env") {
    $envContent = Get-Content ".env" -Raw
    if ($envContent -match "your-project") {
        Write-Host "⚠️  .env needs configuration" -ForegroundColor Yellow
    } else {
        Write-Host "✅ .env configured" -ForegroundColor Green
    }
} else {
    Write-Host "⚠️  Creating .env from example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ .env created - please configure it" -ForegroundColor Green
}

# 6. Iniciar Supabase
Write-Host "`n6. Starting Supabase..." -ForegroundColor Yellow
Write-Host "   (This may take a few minutes on first run)" -ForegroundColor Gray

$supabaseStatus = npx supabase status 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Supabase already running" -ForegroundColor Green
} else {
    Write-Host "   Starting containers..." -ForegroundColor Gray
    npx supabase start
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Supabase started" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to start Supabase" -ForegroundColor Red
        exit
    }
}

# 7. Obter credenciais Supabase
Write-Host "`n7. Getting Supabase credentials..." -ForegroundColor Yellow
$status = npx supabase status --output json | ConvertFrom-Json

Write-Host "✅ Supabase running:" -ForegroundColor Green
Write-Host "   API URL: $($status.API_URL)" -ForegroundColor Cyan
Write-Host "   Studio: $($status.STUDIO_URL)" -ForegroundColor Cyan

# 8. Aplicar Migration
Write-Host "`n8. Applying database migration..." -ForegroundColor Yellow
npx supabase db reset --db-url $status.DB_URL
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Migration applied successfully" -ForegroundColor Green
} else {
    Write-Host "⚠️  Migration may have issues - check manually" -ForegroundColor Yellow
}

# 9. Iniciar servidor
Write-Host "`n9. Starting Krouva API..." -ForegroundColor Yellow
Write-Host "   Server will start on http://localhost:3333" -ForegroundColor Gray
Write-Host "`n📝 To test the API, run: .\test-api.ps1" -ForegroundColor Yellow
Write-Host "📊 To view database, open: $($status.STUDIO_URL)" -ForegroundColor Yellow
Write-Host "`n🚀 Starting server..." -ForegroundColor Green
npm run dev
