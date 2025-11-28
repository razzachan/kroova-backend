import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function findTable() {
  const tables = [
    'booster_openings',
    'booster_opening', 
    'boosters_opened',
    'pack_openings',
    'opening',
    'openings'
  ];
  
  console.log('\n🔍 Procurando tabela de booster openings...\n');
  
  for (const tableName of tables) {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
      
    if (!error) {
      console.log(`✅ TABELA ENCONTRADA: ${tableName}`);
      console.log('Colunas:', data ? Object.keys(data[0] || {}).join(', ') : 'vazia');
      return tableName;
    } else if (error.code !== '42P01' && error.code !== 'PGRST116') {
      console.log(`⚠️  ${tableName}: ${error.message}`);
    }
  }
  
  console.log('\n❌ Nenhuma tabela de booster openings encontrada!');
  console.log('A tabela precisa ser criada no Supabase.');
  return null;
}

findTable().catch(console.error);
