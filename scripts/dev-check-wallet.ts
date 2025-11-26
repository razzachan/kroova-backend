import { supabaseAdmin } from '../src/config/supabase.js';

async function run() {
  const userId = process.argv[2] || process.env.TEST_USER_ID;
  if (!userId) {
    console.error('Pass user id as argv[2] or set TEST_USER_ID');
    process.exit(1);
  }
  const { data, error } = await supabaseAdmin.from('wallets').select('*').eq('user_id', userId).maybeSingle();
  if (error) {
    console.error('Wallet select error:', error.message);
    process.exit(1);
  }
  console.log('Wallet row:', data);
}

run().catch(e => { console.error('Unhandled', e); process.exit(1); });
