"""
APPLY MIGRATION VIA SUPABASE MANAGEMENT API
Execute este script para aplicar a migration 001_edition_lifecycle.sql
"""

import os
import requests

SUPABASE_URL = "https://mmcytphoeyxeylvaqjgr.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tY3l0cGhvZXl4ZXlsdmFxamdyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDExNDIyMCwiZXhwIjoyMDc5NjkwMjIwfQ.EYLRZo0u0aaDTH-JWTp2SXQQZVdYTSgjL4N-IMLfI6c"

# Ler migration
script_dir = os.path.dirname(os.path.abspath(__file__))
migration_path = os.path.join(script_dir, "migrations", "001_edition_lifecycle.sql")

print("🚀 Lendo migration...")
with open(migration_path, "r", encoding="utf-8") as f:
    sql_content = f.read()

print(f"📄 Migration: {len(sql_content)} caracteres")
print("\n⚠️  ATENÇÃO: A API REST do Supabase não permite executar SQL direto.")
print("👉 Use uma das opções abaixo:\n")

print("OPÇÃO 1: Supabase Dashboard (Recomendado)")
print("-" * 50)
print("1. Abra: https://supabase.com/dashboard/project/mmcytphoeyxeylvaqjgr")
print("2. SQL Editor → New Query")
print(f"3. Cole o conteúdo de: {migration_path}")
print("4. Clique em RUN\n")

print("OPÇÃO 2: Via psql (se tiver PostgreSQL instalado)")
print("-" * 50)
print("psql -h db.mmcytphoeyxeylvaqjgr.supabase.co \\")
print("     -U postgres \\")
print("     -d postgres \\")
print("     -p 5432 \\")
print(f"     -f {migration_path}")
print("\nSenha: UL736KVA7ns+1zUARZezRSqSWvbBa9UEA39rAgahOmkWVhFwaduX9cAyoeS78SQbAYn4XKGuAHgGBuGNjO+ikQ==\n")

print("OPÇÃO 3: Node.js com Supabase Admin (Vou criar o script)")
print("-" * 50)
print("Aguarde, criando script alternativo...")

# Criar script Node.js
node_script = """
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://mmcytphoeyxeylvaqjgr.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tY3l0cGhvZXl4ZXlsdmFxamdyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDExNDIyMCwiZXhwIjoyMDc5NjkwMjIwfQ.EYLRZo0u0aaDTH-JWTp2SXQQZVdYTSgjL4N-IMLfI6c';

const supabase = createClient(supabaseUrl, serviceKey);

async function applyMigration() {
  console.log('🚀 Aplicando migration...');
  
  const migrationPath = path.join(__dirname, 'migrations', '001_edition_lifecycle.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');
  
  // Dividir em comandos
  const commands = sql
    .split(/;\\s*\\n/)
    .filter(cmd => cmd.trim() && !cmd.trim().startsWith('--'));
  
  console.log(`📄 ${commands.length} comandos encontrados`);
  
  let success = 0;
  let failed = 0;
  
  for (const command of commands) {
    try {
      // Usar rpc para executar SQL bruto
      const { data, error } = await supabase.rpc('exec_sql', { query: command.trim() });
      
      if (error) throw error;
      success++;
      console.log('✅ OK');
    } catch (err) {
      const msg = err.message || err;
      if (msg.includes('already exists') || msg.includes('duplicate')) {
        console.log('⚠️  Skip (já existe)');
      } else {
        failed++;
        console.error('❌ Erro:', msg);
      }
    }
  }
  
  console.log(`\\n📊 Resultado: ${success} sucesso, ${failed} falhas`);
}

applyMigration().catch(console.error);
"""

node_script_path = os.path.join(script_dir, "apply-migration.js")
with open(node_script_path, "w", encoding="utf-8") as f:
    f.write(node_script)

print(f"✅ Script criado: {node_script_path}")
print("\n Para executar:")
print(f"   cd {script_dir}")
print("   node apply-migration.js\n")

print("=" * 50)
print("🎯 RECOMENDAÇÃO FINAL:")
print("=" * 50)
print("Use o Supabase Dashboard (OPÇÃO 1) - é o mais confiável!")
print("Link direto: https://supabase.com/dashboard/project/mmcytphoeyxeylvaqjgr/sql/new")
