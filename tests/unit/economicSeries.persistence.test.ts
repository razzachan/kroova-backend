import { describe, it, expect, beforeAll } from 'vitest';

// Configura variáveis de ambiente ANTES de importar módulos que usam env
process.env.NODE_ENV = 'test';
process.env.ECONOMIC_SERIES_PERSIST_ENABLED = 'true';
process.env.ECONOMIC_SERIES_INTEGRITY_ENABLED = 'true';
process.env.ECONOMIC_SERIES_HMAC_SECRET = 'test-hmac-secret';

// Import dinâmico depois das envs
import { domainMetrics } from '../../src/observability/metrics.js';
import { supabaseAdmin } from '../../src/config/supabase.js';

let captureEconomicSeriesManual: any;
let listEconomicSeries: any;

// Armazena payloads inseridos para verificação de cadeia
const inserted: any[] = [];

beforeAll(async () => {
  // Mock da cadeia de chamadas supabaseAdmin.from(...)
  (supabaseAdmin as any).from = (_table: string) => {
    return {
      select() { return { order() { return { limit() { return { data: [], error: null }; } }; } }; },
      insert: async (payload: any) => { inserted.push(payload); return { error: null }; }
    };
  };
  // Import tardio do economicSeries (após mocks/env)
  const econ = await import('../../src/observability/economicSeries.js');
  captureEconomicSeriesManual = econ.captureEconomicSeriesManual;
  listEconomicSeries = econ.listEconomicSeries;
});

describe('economicSeries persistence & integrity chain', () => {
  it('persiste duas entradas com hash e prev_hash encadeados', async () => {
    // gera alguns eventos
    domainMetrics.boosterOpen();
    domainMetrics.jackpotHit(1.11);
    await captureEconomicSeriesManual();
    domainMetrics.marketListingCreated();
    domainMetrics.marketTrade(5.0, 0.20);
    domainMetrics.recycleConversion(2.75);
    await captureEconomicSeriesManual();

    expect(inserted.length).toBeGreaterThanOrEqual(2);
    const first = inserted[0];
    const second = inserted[1];
    // Hashes
    expect(first.hash).toBeDefined();
    expect(first.hash.length).toBe(64);
    expect(second.prev_hash).toBe(first.hash);
    expect(second.hash).toBeDefined();
    expect(second.hmac).toBeDefined();
    expect(second.hmac.length).toBe(64);
    // Campos marketplace/reciclagem presentes
    expect(typeof second.market_listings_cum).toBe('number');
    expect(typeof second.recycle_conversions_cum).toBe('number');
    // Série em memória também contém duas entradas
    const mem = listEconomicSeries(10);
    expect(mem.length).toBeGreaterThanOrEqual(2);
  });
});