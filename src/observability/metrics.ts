// Lightweight in-process metrics with optional Redis backing for counters
// Exposes both JSON summary and Prometheus format rendering.
import { redis } from '../lib/cache.js';
import { supabaseAdmin } from '../config/supabase.js';
import crypto from 'crypto';
import { env } from '../config/env.js';

type CounterDef = { name: string; help: string }; // future: labels

const counters: Record<string, CounterDef> = {
  http_requests_total: { name: 'http_requests_total', help: 'Total HTTP requests received' },
  http_requests_error_total: { name: 'http_requests_error_total', help: 'Total HTTP requests errored' },
  booster_purchase_total: { name: 'booster_purchase_total', help: 'Total booster purchases' },
  booster_revenue_brl_cents_total: { name: 'booster_revenue_brl_cents_total', help: 'Total revenue (BRL cents) from booster purchases' },
  booster_open_total: { name: 'booster_open_total', help: 'Total booster openings' },
  card_rarity_trash_total: { name: 'card_rarity_trash_total', help: 'Total trash rarity cards generated' },
  card_rarity_meme_total: { name: 'card_rarity_meme_total', help: 'Total meme rarity cards generated' },
  card_rarity_viral_total: { name: 'card_rarity_viral_total', help: 'Total viral rarity cards generated' },
  card_rarity_legendary_total: { name: 'card_rarity_legendary_total', help: 'Total legendary rarity cards generated' },
  card_rarity_godmode_total: { name: 'card_rarity_godmode_total', help: 'Total godmode rarity cards generated' },
  jackpot_hits_total: { name: 'jackpot_hits_total', help: 'Total godmode jackpot hits' },
  jackpot_payout_brl_total: { name: 'jackpot_payout_brl_total', help: 'Total BRL paid out in jackpots' },
  skin_default_total: { name: 'skin_default_total', help: 'Total cartas com skin default' },
  skin_neon_total: { name: 'skin_neon_total', help: 'Total cartas com skin neon' },
  skin_glow_total: { name: 'skin_glow_total', help: 'Total cartas com skin glow' },
  skin_glitch_total: { name: 'skin_glitch_total', help: 'Total cartas com skin glitch' },
  skin_ghost_total: { name: 'skin_ghost_total', help: 'Total cartas com skin ghost' },
  skin_holo_total: { name: 'skin_holo_total', help: 'Total cartas com skin holo' },
  skin_dark_total: { name: 'skin_dark_total', help: 'Total cartas com skin dark' },
  skin_deviation_alert_total: { name: 'skin_deviation_alert_total', help: 'Alertas de desvio POSITIVO de distribuição de skins (>limite)' },
  skin_deviation_negative_alert_total: { name: 'skin_deviation_negative_alert_total', help: 'Alertas de desvio NEGATIVO de distribuição de skins (<-limite)' },
  rarity_deviation_alert_total: { name: 'rarity_deviation_alert_total', help: 'Alertas de desvio POSITIVO de distribuição de raridades (>limite)' },
  rarity_deviation_negative_alert_total: { name: 'rarity_deviation_negative_alert_total', help: 'Alertas de desvio NEGATIVO de distribuição de raridades (<-limite)' },
  audit_dashboard_requests_total: { name: 'audit_dashboard_requests_total', help: 'Total de requisições ao audit dashboard reconstruídas (não cache)' },
  audit_dashboard_generation_ms_total: { name: 'audit_dashboard_generation_ms_total', help: 'Soma de ms gastos gerando audit dashboard (para média)' },
  anchor_success_total: { name: 'anchor_success_total', help: 'Total de âncoras externas bem-sucedidas de export auditoria' },
  anchor_fail_total: { name: 'anchor_fail_total', help: 'Total de falhas ao ancorar export auditoria' },
  market_listings_created_total: { name: 'market_listings_created_total', help: 'Total de anúncios criados no marketplace' },
  market_trades_total: { name: 'market_trades_total', help: 'Total de compras de anúncios (trades) concluídas' },
  market_volume_brl_cents_total: { name: 'market_volume_brl_cents_total', help: 'Volume bruto em BRL (cents) negociado em trades marketplace' },
  market_fee_brl_cents_total: { name: 'market_fee_brl_cents_total', help: 'Total de fees coletadas pelo marketplace (cents)' },
  market_floor_rejections_total: { name: 'market_floor_rejections_total', help: 'Tentativas de criação de anúncio rejeitadas por piso de preço' },
  recycle_conversions_total: { name: 'recycle_conversions_total', help: 'Total de operações de reciclagem concluídas' },
  recycle_value_brl_cents_total: { name: 'recycle_value_brl_cents_total', help: 'Total em BRL (cents) retornado ao usuário via reciclagem' },
  economic_rtp_high_alert_total: { name: 'economic_rtp_high_alert_total', help: 'Alertas de RTP acima do limite alto configurado' },
  economic_rtp_low_alert_total: { name: 'economic_rtp_low_alert_total', help: 'Alertas de RTP abaixo do limite baixo configurado' },
};

const localCounts: Record<string, number> = Object.fromEntries(Object.keys(counters).map(k => [k, 0]));

async function incr(key: string, by = 1) {
  localCounts[key] = (localCounts[key] || 0) + by;
  if (process.env.NODE_ENV === 'test') return; // skip redis usage in test to avoid noise/timeouts
  try { await redis.incrby(`m:${key}`, by); } catch {/* ignore redis down */}
}

async function getValue(key: string): Promise<number> {
  try {
    const raw = await redis.get(`m:${key}`);
    if (raw) return parseInt(raw, 10);
  } catch {/* ignore */}
  return localCounts[key] || 0;
}

export const Metrics = {
  incr,
  async snapshot() {
    const entries = await Promise.all(Object.keys(counters).map(async k => [k, await getValue(k)] as [string, number]));
    return Object.fromEntries(entries);
  },
  async renderPrometheus() {
    const lines: string[] = [];
    for (const key of Object.keys(counters)) {
      const def = counters[key];
      lines.push(`# HELP ${def.name} ${def.help}`);
      lines.push(`# TYPE ${def.name} counter`);
      lines.push(`${def.name} ${(await getValue(key))}`);
    }
    // Métrica derivada de latência média do audit dashboard (gauge)
    const reqs = await getValue('audit_dashboard_requests_total');
    const totalMs = await getValue('audit_dashboard_generation_ms_total');
    if (reqs > 0) {
      const avg = totalMs / reqs; // ms médio por geração
      lines.push(`# HELP audit_dashboard_generation_ms_avg Average ms to generate audit dashboard`);
      lines.push(`# TYPE audit_dashboard_generation_ms_avg gauge`);
      lines.push(`audit_dashboard_generation_ms_avg ${avg.toFixed(2)}`);
    }
    return lines.join('\n');
  }
};

export function metricsRequestHook() {
  return async function (_req: any, _res: any) {
    await incr('http_requests_total');
  };
}

export function metricsErrorHook() {
  return async function (_req: any, _res: any) {
    await incr('http_requests_error_total');
  };
}

// Domain specific counters helpers
interface SkinDeviationState { samples: number; }
interface RarityDeviationState { samples: number; }
const skinState: SkinDeviationState = { samples: 0 };
const rarityState: RarityDeviationState = { samples: 0 };

// Thresholds dinâmicos (ajustáveis via API interna futura)
const deviationThresholds = {
  skin: { positive: 0.15, negative: 0.15, minSamples: 500 },
  rarity: { positive: 0.20, negative: 0.20, minSamples: 1000 },
};

interface ThresholdChangeLogEntry {
  ts: string;
  before: any;
  after: any;
  actor?: string; // identificador do usuário ou fonte
  reason?: string;
  hash: string;
  hmac?: string; // proteção adicional usando segredo
  prevHash?: string; // hash do registro anterior para cadeia
}
const thresholdChangeLog: ThresholdChangeLogEntry[] = [];
const thresholdLastChangeByActor: Record<string, number> = {};

function canonicalChangeString(data: { before: any; after: any; actor?: string; reason?: string; ts: string }) {
  return JSON.stringify({
    ts: data.ts,
    actor: data.actor || '',
    reason: data.reason || '',
    before: data.before,
    after: data.after,
  });
}

function computeChangeHash(data: { before: any; after: any; actor?: string; reason?: string; ts: string }) {
  const str = canonicalChangeString(data);
  return crypto.createHash('sha256').update(str).digest('hex');
}

function computeChangeHmac(data: { before: any; after: any; actor?: string; reason?: string; ts: string }) {
  if (!env.auditHistoryHmacSecret) return undefined;
  const str = canonicalChangeString(data);
  return crypto.createHmac('sha256', env.auditHistoryHmacSecret).update(str).digest('hex');
}

function recordThresholdChange(before: any, after: any, actor?: string, reason?: string) {
  // Recarrega segredo se for teste e variável definida após import inicial
  if (process.env.NODE_ENV === 'test' && process.env.AUDIT_HISTORY_HMAC_SECRET && process.env.AUDIT_HISTORY_HMAC_SECRET !== env.auditHistoryHmacSecret) {
    env.auditHistoryHmacSecret = process.env.AUDIT_HISTORY_HMAC_SECRET;
  }
  const ts = new Date().toISOString();
  const hash = computeChangeHash({ before, after, actor, reason, ts });
  const hmac = computeChangeHmac({ before, after, actor, reason, ts });
  const prevHash = thresholdChangeLog.length ? thresholdChangeLog[thresholdChangeLog.length - 1].hash : undefined;
  const entry: ThresholdChangeLogEntry = { ts, before, after, actor, reason, hash, hmac, prevHash };
  thresholdChangeLog.push(entry);
  // Persistência opcional (ignorar em test)
  if (process.env.NODE_ENV === 'test') return;
  // tentativa de inserir; se falhar, apenas log local
  const row: any = { before: entry.before, after: entry.after, ts: entry.ts, actor: entry.actor, reason: entry.reason, hash: entry.hash };
  if (entry.hmac) row.hmac = entry.hmac;
  supabaseAdmin
    .from('deviation_threshold_changes')
    .insert(row)
    .then((res: any) => { const { error } = res || {}; if (error) {/* silencioso */} })
    .catch(() => {/* ignorar */});
}

export function setDeviationThresholds(partial: Partial<{ skin: Partial<{ positive: number; negative: number; minSamples: number }>; rarity: Partial<{ positive: number; negative: number; minSamples: number }> }>, actor?: string, reason?: string) {
  // Rate limit por actor
  const now = Date.now();
  if (actor) {
    const last = thresholdLastChangeByActor[actor] || 0;
    const minMs = env.thresholdChangeMinSeconds * 1000;
    if (now - last < minMs) {
      throw new Error(`RATE_LIMIT: alteração de thresholds para actor '${actor}' antes de ${env.thresholdChangeMinSeconds}s`);
    }
    thresholdLastChangeByActor[actor] = now;
  }
  const before = getDeviationThresholds();
  if (partial.skin) Object.assign(deviationThresholds.skin, partial.skin);
  if (partial.rarity) Object.assign(deviationThresholds.rarity, partial.rarity);
  const after = getDeviationThresholds();
  recordThresholdChange(before, after, actor, reason);
}

export function getDeviationThresholds() {
  return JSON.parse(JSON.stringify(deviationThresholds));
}

export function getDeviationThresholdChanges(limit = 50) {
  return thresholdChangeLog.slice(-limit).reverse().map(entry => ({
    ...entry,
    diff: {
      skin: {
        positive: entry.after.skin.positive - entry.before.skin.positive,
        negative: entry.after.skin.negative - entry.before.skin.negative,
        minSamples: entry.after.skin.minSamples - entry.before.skin.minSamples,
      },
      rarity: {
        positive: entry.after.rarity.positive - entry.before.rarity.positive,
        negative: entry.after.rarity.negative - entry.before.rarity.negative,
        minSamples: entry.after.rarity.minSamples - entry.before.rarity.minSamples,
      }
    },
    hash: entry.hash,
    hmac: entry.hmac,
    prevHash: entry.prevHash,
    reason: entry.reason,
  }));
}

export function verifyDeviationThresholdHashes(limit = 100) {
  const list = thresholdChangeLog.slice(-limit);
  const hashToEntry: Record<string, ThresholdChangeLogEntry> = Object.fromEntries(list.map(e => [e.hash, e]));
  return list.reverse().map(entry => {
    const recomputedHash = computeChangeHash({ before: entry.before, after: entry.after, actor: entry.actor, reason: entry.reason, ts: entry.ts });
    let hmacValid: boolean | undefined = undefined;
    if (env.auditHistoryHmacSecret && entry.hmac) {
      const recomputedHmac = computeChangeHmac({ before: entry.before, after: entry.after, actor: entry.actor, reason: entry.reason, ts: entry.ts });
      hmacValid = recomputedHmac === entry.hmac;
    }
    let prevMatch: boolean | undefined = undefined;
    if (entry.prevHash) {
      const prev = hashToEntry[entry.prevHash];
      prevMatch = !!prev && prev.hash === entry.prevHash;
    }
    return {
      ts: entry.ts,
      actor: entry.actor,
      reason: entry.reason,
      hash: entry.hash,
      valid: recomputedHash === entry.hash,
      hmac: entry.hmac,
      hmacValid,
      prevHash: entry.prevHash,
      prevMatch,
    };
  });
}

export const domainMetrics = {
  boosterPurchase: (priceBrl?: number) => { incr('booster_purchase_total'); if (priceBrl && priceBrl > 0) incr('booster_revenue_brl_cents_total', Math.round(priceBrl * 100)); },
  boosterOpen: () => { incr('booster_open_total'); import('./economicSeries.js').then(m => m.captureEconomicSeriesOnEvent()).catch(()=>{}); },
  cardRarity: (rarity: string, expectedPct?: number) => {
    const key = `card_rarity_${rarity}_total`;
    if ((counters as any)[key]) incr(key);
    rarityState.samples++;
    if (expectedPct && rarityState.samples >= deviationThresholds.rarity.minSamples) { // limiar maior para raridades
      const totalCards = Object.keys(counters)
        .filter(k => k.startsWith('card_rarity_'))
        .reduce((acc, k) => acc + (localCounts[k] || 0), 0);
      const observed = (localCounts[key] || 0) / (totalCards || 1) * 100;
      const deviation = (observed - expectedPct) / expectedPct;
      if (deviation > deviationThresholds.rarity.positive) incr('rarity_deviation_alert_total');
      if (deviation < -deviationThresholds.rarity.negative) incr('rarity_deviation_negative_alert_total');
    }
  },
  skin: (skin: string, expectedPct?: number) => {
    const key = `skin_${skin}_total`;
    if ((counters as any)[key]) incr(key);
    skinState.samples++;
    // Após mínimo de amostras, verifica desvio relativo
    if (expectedPct && skinState.samples >= deviationThresholds.skin.minSamples) {
      const totalSkins = Object.keys(counters)
        .filter(k => k.startsWith('skin_') && !k.endsWith('_alert_total'))
        .reduce((acc, k) => acc + (localCounts[k] || 0), 0);
      const observed = (localCounts[key] || 0) / (totalSkins || 1) * 100;
      const deviation = (observed - expectedPct) / expectedPct; // positivo = acima esperado
      if (deviation > deviationThresholds.skin.positive) incr('skin_deviation_alert_total');
      if (deviation < -deviationThresholds.skin.negative) incr('skin_deviation_negative_alert_total');
    }
  },
  jackpotHit: (amount: number) => {
    incr('jackpot_hits_total');
    incr('jackpot_payout_brl_total', Math.round(amount * 100)); // store cents internally
    import('./economicSeries.js').then(m => m.captureEconomicSeriesOnEvent()).catch(()=>{});
  },
  marketListingCreated: () => incr('market_listings_created_total'),
  marketTrade: (priceBrl: number, feeBrl: number) => {
    incr('market_trades_total');
    incr('market_volume_brl_cents_total', Math.round(priceBrl * 100));
    incr('market_fee_brl_cents_total', Math.round(feeBrl * 100));
  },
  marketFloorRejected: () => incr('market_floor_rejections_total'),
  recycleConversion: (valueBrl: number) => {
    incr('recycle_conversions_total');
    incr('recycle_value_brl_cents_total', Math.round(valueBrl * 100));
  },
};

// Função de teste para corromper último hash e disparar alerta de integridade
export function _testTamperLastThresholdHash() {
  if (process.env.NODE_ENV !== 'test') return;
  if (thresholdChangeLog.length) {
    thresholdChangeLog[thresholdChangeLog.length - 1].hash = 'deadbeef' + Date.now();
  }
}
