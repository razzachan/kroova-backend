import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkMultipliers() {
  const { data: boosters } = await supabase
    .from('booster_types')
    .select('name, price_brl, price_multiplier, cards_per_booster')
    .order('price_brl');
    
  console.log('\n📊 BOOSTERS E MULTIPLICADORES:\n');
  boosters?.forEach(b => {
    const name = b.name.padEnd(25);
    const price = `R$ ${String(b.price_brl).padEnd(6)}`;
    const mult = `×${b.price_multiplier}`;
    const cards = `${b.cards_per_booster} cartas`;
    console.log(`${name} ${price} ${mult.padStart(6)} = ${cards}`);
  });
}

checkMultipliers().catch(console.error);
