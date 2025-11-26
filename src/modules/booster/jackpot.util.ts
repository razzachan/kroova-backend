interface ComputeInput {
  boosterPriceBrl: number;
  cardsPerBooster: number;
  godmodePct: number; // percent 0-100
  plannedJackpotRtpPct: number; // fraction e.g. 0.054
}

interface ComputeResult {
  originalPrize: number;
  scaledPrize: number;
  scaleFactor: number;
  expectedGodmodesPerBooster: number;
  expectedPayoutBase: number;
  targetPayout: number;
  baseAvgPrize: number;
}

const PRIZE_TABLE = [
  { amount: 5, weight: 53.4 },
  { amount: 10, weight: 28.8 },
  { amount: 20, weight: 2.7 },
  { amount: 50, weight: 11.0 },
  { amount: 100, weight: 1.4 },
  { amount: 200, weight: 2.7 },
  { amount: 500, weight: 0.078 },
  { amount: 1000, weight: 0.039 },
];

export function computeJackpotReward(input: ComputeInput): ComputeResult {
  const { boosterPriceBrl, cardsPerBooster, godmodePct, plannedJackpotRtpPct } = input;
  const totalWeight = PRIZE_TABLE.reduce((a, b) => a + b.weight, 0);
  const baseAvgPrize = PRIZE_TABLE.reduce((a, b) => a + b.amount * b.weight, 0) / totalWeight;
  const expectedGodmodesPerBooster = cardsPerBooster * (godmodePct / 100);
  const expectedPayoutBase = expectedGodmodesPerBooster * baseAvgPrize;
  const targetPayout = boosterPriceBrl * plannedJackpotRtpPct;
  const scaleFactor = expectedPayoutBase > 0 ? Math.min(1, targetPayout / expectedPayoutBase) : 0;
  // Weighted roll
  let roll = Math.random() * totalWeight;
  let chosen = PRIZE_TABLE[0];
  for (const p of PRIZE_TABLE) {
    if (roll < p.weight) { chosen = p; break; }
    roll -= p.weight;
  }
  const scaledPrize = Math.max(0.5, Math.round(chosen.amount * scaleFactor * 100) / 100);
  return {
    originalPrize: chosen.amount,
    scaledPrize,
    scaleFactor,
    expectedGodmodesPerBooster,
    expectedPayoutBase,
    targetPayout,
    baseAvgPrize,
  };
}

// Deterministic helper for tests (fixed seed sequence)
export function computeJackpotRewardDeterministic(input: ComputeInput, seed: number): ComputeResult {
  const { boosterPriceBrl, cardsPerBooster, godmodePct, plannedJackpotRtpPct } = input;
  const totalWeight = PRIZE_TABLE.reduce((a, b) => a + b.weight, 0);
  const baseAvgPrize = PRIZE_TABLE.reduce((a, b) => a + b.amount * b.weight, 0) / totalWeight;
  const expectedGodmodesPerBooster = cardsPerBooster * (godmodePct / 100);
  const expectedPayoutBase = expectedGodmodesPerBooster * baseAvgPrize;
  const targetPayout = boosterPriceBrl * plannedJackpotRtpPct;
  const scaleFactor = expectedPayoutBase > 0 ? Math.min(1, targetPayout / expectedPayoutBase) : 0;
  // Pseudo-roll determinística
  let roll = (seed % 997) / 997 * totalWeight;
  let chosen = PRIZE_TABLE[0];
  for (const p of PRIZE_TABLE) {
    if (roll < p.weight) { chosen = p; break; }
    roll -= p.weight;
  }
  const scaledPrize = Math.max(0.5, Math.round(chosen.amount * scaleFactor * 100) / 100);
  return {
    originalPrize: chosen.amount,
    scaledPrize,
    scaleFactor,
    expectedGodmodesPerBooster,
    expectedPayoutBase,
    targetPayout,
    baseAvgPrize,
  };
}
