/**
 * Caps skin multipliers in edition_configs for ED01 to control jackpots.
 * Requires SUPABASE_SERVICE_KEY and NEXT_PUBLIC_SUPABASE_URL env vars.
 */
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY; // force service role key
console.log('[DIAG skin caps] URL:', url);
console.log('[DIAG skin caps] Key length:', key ? key.length : 'NONE');
if (!url || !key || !url.startsWith('https://') || key.length < 40) {
  console.error('Invalid/missing Supabase envs for skin cap update');
  process.exit(1);
}

const sb = createClient(url, key);

const EDITION_ID = 'ED01';
const CAPS = {
  default: 1.0,
  neon: 1.2,
  glow: 1.5,
  glitch: 2.0,
  ghost: 3.0,
  holo: 3.0,
  dark: 3.0,
};

(async () => {
  console.log('[SkinCaps] Applying skin multiplier caps...');
  const { data: cfg, error } = await sb
    .from('edition_configs')
    .select('id, skin_multipliers')
    .eq('id', EDITION_ID)
    .single();

  if (error || !cfg) {
    console.error('Failed to load edition config', error?.message);
    process.exit(1);
  }

  const current = cfg.skin_multipliers || {};
  const updated = { ...current };
  for (const [skin, cap] of Object.entries(CAPS)) {
    const v = current[skin] ?? 1.0;
    updated[skin] = Math.min(v, cap);
  }

  const { error: upErr } = await sb
    .from('edition_configs')
    .update({ skin_multipliers: updated })
    .eq('id', EDITION_ID)
    .select('skin_multipliers');

  if (upErr) {
    console.error('Failed to update skin multipliers', upErr.message);
    process.exit(1);
  }

  console.log('Applied skin caps to', EDITION_ID, updated);
})();
