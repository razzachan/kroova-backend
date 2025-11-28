import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function resetOpening() {
  const openingId = '7b801ec1-12e2-4c26-b829-f7b6ee1035d2';
  
  console.log('\n🔄 Resetando opening para permitir nova abertura...\n');
  
  const { data, error } = await supabase
    .from('booster_openings')
    .update({
      opened_at: null,
      cards_obtained: []
    })
    .eq('id', openingId)
    .select()
    .single();
    
  if (error) {
    console.error('❌ Erro:', error);
  } else {
    console.log('✅ Opening resetado:', data);
    console.log('\nAgora pode testar a abertura no frontend!');
    console.log('URL: https://frontend-[NEW_HASH]-razzachans-projects.vercel.app/boosters');
  }
}

resetOpening().catch(console.error);
