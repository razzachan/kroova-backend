import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixMultipliers() {
  console.log('\n🔧 Corrigindo price_multipliers...\n');
  
  // Fórmula: price_multiplier ≈ price_brl / 0.5 (preço base)
  // Ajustado para manter RTP ~30% (house edge 70%)
  
  const updates = [
    { name: 'Booster Básico', price_multiplier: 15 },      // R$ 25 / 0.5 × 0.3
    { name: 'Booster Premium', price_multiplier: 45 },     // R$ 75 / 0.5 × 0.3
    { name: 'Booster Lendário', price_multiplier: 150 },   // R$ 250 / 0.5 × 0.3
  ];
  
  for (const update of updates) {
    const { data, error } = await supabase
      .from('booster_types')
      .update({ price_multiplier: update.price_multiplier })
      .eq('name', update.name)
      .select();
      
    if (error) {
      console.error(`❌ ${update.name}:`, error.message);
    } else {
      console.log(`✅ ${update.name}: price_multiplier = ${update.price_multiplier}`);
    }
  }
  
  console.log('\n✅ Multiplicadores corrigidos!\n');
  console.log('Execute novamente a simulação para verificar o RTP.');
}

fixMultipliers().catch(console.error);
