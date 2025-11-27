
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
    .split(/;\s*\n/)
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
  
  console.log(`\n📊 Resultado: ${success} sucesso, ${failed} falhas`);
}

applyMigration().catch(console.error);
