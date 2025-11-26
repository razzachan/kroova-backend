import { describe, it, expect } from 'vitest';
import { rollSkinWeighted } from '../../src/modules/skin/skin.util';

describe('skin weighted roll', () => {
  it('respeita pesos relativos', () => {
    const skins = [
      { name: 'default', weight: 70 },
      { name: 'neon', weight: 12 },
      { name: 'holo', weight: 1.5 },
      { name: 'dark', weight: 0.5 },
    ];
    const counts: Record<string, number> = {};
    for (let i = 0; i < 5000; i++) {
      const s = rollSkinWeighted(skins);
      counts[s] = (counts[s] || 0) + 1;
    }
    expect(counts['default']).toBeGreaterThan(counts['neon']);
    expect(counts['neon']).toBeGreaterThan(counts['holo']);
    expect(counts['holo']).toBeGreaterThan(counts['dark']);
  });
});