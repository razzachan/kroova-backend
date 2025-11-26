import { describe, it, expect } from 'vitest';
import { simulateDistribution } from '../../src/audit/distribution.audit';

describe('distribution.audit simulateDistribution', () => {
  it('mantém ordem de raridades esperada (trash > meme > viral > legendary > godmode)', () => {
    const res = simulateDistribution({ editionId: 'ED01', boosters: 1500 });
    const r = res.rarityCounts;
    expect(r.trash).toBeGreaterThan(r.meme);
    expect(r.meme).toBeGreaterThan(r.viral);
    expect(r.viral).toBeGreaterThan(r.legendary);
    expect(r.legendary).toBeGreaterThan(r.godmode);
  });
  it('observed godmode pct próximo da base (erro <= 0.5%)', () => {
    const res = simulateDistribution({ editionId: 'ED01', boosters: 4000 });
    const diff = Math.abs(res.godmodePctObserved - res.godmodePctBase);
    expect(diff).toBeLessThanOrEqual(0.5);
  });
  it('skins respeitam ordem de pesos principais (default > neon > glow)', () => {
    const res = simulateDistribution({ editionId: 'ED01', boosters: 2000 });
    const s = res.skinCounts;
    expect(s.default).toBeGreaterThan(s.neon);
    expect(s.neon).toBeGreaterThan(s.glow);
  });
});