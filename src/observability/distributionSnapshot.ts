import { Metrics } from './metrics.js';

interface DistEntry {
  key: string;
  count: number;
  pct: number;
  deltaCount: number | null;
  deltaPct: number | null;
}

interface SnapshotPayload {
  timestamp: string;
  rarity: { total: number; deltaTotal: number | null; items: DistEntry[] };
  skins: { total: number; deltaTotal: number | null; items: DistEntry[] };
  alerts: {
    skinPositive: number;
    skinNegative: number;
    rarityPositive: number;
    rarityNegative: number;
  };
}

let previous: SnapshotPayload | null = null;

export async function computeDistributionSnapshot(): Promise<SnapshotPayload> {
  const snap = await Metrics.snapshot();
  const rarityKeys = Object.keys(snap).filter(k => k.startsWith('card_rarity_'));
  const skinKeys = Object.keys(snap).filter(k => k.startsWith('skin_') && !k.endsWith('_alert_total'));
  const totalCards = rarityKeys.reduce((a, k) => a + snap[k], 0);
  const totalSkins = skinKeys.reduce((a, k) => a + snap[k], 0);

  const rarityItems: DistEntry[] = rarityKeys.map(k => {
    const count = snap[k];
    const pct = totalCards ? (count / totalCards * 100) : 0;
    let deltaCount: number | null = null;
    let deltaPct: number | null = null;
    if (previous) {
      const prevEntry = previous.rarity.items.find(e => e.key === k);
      if (prevEntry) {
        deltaCount = count - prevEntry.count;
        deltaPct = pct - prevEntry.pct;
      }
    }
    return { key: k, count, pct, deltaCount, deltaPct };
  });

  const skinItems: DistEntry[] = skinKeys.map(k => {
    const count = snap[k];
    const pct = totalSkins ? (count / totalSkins * 100) : 0;
    let deltaCount: number | null = null;
    let deltaPct: number | null = null;
    if (previous) {
      const prevEntry = previous.skins.items.find(e => e.key === k);
      if (prevEntry) {
        deltaCount = count - prevEntry.count;
        deltaPct = pct - prevEntry.pct;
      }
    }
    return { key: k, count, pct, deltaCount, deltaPct };
  });

  const payload: SnapshotPayload = {
    timestamp: new Date().toISOString(),
    rarity: {
      total: totalCards,
      deltaTotal: previous ? totalCards - previous.rarity.total : null,
      items: rarityItems,
    },
    skins: {
      total: totalSkins,
      deltaTotal: previous ? totalSkins - previous.skins.total : null,
      items: skinItems,
    },
    alerts: {
      skinPositive: snap['skin_deviation_alert_total'] || 0,
      skinNegative: snap['skin_deviation_negative_alert_total'] || 0,
      rarityPositive: snap['rarity_deviation_alert_total'] || 0,
      rarityNegative: snap['rarity_deviation_negative_alert_total'] || 0,
    },
  };

  previous = payload; // update reference
  return payload;
}

export function getPreviousDistributionSnapshot(): SnapshotPayload | null {
  return previous;
}
