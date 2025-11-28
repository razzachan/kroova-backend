import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
if (!url || !key) {
  console.error('Missing Supabase envs');
  process.exit(1);
}
const sb = createClient(url, key);

(async () => {
  const { data, error } = await sb
    .from('edition_configs')
    .select('id, jackpot_tiers')
    .eq('id', 'ED01')
    .single();
  if (error) {
    console.error('Fetch edition_configs failed:', error.message);
    process.exit(1);
  }
  console.log('ED01 jackpot_tiers:\n', JSON.stringify(data?.jackpot_tiers || {}, null, 2));

  // Quick EV summary per booster if present
  const tiers = data?.jackpot_tiers || {};
  for (const [booster, list] of Object.entries(tiers)) {
    let ev = 0;
    // Need price to compute EV in absolute BRL; print probability × multiplier sum as proxy
    let sumProbMult = 0;
    for (const t of list) {
      const p = Number(t.probability || 0);
      const m = Number(t.multiplier || 0);
      sumProbMult += p * m;
    }
    console.log(`- ${booster}: sum(prob×mult) = ${sumProbMult.toFixed(6)} × price_brl`);
  }
})();
