import { describe, it, expect } from 'vitest';
import { rollRarity } from '../../src/modules/booster/rarity.util';

describe('rollRarity distribution', () => {
  it('approximates provided percentages', () => {
    const dist = { trash: 70.85, meme: 20, viral: 8, legendary: 1, godmode: 0.15 };
    const counts: Record<string, number> = { trash:0,meme:0,viral:0,legendary:0,godmode:0 };
    const iterations = 20000;
    for (let i=0;i<iterations;i++) {
      const r = rollRarity(dist);
      counts[r]++;
    }
    const pct = Object.fromEntries(Object.entries(counts).map(([k,v])=>[k,(v/iterations)*100]));
    // Allow a tolerance of +/-2%
    for (const [rarity, target] of Object.entries(dist)) {
      expect(pct[rarity]).toBeGreaterThan(target - 2);
      expect(pct[rarity]).toBeLessThan(target + 2);
    }
  });
});