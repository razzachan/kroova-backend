import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
if (!url || !key) { console.error('Missing Supabase envs'); process.exit(1); }
const sb = createClient(url, key);

(async () => {
  console.log('[MicroBooster] Ensuring Booster Micro (R$0,50) exists...');
  const name = 'Booster Micro';
  const edition_id = 'ED01';
  const rarity_distribution = { trash: 45, meme: 33, viral: 18, legendary: 4 };
  const guaranteed_cards = [{ rarity: 'meme', count: 1 }];
  const payload = {
    name,
    edition_id,
    price_brl: 0.50,
    cards_per_booster: 1,
    price_multiplier: 12,
    rarity_distribution,
    guaranteed_cards
  };

  // Check exists
  const { data: existing } = await sb
    .from('booster_types')
    .select('id, name')
    .eq('name', name)
    .limit(1);

  if (existing && existing.length > 0) {
    console.log('[MicroBooster] Already exists, updating config...');
    const { error: updErr } = await sb
      .from('booster_types')
      .update(payload)
      .eq('name', name);
    if (updErr) { console.error('[MicroBooster] Update failed', updErr.message); process.exit(1); }
  } else {
    const { error: insErr } = await sb
      .from('booster_types')
      .insert(payload);
    if (insErr) { console.error('[MicroBooster] Insert failed', insErr.message); process.exit(1); }
    console.log('[MicroBooster] Inserted');
  }

  const { data: verify } = await sb
    .from('booster_types')
    .select('name, price_brl, cards_per_booster, price_multiplier, rarity_distribution, guaranteed_cards')
    .eq('name', name)
    .single();
  console.log('[MicroBooster] Verification:', verify);
})();
