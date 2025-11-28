import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkOpenings() {
  const userId = '15f2efb3-f1e6-4146-b35c-41d93f32d569';
  
  const { data: openings } = await supabase
    .from('booster_openings')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5);
    
  console.log('\n📦 ÚLTIMOS BOOSTER OPENINGS:\n');
  openings?.forEach((o, i) => {
    console.log(`${i+1}. ID: ${o.id.substring(0,13)}...`);
    console.log(`   opened_at: ${o.opened_at || 'NULL (não aberto)'}`);
    console.log(`   cards_obtained: ${JSON.stringify(o.cards_obtained)}`);
    console.log('');
  });
  
  // Pegar o mais recente não aberto
  const notOpened = openings?.find(o => !o.opened_at);
  if (notOpened) {
    console.log(`\n✅ Opening disponível para abrir: ${notOpened.id}\n`);
    return notOpened.id;
  } else {
    console.log('\n❌ Nenhum opening disponível (todos já foram abertos)\n');
    return null;
  }
}

checkOpenings().catch(console.error);
