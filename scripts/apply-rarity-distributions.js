import { createClient } from '@supabase/supabase-js';

/* Apply tuned rarity distributions */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
if (!url || !key) { console.error('Missing Supabase envs'); process.exit(1); }
const sb = createClient(url, key);

const updates = [
  {
    name: 'Booster Premium',
    rarity_distribution: { trash: 28, meme: 31, viral: 26, legendary: 12, godmode: 3 }
  },
  {
    name: 'Booster Lendário',
    rarity_distribution: { trash: 18, meme: 25, viral: 31, legendary: 20, godmode: 5 }
  }
];

(async () => {
  console.log('[RarityDist] Applying tuned rarity distributions...');
  for (const u of updates) {
    const { error } = await sb
      .from('booster_types')
      .update({ rarity_distribution: u.rarity_distribution })
      .eq('name', u.name);
    if (error) {
      console.error('[RarityDist] Failed update', u.name, error.message);
      process.exit(1);
    } else {
      console.log('[RarityDist] Updated', u.name, u.rarity_distribution);
    }
  }
  const { data } = await sb
    .from('booster_types')
    .select('name, rarity_distribution')
    .in('name', updates.map(u=>u.name));
  console.log('[RarityDist] Verification:', data);
})();
