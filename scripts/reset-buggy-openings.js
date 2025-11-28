import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixSchema() {
  console.log('\n🔧 Removendo DEFAULT da coluna opened_at...\n');
  
  // Supabase não expõe ALTER TABLE diretamente via SDK
  // Vamos fazer workaround: resetar manualmente os openings bugados
  
  console.log('📊 Resetando openings que foram marcados como abertos mas não têm cartas...\n');
  
  // Primeiro, buscar os openings com cards_obtained vazio
  const { data: toFix } = await supabase
    .from('booster_openings')
    .select('id, opened_at, cards_obtained')
    .not('opened_at', 'is', null);
    
  const buggyOpenings = toFix?.filter(o => 
    Array.isArray(o.cards_obtained) && o.cards_obtained.length === 0
  ) || [];
  
  console.log(`Encontrados ${buggyOpenings.length} openings bugados\n`);
  
  if (buggyOpenings.length === 0) {
    console.log('✅ Nenhum opening bugado encontrado!');
    return;
  }
  
  // Resetar um por um
  for (const opening of buggyOpenings) {
    const { error } = await supabase
      .from('booster_openings')
      .update({ opened_at: null })
      .eq('id', opening.id);
      
    if (error) {
      console.error(`❌ Erro ao resetar ${opening.id}:`, error.message);
    } else {
      console.log(`✅ ${opening.id.substring(0,13)}... resetado`);
    }
  }
  
  console.log('\n⚠️ IMPORTANTE: Execute no Supabase SQL Editor:');
  console.log(`
ALTER TABLE booster_openings 
ALTER COLUMN opened_at DROP DEFAULT;
  `);
  console.log('\nIsso evitará o problema em novos openings.');
}

fixSchema().catch(console.error);
