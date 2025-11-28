/**
 * Updates booster_types.price_multiplier to recommended values.
 * Requires SUPABASE_SERVICE_KEY and NEXT_PUBLIC_SUPABASE_URL env vars.
 */
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY; // force service role key
console.log('[DIAG multipliers] URL:', url);
console.log('[DIAG multipliers] Key length:', key ? key.length : 'NONE');
if (!url || !key || !url.startsWith('https://') || key.length < 40) {
  console.error('Invalid/missing Supabase envs for multiplier update');
  process.exit(1);
}

const sb = createClient(url, key);

const recommendations = [
  { name: 'Booster Básico', price_multiplier: 12 },
  { name: 'Booster Premium', price_multiplier: 20 },
  { name: 'Booster Lendário', price_multiplier: 50 },
];

(async () => {
  console.log('[Multipliers] Applying recommended price multipliers...');
  for (const rec of recommendations) {
    const { data, error } = await sb
      .from('booster_types')
      .update({ price_multiplier: rec.price_multiplier })
      .eq('name', rec.name)
      .select('*');
    if (error) {
      console.error('Failed to update', rec.name, error.message);
    } else {
      console.log('Updated', rec.name, '→ ×' + rec.price_multiplier, data?.[0]?.id || '');
    }
  }
  const { data: verify } = await sb.from('booster_types').select('name, price_multiplier').in('name', recommendations.map(r=>r.name));
  console.log('[Multipliers] Verification:', verify);
})();
