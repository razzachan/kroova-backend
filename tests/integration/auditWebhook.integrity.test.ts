import { describe, it, expect, beforeAll } from 'vitest';
import http from 'http';

let received: any[] = [];
let server: http.Server;
let port = 5555;

// Usa tampering para forçar falha de integridade

describe('webhook integrity alert', () => {
  beforeAll(async () => {
    received = [];
    server = http.createServer((req, res) => {
      if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
          try { received.push(JSON.parse(body)); } catch {}
          res.statusCode = 200; res.end('ok');
        });
      } else { res.statusCode = 404; res.end(); }
    }).listen(port);

    process.env.ALERT_WEBHOOK_URL = `http://localhost:${port}`;
    process.env.AUDIT_DASHBOARD_CACHE_SECONDS = '0';
    process.env.AUDIT_HISTORY_HMAC_SECRET = 'hist-secret';
    // importa app após env
    const mod = await import('../../src/app');
    const metricsMod = await import('../../src/observability/metrics');
    const app = await mod.buildApp();

    // cria alteração válida
    await app.inject({ method: 'POST', url: '/internal/deviation-thresholds', headers: { 'x-actor': 'tamper-a' }, payload: { skin: { positive: 0.155 }, reason: 'valid change' } });
    // tampering: manipula hash da última entrada para invalidar verificação
    // Força corrupção usando endpoint verify para localizar entrada e alterar diretamente via referência específica
    // usa função oficial de tampering de teste
    (metricsMod as any)._testTamperLastThresholdHash();
    // gera dashboard que deve disparar alerta
    const d1 = await app.inject({ method: 'GET', url: '/internal/audit-dashboard' });
    expect(d1.statusCode).toBe(200);
    const d2 = await app.inject({ method: 'GET', url: '/internal/audit-dashboard' });
    expect(d2.statusCode).toBe(200);

    // aguarda envio
    await new Promise(r => setTimeout(r, 400));
    server.close();
  });

  it('recebe INTEGRITY_ALERT', () => {
    const integrityEvents = received.filter(e => e.type === 'INTEGRITY_ALERT');
    expect(integrityEvents.length).toBeGreaterThanOrEqual(1);
    const evt = integrityEvents[0];
    expect(evt.verification.allValid).toBe(false);
  });
});
