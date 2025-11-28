/**
 * Proposes RTP adjustments based on recent simulation JSON files.
 * Reads files named like simulation_results_*.json and outputs a table
 * with current RTP, recommended multiplier changes to hit targets.
 */
import fs from 'fs';
import path from 'path';

type SimResult = {
  booster: string;
  price_brl: number;
  cards_per_booster: number;
  openings: number;
  rtp: number; // percentage 0-100
  godmode_realized_pct: number;
  rarity_distribution: Record<string, number>;
};

const workspace = 'c://Kroova//scripts';

function loadSimFiles(): SimResult[] {
  const files = fs.readdirSync(workspace)
    .filter(f => f.startsWith('simulation_results_') && f.endsWith('.json'));
  const results: SimResult[] = [];
  for (const f of files) {
    const raw = fs.readFileSync(path.join(workspace, f), 'utf-8');
    try {
      const data = JSON.parse(raw);
      results.push({
        booster: data.booster,
        price_brl: data.price_brl,
        cards_per_booster: data.cards_per_booster,
        openings: data.openings,
        rtp: data.rtp_pct,
        godmode_realized_pct: data.godmode_realized_pct,
        rarity_distribution: data.rarity_distribution,
      });
    } catch (e) {
      console.warn('Failed to parse', f, e);
    }
  }
  return results;
}

function targetRtpFor(booster: string): [number, number] {
  const b = booster.toLowerCase();
  if (b.includes('lend') || b.includes('legend')) return [10, 25];
  if (b.includes('premium')) return [25, 35];
  if (b.includes('básico') || b.includes('basico') || b.includes('padrao')) return [35, 45];
  // default mid-tier
  return [30, 40];
}

function recommendMultiplier(currentMultiplier: number | undefined, currentRtp: number, [minTarget, maxTarget]: [number, number]) {
  // naive proportional scaling assuming RTP scales ~linearly with multiplier
  const target = (minTarget + maxTarget) / 2;
  if (!currentMultiplier || currentMultiplier <= 0) {
    return { recommendedMultiplier: undefined, note: 'Missing current multiplier' };
  }
  const scale = target / Math.max(1, currentRtp);
  const recommended = Math.max(1, Math.round(currentMultiplier * scale));
  return { recommendedMultiplier: recommended, note: `scale ${scale.toFixed(2)}` };
}

function getCurrentMultipliers(): Record<string, number> {
  // read from check-multipliers output file if present, else hardcode known values
  const map: Record<string, number> = {
    'Basico': 1,
    'Padrao': 2,
    'Premium': 4,
    'Pack Viral': 1,
    'Pack Lendario': 1,
    'Elite': 10,
    'Pack Epico': 1,
    'Whale': 20,
    'Pack Colecionador': 1,
    'Booster Básico': 15,
    'Booster Premium': 45,
    'Booster Lendário': 150,
  };
  return map;
}

function main() {
  const sims = loadSimFiles();
  const multipliers = getCurrentMultipliers();
  const rows: string[] = [];
  rows.push('Booster | RTP% | Godmode% | Curr× | Target RTP | Rec× | Note');
  rows.push('------- | ---- | -------- | ----- | ---------- | ---- | ----');
  for (const s of sims) {
    const targets = targetRtpFor(s.booster);
    const curr = multipliers[s.booster];
    const rec = recommendMultiplier(curr, s.rtp, targets);
    rows.push([
      s.booster,
      s.rtp.toFixed(2),
      s.godmode_realized_pct.toFixed(2),
      curr ?? NaN,
      `${targets[0]}–${targets[1]}`,
      rec.recommendedMultiplier ?? 'n/a',
      rec.note,
    ].join(' | '));
  }
  const out = rows.join('\n');
  console.log('\nRTP Adjustment Proposals\n');
  console.log(out);
  fs.writeFileSync(path.join(workspace, 'rtp-adjustments-table.md'), out);
}

main();
