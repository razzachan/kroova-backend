import { describe, it, expect, beforeAll } from 'vitest';
let received: any[] = [];

// Força alerta de latência definindo limiar muito baixo (0ms)

describe('webhook latency alert', () => {
  beforeAll(async () => {
    received = [];
    // Mock fetch antes de carregar app
    // @ts-ignore
    global.fetch = async (_url: string, init: any) => {
      try { received.push(JSON.parse(init.body)); } catch {}
      return { ok: true } as any;
    };
    process.env.ALERT_WEBHOOK_URL = 'http://mock-webhook';
    process.env.AUDIT_DASHBOARD_LATENCY_ALERT_MS = '0';
    process.env.AUDIT_DASHBOARD_CACHE_SECONDS = '0';
    const mod = await import('../../src/app');
    const app = await mod.buildApp();
    // Força override direto do objeto env após possíveis imports prévios
    const { env } = await import('../../src/config/env.js');
    env.auditDashboardLatencyAlertMs = 0;
    env.auditDashboardCacheSeconds = 0;
    env.alertWebhookUrl = 'http://mock-webhook';
    for (let i = 0; i < 3; i++) {
      await app.inject({ method: 'GET', url: '/internal/audit-dashboard' });
    }
    await new Promise(r => setTimeout(r, 50));
  });

  it('recebe LATENCY_ALERT', () => {
    const latencyEvents = received.filter(e => e.type === 'LATENCY_ALERT');
    expect(latencyEvents.length).toBeGreaterThanOrEqual(1);
    const evt = latencyEvents[0];
    expect(typeof evt.generationMs).toBe('number');
    expect(evt.thresholdMs).toBe(0);
  });
});
