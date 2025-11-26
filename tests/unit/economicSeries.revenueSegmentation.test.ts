import { describe, it, expect, beforeAll } from 'vitest';

process.env.NODE_ENV = 'test';
process.env.ECONOMIC_SERIES_PERSIST_ENABLED = 'false';

import { domainMetrics } from '../../src/observability/metrics.js';
import { resetRevenueSegmentationForTest } from '../../src/observability/economicRevenue.js';

let captureEconomicSeriesManual: any; let listEconomicSeries: any; let BoosterService: any;

beforeAll(async () => {
  const econ = await import('../../src/observability/economicSeries.js');
  captureEconomicSeriesManual = econ.captureEconomicSeriesManual;
  listEconomicSeries = econ.listEconomicSeries;
  BoosterService = (await import('../../src/modules/booster/booster.service.ts')).BoosterService;
});

describe('revenue segmentation by type/channel', () => {
  it('records cumulative and period maps after purchases', async () => {
    resetRevenueSegmentationForTest();
    const svc = new BoosterService();
    // Purchase 2 boosters type A (test booster id) currency brl
    const boosterTypes = await svc.listBoosterTypes();
    const typeId = boosterTypes[0].id;
    await svc.purchase('user-1', { booster_type_id: typeId, quantity: 2, currency: 'brl' });
    await captureEconomicSeriesManual();
    // Second purchase 1 booster
    await svc.purchase('user-1', { booster_type_id: typeId, quantity: 1, currency: 'brl' });
    await captureEconomicSeriesManual();
    const items = listEconomicSeries(10);
    expect(items.length).toBeGreaterThanOrEqual(2);
    const first = items[items.length - 2];
    const second = items[items.length - 1];
    // cumulative grows
    const cumFirst = first.boosterRevenueByTypeCents?.[typeId] || 0;
    const cumSecond = second.boosterRevenueByTypeCents?.[typeId] || 0;
    expect(cumSecond).toBeGreaterThan(cumFirst);
    // period map for second should equal added revenue of last purchase
    const periodTypeSecond = second.periodBoosterRevenueByTypeCents?.[typeId] || 0;
    expect(periodTypeSecond).toBe(cumSecond - cumFirst);
    // channel segmentation
    const channelCumSecond = second.boosterRevenueByChannelCents?.['brl'] || 0;
    expect(channelCumSecond).toBe(cumSecond);
  });
});
