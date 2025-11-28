import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
if (!url || !key) { console.error('Missing Supabase envs'); process.exit(1); }
const sb = createClient(url, key);

(async () => {
  console.log('[Booster] Upserting Booster Micro 5x (R$5, 5 cartas)');
  const name = 'Booster Micro 5x';
  const edition_id = 'ED01';
  const rarity_distribution = { trash: 60, meme: 28, viral: 10, legendary: 2 };
  const price_brl = 5.00;
  const cards_per_booster = 5;
  const price_multiplier = 2.5; // align per-card economics with Micro

  // Try find existing
  const { data: existing } = await sb
    .from('booster_types')
    .select('id')
    .eq('name', name)
    .single();

  if (existing?.id) {
    const { error: updErr } = await sb
      .from('booster_types')
      .update({ edition_id, rarity_distribution, price_brl, cards_per_booster, price_multiplier })
      .eq('id', existing.id);
    if (updErr) { console.error('Update failed:', updErr.message); process.exit(1); }
    console.log('[Booster] Updated existing booster:', existing.id);
  } else {
    const { data, error } = await sb
      .from('booster_types')
      .insert({ name, edition_id, rarity_distribution, price_brl, cards_per_booster, price_multiplier })
      .select('id')
      .single();
    if (error) { console.error('Insert failed:', error.message); process.exit(1); }
    console.log('[Booster] Created booster:', data.id);
  }

  // Verify
  const { data: verify } = await sb
    .from('booster_types')
    .select('id, name, price_brl, cards_per_booster, price_multiplier, rarity_distribution')
    .eq('name', name)
    .single();
  console.log('[Booster] Verification:', JSON.stringify(verify, null, 2));
})();
