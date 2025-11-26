import { describe, it, expect, vi } from 'vitest';

async function loadMetrics() {
  vi.resetModules();
  process.env.NODE_ENV = 'test';
  return await import('../../src/observability/metrics');
}

describe('verifyDeviationThresholdHashes', () => {
  it('retorna todos valid=true após mudanças legítimas', async () => {
    const m = await loadMetrics();
    m.setDeviationThresholds({ skin: { positive: 0.16 } }, 'actor-x', 'ajuste x');
    m.setDeviationThresholds({ rarity: { positive: 0.21 } }, 'actor-y', 'ajuste y');
    const res = m.verifyDeviationThresholdHashes(10);
    expect(res.length).toBeGreaterThanOrEqual(2);
    for (const r of res) {
      expect(r.valid).toBe(true);
      expect(r.hash).toMatch(/^[a-f0-9]{64}$/);
    }
  });
});
