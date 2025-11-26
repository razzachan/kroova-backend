import { describe, it, expect } from 'vitest';
import { computeJackpotRewardDeterministic } from '../../src/modules/booster/jackpot.util.js';

// Focus: scaleFactor behavior relative to expected vs target payout

describe('jackpot.util scaling', () => {
  it('reduces payout when expected > target', () => {
    const res = computeJackpotRewardDeterministic({
      boosterPriceBrl: 10,
      cardsPerBooster: 5,
      godmodePct: 10, // high godmode rate artificially
      plannedJackpotRtpPct: 0.02, // 2% target
    }, 42);
    expect(res.expectedPayoutBase).toBeGreaterThan(res.targetPayout);
    expect(res.scaleFactor).toBeLessThan(1);
    // scaled prize should be <= original prize
    expect(res.scaledPrize).toBeLessThanOrEqual(res.originalPrize);
  });

  it('keeps scaleFactor=1 when target >= expected base payout', () => {
    const res = computeJackpotRewardDeterministic({
      boosterPriceBrl: 50, // large booster price inflates target
      cardsPerBooster: 5,
      godmodePct: 1,
      plannedJackpotRtpPct: 0.20, // 20% jackpot RTP
    }, 7);
    // Recompute expectation manually
    expect(res.targetPayout).toBeGreaterThanOrEqual(res.expectedPayoutBase);
    expect(res.scaleFactor).toBe(1);
    expect(res.scaledPrize).toBe(res.originalPrize >= 0.5 ? res.originalPrize : 0.5);
  });

  it('handles zero godmode pct', () => {
    const res = computeJackpotRewardDeterministic({
      boosterPriceBrl: 1,
      cardsPerBooster: 5,
      godmodePct: 0,
      plannedJackpotRtpPct: 0.05,
    }, 99);
    expect(res.expectedGodmodesPerBooster).toBe(0);
    expect(res.scaleFactor).toBe(0); // no expected payout => scaleFactor 0
    // scaled prize will still floor at 0.5
    expect(res.scaledPrize).toBe(0.5);
  });
});
