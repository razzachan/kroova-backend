import { describe, it, expect, beforeAll } from 'vitest';
import http from 'http';

let received: any[] = [];
let server: http.Server;
let port = 5557;
let buildApp: any;

describe('audit export anchoring', () => {
  beforeAll(async () => {
    received = [];
    server = http.createServer((req, res) => {
      if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
          let json: any = {};
          try { json = JSON.parse(body); } catch {}
          received.push(json);
          const response = { anchorId: 'anchor-' + Date.now(), provider: 'mock-anchor', requestId: 'req-' + Math.random().toString(16).slice(2) };
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(response));
        });
      } else { res.statusCode = 404; res.end(); }
    }).listen(port);
    process.env.AUDIT_ANCHOR_ENABLED = 'true';
    process.env.AUDIT_ANCHOR_URL = `http://localhost:${port}`;
    process.env.AUDIT_EXPORT_HMAC_SECRET = 'export-secret-anchor';
    const mod = await import('../../src/app');
    buildApp = mod.buildApp;
  });

  it('inclui campo anchor no bundle JSON', async () => {
    const app = await buildApp();
    const res = await app.inject({ method: 'GET', url: '/internal/audit-export?historyLimit=5&snapshotsLimit=2' });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.anchor).toBeTruthy();
    expect(body.anchor.anchorId).toMatch(/^anchor-/);
    expect(body.anchor.provider).toBe('mock-anchor');
    expect(received.length).toBeGreaterThanOrEqual(1);
    const posted = received[0];
    expect(posted.type).toBe('AUDIT_EXPORT_ANCHOR');
    expect(posted.digest).toMatch(/^[a-f0-9]{64}$/);
  });
});
