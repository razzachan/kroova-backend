import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
if (!url || !key) { console.error('Missing Supabase envs'); process.exit(1); }
const sb = createClient(url, key);

(async () => {
  console.log('[BasicWinningFeel] Applying Basic booster perceived-win tuning...');
  const name = 'Booster Básico';
  const rarity_distribution = { trash: 45, meme: 33, viral: 18, legendary: 4 };
  const guaranteed_cards = [{ rarity: 'meme', count: 1 }];
  const { error } = await sb
    .from('booster_types')
    .update({ rarity_distribution, guaranteed_cards })
    .eq('name', name);
  if (error) { console.error('[BasicWinningFeel] Update failed', error.message); process.exit(1); }
  const { data } = await sb
    .from('booster_types')
    .select('name, rarity_distribution, guaranteed_cards')
    .eq('name', name)
    .single();
  console.log('[BasicWinningFeel] Verification:', data);
})();
