import { describe, it, expect } from 'vitest';
import { domainMetrics, Metrics } from '../../src/observability/metrics.js';

process.env.NODE_ENV = 'test';

describe('Marketplace & Recycling metrics', () => {
  it('incrementa counters de marketplace (listing + trade + volume + fee + floor reject)', async () => {
    domainMetrics.marketListingCreated();
    domainMetrics.marketTrade(10.5, 0.42); // preço + fee
    domainMetrics.marketFloorRejected();
    const snap = await Metrics.snapshot();
    expect(snap.market_listings_created_total).toBeGreaterThanOrEqual(1);
    expect(snap.market_trades_total).toBeGreaterThanOrEqual(1);
    expect(snap.market_volume_brl_cents_total).toBeGreaterThanOrEqual(1050);
    expect(snap.market_fee_brl_cents_total).toBeGreaterThanOrEqual(42);
    expect(snap.market_floor_rejections_total).toBeGreaterThanOrEqual(1);
  });

  it('incrementa counters de reciclagem', async () => {
    domainMetrics.recycleConversion(3.33);
    domainMetrics.recycleConversion(1.00);
    const snap = await Metrics.snapshot();
    expect(snap.recycle_conversions_total).toBeGreaterThanOrEqual(2);
    expect(snap.recycle_value_brl_cents_total).toBeGreaterThanOrEqual(433); // 333 + 100
  });
});
