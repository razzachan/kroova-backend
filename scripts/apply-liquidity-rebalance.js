import { createClient } from '@supabase/supabase-js';

/*
  Rebalance edition base_liquidity and Lendário booster price_multiplier to hit target RTP bands:
    Premium ~32%  | Lendário ~21%
  New base_liquidity (ED01):
    trash: 0.01 (floor retained)
    meme: 0.025
    viral: 0.10
    legendary: 0.50
    epica: 1.00
  Change Booster Lendário price_multiplier: 50 -> 20
*/

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
if (!url || !key) { console.error('Missing Supabase envs'); process.exit(1); }
const sb = createClient(url, key);

(async () => {
  console.log('[Rebalance] Starting liquidity + multiplier rebalance');
  // 1. Update edition_configs base_liquidity
  const newBaseLiquidity = { trash: 0.01, meme: 0.025, viral: 0.10, legendary: 0.50, epica: 1.00 };
  const { error: edErr } = await sb
    .from('edition_configs')
    .update({ base_liquidity: newBaseLiquidity })
    .eq('id', 'ED01');
  if (edErr) { console.error('[Rebalance] Failed to update edition base_liquidity', edErr.message); process.exit(1); }
  console.log('[Rebalance] Updated edition base_liquidity:', newBaseLiquidity);

  // 2. Update Booster Lendário price_multiplier
  const { error: lendErr } = await sb
    .from('booster_types')
    .update({ price_multiplier: 20 })
    .eq('name', 'Booster Lendário');
  if (lendErr) { console.error('[Rebalance] Failed to update Lendário price_multiplier', lendErr.message); process.exit(1); }
  console.log('[Rebalance] Updated Booster Lendário price_multiplier -> 20');

  // 3. Verify
  const { data: editionVerify } = await sb
    .from('edition_configs')
    .select('id, base_liquidity')
    .eq('id', 'ED01')
    .single();
  const { data: boostersVerify } = await sb
    .from('booster_types')
    .select('name, price_multiplier')
    .in('name', ['Booster Premium','Booster Lendário']);
  console.log('[Rebalance] Verification edition:', editionVerify);
  console.log('[Rebalance] Verification boosters:', boostersVerify);
  console.log('[Rebalance] Done');
})();
