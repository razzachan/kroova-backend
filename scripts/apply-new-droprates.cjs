const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'frontend/.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function updateDropRates() {
  console.log('🎲 Atualizando drop rates dos booster tiers...\n');

  const updates = [
    {
      price_brl: 0.50,
      name: 'Básico',
      rarity_distribution: {
        meme: 30,
        trash: 55,
        viral: 12,
        legendary: 3,
        godmode: 0.2
      }
    },
    {
      price_brl: 1.00,
      name: 'Padrão',
      rarity_distribution: {
        meme: 25,
        trash: 45,
        viral: 20,
        legendary: 9,
        godmode: 1
      }
    },
    {
      price_brl: 2.00,
      name: 'Premium',
      rarity_distribution: {
        meme: 15,
        trash: 30,
        viral: 30,
        legendary: 22,
        godmode: 3
      }
    },
    {
      price_brl: 5.00,
      name: 'Elite',
      rarity_distribution: {
        meme: 5,
        trash: 15,
        viral: 30,
        legendary: 40,
        godmode: 10
      }
    },
    {
      price_brl: 10.00,
      name: 'Whale',
      rarity_distribution: {
        meme: 2,
        trash: 8,
        viral: 25,
        legendary: 45,
        godmode: 20
      }
    }
  ];

  for (const update of updates) {
    const { data, error } = await supabase
      .from('booster_types')
      .update({ rarity_distribution: update.rarity_distribution })
      .eq('price_brl', update.price_brl)
      .eq('edition_id', 'ED01')
      .select();

    if (error) {
      console.error(`❌ Erro ao atualizar ${update.name}:`, error);
    } else {
      console.log(`✅ ${update.name} (R$ ${update.price_brl.toFixed(2)}): ${data.length} registros atualizados`);
      console.log('   Nova distribuição:', update.rarity_distribution);
    }
  }

  console.log('\n✨ Drop rates atualizados!');
}

updateDropRates().catch(console.error);
