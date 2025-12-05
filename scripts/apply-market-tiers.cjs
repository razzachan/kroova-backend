const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'frontend/.env.local' });
const fs = require('fs');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function applyMigrations() {
  console.log('🔧 Aplicando sistema de Market Tiers...\n');
  
  // Migration 1: Adicionar coluna market_tier
  console.log('1️⃣ Adicionando coluna market_tier...');
  const sql1 = fs.readFileSync('supabase/migrations/20241204_add_market_tier_system.sql', 'utf8');
  
  const { data: d1, error: e1 } = await supabase.rpc('exec_sql', { sql_query: sql1 });
  if (e1) {
    console.error('❌ Erro na migration 1:', e1);
  } else {
    console.log('✅ Market tier system aplicado\n');
  }
  
  // Migration 2: Configurar filtros por tier
  console.log('2️⃣ Configurando market_tier_filter nos boosters...');
  const sql2 = fs.readFileSync('supabase/migrations/20241204_configure_market_tiers.sql', 'utf8');
  
  const { data: d2, error: e2 } = await supabase.rpc('exec_sql', { sql_query: sql2 });
  if (e2) {
    console.error('❌ Erro na migration 2:', e2);
  } else {
    console.log('✅ Filtros configurados\n');
  }
  
  console.log('✨ Migrations aplicadas! Verificando resultado...\n');
  
  // Verificar booster_types
  const { data: boosters } = await supabase
    .from('booster_types')
    .select('name, price_brl, market_tier_filter, rarity_distribution')
    .eq('edition_id', 'ED01')
    .order('price_brl');
  
  console.log('📦 Configuração dos Boosters:\n');
  for (const b of boosters || []) {
    console.log(`${b.name} (R$ ${b.price_brl}):`);
    console.log(`  Market Tiers: ${b.market_tier_filter.min}-${b.market_tier_filter.max}`);
    console.log(`  Raridades:`, b.rarity_distribution);
    console.log();
  }
}

applyMigrations().catch(console.error);
