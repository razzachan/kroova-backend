// In-memory revenue segmentation for boosters by type and channel.
// Focus on BRL revenue; extend later for crypto if needed.

interface RevenueMaps {
  byType: Record<string, number>; // booster_type_id -> cents
  byChannel: Record<string, number>; // 'brl' | 'crypto' | 'stripe' | 'internal' etc -> cents
}

const revenue: RevenueMaps = { byType: {}, byChannel: {} };

export function recordBoosterRevenuePurchase(boosterTypeId: string, channel: string, amountBrl: number) {
  if (!boosterTypeId || !channel) return;
  const cents = Math.round(amountBrl * 100);
  revenue.byType[boosterTypeId] = (revenue.byType[boosterTypeId] || 0) + cents;
  revenue.byChannel[channel] = (revenue.byChannel[channel] || 0) + cents;
}

export function getRevenueSegmentation() {
  // return deep copy to avoid mutation by callers
  return {
    byType: { ...revenue.byType },
    byChannel: { ...revenue.byChannel },
  };
}

export function resetRevenueSegmentationForTest() {
  Object.keys(revenue.byType).forEach(k => delete revenue.byType[k]);
  Object.keys(revenue.byChannel).forEach(k => delete revenue.byChannel[k]);
}
