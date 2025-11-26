import { supabaseAdmin, supabase } from '../src/config/supabase.js';

// Admin E2E: fund wallet, purchase booster, open booster, list inventory
// Usage: npx tsx scripts/dev-admin-flow.ts <email> [brlAmount]
async function run() {
  const email = process.argv[2];
  const brlAmount = Number(process.argv[3] || 500);
  if (!email) {
    console.error('Usage: npx tsx scripts/dev-admin-flow.ts <email> [brlAmount]');
    process.exit(1);
  }
  const { data: user, error: userErr } = await supabaseAdmin.from('users').select('id, email').eq('email', email).single();
  if (userErr || !user) { console.error('User not found:', userErr?.message); process.exit(1); }
  const userId = user.id;

  // Wallet upsert
  const { data: wallet } = await supabaseAdmin.from('wallets').select('*').eq('user_id', userId).single();
  if (!wallet) {
    const { error: insWErr } = await supabaseAdmin.from('wallets').insert({ user_id: userId, balance_brl: brlAmount, balance_crypto: 0 });
    if (insWErr) { console.error('Wallet insert error:', insWErr.message); process.exit(1); }
  } else {
    const { error: updWErr } = await supabaseAdmin.from('wallets').update({ balance_brl: brlAmount }).eq('user_id', userId);
    if (updWErr) { console.error('Wallet update error:', updWErr.message); process.exit(1); }
  }
  console.log('Wallet funded BRL=', brlAmount);

  // Get a booster type (first available)
  const { data: boosterType } = await supabase.from('booster_types').select('id, price_brl, cards_per_booster').limit(1);
  const bt = boosterType?.[0];
  if (!bt) { console.error('No booster_types available'); process.exit(1); }

  // Create opening (purchase)
  const { data: openingData, error: openingErr } = await supabaseAdmin
    .from('booster_openings')
    .insert({ user_id: userId, booster_type_id: bt.id, opened_at: null, cards_obtained: [] })
    .select('id')
    .single();
  if (openingErr || !openingData) { console.error('Opening insert error:', openingErr?.message); process.exit(1); }
  const openingId = openingData.id;
  console.log('Purchased booster; opening_id=', openingId);

  // Deduct wallet and record transaction
  const { data: w2, error: wSelErr } = await supabaseAdmin.from('wallets').select('balance_brl').eq('user_id', userId).single();
  if (wSelErr || !w2) { console.error('Wallet select error:', wSelErr?.message); process.exit(1); }
  const newBal = (w2.balance_brl || 0) - (bt.price_brl || 0);
  const { error: wDedErr } = await supabaseAdmin.from('wallets').update({ balance_brl: newBal }).eq('user_id', userId);
  if (wDedErr) { console.error('Wallet deduct error:', wDedErr.message); process.exit(1); }
  await supabaseAdmin.from('transactions').insert({ user_id: userId, type: 'purchase', amount_brl: bt.price_brl || 0, amount_crypto: 0, meta: { opening_id: openingId } });

  // Open booster: mark opened_at and generate placeholder cards_per_booster instances
  const { error: openMarkErr } = await supabaseAdmin.from('booster_openings').update({ opened_at: new Date().toISOString() }).eq('id', openingId);
  if (openMarkErr) { console.error('Open mark error:', openMarkErr.message); process.exit(1); }

  // Generate card instances: pick first bt.cards_per_booster from cards_base
  const { data: baseCards } = await supabase.from('cards_base').select('id').limit(bt.cards_per_booster || 5);
  const createdIds: string[] = [];
  for (const base of baseCards || []) {
    const { data: inst, error: instErr } = await supabaseAdmin
      .from('cards_instances')
      .insert({ base_id: base.id, owner_id: userId })
      .select('id')
      .single();
    if (instErr || !inst) { console.error('Instance insert error:', instErr?.message); process.exit(1); }
    createdIds.push(inst.id);
    await supabaseAdmin.from('user_inventory').insert({ user_id: userId, card_instance_id: inst.id, acquired_at: new Date().toISOString() });
  }
  console.log('Opened booster and created cards:', createdIds.length);

  // List inventory count
  const { data: inv } = await supabaseAdmin.from('user_inventory').select('card_instance_id').eq('user_id', userId);
  console.log('Inventory total items:', inv?.length || 0);
}

run().catch((e) => { console.error('dev-admin-flow error', e); process.exit(1); });
