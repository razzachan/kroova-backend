import { describe, it, expect } from 'vitest';
import { captureEconomicSeriesManual, listEconomicSeries } from '../../src/observability/economicSeries.js';
import { domainMetrics } from '../../src/observability/metrics.js';

// Define ambiente de teste
process.env.NODE_ENV = 'test';

describe('economicSeries basic capture', () => {
  it('captura entrada inicial e calcula percentuais', async () => {
    // gera algumas cartas para raridades e skins
    for (let i = 0; i < 10; i++) domainMetrics.cardRarity('trash');
    for (let i = 0; i < 5; i++) domainMetrics.cardRarity('meme');
    for (let i = 0; i < 2; i++) domainMetrics.cardRarity('legendary');
    for (let i = 0; i < 1; i++) domainMetrics.cardRarity('godmode');
    for (let i = 0; i < 7; i++) domainMetrics.skin('default');
    for (let i = 0; i < 3; i++) domainMetrics.skin('neon');

    const entry = await captureEconomicSeriesManual();
    expect(entry.boosterOpensCumulative).toBe(0);
    const totalRarityPct = Object.values(entry.rarityPct).reduce((a,b)=> a + b, 0);
    expect(totalRarityPct).toBeGreaterThan(0);
    expect(entry.jackpotHitsCumulative).toBe(0);
    expect(entry.periodBoosterOpens).toBe(0);
  });

  it('captura segunda entrada com deltas incluindo marketplace e reciclagem', async () => {
    for (let i = 0; i < 3; i++) domainMetrics.boosterOpen();
    domainMetrics.jackpotHit(1.23);
    domainMetrics.jackpotHit(0.50);
    domainMetrics.marketListingCreated();
    domainMetrics.marketTrade(10.0, 0.40);
    domainMetrics.marketFloorRejected();
    domainMetrics.recycleConversion(2.50);
    const entry2 = await captureEconomicSeriesManual();
    const items = listEconomicSeries(10);
    expect(items.length).toBeGreaterThanOrEqual(2);
    const prev = items[items.length - 2];
    // booster / jackpot
    expect(entry2.periodBoosterOpens).toBe(entry2.boosterOpensCumulative - prev.boosterOpensCumulative);
    expect(entry2.periodJackpotPayoutCents).toBe(entry2.jackpotPayoutCentsCumulative - prev.jackpotPayoutCentsCumulative);
    expect(entry2.jackpotHitsCumulative).toBeGreaterThanOrEqual(prev.jackpotHitsCumulative);
    expect(entry2.jackpotAvgPayoutCents).toBeGreaterThan(0);
    // marketplace
    expect(entry2.periodMarketListings).toBe(entry2.marketListingsCumulative - prev.marketListingsCumulative);
    expect(entry2.periodMarketTrades).toBe(entry2.marketTradesCumulative - prev.marketTradesCumulative);
    expect(entry2.periodMarketVolumeCents).toBe(entry2.marketVolumeCentsCumulative - prev.marketVolumeCentsCumulative);
    expect(entry2.periodMarketFeeCents).toBe(entry2.marketFeeCentsCumulative - prev.marketFeeCentsCumulative);
    expect(entry2.periodMarketFloorRejections).toBe(entry2.marketFloorRejectionsCumulative - prev.marketFloorRejectionsCumulative);
    // reciclagem
    expect(entry2.periodRecycleConversions).toBe(entry2.recycleConversionsCumulative - prev.recycleConversionsCumulative);
    expect(entry2.periodRecycleValueCents).toBe(entry2.recycleValueCentsCumulative - prev.recycleValueCentsCumulative);
    // financeiros (sem revenue ainda, rtp/margem indefinidos)
    expect(entry2.boosterRevenueCentsCumulative).toBeDefined();
    if ((entry2.boosterRevenueCentsCumulative || 0) === 0) {
      expect(entry2.rtpPct).toBeUndefined();
      expect(entry2.grossMarginPct).toBeUndefined();
    }
  });
});
