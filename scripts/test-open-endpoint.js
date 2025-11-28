import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testOpen() {
  const openingId = '7b801ec1-12e2-4c26-b829-f7b6ee1035d2';
  const userId = '15f2efb3-f1e6-4146-b35c-41d93f32d569';

  console.log('\n🔍 Buscando opening...\n');
  
  const { data: opening, error: openingError } = await supabase
    .from('booster_openings')
    .select('*, booster_type:booster_types(*)')
    .eq('id', openingId)
    .eq('user_id', userId)
    .single();

  if (openingError) {
    console.error('❌ Erro ao buscar opening:', openingError);
    return;
  }

  console.log('✅ Opening:', JSON.stringify(opening, null, 2));

  const boosterType = opening.booster_type;
  const editionId = boosterType.edition_id || 'ED01';

  console.log('\n🔍 Buscando edition_configs para:', editionId, '\n');

  const { data: editionConfig, error: editionError } = await supabase
    .from('edition_configs')
    .select('*')
    .eq('id', editionId)
    .single();

  if (editionError) {
    console.error('❌ Erro ao buscar edition_configs:', editionError);
    console.log('\n⚠️ Tabela edition_configs não existe ou não tem dados!');
    console.log('Precisamos criar essa tabela ou simplificar o endpoint /open');
    return;
  }

  console.log('✅ Edition Config:', JSON.stringify(editionConfig, null, 2));
}

testOpen().catch(console.error);
