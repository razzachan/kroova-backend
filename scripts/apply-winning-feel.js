import { createClient } from '@supabase/supabase-js';

/*
  Increase perceived wins:
  - Adjust rarity distributions to sum 100% (remove implicit trash bias)
  - Guarantee 1 viral in Premium, 1 legendary in Lendário
  New distributions:
    Premium: trash 28, meme 33, viral 27, legendary 12
    Lendário: trash 18, meme 27, viral 32, legendary 23
*/

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
if (!url || !key) { console.error('Missing Supabase envs'); process.exit(1); }
const sb = createClient(url, key);

const updates = [
  {
    name: 'Booster Premium',
    rarity_distribution: { trash: 28, meme: 33, viral: 27, legendary: 12 },
    guaranteed_cards: [{ rarity: 'viral', count: 1 }]
  },
  {
    name: 'Booster Lendário',
    rarity_distribution: { trash: 18, meme: 27, viral: 32, legendary: 23 },
    guaranteed_cards: [{ rarity: 'legendary', count: 1 }]
  }
];

(async () => {
  console.log('[WinningFeel] Applying perceived-win tuning...');
  for (const u of updates) {
    const { error } = await sb
      .from('booster_types')
      .update({ rarity_distribution: u.rarity_distribution, guaranteed_cards: u.guaranteed_cards })
      .eq('name', u.name);
    if (error) {
      console.error('[WinningFeel] Failed update', u.name, error.message);
      process.exit(1);
    } else {
      console.log('[WinningFeel] Updated', u.name, u.rarity_distribution, 'guaranteed:', u.guaranteed_cards);
    }
  }
  const { data } = await sb
    .from('booster_types')
    .select('name, rarity_distribution, guaranteed_cards')
    .in('name', updates.map(u=>u.name));
  console.log('[WinningFeel] Verification:', data);
})();
