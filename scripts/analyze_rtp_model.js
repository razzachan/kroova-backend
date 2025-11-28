import { createClient } from '@supabase/supabase-js';

/*
  Analyze theoretical RTP for specified boosters using current edition + booster configs.
  Formula:
    AvgSkin = sum(p_skin * skin_multiplier)
    BaseSum = sum_rarity( p_rarity * base_liquidity[rarity] )
    GodmodeFactor = 1 + godmode_probability * (godmode_multiplier - 1) / cards_per_booster
      (since only 1 card receives godmode multiplier when triggered)
    ExpectedValuePerBooster = price_multiplier * AvgSkin * BaseSum * (cards_per_booster + godmode_probability * (godmode_multiplier - 1))
    RTP = ExpectedValuePerBooster / booster_price
  booster_price assumed = price_multiplier * nominal_base_price (we infer nominal_base_price by dividing observed simulation average liquidity * price / (price_multiplier * ... ) if needed). For comparison we output absolute EV components.
*/

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
if (!url || !key) {
  console.error('Missing Supabase URL or service role key');
  process.exit(1);
}
const sb = createClient(url, key);

const BOOSTERS = ['Booster Premium', 'Booster Lendário'];
const SKIN_PROBS = [
  { name: 'default', p: 50.0 },
  { name: 'neon', p: 25.0 },
  { name: 'glow', p: 15.0 },
  { name: 'glitch', p: 7.0 },
  { name: 'ghost', p: 2.0 },
  { name: 'holo', p: 0.8 },
  { name: 'dark', p: 0.2 }
];

function pctToProb(x){ return x/100; }

(async () => {
  const { data: edition, error: edErr } = await sb
    .from('edition_configs')
    .select('id, base_liquidity, skin_multipliers, godmode_multiplier, godmode_probability')
    .eq('id', 'ED01')
    .single();
  if (edErr || !edition) {
    console.error('Edition fetch error', edErr?.message);
    process.exit(1);
  }
  // Average skin multiplier
  const avgSkin = SKIN_PROBS.reduce((sum, s) => sum + pctToProb(s.p) * (edition.skin_multipliers[s.name] || 1), 0);

  const { data: boosters, error: btErr } = await sb
    .from('booster_types')
    .select('id, name, price_multiplier, cards_per_booster, rarity_distribution')
    .in('name', BOOSTERS);
  if (btErr) {
    console.error('Booster fetch error', btErr.message);
    process.exit(1);
  }

  const results = [];
  for (const booster of boosters) {
    const dist = booster.rarity_distribution;
    const rarities = ['trash','meme','viral','legendary','epica'];
    const baseSum = rarities.reduce((sum,r)=> sum + (dist[r]||0)/100 * (edition.base_liquidity[r]||0), 0);
    const godProb = edition.godmode_probability ?? 0.01; // fallback
    const godExtraCardsEquivalent = godProb * (edition.godmode_multiplier - 1);
    const evWithoutPrice = avgSkin * baseSum * (booster.cards_per_booster + godExtraCardsEquivalent); // before price_multiplier
    const evLiquidity = evWithoutPrice * booster.price_multiplier; // theoretical average liquidity in BRL
    // Hardcoded booster prices (current production values)
    const boosterPrice = booster.name.includes('Premium') ? 75 : booster.name.includes('Lend') ? 250 : null;
    const rtp = boosterPrice ? evLiquidity / boosterPrice : null;
    results.push({
      name: booster.name,
      price_multiplier: booster.price_multiplier,
      cards_per_booster: booster.cards_per_booster,
      booster_price_brl: boosterPrice,
      avg_skin_multiplier: avgSkin,
      godmode_probability: godProb,
      godmode_multiplier: edition.godmode_multiplier,
      base_sum_weighted_rarity: baseSum,
      theoretical_avg_liquidity_brl: evLiquidity,
      theoretical_rtp: rtp,
      base_liquidity: edition.base_liquidity,
      rarity_distribution: dist
    });
  }

  console.log('[RTP MODEL] Theoretical analysis:');
  console.log('[Edition Base Liquidity]', edition.base_liquidity);
  console.log('[Skin Multipliers]', edition.skin_multipliers);
  for (const r of results) {
    console.log('---');
    console.log(r.name);
    console.log('Price Multiplier:', r.price_multiplier, 'Cards:', r.cards_per_booster);
    console.log('Booster Price (BRL):', r.booster_price_brl?.toFixed(2));
    console.log('Rarity Distribution:', r.rarity_distribution);
    console.log('Avg Skin Multiplier:', r.avg_skin_multiplier.toFixed(3));
    console.log('Weighted Base Liquidity Sum:', r.base_sum_weighted_rarity.toFixed(4));
    console.log('Godmode Prob:', r.godmode_probability, 'Godmode Multiplier:', r.godmode_multiplier);
    console.log('Theoretical Avg Liquidity (BRL):', r.theoretical_avg_liquidity_brl.toFixed(2));
    console.log('Theoretical RTP:', r.theoretical_rtp ? (r.theoretical_rtp*100).toFixed(2)+'%' : 'N/A');
  }

  // Suggest scaling of legendary to reach target midpoint RTP
  const targetMid = { 'Booster Premium': 0.30, 'Booster Lendário': 0.20 };
  console.log('\n[ADJUSTMENTS] Suggested legendary scaling to reach target mid RTP');
  for (const r of results) {
    if (!r.theoretical_rtp) continue;
    const current = r.theoretical_rtp;
    const target = targetMid[r.name];
    if (!target) continue;
    // Assume legendary dominates X% of baseSum; compute its share
    const legendaryShare = ((r.rarity_distribution['legendary']||0)/100 * (r.base_liquidity['legendary']||0)) / r.base_sum_weighted_rarity;
    // If we scale only legendary base liquidity by factor f, new baseSum' = baseSum - L + f*L
    const L = (r.rarity_distribution['legendary']||0)/100 * (r.base_liquidity['legendary']||0);
    const baseSum = r.base_sum_weighted_rarity;
    // We want new RTP = target = current * (baseSum' / baseSum)
    // baseSum'/baseSum = (baseSum - L + f*L)/baseSum = 1 + (f-1)*(L/baseSum)
    // Solve: target/current = 1 + (f-1)*(L/baseSum) => f = 1 + (target/current - 1)/(L/baseSum)
    const f = 1 + (target/current - 1)/(L/baseSum);
    console.log(r.name, 'currentRTP=', (current*100).toFixed(2)+'%', 'targetMid=', (target*100)+'%', 'legendaryShare=', (legendaryShare*100).toFixed(1)+'%', 'scalingFactorLegendary≈', f.toFixed(3));
  }

  process.exit(0);
})();

function inferPrice(){ return null; }
