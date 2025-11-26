import { supabaseAdmin } from '../src/config/supabase.js';

// Upsert wallet for a given user id (dev helper)
// Usage (PowerShell): $env:TEST_USER_ID='<uuid>'; $env:TEST_WALLET_BRL='500'; npx tsx scripts/dev-wallet-upsert.ts
// Or: npx tsx scripts/dev-wallet-upsert.ts <uuid> <brl> <crypto>
async function run() {
  const argUser = process.argv[2];
  const argBrl = process.argv[3];
  const argCrypto = process.argv[4];
  const userId = argUser || process.env.TEST_USER_ID || '965fa0a9-0fb5-4561-ba65-d74817f3c7ba';
  const balanceBRL = Number(process.env.TEST_WALLET_BRL || '200');
  const balanceCrypto = Number(process.env.TEST_WALLET_CRYPTO || '0');
  const finalBRL = argBrl ? Number(argBrl) : balanceBRL;
  const finalCrypto = argCrypto ? Number(argCrypto) : balanceCrypto;

  // Check existing wallet
  const { data: existing, error: existingError } = await supabaseAdmin
    .from('wallets')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (existingError && existingError.code !== 'PGRST116') {
    console.error('Query wallet error:', existingError.message);
    process.exit(1);
  }

  if (!existing) {
    const { error: insertError } = await supabaseAdmin.from('wallets').insert({
      user_id: userId,
      balance_brl: finalBRL,
      balance_crypto: finalCrypto,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    if (insertError) {
      console.error('Insert wallet error:', insertError.message);
      process.exit(1);
    }
    console.log('Wallet created:', { user_id: userId, balance_brl: finalBRL });
  } else {
    const { error: updateError } = await supabaseAdmin
      .from('wallets')
      .update({ balance_brl: finalBRL, balance_crypto: finalCrypto, updated_at: new Date().toISOString() })
      .eq('user_id', userId);
    if (updateError) {
      console.error('Update wallet error:', updateError.message);
      process.exit(1);
    }
    console.log('Wallet updated:', { user_id: userId, balance_brl: finalBRL });
  }
}

run().catch(e => {
  console.error('Unhandled dev-wallet-upsert error', e);
  process.exit(1);
});
