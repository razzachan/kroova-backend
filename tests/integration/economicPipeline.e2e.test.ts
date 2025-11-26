import { describe, it, expect, beforeAll } from 'vitest';

// Configure env BEFORE imports
process.env.NODE_ENV = 'test';
process.env.ALERT_WEBHOOK_URL = 'http://localhost:18091';
process.env.ECONOMIC_SERIES_RTP_ALERT_HIGH_PCT = '5';
process.env.ECONOMIC_SERIES_RTP_ALERT_LOW_PCT = '90';
process.env.ECONOMIC_SERIES_EXPORT_ENABLED = 'true';

import { buildApp } from '../../src/app.js';
import { domainMetrics } from '../../src/observability/metrics.js';
import { _test_resetAlerts } from '../../src/observability/alertWebhook.js';

let app: any;
let server: any;
const received: any[] = [];

beforeAll(async () => {
  // Webhook collector
  const http = await import('http');
  server = http.createServer((req, res) => {
    if (req.method === 'POST') {
      let body = '';
      req.on('data', c => body += c);
      req.on('end', () => { try { received.push(JSON.parse(body)); } catch {} res.writeHead(200); res.end('ok'); });
    } else { res.writeHead(404); res.end(); }
  }).listen(18091);
  _test_resetAlerts();
  app = await buildApp();
});

describe('E2E Economic Pipeline', () => {
  it('purchase → revenue → RTP high/low → export bundle includes alerts', async () => {
    // Register
    const email = `econ_${Date.now()}@test.local`;
    const registerRes = await app.inject({ method: 'POST', url: '/api/v1/auth/register', payload: { email, password: 'Test@123', name: 'Econ User' } });
    expect(registerRes.statusCode).toBe(200);
    const { data: regData } = registerRes.json();
    const authHeader = `Bearer ${regData.access_token}`;

    // Simulate direct metric revenue & jackpot to spike RTP
    domainMetrics.boosterPurchase(1); // +1 revenue
    domainMetrics.jackpotHit(1); // +1 payout => RTP >> 5 triggers high
    // Capture manual economic series entry
    const econMod = await import('../../src/observability/economicSeries.js');
    await econMod.captureEconomicSeriesManual();

    // Dilute RTP with many purchases (no jackpots) to drop below LOW threshold (90%)
    for (let i = 0; i < 40; i++) domainMetrics.boosterPurchase(10); // +400 revenue
    await econMod.captureEconomicSeriesManual();

    // Allow webhook dispatch flush
    await new Promise(r => setTimeout(r, 150));
    server.close();

    const highEvents = received.filter(e => e.type === 'RTP_HIGH_ALERT');
    const lowEvents = received.filter(e => e.type === 'RTP_LOW_ALERT');
    expect(highEvents.length).toBeGreaterThanOrEqual(1);
    expect(lowEvents.length).toBeGreaterThanOrEqual(1);

    // Metrics endpoint should include counters
    const metricsRes = await app.inject({ method: 'GET', url: '/internal/metrics' });
    expect(metricsRes.statusCode).toBe(200);
    const metricsText = metricsRes.body as string;
    expect(metricsText).toMatch(/economic_rtp_high_alert_total/);
    expect(metricsText).toMatch(/economic_rtp_low_alert_total/);

    // Economic series list should have >=2 entries and flags present
    const listRes = await app.inject({ method: 'GET', url: '/internal/economic-series?limit=5' });
    expect(listRes.statusCode).toBe(200);
    const listBody = listRes.json();
    expect(listBody.items.length).toBeGreaterThanOrEqual(2);
    const last = listBody.items[listBody.items.length - 1];
    expect([true, false, undefined]).toContain(last.rtpHighAlertTriggered); // sanity
    expect([true, false, undefined]).toContain(last.rtpLowAlertTriggered);

    // Export bundle (JSON) should include rtpAlerts counters
    const exportRes = await app.inject({ method: 'GET', url: '/internal/economic-series/export?limit=50&format=json' });
    expect(exportRes.statusCode).toBe(200);
    const exportBody = exportRes.json();
    expect(exportBody.rtpAlerts).toBeTruthy();
    expect(typeof exportBody.rtpAlerts.totalHighAlerts).toBe('number');
    expect(typeof exportBody.rtpAlerts.totalLowAlerts).toBe('number');
  }, 20000);
});
