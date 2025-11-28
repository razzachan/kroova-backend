import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
if (!url || !key) { console.error('Missing Supabase envs'); process.exit(1); }
const sb = createClient(url, key);

(async () => {
  console.log('[AdjustMicro] Tuning Booster Micro for target RTP ~18–22%');
  const name = 'Booster Micro';
  const updates = {
    price_multiplier: 2.5,
    cards_per_booster: 1,
    guaranteed_cards: [],
    rarity_distribution: { trash: 60, meme: 28, viral: 10, legendary: 2 }
  };
  const { error: updErr } = await sb
    .from('booster_types')
    .update(updates)
    .eq('name', name);
  if (updErr) { console.error('[AdjustMicro] Update failed', updErr.message); process.exit(1); }
  const { data: verify } = await sb
    .from('booster_types')
    .select('name, price_brl, price_multiplier, cards_per_booster, rarity_distribution, guaranteed_cards')
    .eq('name', name)
    .single();
  console.log('[AdjustMicro] Verification:', verify);
})();
