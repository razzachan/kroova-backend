import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugOpen() {
  const userId = '15f2efb3-f1e6-4146-b35c-41d93f32d569';
  
  // Pegar TODOS os openings
  const { data: allOpenings } = await supabase
    .from('booster_openings')
    .select('*')
    .eq('user_id', userId);
    
  console.log('\n📊 TODOS OS OPENINGS DO USER:\n');
  console.log(JSON.stringify(allOpenings, null, 2));
  
  if (!allOpenings || allOpenings.length === 0) {
    console.log('\n❌ Nenhum opening encontrado! Precisa comprar um booster primeiro.\n');
    return;
  }
  
  // Verificar se existe algum com opened_at = null
  const unopened = allOpenings.filter(o => o.opened_at === null);
  console.log(`\n✅ Openings não abertos: ${unopened.length}`);
  console.log(`❌ Openings já abertos: ${allOpenings.length - unopened.length}`);
}

debugOpen().catch(console.error);
