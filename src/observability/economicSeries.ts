import { Metrics } from './metrics.js';
import { env } from '../config/env.js';
import { supabaseAdmin } from '../config/supabase.js';
import { createHash, createHmac } from 'crypto';
import { getRevenueSegmentation } from './economicRevenue.js';
import { maybeRtpHighAlert, maybeRtpLowAlert } from './alertWebhook.js';

export interface EconomicSeriesEntry {
  ts: string; // ISO timestamp
  rarityPct: Record<string, number>;
  skinPct: Record<string, number>;
  boosterOpensCumulative: number;
  jackpotHitsCumulative: number;
  jackpotPayoutCentsCumulative: number; // armazenado em cents (mesmo padrão interno)
  jackpotAvgPayoutCents: number; // derivado (payoutCumulative / hits)
  periodJackpotHits: number;
  periodJackpotPayoutCents: number;
  periodBoosterOpens: number;
  // Booster revenue
  boosterRevenueCentsCumulative?: number;
  periodBoosterRevenueCents?: number;
  boosterRevenueByTypeCents?: Record<string, number>;
  boosterRevenueByChannelCents?: Record<string, number>;
  periodBoosterRevenueByTypeCents?: Record<string, number>;
  periodBoosterRevenueByChannelCents?: Record<string, number>;
  // Derivados financeiros
  rtpPct?: number; // (jackpotPayout + recycleValue) / boosterRevenue * 100
  grossMarginPct?: number; // (boosterRevenue - jackpotPayout - recycleValue) / boosterRevenue * 100
  rtpHighAlertTriggered?: boolean;
  rtpLowAlertTriggered?: boolean;
  // Marketplace
  marketListingsCumulative: number;
  marketTradesCumulative: number;
  marketVolumeCentsCumulative: number;
  marketFeeCentsCumulative: number;
  marketFloorRejectionsCumulative: number;
  periodMarketListings: number;
  periodMarketTrades: number;
  periodMarketVolumeCents: number;
  periodMarketFeeCents: number;
  periodMarketFloorRejections: number;
  // Reciclagem
  recycleConversionsCumulative: number;
  recycleValueCentsCumulative: number;
  periodRecycleConversions: number;
  periodRecycleValueCents: number;
  alerts: {
    rarityPositive: number;
    rarityNegative: number;
    skinPositive: number;
    skinNegative: number;
  };
}

// Buffer em memória (fase 1 - validação antes de persistir)
const series: EconomicSeriesEntry[] = [];
let lastEventCapture = 0;
let schedulerStarted = false;

function buildEntry(snapshot: Record<string, number>): EconomicSeriesEntry {
  const ts = new Date().toISOString();
  const rarityKeys = Object.keys(snapshot).filter(k => k.startsWith('card_rarity_'));
  const skinKeys = Object.keys(snapshot).filter(k => k.startsWith('skin_') && !k.endsWith('_alert_total'));
  const totalRarity = rarityKeys.reduce((a,k)=> a + (snapshot[k]||0), 0);
  const totalSkins = skinKeys.reduce((a,k)=> a + (snapshot[k]||0), 0);
  const rarityPct: Record<string, number> = {};
  for (const k of rarityKeys) {
    const name = k.replace('card_rarity_','').replace('_total','');
    rarityPct[name] = totalRarity ? (snapshot[k] / totalRarity * 100) : 0;
  }
  const skinPct: Record<string, number> = {};
  for (const k of skinKeys) {
    const name = k.replace('skin_','').replace('_total','');
    skinPct[name] = totalSkins ? (snapshot[k] / totalSkins * 100) : 0;
  }
  const boosterOpensCumulative = snapshot['booster_open_total'] || 0;
  const jackpotHitsCumulative = snapshot['jackpot_hits_total'] || 0;
  const jackpotPayoutCentsCumulative = snapshot['jackpot_payout_brl_total'] || 0;
  const jackpotAvgPayoutCents = jackpotHitsCumulative > 0 ? (jackpotPayoutCentsCumulative / jackpotHitsCumulative) : 0;
  const prev = series.length ? series[series.length - 1] : undefined;
  const periodJackpotHits = prev ? (jackpotHitsCumulative - prev.jackpotHitsCumulative) : jackpotHitsCumulative;
  const periodJackpotPayoutCents = prev ? (jackpotPayoutCentsCumulative - prev.jackpotPayoutCentsCumulative) : jackpotPayoutCentsCumulative;
  const periodBoosterOpens = prev ? (boosterOpensCumulative - prev.boosterOpensCumulative) : boosterOpensCumulative;
  // Booster revenue
  const boosterRevenueCentsCumulative = snapshot['booster_revenue_brl_cents_total'] || 0;
  const periodBoosterRevenueCents = prev ? (boosterRevenueCentsCumulative - (prev.boosterRevenueCentsCumulative || 0)) : boosterRevenueCentsCumulative;
  // Revenue segmentation cumulative maps
  const seg = getRevenueSegmentation();
  const boosterRevenueByTypeCents = seg.byType;
  const boosterRevenueByChannelCents = seg.byChannel;
  const periodBoosterRevenueByTypeCents: Record<string, number> = {};
  const periodBoosterRevenueByChannelCents: Record<string, number> = {};
  if (prev && prev.boosterRevenueByTypeCents) {
    for (const k of Object.keys(boosterRevenueByTypeCents)) {
      const prevVal = prev.boosterRevenueByTypeCents[k] || 0;
      periodBoosterRevenueByTypeCents[k] = boosterRevenueByTypeCents[k] - prevVal;
    }
  } else {
    for (const k of Object.keys(boosterRevenueByTypeCents)) periodBoosterRevenueByTypeCents[k] = boosterRevenueByTypeCents[k];
  }
  if (prev && prev.boosterRevenueByChannelCents) {
    for (const k of Object.keys(boosterRevenueByChannelCents)) {
      const prevVal = prev.boosterRevenueByChannelCents[k] || 0;
      periodBoosterRevenueByChannelCents[k] = boosterRevenueByChannelCents[k] - prevVal;
    }
  } else {
    for (const k of Object.keys(boosterRevenueByChannelCents)) periodBoosterRevenueByChannelCents[k] = boosterRevenueByChannelCents[k];
  }
  // Marketplace cumulativos
  const marketListingsCumulative = snapshot['market_listings_created_total'] || 0;
  const marketTradesCumulative = snapshot['market_trades_total'] || 0;
  const marketVolumeCentsCumulative = snapshot['market_volume_brl_cents_total'] || 0;
  const marketFeeCentsCumulative = snapshot['market_fee_brl_cents_total'] || 0;
  const marketFloorRejectionsCumulative = snapshot['market_floor_rejections_total'] || 0;
  const periodMarketListings = prev ? (marketListingsCumulative - prev.marketListingsCumulative) : marketListingsCumulative;
  const periodMarketTrades = prev ? (marketTradesCumulative - prev.marketTradesCumulative) : marketTradesCumulative;
  const periodMarketVolumeCents = prev ? (marketVolumeCentsCumulative - prev.marketVolumeCentsCumulative) : marketVolumeCentsCumulative;
  const periodMarketFeeCents = prev ? (marketFeeCentsCumulative - prev.marketFeeCentsCumulative) : marketFeeCentsCumulative;
  const periodMarketFloorRejections = prev ? (marketFloorRejectionsCumulative - prev.marketFloorRejectionsCumulative) : marketFloorRejectionsCumulative;
  // Reciclagem cumulativos
  const recycleConversionsCumulative = snapshot['recycle_conversions_total'] || 0;
  const recycleValueCentsCumulative = snapshot['recycle_value_brl_cents_total'] || 0;
  const periodRecycleConversions = prev ? (recycleConversionsCumulative - prev.recycleConversionsCumulative) : recycleConversionsCumulative;
  const periodRecycleValueCents = prev ? (recycleValueCentsCumulative - prev.recycleValueCentsCumulative) : recycleValueCentsCumulative;
  const alerts = {
    rarityPositive: snapshot['rarity_deviation_alert_total'] || 0,
    rarityNegative: snapshot['rarity_deviation_negative_alert_total'] || 0,
    skinPositive: snapshot['skin_deviation_alert_total'] || 0,
    skinNegative: snapshot['skin_deviation_negative_alert_total'] || 0,
  };
  // Derivados financeiros
  let rtpPct: number | undefined = undefined;
  let grossMarginPct: number | undefined = undefined;
  let rtpHighAlertTriggered: boolean | undefined = undefined;
  let rtpLowAlertTriggered: boolean | undefined = undefined;
  if (boosterRevenueCentsCumulative > 0) {
    const payouts = jackpotPayoutCentsCumulative + recycleValueCentsCumulative;
    rtpPct = (payouts / boosterRevenueCentsCumulative) * 100;
    grossMarginPct = ((boosterRevenueCentsCumulative - payouts) / boosterRevenueCentsCumulative) * 100;
    // Verificação de limites RTP para marcar triggers
    const high = env.economicSeriesRtpAlertHighPct;
    const low = env.economicSeriesRtpAlertLowPct;
    if (!isNaN(high) && high > 0 && rtpPct > high) {
      rtpHighAlertTriggered = true;
    }
    if (!isNaN(low) && low > 0 && rtpPct < low) {
      rtpLowAlertTriggered = true;
    }
  }
  return {
    ts,
    rarityPct,
    skinPct,
    boosterOpensCumulative,
    jackpotHitsCumulative,
    jackpotPayoutCentsCumulative,
    jackpotAvgPayoutCents: Math.round(jackpotAvgPayoutCents * 100) / 100, // arredonda
    periodJackpotHits,
    periodJackpotPayoutCents,
    periodBoosterOpens,
    boosterRevenueCentsCumulative,
    periodBoosterRevenueCents,
    boosterRevenueByTypeCents,
    boosterRevenueByChannelCents,
    periodBoosterRevenueByTypeCents,
    periodBoosterRevenueByChannelCents,
    rtpPct: rtpPct !== undefined ? Math.round(rtpPct * 100) / 100 : undefined,
    grossMarginPct: grossMarginPct !== undefined ? Math.round(grossMarginPct * 100) / 100 : undefined,
    rtpHighAlertTriggered,
    rtpLowAlertTriggered,
    marketListingsCumulative,
    marketTradesCumulative,
    marketVolumeCentsCumulative,
    marketFeeCentsCumulative,
    marketFloorRejectionsCumulative,
    periodMarketListings,
    periodMarketTrades,
    periodMarketVolumeCents,
    periodMarketFeeCents,
    periodMarketFloorRejections,
    recycleConversionsCumulative,
    recycleValueCentsCumulative,
    periodRecycleConversions,
    periodRecycleValueCents,
    alerts,
  };
}

let lastPersistedHash: string | undefined;

function getRtpThresholds() {
  let high = env.economicSeriesRtpAlertHighPct;
  let low = env.economicSeriesRtpAlertLowPct;
  if (process.env.NODE_ENV === 'test') {
    if (process.env.ECONOMIC_SERIES_RTP_ALERT_HIGH_PCT) high = Number(process.env.ECONOMIC_SERIES_RTP_ALERT_HIGH_PCT);
    if (process.env.ECONOMIC_SERIES_RTP_ALERT_LOW_PCT) low = Number(process.env.ECONOMIC_SERIES_RTP_ALERT_LOW_PCT);
  }
  return { high, low };
}

async function ensureLastPersistedHash() {
  if (!env.economicSeriesPersistEnabled || lastPersistedHash !== undefined) return;
  const { data, error } = await supabaseAdmin
    .from('economic_series')
    .select('hash')
    .order('ts', { ascending: false })
    .limit(1);
  if (!error && data && data.length && data[0].hash) {
    lastPersistedHash = data[0].hash;
  } else {
    lastPersistedHash = null as any; // marca ausência inicial
  }
}

function canonicalForIntegrity(entry: EconomicSeriesEntry) {
  // Seleciona somente campos econômicos ordenados para hash determinístico
  const obj: Record<string, any> = {
    ts: entry.ts,
    rarityPct: entry.rarityPct,
    skinPct: entry.skinPct,
    boosterOpensCumulative: entry.boosterOpensCumulative,
    jackpotHitsCumulative: entry.jackpotHitsCumulative,
    jackpotPayoutCentsCumulative: entry.jackpotPayoutCentsCumulative,
    jackpotAvgPayoutCents: entry.jackpotAvgPayoutCents,
    periodJackpotHits: entry.periodJackpotHits,
    periodJackpotPayoutCents: entry.periodJackpotPayoutCents,
    periodBoosterOpens: entry.periodBoosterOpens,
    boosterRevenueCentsCumulative: entry.boosterRevenueCentsCumulative,
    periodBoosterRevenueCents: entry.periodBoosterRevenueCents,
    rtpPct: entry.rtpPct,
    grossMarginPct: entry.grossMarginPct,
    rtpHighAlertTriggered: entry.rtpHighAlertTriggered,
    rtpLowAlertTriggered: entry.rtpLowAlertTriggered,
    boosterRevenueByTypeCents: entry.boosterRevenueByTypeCents,
    boosterRevenueByChannelCents: entry.boosterRevenueByChannelCents,
    periodBoosterRevenueByTypeCents: entry.periodBoosterRevenueByTypeCents,
    periodBoosterRevenueByChannelCents: entry.periodBoosterRevenueByChannelCents,
    marketListingsCumulative: entry.marketListingsCumulative,
    marketTradesCumulative: entry.marketTradesCumulative,
    marketVolumeCentsCumulative: entry.marketVolumeCentsCumulative,
    marketFeeCentsCumulative: entry.marketFeeCentsCumulative,
    marketFloorRejectionsCumulative: entry.marketFloorRejectionsCumulative,
    periodMarketListings: entry.periodMarketListings,
    periodMarketTrades: entry.periodMarketTrades,
    periodMarketVolumeCents: entry.periodMarketVolumeCents,
    periodMarketFeeCents: entry.periodMarketFeeCents,
    periodMarketFloorRejections: entry.periodMarketFloorRejections,
    recycleConversionsCumulative: entry.recycleConversionsCumulative,
    recycleValueCentsCumulative: entry.recycleValueCentsCumulative,
    periodRecycleConversions: entry.periodRecycleConversions,
    periodRecycleValueCents: entry.periodRecycleValueCents,
    alerts: entry.alerts,
  };
  // Ordena chaves de primeiro nível
  const sorted = Object.keys(obj).sort().reduce((acc, k) => { acc[k] = obj[k]; return acc; }, {} as Record<string, any>);
  return JSON.stringify(sorted);
}

async function persistEntry(entry: EconomicSeriesEntry) {
  if (!env.economicSeriesPersistEnabled) return;
  await ensureLastPersistedHash();
  let hash: string | undefined;
  let hmac: string | undefined;
  let prev_hash: string | undefined = lastPersistedHash || undefined;
  if (env.economicSeriesIntegrityEnabled) {
    const canonical = canonicalForIntegrity(entry);
    hash = createHash('sha256').update(canonical).digest('hex');
    if (env.economicSeriesHmacSecret) {
      hmac = createHmac('sha256', env.economicSeriesHmacSecret).update(canonical).digest('hex');
    }
  }
  const payload: Record<string, any> = {
    ts: entry.ts,
    rarity_pct: entry.rarityPct,
    skin_pct: entry.skinPct,
    booster_opens_cum: entry.boosterOpensCumulative,
    jackpot_hits_cum: entry.jackpotHitsCumulative,
    jackpot_payout_cents_cum: entry.jackpotPayoutCentsCumulative,
    jackpot_avg_payout_cents: entry.jackpotAvgPayoutCents,
    period_jackpot_hits: entry.periodJackpotHits,
    period_jackpot_payout_cents: entry.periodJackpotPayoutCents,
    period_booster_opens: entry.periodBoosterOpens,
    booster_revenue_cents_cum: entry.boosterRevenueCentsCumulative,
    period_booster_revenue_cents: entry.periodBoosterRevenueCents,
    rtp_pct: entry.rtpPct,
    gross_margin_pct: entry.grossMarginPct,
    booster_revenue_by_type_cents: entry.boosterRevenueByTypeCents,
    booster_revenue_by_channel_cents: entry.boosterRevenueByChannelCents,
    period_booster_revenue_by_type_cents: entry.periodBoosterRevenueByTypeCents,
    period_booster_revenue_by_channel_cents: entry.periodBoosterRevenueByChannelCents,
    alerts: entry.alerts,
    // Integridade
    hash,
    prev_hash,
    hmac,
    // Marketplace & reciclagem - serão adicionados em migration extensão
    market_listings_cum: entry.marketListingsCumulative,
    market_trades_cum: entry.marketTradesCumulative,
    market_volume_cents_cum: entry.marketVolumeCentsCumulative,
    market_fee_cents_cum: entry.marketFeeCentsCumulative,
    market_floor_rejections_cum: entry.marketFloorRejectionsCumulative,
    period_market_listings: entry.periodMarketListings,
    period_market_trades: entry.periodMarketTrades,
    period_market_volume_cents: entry.periodMarketVolumeCents,
    period_market_fee_cents: entry.periodMarketFeeCents,
    period_market_floor_rejections: entry.periodMarketFloorRejections,
    recycle_conversions_cum: entry.recycleConversionsCumulative,
    recycle_value_cents_cum: entry.recycleValueCentsCumulative,
    period_recycle_conversions: entry.periodRecycleConversions,
    period_recycle_value_cents: entry.periodRecycleValueCents,
  };
  const { error } = await supabaseAdmin.from('economic_series').insert(payload);
  if (!error && hash) {
    lastPersistedHash = hash;
  }
}

async function captureInternal() {
  const snap = await Metrics.snapshot();
  const entry = buildEntry(snap);
  series.push(entry);
  const max = env.economicSeriesMaxEntries;
  if (series.length > max) {
    series.splice(0, series.length - max);
  }
  // RTP alerts
  if (entry.rtpPct !== undefined) {
    const { high, low } = getRtpThresholds();
    if (!isNaN(high) && high > 0 && entry.rtpPct > high) {
      Metrics.incr('economic_rtp_high_alert_total').catch(()=>{});
      await maybeRtpHighAlert(entry.rtpPct, { high });
    }
    if (!isNaN(low) && low > 0 && entry.rtpPct < low) {
      Metrics.incr('economic_rtp_low_alert_total').catch(()=>{});
      await maybeRtpLowAlert(entry.rtpPct, { low });
    }
  }
  // Persistência opcional
  try {
    await persistEntry(entry);
  } catch {
    // silencioso para não quebrar captura principal
  }
  return entry;
}

// Captura manual (exposta)
export async function captureEconomicSeriesManual() {
  return await captureInternal();
}

// Captura disparada por eventos (jackpot / booster open) com intervalo mínimo
export async function captureEconomicSeriesOnEvent() {
  const now = Date.now();
  if (now - lastEventCapture < env.economicSeriesEventMinSeconds * 1000) return null; // ignora por janela
  lastEventCapture = now;
  return await captureInternal();
}

// Scheduler periódico
export function startEconomicSeriesScheduler() {
  if (schedulerStarted) return;
  schedulerStarted = true;
  const intervalMs = env.economicSeriesIntervalSeconds * 1000;
  setInterval(() => {
    captureInternal().catch(()=>{});
  }, intervalMs).unref();
}

export function listEconomicSeries(limit = 100, sinceTs?: string) {
  let items = series.slice();
  if (sinceTs) {
    items = items.filter(e => e.ts > sinceTs);
  }
  if (limit && items.length > limit) items = items.slice(-limit); // últimos 'limit' mas retornando ascendente
  return items;
}
