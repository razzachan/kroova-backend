import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
if (!url || !key) { console.error('Missing Supabase envs'); process.exit(1); }
const sb = createClient(url, key);

(async () => {
  console.log('[Migration] Adding guaranteed_cards column to booster_types if not exists');
  // Try select to see if column exists
  const { error: colErr } = await sb.from('booster_types').select('id, guaranteed_cards').limit(1);
  if (!colErr) {
    console.log('[Migration] Column already exists, skipping ALTER');
  } else {
    // Use rpc or raw SQL via pg_rest if enabled; fallback to http fetch on /rest/v1 with Prefer header doesn't allow DDL.
    // Supabase JS client cannot run DDL directly; need SQL via /pg functions if exposed. We'll attempt a stored procedure call name create_extension(not available).
    // Inform user manual psql step required.
    console.error(`[Migration] Column guaranteed_cards missing and DDL not executable via client. Please run SQL manually:\nALTER TABLE booster_types ADD COLUMN guaranteed_cards JSONB DEFAULT '[]'::jsonb;`);
    process.exit(1);
  }
  process.exit(0);
})();
