import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkEditions() {
  console.log('\n🎴 BOOSTERS:\n');
  const { data: boosters } = await supabase
    .from('booster_types')
    .select('id, name, edition_id, price_brl')
    .order('price_brl');
    
  boosters?.forEach(b => {
    console.log(`- ${b.name.padEnd(20)} R$ ${String(b.price_brl).padEnd(6)} edition_id: ${b.edition_id || 'NULL'}`);
  });
  
  console.log('\n📚 EDITIONS in edition_configs:\n');
  const { data: editions } = await supabase
    .from('edition_configs')
    .select('id, name');
    
  editions?.forEach(e => {
    console.log(`- ${e.id}: ${e.name}`);
  });
  
  // Verificar se edition_metrics tem registro para cada edition
  console.log('\n📊 EDITION METRICS:\n');
  const { data: metrics } = await supabase
    .from('edition_metrics')
    .select('edition_id, date, boosters_sold')
    .order('edition_id');
    
  if (!metrics || metrics.length === 0) {
    console.log('⚠️  Nenhum registro em edition_metrics!');
    console.log('Isso pode causar erro se houver trigger que espera registro existente.');
  } else {
    console.log(`Encontrados ${metrics.length} registros`);
  }
}

checkEditions().catch(console.error);
