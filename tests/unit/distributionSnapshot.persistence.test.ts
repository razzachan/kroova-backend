import { describe, it, expect, vi } from 'vitest';

async function loadModule() {
  vi.resetModules();
  process.env.NODE_ENV = 'test';
  return await import('../../src/observability/distributionSnapshot.persistence');
}

async function loadMetrics() {
  vi.resetModules();
  process.env.NODE_ENV = 'test';
  return await import('../../src/observability/metrics');
}

describe('distributionSnapshot.persistence memory fallback', () => {
  it('stores snapshot in memory when persistence disabled (test env)', async () => {
    const metrics = await loadMetrics();
    // generate some samples to have content
    for (let i = 0; i < 10; i++) metrics.domainMetrics.cardRarity('trash', 50);
    for (let i = 0; i < 10; i++) metrics.domainMetrics.cardRarity('meme', 30);

    const mod = await loadModule();
    const res = await mod.saveDistributionSnapshot();
    expect(res.persisted).toBe(false);
    const list = mod.listMemorySnapshots();
    expect(list.length).toBeGreaterThanOrEqual(1);
    expect(list[0].snapshot.timestamp).toBeDefined();
  });
});
