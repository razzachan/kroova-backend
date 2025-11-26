import { describe, it, expect, vi } from 'vitest';

async function loadFreshMetrics() {
  vi.resetModules();
  process.env.NODE_ENV = 'test';
  return await import('../../src/observability/metrics');
}

describe('metrics deviation alerts', () => {
  it('dispara alerta positivo para skins quando acima do limiar (skin avaliada após atingir minSamples)', async () => {
    const m = await loadFreshMetrics();
    m.setDeviationThresholds({ skin: { positive: 0.10, negative: 0.10, minSamples: 10 } });
    // expectedPct = 10, gerar 5 default + 5 neon (último sample neon) => neon 50% observado => desvio 4.0
    for (let i = 0; i < 5; i++) m.domainMetrics.skin('default', 10);
    for (let i = 0; i < 5; i++) m.domainMetrics.skin('neon', 10); // última chamada avalia neon
    const snap = await m.Metrics.snapshot();
    expect(snap['skin_deviation_alert_total']).toBeGreaterThanOrEqual(1);
    expect(snap['skin_deviation_negative_alert_total'] || 0).toBe(0);
  });

  it('dispara alerta negativo para skins quando abaixo do limiar (skin avaliada após atingir minSamples)', async () => {
    const m = await loadFreshMetrics();
    m.setDeviationThresholds({ skin: { positive: 0.10, negative: 0.10, minSamples: 10 } });
    // expectedPct = 40, gerar 9 default + 1 neon (último sample neon) => neon 10% observado => desvio -0.75
    for (let i = 0; i < 9; i++) m.domainMetrics.skin('default', 40);
    m.domainMetrics.skin('neon', 40); // avaliação negativa ocorre aqui
    const snap = await m.Metrics.snapshot();
    expect(snap['skin_deviation_negative_alert_total']).toBeGreaterThanOrEqual(1);
    expect(snap['skin_deviation_alert_total'] || 0).toBe(0);
  });

  it('não dispara alerta quando desvio dentro dos limites (nenhuma skin excede limiar)', async () => {
    const m = await loadFreshMetrics();
    m.setDeviationThresholds({ skin: { positive: 0.10, negative: 0.10, minSamples: 10 } });
    // expectedPct = 50 para ambas, gerar 5 default + 5 neon => ambos 50% observado => desvio 0
    for (let i = 0; i < 5; i++) m.domainMetrics.skin('default', 50);
    for (let i = 0; i < 5; i++) m.domainMetrics.skin('neon', 50); // avaliação final neon
    const snap = await m.Metrics.snapshot();
    expect(snap['skin_deviation_alert_total'] || 0).toBe(0);
    expect(snap['skin_deviation_negative_alert_total'] || 0).toBe(0);
  });

  it('rarity positivo e negativo funcionam (avaliação após minSamples)', async () => {
    const m = await loadFreshMetrics();
    m.setDeviationThresholds({ rarity: { positive: 0.05, negative: 0.05, minSamples: 20 } });
    // expectedPct = 5, gerar 10 trash + 10 godmode (último sample godmode) => godmode 50% => desvio 9.0
    for (let i = 0; i < 10; i++) m.domainMetrics.cardRarity('trash', 5);
    for (let i = 0; i < 10; i++) m.domainMetrics.cardRarity('godmode', 5); // avaliação godmode
    let snap = await m.Metrics.snapshot();
    expect(snap['rarity_deviation_alert_total']).toBeGreaterThanOrEqual(1);
    // novo cenário negativo
    const m2 = await loadFreshMetrics();
    m2.setDeviationThresholds({ rarity: { positive: 0.05, negative: 0.05, minSamples: 20 } });
    // expectedPct = 40, gerar 18 trash + 2 legendary (último legendary) => legendary 10% => desvio -0.75
    for (let i = 0; i < 18; i++) m2.domainMetrics.cardRarity('trash', 40);
    for (let i = 0; i < 2; i++) m2.domainMetrics.cardRarity('legendary', 40); // avaliação legendary
    snap = await m2.Metrics.snapshot();
    expect(snap['rarity_deviation_negative_alert_total']).toBeGreaterThanOrEqual(1);
  });
});
