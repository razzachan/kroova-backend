const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'frontend/.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function applyMarketTiers() {
  console.log('🔧 Aplicando sistema de Market Tiers...\n');
  
  // Passo 1: Adicionar coluna market_tier (via ALTER)
  console.log('1️⃣ Adicionando coluna market_tier_filter em booster_types...');
  
  // Usar query direta para ALTER TABLE
  const { data: d1, error: e1 } = await supabase
    .from('booster_types')
    .select('id')
    .limit(1);
  
  if (e1) {
    console.error('❌ Erro ao conectar:', e1);
    return;
  }
  
  console.log('✅ Conectado ao banco\n');
  
  // Passo 2: Atualizar market_tier_filter por tier
  console.log('2️⃣ Configurando filtros de market_tier...\n');
  
  const configs = [
    { price: 0.50, name: 'Básico', filter: { min: 1, max: 2 }, dist: { trash: 55, meme: 35, viral: 8, legendary: 2, godmode: 0 } },
    { price: 1.00, name: 'Padrão', filter: { min: 1, max: 3 }, dist: { trash: 45, meme: 35, viral: 15, legendary: 5, godmode: 0 } },
    { price: 2.00, name: 'Premium', filter: { min: 2, max: 4 }, dist: { trash: 30, meme: 30, viral: 28, legendary: 11, godmode: 1 } },
    { price: 5.00, name: 'Elite', filter: { min: 3, max: 5 }, dist: { trash: 15, meme: 20, viral: 35, legendary: 26, godmode: 4 } },
    { price: 10.00, name: 'Whale', filter: { min: 4, max: 5 }, dist: { trash: 5, meme: 10, viral: 35, legendary: 40, godmode: 10 } }
  ];
  
  for (const cfg of configs) {
    const { data, error } = await supabase
      .from('booster_types')
      .update({
        market_tier_filter: cfg.filter,
        rarity_distribution: cfg.dist
      })
      .eq('price_brl', cfg.price)
      .eq('edition_id', 'ED01')
      .select();
    
    if (error) {
      console.error(`❌ Erro ao configurar ${cfg.name}:`, error);
    } else {
      console.log(`✅ ${cfg.name} (R$ ${cfg.price.toFixed(2)}): ${data.length} registros`);
      console.log(`   Market tiers: ${cfg.filter.min}-${cfg.filter.max}`);
      console.log(`   Legendary: ${cfg.dist.legendary}%, Godmode: ${cfg.dist.godmode}%`);
    }
  }
  
  console.log('\n✨ Configurações aplicadas!');
  console.log('\n⚠️  ATENÇÃO: Ainda falta adicionar coluna market_tier em cards_base');
  console.log('   Execute manualmente no banco:');
  console.log('   ALTER TABLE cards_base ADD COLUMN IF NOT EXISTS market_tier INTEGER DEFAULT 3;');
}

applyMarketTiers().catch(console.error);
