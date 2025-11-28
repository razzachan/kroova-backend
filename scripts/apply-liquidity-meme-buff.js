import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
if (!url || !key) { console.error('Missing Supabase envs'); process.exit(1); }
const sb = createClient(url, key);

(async () => {
  console.log('[MemeBuff] Applying meme liquidity buff to 0.03 and reinforcing godmode_probability=0.01');
  const { data: edition, error: edErr } = await sb
    .from('edition_configs')
    .select('id, base_liquidity, godmode_probability')
    .eq('id', 'ED01')
    .single();
  if (edErr || !edition) { console.error('Fetch edition failed', edErr?.message); process.exit(1); }
  const base = { ...edition.base_liquidity, meme: 0.03 };
  const { error: updErr } = await sb
    .from('edition_configs')
    .update({ base_liquidity: base, godmode_probability: 0.01 })
    .eq('id', 'ED01');
  if (updErr) { console.error('Update edition failed', updErr.message); process.exit(1); }
  const { data: verify } = await sb
    .from('edition_configs')
    .select('id, base_liquidity, godmode_probability')
    .eq('id', 'ED01')
    .single();
  console.log('[MemeBuff] Verification:', verify);
})();
