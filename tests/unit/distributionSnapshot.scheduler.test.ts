import { describe, it, expect, vi } from 'vitest';

async function loadModules() {
  vi.resetModules();
  process.env.NODE_ENV = 'test';
  const persistence = await import('../../src/observability/distributionSnapshot.persistence');
  const metrics = await import('../../src/observability/metrics');
  return { persistence, metrics };
}

describe('snapshot scheduler', () => {
  it('gera múltiplos snapshots em memória após intervalo reduzido', async () => {
    const { persistence, metrics } = await loadModules();
    // gerar alguma atividade de métricas para diferenciar snapshots
    for (let i = 0; i < 5; i++) metrics.domainMetrics.cardRarity('trash', 50);
    persistence.startSnapshotScheduler(50); // 50ms
    await new Promise(r => setTimeout(r, 180)); // esperar alguns ciclos
    persistence.stopSnapshotScheduler();
    const items = persistence.listMemorySnapshots();
    expect(items.length).toBeGreaterThanOrEqual(2);
    // timestamps devem ser ordenados pela criação subsequente
    const tsSorted = [...items].map(x => x.snapshot.timestamp);
    expect(new Date(tsSorted[0]).getTime()).toBeLessThanOrEqual(new Date(tsSorted[tsSorted.length-1]).getTime());
  });
});
