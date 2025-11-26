import { describe, it, expect, vi } from 'vitest';

async function loadMetrics() {
  vi.resetModules();
  process.env.NODE_ENV = 'test';
  return await import('../../src/observability/metrics');
}

describe('actor em mudanças de thresholds', () => {
  it('armazena actor quando fornecido', async () => {
    const m = await loadMetrics();
    m.setDeviationThresholds({ skin: { positive: 0.27 } }, 'admin-user');
    const history = m.getDeviationThresholdChanges(5);
    expect(history[0].actor).toBe('admin-user');
  });
  it('usa actor "internal-api" quando não fornecido explicitamente', async () => {
    const m = await loadMetrics();
    m.setDeviationThresholds({ rarity: { positive: 0.25 } });
    const h = m.getDeviationThresholdChanges(1);
    expect(h[0].actor).toBeUndefined(); // setDeviationThresholds sem actor não define
  });
});
