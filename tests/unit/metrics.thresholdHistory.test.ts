import { describe, it, expect, vi } from 'vitest';

async function loadMetrics() {
  vi.resetModules();
  process.env.NODE_ENV = 'test';
  return await import('../../src/observability/metrics');
}

describe('threshold change history', () => {
  it('registra entrada com before/after', async () => {
    const m = await loadMetrics();
    const before = m.getDeviationThresholds();
    m.setDeviationThresholds({ skin: { positive: 0.25 } }, 'teste');
    const after = m.getDeviationThresholds();
    expect(after.skin.positive).toBe(0.25);
    const history = m.getDeviationThresholdChanges(5);
    expect(history.length).toBeGreaterThan(0);
    const entry = history[0];
    expect(entry.before.skin.positive).toBe(before.skin.positive);
    expect(entry.after.skin.positive).toBe(after.skin.positive);
  });
});
