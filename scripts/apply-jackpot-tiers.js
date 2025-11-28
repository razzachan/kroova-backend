import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
if (!url || !key) { console.error('Missing Supabase envs'); process.exit(1); }
const sb = createClient(url, key);

// Jackpot tiers per booster (multiplier × booster price). Probabilities as fractions (0..1).
// One jackpot max per booster; higher tiers take precedence.
// Tuned to add a modest RTP bump while keeping top prizes meaningful.
const jackpot_tiers = {
  'Booster Micro': [
    // Target EV ≈ R$0.075 (~15% of R$0.50)
    { name: 'grand', probability: 0.00001, multiplier: 500 }, // EV ≈ 0.005
    { name: 'major', probability: 0.00020, multiplier: 100 }, // EV ≈ 0.020
    { name: 'minor', probability: 0.00500, multiplier: 10 }   // EV ≈ 0.050
  ],
  'Booster Micro 5x': [
    // Keep top prize aligned (R$ 250) and ~7.5% EV of price
    { name: 'grand', probability: 0.00001, multiplier: 50 },  // EV ≈ 0.0005 × price
    { name: 'major', probability: 0.00020, multiplier: 10 },  // EV ≈ 0.0020 × price
    { name: 'minor', probability: 0.00500, multiplier: 14.5 } // EV ≈ 0.0725 × price
  ],
  'Booster Básico': [
    // Target EV ≈ R$3.5–3.75 (≈14–15% of R$25)
    { name: 'grand', probability: 0.00002, multiplier: 500 }, // EV ≈ 0.25
    { name: 'major', probability: 0.00050, multiplier: 100 }, // EV ≈ 1.25
    { name: 'minor', probability: 0.00800, multiplier: 10 }   // EV ≈ 2.50
  ],
  'Booster Premium': [
    // Target EV ≈ R$5.0 (≈6.7% of R$75) to keep total RTP ≤ ~35%
    { name: 'grand', probability: 0.00001, multiplier: 200 }, // EV ≈ 0.15
    { name: 'major', probability: 0.00020, multiplier: 50 },  // EV ≈ 0.75
    { name: 'minor', probability: 0.00550, multiplier: 10 }   // EV ≈ 4.125
  ],
  'Booster Lendário': [
    // Target EV ≈ R$12.5 (≈5% of R$250), keeping total RTP ~24–25%
    { name: 'grand', probability: 0.00010, multiplier: 100 }, // EV ≈ 2.50
    { name: 'major', probability: 0.00040, multiplier: 25 },  // EV ≈ 2.50
    { name: 'minor', probability: 0.00600, multiplier: 5 }    // EV ≈ 7.50
  ],
  'Booster Micro 5x': [
    // EV target ≈ 7.5% of R$5 → R$0.375; top prize R$250
    { name: 'grand', probability: 0.00001, multiplier: 50 },  // EV ≈ 0.0005 × 5 = R$0.0025
    { name: 'major', probability: 0.00020, multiplier: 10 },  // EV ≈ 0.0020 × 5 = R$0.0100
    { name: 'minor', probability: 0.00500, multiplier: 14.5 } // EV ≈ 0.0725 × 5 = R$0.3625
  ]
};

(async () => {
  console.log('[Jackpots] Updating edition_configs.ED01 jackpot_tiers');
  const { data: ed, error: edErr } = await sb
    .from('edition_configs')
    .select('id, jackpot_tiers')
    .eq('id', 'ED01')
    .single();
  if (edErr) { console.error('Fetch edition failed', edErr.message); process.exit(1); }
  const merged = { ...(ed?.jackpot_tiers || {}), ...jackpot_tiers };
  const { error: updErr } = await sb
    .from('edition_configs')
    .update({ jackpot_tiers: merged })
    .eq('id', 'ED01');
  if (updErr) { console.error('Update edition failed', updErr.message); process.exit(1); }
  const { data: verify } = await sb
    .from('edition_configs')
    .select('id, jackpot_tiers')
    .eq('id', 'ED01')
    .single();
  console.log('[Jackpots] Verification:', JSON.stringify(verify?.jackpot_tiers || {}, null, 2));
})();
