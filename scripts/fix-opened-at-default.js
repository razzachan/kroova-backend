import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixOpenedAtDefault() {
  console.log('\n🔧 Verificando se coluna opened_at tem DEFAULT now()...\n');
  
  // Testar criando um opening sem especificar opened_at
  const testUserId = '15f2efb3-f1e6-4146-b35c-41d93f32d569';
  const testBoosterId = '5f35410d-d762-46fd-a872-e79aaf7e9b31';
  
  const { data: test1, error: err1 } = await supabase
    .from('booster_openings')
    .insert({
      user_id: testUserId,
      booster_type_id: testBoosterId,
      cards_obtained: []
      // NÃO especifica opened_at - deve ser NULL
    })
    .select()
    .single();
    
  if (err1) {
    console.error('❌ Erro ao inserir:', err1);
    return;
  }
  
  console.log('✅ Inserção teste:');
  console.log('   opened_at:', test1.opened_at);
  console.log('   Esperado: null');
  console.log('   Resultado:', test1.opened_at === null ? '✅ CORRETO' : '❌ ERRADO - tem DEFAULT');
  
  // Limpar
  await supabase
    .from('booster_openings')
    .delete()
    .eq('id', test1.id);
    
  if (test1.opened_at !== null) {
    console.log('\n⚠️ PROBLEMA ENCONTRADO!');
    console.log('A coluna opened_at tem DEFAULT now() ou similar.');
    console.log('\n📝 SQL para corrigir:');
    console.log(`
ALTER TABLE booster_openings 
ALTER COLUMN opened_at DROP DEFAULT;

-- Resetar todos os openings não abertos de verdade
UPDATE booster_openings 
SET opened_at = NULL 
WHERE cards_obtained = '[]'::jsonb;
    `);
    console.log('\nExecute esse SQL no Supabase Dashboard (SQL Editor)');
  } else {
    console.log('\n✅ opened_at está correto (sem DEFAULT)');
  }
}

fixOpenedAtDefault().catch(console.error);
