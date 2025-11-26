import { describe, it, expect, beforeAll } from 'vitest';

process.env.NODE_ENV = 'test';
process.env.ECONOMIC_SERIES_RTP_ALERT_HIGH_PCT = '5';
process.env.ECONOMIC_SERIES_RTP_ALERT_LOW_PCT = '90';
process.env.ALERT_WEBHOOK_URL = 'http://mock-webhook';

import { domainMetrics } from '../../src/observability/metrics.js';
import { _test_resetAlerts } from '../../src/observability/alertWebhook.js';

let captureEconomicSeriesManual: any;
let received: any[] = [];

beforeAll(async () => {
  // Mock global fetch para coletar eventos
  // @ts-ignore
  global.fetch = async (_url: string, init: any) => {
    try { received.push(JSON.parse(init.body)); } catch {}
    return { ok: true } as any;
  };
  _test_resetAlerts();
  const econ = await import('../../src/observability/economicSeries.js');
  captureEconomicSeriesManual = econ.captureEconomicSeriesManual;
  // Cenário high alert
  domainMetrics.boosterPurchase(1); // receita 1
  domainMetrics.jackpotHit(1); // payout 1 => RTP 100% (>5)
  await captureEconomicSeriesManual();
  // Cenário low alert (diluição)
  for (let i = 0; i < 50; i++) domainMetrics.boosterPurchase(10); // +500 receita
  await captureEconomicSeriesManual();
});

describe('Webhook RTP (mock)', () => {
  it('emite eventos RTP_HIGH_ALERT e RTP_LOW_ALERT', () => {
    const highEvents = received.filter(e => e.type === 'RTP_HIGH_ALERT');
    const lowEvents = received.filter(e => e.type === 'RTP_LOW_ALERT');
    expect(highEvents.length).toBeGreaterThanOrEqual(1);
    expect(lowEvents.length).toBeGreaterThanOrEqual(1);
    expect(highEvents[0].thresholds.high).toBe(5);
    expect(lowEvents[0].thresholds.low).toBe(90);
  });
});
