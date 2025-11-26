import { getEditionConfig } from '../config/edition.js';
import { rollRarity } from '../modules/booster/rarity.util.js';
import { applyPityDistribution } from '../modules/pity/pity.util.js';
import { chooseSkin } from '../modules/skin/skin.util.js';

interface SimulationOptions {
  editionId: string;
  boosters: number;
  pityEnabled?: boolean;
}

interface SimulationResult {
  editionId: string;
  boosters: number;
  cardsTotal: number;
  rarityCounts: Record<string, number>;
  skinCounts: Record<string, number>;
  godmodePctObserved: number;
  godmodePctBase: number;
  godmodePctAvgEffective?: number; // média das distribuições ajustadas se pity
}

export function simulateDistribution(opts: SimulationOptions): SimulationResult {
  const edition = getEditionConfig(opts.editionId);
  if (!edition) throw new Error('Edição não encontrada');
  const cardsPerBooster = edition.cardsPerBooster;
  let attemptsSinceGodmode = 0;
  const rarityCounts: Record<string, number> = {};
  const skinCounts: Record<string, number> = {};
  let sumEffectiveGodPct = 0;
  for (let b = 0; b < opts.boosters; b++) {
    // Pity: calcular distribuição ajustada por booster (não por carta) usando contador acumulado
    let dist = edition.rarityDistribution;
    if (opts.pityEnabled && edition.pityEnabled) {
      const pityApplied = applyPityDistribution(dist, attemptsSinceGodmode, edition);
      dist = pityApplied.dist;
      sumEffectiveGodPct += pityApplied.boostedGodmodePct;
    }
    for (let c = 0; c < cardsPerBooster; c++) {
      const rarity = rollRarity(dist);
      rarityCounts[rarity] = (rarityCounts[rarity] || 0) + 1;
      if (rarity === 'godmode') {
        attemptsSinceGodmode = 0;
      } else {
        attemptsSinceGodmode++;
      }
      const skin = chooseSkin(edition);
      skinCounts[skin] = (skinCounts[skin] || 0) + 1;
    }
  }
  const cardsTotal = opts.boosters * cardsPerBooster;
  const godmodeObserved = rarityCounts['godmode'] || 0;
  const godmodePctObserved = (godmodeObserved / cardsTotal) * 100;
  const godmodePctBase = edition.rarityDistribution['godmode'] || 0;
  return {
    editionId: opts.editionId,
    boosters: opts.boosters,
    cardsTotal,
    rarityCounts,
    skinCounts,
    godmodePctObserved,
    godmodePctBase,
    godmodePctAvgEffective: opts.pityEnabled && edition.pityEnabled && opts.boosters > 0 ? sumEffectiveGodPct / opts.boosters : undefined,
  };
}

// CLI rápido (node dist/audit/distribution.audit.js --edition ED01 --boosters 10000 --pity)
if (process.argv[1] && process.argv[1].includes('distribution.audit')) {
  const editionArg = process.argv.find(a => a.startsWith('--edition='))?.split('=')[1] || 'ED01';
  const boostersArg = parseInt(process.argv.find(a => a.startsWith('--boosters='))?.split('=')[1] || '2000', 10);
  const pity = process.argv.includes('--pity');
  const csv = process.argv.includes('--csv');
  const res = simulateDistribution({ editionId: editionArg, boosters: boostersArg, pityEnabled: pity });
  if (csv) {
    const rarityHeader = Object.keys(res.rarityCounts).join(',');
    const rarityRow = Object.values(res.rarityCounts).join(',');
    const skinHeader = Object.keys(res.skinCounts).join(',');
    const skinRow = Object.values(res.skinCounts).join(',');
    console.log('type,' + rarityHeader);
    console.log('rarity,' + rarityRow);
    console.log('type,' + skinHeader);
    console.log('skin,' + skinRow);
    console.log(`godmode_base,${res.godmodePctBase}`);
    console.log(`godmode_observed,${res.godmodePctObserved.toFixed(4)}`);
    if (res.godmodePctAvgEffective !== undefined) {
      console.log(`godmode_avg_effective,${res.godmodePctAvgEffective.toFixed(4)}`);
    }
  } else {
    console.log(JSON.stringify(res, null, 2));
  }
}