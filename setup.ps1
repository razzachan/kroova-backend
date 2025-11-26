# 🚀 Setup Script para Kroova Backend

Write-Host "🎨 Kroova Backend - Setup Profissional" -ForegroundColor Magenta
Write-Host ""

# Instalar dependências
Write-Host "📦 Instalando dependências..." -ForegroundColor Cyan
npm install

# Instalar dependências de desenvolvimento
Write-Host "🛠️ Instalando dependências de desenvolvimento..." -ForegroundColor Cyan
npm install --save-dev `
  eslint `
  prettier `
  husky `
  lint-staged `
  "@typescript-eslint/parser" `
  "@typescript-eslint/eslint-plugin" `
  vitest `
  "@vitest/coverage-v8" `
  "@commitlint/config-conventional" `
  "@commitlint/cli" `
  "eslint-config-prettier"

# Inicializar Husky
Write-Host "🪝 Configurando Husky..." -ForegroundColor Yellow
npx husky install

# Criar hooks
Write-Host "✨ Criando hooks..." -ForegroundColor Green

# Pre-commit hook (lint-staged)
npx husky add .husky/pre-commit "npx lint-staged"

# Commit-msg hook (commitlint)
npx husky add .husky/commit-msg 'npx commitlint --edit "$1"'

Write-Host ""
Write-Host "✅ Setup concluído!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos passos:" -ForegroundColor Yellow
Write-Host "  1. Configure o arquivo .env (copie de .env.example)"
Write-Host "  2. Execute 'npm run dev' para iniciar o servidor"
Write-Host "  3. Execute 'npm test' para rodar os testes"
Write-Host ""
Write-Host "🔐 Não esqueça de gerar uma chave de criptografia:" -ForegroundColor Cyan
Write-Host "  node -e `"console.log(require('crypto').randomBytes(32).toString('base64'))`""
Write-Host ""
