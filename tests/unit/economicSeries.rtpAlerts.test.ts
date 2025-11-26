import { describe, it, expect, beforeAll } from 'vitest';

process.env.NODE_ENV = 'test';
process.env.ECONOMIC_SERIES_RTP_ALERT_HIGH_PCT = '80';
process.env.ECONOMIC_SERIES_RTP_ALERT_LOW_PCT = '20';

import { domainMetrics } from '../../src/observability/metrics.js';
let captureEconomicSeriesManual: any; let listEconomicSeries: any; let BoosterService: any; let Metrics: any;

beforeAll(async () => {
  const econ = await import('../../src/observability/economicSeries.js');
  captureEconomicSeriesManual = econ.captureEconomicSeriesManual;
  listEconomicSeries = econ.listEconomicSeries;
  BoosterService = (await import('../../src/modules/booster/booster.service.ts')).BoosterService;
  Metrics = (await import('../../src/observability/metrics.js')).Metrics;
});

describe('RTP alert counters', () => {
  it('triggers high alert when RTP > high threshold', async () => {
    const svc = new BoosterService();
    const boosterTypes = await svc.listBoosterTypes();
    const typeId = boosterTypes[0].id;
    // Purchase booster (revenue ~ unit price * 1)
    await svc.purchase('user-rtp-high', { booster_type_id: typeId, quantity: 1, currency: 'brl' });
    // Simulate large jackpot payout to force RTP high (e.g. payout 5x revenue)
    domainMetrics.jackpotHit(10); // big payout
    await captureEconomicSeriesManual();
    const snap = await Metrics.snapshot();
    expect((snap['economic_rtp_high_alert_total'] || 0)).toBeGreaterThan(0);
  });
  it('triggers low alert when RTP < low threshold (after diluting high payouts)', async () => {
    const svc = new BoosterService();
    const boosterTypes = await svc.listBoosterTypes();
    const typeId = boosterTypes[0].id;
    // Add large revenue to dilute existing payouts from previous test
    await svc.purchase('user-rtp-low', { booster_type_id: typeId, quantity: 120, currency: 'brl' });
    // No additional payouts -> RTP should drop below low threshold
    await captureEconomicSeriesManual();
    const snap = await Metrics.snapshot();
    expect((snap['economic_rtp_low_alert_total'] || 0)).toBeGreaterThan(0);
  });
});
