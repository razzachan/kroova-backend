import { env } from '../config/env.js';
import { listEconomicSeries } from './economicSeries.js';
import crypto from 'crypto';
import { supabaseAdmin } from '../config/supabase.js';

interface EconomicSeriesExportBundle {
  generatedAt: string;
  count: number;
  items: any[]; // raw entries
  lastHash?: string; // last persisted hash (if integrity enabled/persistence on)
  anchor?: any; // optional anchor info
  signature?: string;
  signatureAlgo?: string;
  version: number;
  rtpAlerts?: {
    totalHighAlerts: number;
    totalLowAlerts: number;
  };
}

function canonicalize(o: any) { return JSON.stringify(o); }

async function fetchLastPersistedHash(): Promise<string | undefined> {
  if (!env.economicSeriesPersistEnabled) return undefined;
  const { data, error } = await supabaseAdmin
    .from('economic_series')
    .select('hash')
    .order('ts', { ascending: false })
    .limit(1);
  if (error || !data || !data.length) return undefined;
  return data[0].hash || undefined;
}

let lastAnchorState: { lastHash?: string } = {};

function shouldAnchor(currentLastHash?: string): boolean {
  if (!env.economicSeriesExportAnchorEnabled) return false;
  if (!currentLastHash) return false;
  if (currentLastHash !== lastAnchorState.lastHash) {
    lastAnchorState.lastHash = currentLastHash;
    return true;
  }
  return false;
}

export async function buildEconomicSeriesExport(limit = 500): Promise<EconomicSeriesExportBundle> {
  const items = listEconomicSeries(limit);
  const lastHash = await fetchLastPersistedHash();
  // Importa Metrics de forma tardia para não antecipar carga de env em outros testes
  const { Metrics } = await import('./metrics.js');
  const snapshot = await Metrics.snapshot();
  const base: EconomicSeriesExportBundle = {
    generatedAt: new Date().toISOString(),
    count: items.length,
    items,
    lastHash,
    version: 1,
    rtpAlerts: {
      totalHighAlerts: snapshot['economic_rtp_high_alert_total'] || 0,
      totalLowAlerts: snapshot['economic_rtp_low_alert_total'] || 0,
    },
  };
  if (env.economicSeriesHmacSecret) {
    base.signature = crypto.createHmac('sha256', env.economicSeriesHmacSecret).update(canonicalize(base)).digest('hex');
    base.signatureAlgo = 'HMAC-SHA256';
  }
  if (shouldAnchor(lastHash)) {
    // Reutiliza mecanismo de anchor genérico de auditoria para consistência
    const anchorFn = (await import('./auditAnchor.js')).anchorAuditBundle;
    base.anchor = await anchorFn({
      generatedAt: base.generatedAt,
      lastHash,
      count: base.count,
      version: base.version,
    });
  }
  return base;
}

export function economicSeriesExportToCsv(bundle: EconomicSeriesExportBundle): string {
  if (!bundle.items.length) return 'empty';
  const headers = [
    'ts','boosterOpensCumulative','jackpotHitsCumulative','jackpotPayoutCentsCumulative','jackpotAvgPayoutCents',
    'boosterRevenueCentsCumulative','periodBoosterRevenueCents','rtpPct','grossMarginPct',
    'rtpHighAlertTriggered','rtpLowAlertTriggered',
    'periodBoosterOpens','periodJackpotHits','periodJackpotPayoutCents',
    'marketListingsCumulative','marketTradesCumulative','marketVolumeCentsCumulative','marketFeeCentsCumulative','marketFloorRejectionsCumulative',
    'periodMarketListings','periodMarketTrades','periodMarketVolumeCents','periodMarketFeeCents','periodMarketFloorRejections',
    'recycleConversionsCumulative','recycleValueCentsCumulative','periodRecycleConversions','periodRecycleValueCents'
  ];
  // Raridade e skin dinamicamente expandidas
  const rarityKeys = new Set<string>();
  const skinKeys = new Set<string>();
  for (const it of bundle.items) {
    Object.keys(it.rarityPct).forEach(r => rarityKeys.add(r));
    Object.keys(it.skinPct).forEach(s => skinKeys.add(s));
  }
  const rarityCols = Array.from(rarityKeys).map(r => `rarityPct_${r}`);
  const skinCols = Array.from(skinKeys).map(s => `skinPct_${s}`);
  const allHeaders = headers.concat(rarityCols).concat(skinCols);
  const lines: string[] = [allHeaders.join(',')];
  for (const it of bundle.items) {
    const row: any = {
      ts: it.ts,
      boosterOpensCumulative: it.boosterOpensCumulative,
      jackpotHitsCumulative: it.jackpotHitsCumulative,
      jackpotPayoutCentsCumulative: it.jackpotPayoutCentsCumulative,
      jackpotAvgPayoutCents: it.jackpotAvgPayoutCents,
      periodBoosterOpens: it.periodBoosterOpens,
      periodJackpotHits: it.periodJackpotHits,
      periodJackpotPayoutCents: it.periodJackpotPayoutCents,
      boosterRevenueCentsCumulative: it.boosterRevenueCentsCumulative ?? '',
      periodBoosterRevenueCents: it.periodBoosterRevenueCents ?? '',
      rtpPct: it.rtpPct !== undefined ? it.rtpPct.toFixed(2) : '',
      grossMarginPct: it.grossMarginPct !== undefined ? it.grossMarginPct.toFixed(2) : '',
      rtpHighAlertTriggered: it.rtpHighAlertTriggered ?? '',
      rtpLowAlertTriggered: it.rtpLowAlertTriggered ?? '',
      marketListingsCumulative: it.marketListingsCumulative,
      marketTradesCumulative: it.marketTradesCumulative,
      marketVolumeCentsCumulative: it.marketVolumeCentsCumulative,
      marketFeeCentsCumulative: it.marketFeeCentsCumulative,
      marketFloorRejectionsCumulative: it.marketFloorRejectionsCumulative,
      periodMarketListings: it.periodMarketListings,
      periodMarketTrades: it.periodMarketTrades,
      periodMarketVolumeCents: it.periodMarketVolumeCents,
      periodMarketFeeCents: it.periodMarketFeeCents,
      periodMarketFloorRejections: it.periodMarketFloorRejections,
      recycleConversionsCumulative: it.recycleConversionsCumulative,
      recycleValueCentsCumulative: it.recycleValueCentsCumulative,
      periodRecycleConversions: it.periodRecycleConversions,
      periodRecycleValueCents: it.periodRecycleValueCents,
    };
    for (const r of rarityKeys) row[`rarityPct_${r}`] = (it.rarityPct[r] ?? 0).toFixed(4);
    for (const s of skinKeys) row[`skinPct_${s}`] = (it.skinPct[s] ?? 0).toFixed(4);
    lines.push(allHeaders.map(h => row[h] ?? '').join(','));
  }
  if (bundle.signature) {
    lines.push('');
    lines.push(`#signature algo=${bundle.signatureAlgo} value=${bundle.signature}`);
  }
  if (bundle.lastHash) {
    lines.push(`#last_hash value=${bundle.lastHash}`);
  }
  if (bundle.rtpAlerts) {
    lines.push(`#rtp_alerts total_high=${bundle.rtpAlerts.totalHighAlerts} total_low=${bundle.rtpAlerts.totalLowAlerts}`);
  }
  return lines.join('\n');
}
