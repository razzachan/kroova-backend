import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
if (!url || !key) { console.error('Missing Supabase envs'); process.exit(1); }
const sb = createClient(url, key);

(async () => {
  console.log('[Migration] Checking edition_configs.jackpot_tiers column');
  // Try select to see if column exists
  const { error: colErr } = await sb.from('edition_configs').select('id, jackpot_tiers').limit(1);
  if (!colErr) {
    console.log('[Migration] Column already exists, nothing to do.');
    process.exit(0);
  }
  console.error('[Migration] jackpot_tiers is missing on edition_configs. Please run the following SQL in Supabase SQL editor:');
  console.error("\nALTER TABLE public.edition_configs ADD COLUMN jackpot_tiers JSONB DEFAULT '{}'::jsonb;\n");
  console.error('After adding the column, run: node scripts/apply-jackpot-tiers.js');
  process.exit(1);
})();
