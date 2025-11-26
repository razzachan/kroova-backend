import { describe, it, expect, beforeAll } from 'vitest';
let buildApp: any;
let Metrics: any;

// Testa métrica derivada audit_dashboard_generation_ms_avg

describe('audit dashboard average latency metric', () => {
  beforeAll(async () => {
    process.env.AUDIT_DASHBOARD_CACHE_SECONDS = '0';
    const mod = await import('../src/app');
    buildApp = mod.buildApp;
    Metrics = (await import('../src/observability/metrics')).Metrics;
  });

  it('exibe gauge audit_dashboard_generation_ms_avg após múltiplas gerações', async () => {
    const app = await buildApp();
    // realiza 3 gerações
    // primeira chamada não cache (cached=false), seguintes podem ser cache (TTL default 5s ignorado pois foi setado 0 acima)
    const first = await app.inject({ method: 'GET', url: '/internal/audit-dashboard?historyLimit=2&snapshotsLimit=1' });
    expect(first.statusCode).toBe(200);
    const b1 = first.json();
    expect(b1.cached).toBe(false);
    const second = await app.inject({ method: 'GET', url: '/internal/audit-dashboard?historyLimit=2&snapshotsLimit=1' });
    const b2 = second.json();
    expect(b2.cached).toBe(false);
    const third = await app.inject({ method: 'GET', url: '/internal/audit-dashboard?historyLimit=2&snapshotsLimit=1' });
    const b3 = third.json();
    expect(b3.cached).toBe(false);
    const prom = await Metrics.renderPrometheus();
    expect(prom).toMatch(/audit_dashboard_requests_total/);
    expect(prom).toMatch(/audit_dashboard_generation_ms_total/);
    expect(prom).toMatch(/# HELP audit_dashboard_generation_ms_avg/);
    expect(prom).toMatch(/audit_dashboard_generation_ms_avg [0-9]+\.[0-9]{2}/);
  });
});
