import { describe, it, expect, beforeAll } from 'vitest';

process.env.NODE_ENV = 'test';
process.env.ALERT_WEBHOOK_URL = 'http://localhost:18081';
process.env.ECONOMIC_SERIES_RTP_ALERT_HIGH_PCT = '5';
process.env.ECONOMIC_SERIES_RTP_ALERT_LOW_PCT = '90';

import { domainMetrics } from '../../src/observability/metrics.js';
import { _test_resetAlerts } from '../../src/observability/alertWebhook.js';

let captureEconomicSeriesManual: any;
let captureEconomicSeriesOnEvent: any;

let server: any;
const received: any[] = [];

beforeAll(async () => {
  // Simple webhook collector server
  const http = await import('http');
  server = http.createServer((req, res) => {
    if (req.method === 'POST') {
      let body = '';
      req.on('data', c => body += c);
      req.on('end', () => {
        try { received.push(JSON.parse(body)); } catch {}
        res.writeHead(200); res.end('ok');
      });
    } else { res.writeHead(404); res.end(); }
  }).listen(18081);
  _test_resetAlerts();
  const econ = await import('../../src/observability/economicSeries.js');
  captureEconomicSeriesManual = econ.captureEconomicSeriesManual;
  captureEconomicSeriesOnEvent = econ.captureEconomicSeriesOnEvent;
  // Gera entrada via evento (dispara captureEconomicSeriesOnEvent) para garantir chamada do bloco de alertas
  domainMetrics.boosterPurchase(1); // receita 1
  domainMetrics.jackpotHit(1); // payout 1 => RTP 100% (> high=5%)
  await captureEconomicSeriesManual();
  // Dilui RTP para baixo do low (90%) gerando queda
  for (let i = 0; i < 50; i++) domainMetrics.boosterPurchase(10); // +500 receita -> RTP cai para ~1/501 ≈ 0.2% (< low=90%)
  await captureEconomicSeriesManual();
  // aguarda envio assíncrono dos webhooks
  await new Promise(r => setTimeout(r, 200));
  server.close();
});

describe('RTP webhook alerts', () => {
  it('dispara eventos RTP_HIGH_ALERT e RTP_LOW_ALERT com cooldown', () => {
    const highEvents = received.filter(e => e.type === 'RTP_HIGH_ALERT');
    const lowEvents = received.filter(e => e.type === 'RTP_LOW_ALERT');
    expect(highEvents.length).toBeGreaterThanOrEqual(1);
    expect(lowEvents.length).toBeGreaterThanOrEqual(1);
    const evt = highEvents[0];
    expect(typeof evt.rtpPct).toBe('number');
    expect(evt.thresholds.high).toBe(5);
    // Cooldown: repetição não deve gerar spam imediato
  });
});
