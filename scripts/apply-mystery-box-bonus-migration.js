// Script para aplicar migration do Mystery Box Bonus System via Supabase client
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = 'https://mmcytphoeyxeylvaqjgr.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tY3l0cGhvZXl4ZXlsdmFxamdyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDExNDIyMCwiZXhwIjoyMDc5NjkwMjIwfQ.mPKc2a3A4kL1LUzX9BjTsaCz3OGAWLGIBYV0TSa20Fw';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  console.log('🚀 Aplicando migration: Mystery Box Booster Bonus System...\n');
  
  try {
    // Ler o arquivo SQL
    const sqlPath = join(__dirname, '..', 'supabase', 'migrations', '20251204_add_mystery_box_booster_bonus.sql');
    const sqlContent = readFileSync(sqlPath, 'utf8');
    
    // Executar via RPC (Supabase permite SQL direto via service_role)
    const { data, error } = await supabase.rpc('exec_sql', { query: sqlContent });
    
    if (error) {
      console.error('❌ Erro ao aplicar migration:', error);
      process.exit(1);
    }
    
    console.log('✅ Migration aplicada com sucesso!\n');
    
    // Verificar resultado
    const { data: boosterTypes } = await supabase
      .from('booster_types')
      .select('name, price_brl, mystery_box_bonus_chance')
      .order('price_brl');
    
    console.log('📊 Booster Types com bonus configurado:');
    console.table(boosterTypes);
    
  } catch (error) {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  }
}

applyMigration();
