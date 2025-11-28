import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixSchema() {
  console.log('\n📊 Verificando schema atual de booster_openings...\n');
  
  // 1. Ver schema atual
  const { data: currentSchema, error: schemaError } = await supabase
    .from('booster_openings')
    .select('*')
    .limit(0);
    
  if (schemaError) {
    console.error('❌ Erro ao verificar schema:', schemaError);
    return;
  }
  
  console.log('✅ Tabela existe e é acessível');
  
  // 2. Tentar inserir com cards_obtained
  console.log('\n🧪 Testando inserção com cards_obtained...\n');
  
  const testUserId = '15f2efb3-f1e6-4146-b35c-41d93f32d569'; // akroma
  const testBoosterId = '5f35410d-d762-46fd-a872-e79aaf7e9b31'; // Basico
  
  const { data: testInsert, error: insertError } = await supabase
    .from('booster_openings')
    .insert({
      user_id: testUserId,
      booster_type_id: testBoosterId,
      cards_obtained: []
    })
    .select()
    .single();
    
  if (insertError) {
    console.error('❌ Erro ao inserir:', insertError);
    console.log('\n📝 SQL necessário:');
    console.log(`
ALTER TABLE booster_openings 
ADD COLUMN IF NOT EXISTS cards_obtained JSONB DEFAULT '[]'::jsonb;

ALTER TABLE booster_openings 
ADD COLUMN IF NOT EXISTS opened_at TIMESTAMP WITH TIME ZONE;
    `);
  } else {
    console.log('✅ Inserção bem-sucedida!', testInsert);
    
    // Limpar teste
    await supabase
      .from('booster_openings')
      .delete()
      .eq('id', testInsert.id);
    console.log('🧹 Registro de teste removido');
  }
}

fixSchema().catch(console.error);
