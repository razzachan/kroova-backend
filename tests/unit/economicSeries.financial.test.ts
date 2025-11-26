import { describe, it, expect, beforeAll } from 'vitest';

process.env.NODE_ENV = 'test';
process.env.ECONOMIC_SERIES_PERSIST_ENABLED = 'false';
process.env.ECONOMIC_SERIES_INTEGRITY_ENABLED = 'false';

import { domainMetrics } from '../../src/observability/metrics.js';
let captureEconomicSeriesManual: any; let listEconomicSeries: any;

beforeAll(async () => {
  const econ = await import('../../src/observability/economicSeries.js');
  captureEconomicSeriesManual = econ.captureEconomicSeriesManual;
  listEconomicSeries = econ.listEconomicSeries;
});

describe('economicSeries financial derived metrics', () => {
  it('computes rtpPct and grossMarginPct when revenue > 0', async () => {
    // Simulate booster revenue: purchase price 10 BRL, quantity 2 (total 20 BRL = 2000 cents)
    domainMetrics.boosterPurchase(10); // treat as one purchase of 10 BRL
    domainMetrics.boosterPurchase(10); // second purchase
    // Payouts: jackpot 3 BRL (300 cents)
    domainMetrics.jackpotHit(3);
    // Recycling: 2 BRL (200 cents)
    domainMetrics.recycleConversion(2);
    await captureEconomicSeriesManual();
    const items = listEconomicSeries(10);
    const last = items[items.length - 1];
    expect(last.boosterRevenueCentsCumulative).toBe(2000);
    const expectedRtp = ((300 + 200) / 2000) * 100; // 25%
    const expectedMargin = ((2000 - 300 - 200) / 2000) * 100; // 75%
    expect(Math.abs((last.rtpPct ?? 0) - expectedRtp)).toBeLessThan(0.01);
    expect(Math.abs((last.grossMarginPct ?? 0) - expectedMargin)).toBeLessThan(0.01);
  });
});
