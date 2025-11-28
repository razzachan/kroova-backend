import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixEditionIds() {
  console.log('\n🔧 Corrigindo edition_id dos boosters bugados...\n');
  
  const { data, error } = await supabase
    .from('booster_types')
    .update({ edition_id: 'ED01' })
    .in('name', ['Booster Básico', 'Booster Premium', 'Booster Lendário'])
    .select();
    
  if (error) {
    console.error('❌ Erro:', error);
    return;
  }
  
  console.log(`✅ Corrigidos ${data?.length} boosters:\n`);
  data?.forEach(b => {
    console.log(`- ${b.name}: ${b.edition_id}`);
  });
}

fixEditionIds().catch(console.error);
