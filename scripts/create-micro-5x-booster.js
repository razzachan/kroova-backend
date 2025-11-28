import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
if (!url || !key) { console.error('Missing Supabase envs'); process.exit(1); }
const sb = createClient(url, key);

(async () => {
  const name = 'Booster Micro 5x';
  const edition_id = 'ED01';
  const payload = {
    name,
    edition_id,
    price_brl: 5.00,
    cards_per_booster: 5,
    price_multiplier: 2.5, // keep same per-card scaling as Micro
    rarity_distribution: { trash: 60, meme: 28, viral: 10, legendary: 2 },
    guaranteed_cards: []
  };

  console.log('[Micro5x] Upserting Booster Micro 5x (R$5, 5 cartas)...');
  const { data: existing, error: selErr } = await sb
    .from('booster_types')
    .select('id')
    .eq('name', name)
    .limit(1);
  if (selErr) { console.error('[Micro5x] Select error:', selErr.message); process.exit(1); }

  if (existing && existing.length > 0) {
    const { error: updErr } = await sb
      .from('booster_types')
      .update(payload)
      .eq('name', name);
    if (updErr) { console.error('[Micro5x] Update failed:', updErr.message); process.exit(1); }
    console.log('[Micro5x] Updated.');
  } else {
    const { error: insErr } = await sb
      .from('booster_types')
      .insert(payload);
    if (insErr) { console.error('[Micro5x] Insert failed:', insErr.message); process.exit(1); }
    console.log('[Micro5x] Inserted.');
  }

  const { data: verify } = await sb
    .from('booster_types')
    .select('name, price_brl, cards_per_booster, price_multiplier, rarity_distribution, guaranteed_cards')
    .eq('name', name)
    .single();
  console.log('[Micro5x] Verification:', verify);
})();
