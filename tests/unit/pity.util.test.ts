import { describe, it, expect } from 'vitest';
import { computePityGodmodePct, renormalizeDistribution, applyPityDistribution } from '../../src/modules/pity/pity.util';

describe('pity.util', () => {
  it('aplica incremento correto baseado em thresholds', () => {
    const res = computePityGodmodePct({
      baseGodmodePct: 1,
      attempts: 120,
      thresholds: [50, 100, 150],
      increments: [0.10, 0.25, 0.45],
      capMultiplier: 2,
    });
    expect(res.boostedGodmodePct).toBeCloseTo(1 + 1 * 0.25, 6);
    expect(res.appliedIncrement).toBe(0.25);
    expect(res.capped).toBe(false);
  });

  it('respeita cap multiplier', () => {
    const res = computePityGodmodePct({
      baseGodmodePct: 1,
      attempts: 999,
      thresholds: [10, 20, 30],
      increments: [0.5, 1.2, 5], // grande para forçar cap
      capMultiplier: 3,
    });
    expect(res.boostedGodmodePct).toBe(3); // cap 3%
    expect(res.capped).toBe(true);
  });

  it('re-normaliza mantendo proporções', () => {
    const original = { trash: 60, meme: 25, viral: 10, legendary: 4, godmode: 1 };
    const dist = renormalizeDistribution(original, 2); // aumenta godmode para 2%
    const sum = Object.values(dist).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(100, 6);
    expect(dist.godmode).toBe(2);
    // trash deve reduzir proporcionalmente (~60 * remaining/99)
    expect(dist.trash).toBeCloseTo(60 * (98 / 99), 6);
  });
});