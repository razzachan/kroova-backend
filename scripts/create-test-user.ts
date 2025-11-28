import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mmcytphoeyxeylvaqjgr.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tY3l0cGhvZXl4ZXlsdmFxamdyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDExNDIyMCwiZXhwIjoyMDc5NjkwMjIwfQ.EYLRZo0u0aaDTH-JWTp2SXQQZVdYTSgjL4N-IMLfI6c';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTestUser() {
  console.log('🔧 Criando usuário de teste...');

  // 1. Criar usuário via Supabase Auth Admin API
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: 'akroma.julio@gmail.com',
    password: 'Shadowspirit!23',
    email_confirm: true, // Confirma email automaticamente
  });

  if (authError) {
    console.error('❌ Erro ao criar usuário auth:', authError);
    return;
  }

  console.log('✅ Usuário criado no auth:', authData.user.id);

  // 2. Criar perfil em users
  const { error: userError } = await supabase
    .from('users')
    .insert({
      id: authData.user.id,
      email: 'akroma.julio@gmail.com',
      display_id: 'usr_akroma',
    });

  if (userError) {
    console.error('❌ Erro ao criar perfil:', userError);
  } else {
    console.log('✅ Perfil criado');
  }

  // 3. Criar wallet com 10k de saldo
  const { error: walletError } = await supabase
    .from('wallets')
    .insert({
      user_id: authData.user.id,
      balance_brl: 10000.00,
      balance_crypto: 0.00,
    });

  if (walletError) {
    console.error('❌ Erro ao criar wallet:', walletError);
  } else {
    console.log('✅ Wallet criada com R$ 10.000,00');
  }

  // Verificar
  const { data: wallet } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', authData.user.id)
    .single();

  console.log('\n🎉 Conta criada com sucesso!');
  console.log('📧 Email: akroma.julio@gmail.com');
  console.log('🔑 Senha: Shadowspirit!23');
  console.log('💰 Saldo: R$', wallet?.balance_brl || 0);
}

createTestUser().catch(console.error);
