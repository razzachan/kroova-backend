const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'frontend/.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkCardValues() {
  console.log('💰 Verificando valores de liquidez das cartas no banco...\n');

  const { data, error } = await supabase
    .from('cards_base')
    .select('rarity, base_liquidity_brl')
    .eq('edition_id', 'ED01')
    .order('rarity');

  if (error) {
    console.error('❌ Erro:', error);
    return;
  }

  // Group by rarity
  const byRarity = {};
  for (const card of data) {
    if (!byRarity[card.rarity]) {
      byRarity[card.rarity] = [];
    }
    byRarity[card.rarity].push(card.base_liquidity_brl);
  }

  console.log('📊 Valores de base_liquidity_brl por raridade:\n');
  
  for (const [rarity, values] of Object.entries(byRarity)) {
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    console.log(`${rarity.toUpperCase()}:`);
    console.log(`  Quantidade: ${values.length} cartas`);
    console.log(`  Média: R$ ${avg.toFixed(4)}`);
    console.log(`  Min/Max: R$ ${min.toFixed(4)} / R$ ${max.toFixed(4)}`);
    console.log();
  }
}

checkCardValues().catch(console.error);
