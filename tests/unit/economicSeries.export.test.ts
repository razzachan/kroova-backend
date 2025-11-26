import { describe, it, expect, beforeAll } from 'vitest';

process.env.NODE_ENV = 'test';
process.env.ECONOMIC_SERIES_EXPORT_ENABLED = 'true';
process.env.ECONOMIC_SERIES_PERSIST_ENABLED = 'true';
process.env.ECONOMIC_SERIES_INTEGRITY_ENABLED = 'true';
process.env.ECONOMIC_SERIES_HMAC_SECRET = 'export-test-secret';
// Thresholds RTP para testar alerts (overlap intencional para validar ambos)
process.env.ECONOMIC_SERIES_RTP_ALERT_HIGH_PCT = '5';
process.env.ECONOMIC_SERIES_RTP_ALERT_LOW_PCT = '90';

import { domainMetrics } from '../../src/observability/metrics.js';
import { supabaseAdmin } from '../../src/config/supabase.js';

let buildEconomicSeriesExport: any;
let economicSeriesExportToCsv: any;
let captureEconomicSeriesManual: any;

const inserted: any[] = [];

beforeAll(async () => {
  // Mock supabase for persistence
  (supabaseAdmin as any).from = (_table: string) => {
    return {
      select() { return { order() { return { limit() { return { data: inserted.slice(-1).map(e => ({ hash: e.hash })), error: null }; } }; } }; },
      insert: async (payload: any) => { inserted.push(payload); return { error: null }; }
    };
  };
  const econ = await import('../../src/observability/economicSeries.js');
  captureEconomicSeriesManual = econ.captureEconomicSeriesManual;
  const exp = await import('../../src/observability/economicSeriesExport.js');
  buildEconomicSeriesExport = exp.buildEconomicSeriesExport;
  economicSeriesExportToCsv = exp.economicSeriesExportToCsv;
});

describe('economicSeries export', () => {
  it('gera export JSON com assinatura e lastHash', async () => {
    domainMetrics.boosterOpen();
    domainMetrics.jackpotHit(2.22);
    await captureEconomicSeriesManual();
    domainMetrics.marketListingCreated();
    domainMetrics.marketTrade(10.0, 0.50);
    domainMetrics.recycleConversion(1.75);
    await captureEconomicSeriesManual();
    const bundle = await buildEconomicSeriesExport(50);
    expect(bundle.count).toBeGreaterThanOrEqual(2);
    expect(bundle.signature).toBeDefined();
    expect(bundle.signatureAlgo).toBe('HMAC-SHA256');
    expect(typeof bundle.lastHash === 'string' || bundle.lastHash === undefined).toBe(true);
  });
  it('gera export CSV incluindo assinatura', async () => {
    const bundle = await buildEconomicSeriesExport(50);
    const csv = economicSeriesExportToCsv(bundle);
    expect(csv.includes('#signature')).toBe(bundle.signature ? true : true); // if signature present should include line
    expect(csv.split('\n')[0].startsWith('ts,')).toBe(true);
  });
  it('inclui rtpAlerts e flags de triggers no bundle e CSV', async () => {
    // Ajusta thresholds diretamente (env já pode ter sido congelado antes de imports de outros módulos)
    const { env } = await import('../../src/config/env.js');
    env.economicSeriesRtpAlertHighPct = 5;
    env.economicSeriesRtpAlertLowPct = 90;
    // Primeiro cenário: payout alto sobre receita pequena -> high alert
    domainMetrics.boosterPurchase(10); // revenue 10
    domainMetrics.jackpotHit(2); // payout 2 => RTP 20% (> high=5%)
    await captureEconomicSeriesManual();
    // Segundo cenário: muita receita adicional sem novo payout -> RTP cai < low(90%)
    for (let i = 0; i < 10; i++) domainMetrics.boosterPurchase(10); // +100 revenue (cumulative 110)
    await captureEconomicSeriesManual();
    const bundle = await buildEconomicSeriesExport(50);
    expect(bundle.rtpAlerts).toBeDefined();
    expect(bundle.rtpAlerts.totalHighAlerts).toBeGreaterThanOrEqual(1);
    expect(bundle.rtpAlerts.totalLowAlerts).toBeGreaterThanOrEqual(1);
    const hasHighFlag = bundle.items.some(it => it.rtpHighAlertTriggered === true);
    const hasLowFlag = bundle.items.some(it => it.rtpLowAlertTriggered === true);
    expect(hasHighFlag).toBe(true);
    expect(hasLowFlag).toBe(true);
    const csv = economicSeriesExportToCsv(bundle);
    expect(csv.includes('rtpHighAlertTriggered')).toBe(true);
    expect(csv.includes('#rtp_alerts')).toBe(true);
  });
});