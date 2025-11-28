import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
if (!url || !key) { console.error('Missing Supabase envs'); process.exit(1); }
const sb = createClient(url, key);

(async () => {
  const name = 'Booster Micro 5x';
  console.log(`[Cleanup] Removing booster '${name}' if exists and cleaning jackpot_tiers entry`);
  const { data: booster } = await sb.from('booster_types').select('id').eq('name', name).single();
  if (booster?.id) {
    const { error: delErr } = await sb.from('booster_types').delete().eq('id', booster.id);
    if (delErr) { console.error('Delete booster failed:', delErr.message); process.exit(1); }
    console.log('[Cleanup] Deleted booster:', booster.id);
  } else {
    console.log('[Cleanup] Booster not found, skipping delete');
  }
  const { data: ed, error: edErr } = await sb.from('edition_configs').select('id, jackpot_tiers').eq('id','ED01').single();
  if (edErr) { console.error('Fetch edition failed:', edErr.message); process.exit(1); }
  const jt = ed?.jackpot_tiers || {};
  if (jt[name]) {
    delete jt[name];
    const { error: updErr } = await sb.from('edition_configs').update({ jackpot_tiers: jt }).eq('id','ED01');
    if (updErr) { console.error('Update jackpot_tiers failed:', updErr.message); process.exit(1); }
    console.log('[Cleanup] Removed jackpot_tiers entry for booster');
  } else {
    console.log('[Cleanup] No jackpot_tiers entry to remove');
  }
  console.log('[Cleanup] Done');
})();
