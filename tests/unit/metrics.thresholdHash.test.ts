import { describe, it, expect, vi } from 'vitest';

async function loadMetrics() {
  vi.resetModules();
  process.env.NODE_ENV = 'test';
  return await import('../../src/observability/metrics');
}

describe('hash e reason em mudanças de thresholds', () => {
  it('gera hash consistente e diferente após nova mudança', async () => {
    const m = await loadMetrics();
    m.setDeviationThresholds({ skin: { positive: 0.18 } }, 'actor-a', 'ajuste inicial');
    const first = m.getDeviationThresholdChanges(1)[0];
    expect(first.hash).toMatch(/^[a-f0-9]{64}$/);
    expect(first.reason).toBe('ajuste inicial');
    const hash1 = first.hash;
    // segunda mudança usa actor diferente para evitar rate limit
    m.setDeviationThresholds({ skin: { positive: 0.19 } }, 'actor-a2', 'refino');
    const second = m.getDeviationThresholdChanges(1)[0];
    expect(second.hash).not.toBe(hash1);
    expect(second.reason).toBe('refino');
  });

  it('hash muda se apenas reason muda (mesmo valor numérico)', async () => {
    const m = await loadMetrics();
    m.setDeviationThresholds({ skin: { positive: 0.20 } }, 'actor-b', 'primeiro');
    const h1 = m.getDeviationThresholdChanges(1)[0].hash;
    // nova mudança mantendo valor (rate limit impede mudança se muito rápido; trocar actor para bypass)
    m.setDeviationThresholds({ skin: { positive: 0.20 } }, 'actor-b2', 'segundo');
    const h2 = m.getDeviationThresholdChanges(1)[0].hash;
    expect(h2).not.toBe(h1);
  });
});
