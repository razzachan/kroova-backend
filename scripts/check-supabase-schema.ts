import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_KEY!;

async function checkSchema() {
  const supabase = createClient(supabaseUrl, serviceKey);

  console.log('🔍 Verificando schema do Supabase em produção...\n');

  // Verificar tabela user_stats_pity
  console.log('📊 Tabela: user_stats_pity');
  const { data: pityData, error: pityError } = await supabase
    .from('user_stats_pity')
    .select('*')
    .limit(1);
  
  if (pityError) {
    console.log('❌ Erro:', pityError.message);
  } else {
    console.log('✅ Existe');
    if (pityData && pityData.length > 0) {
      console.log('   Colunas:', Object.keys(pityData[0]));
    }
  }

  // Verificar tabela edition_configs
  console.log('\n📊 Tabela: edition_configs');
  const { data: editionData, error: editionError } = await supabase
    .from('edition_configs')
    .select('*')
    .limit(1);
  
  if (editionError) {
    console.log('❌ Erro:', editionError.message);
  } else {
    console.log('✅ Existe');
    if (editionData && editionData.length > 0) {
      console.log('   Colunas:', Object.keys(editionData[0]));
    }
  }

  // Verificar tabela booster_types
  console.log('\n📊 Tabela: booster_types');
  const { data: boosterData, error: boosterError } = await supabase
    .from('booster_types')
    .select('*')
    .limit(1);
  
  if (boosterError) {
    console.log('❌ Erro:', boosterError.message);
  } else {
    console.log('✅ Existe');
    if (boosterData && boosterData.length > 0) {
      console.log('   Colunas:', Object.keys(boosterData[0]));
    }
  }

  // Verificar tabela booster_openings
  console.log('\n📊 Tabela: booster_openings');
  const { data: openingData, error: openingError } = await supabase
    .from('booster_openings')
    .select('*')
    .limit(1);
  
  if (openingError) {
    console.log('❌ Erro:', openingError.message);
  } else {
    console.log('✅ Existe');
    if (openingData && openingData.length > 0) {
      console.log('   Colunas:', Object.keys(openingData[0]));
    }
  }

  // Verificar tabela wallets
  console.log('\n📊 Tabela: wallets');
  const { data: walletData, error: walletError } = await supabase
    .from('wallets')
    .select('*')
    .limit(1);
  
  if (walletError) {
    console.log('❌ Erro:', walletError.message);
  } else {
    console.log('✅ Existe');
    if (walletData && walletData.length > 0) {
      console.log('   Colunas:', Object.keys(walletData[0]));
    }
  }
}

checkSchema().catch(console.error);
