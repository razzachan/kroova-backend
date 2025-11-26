import { describe, it, expect, beforeAll } from 'vitest';
import http from 'http';

let received: any[] = [];
let server: http.Server;
let port = 5559;
let buildApp: any;

describe('anchor verify endpoint', () => {
  beforeAll(async () => {
    server = http.createServer((req, res) => {
      if (req.method === 'POST') {
        let body = '';
        req.on('data', c => body += c);
        req.on('end', () => {
          received.push(body);
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ anchorId: 'anchor-verify' }));
        });
      } else { res.statusCode = 404; res.end(); }
    }).listen(port);
    process.env.AUDIT_ANCHOR_ENABLED = 'true';
    process.env.AUDIT_ANCHOR_URL = `http://localhost:${port}`;
    process.env.AUDIT_EXPORT_HMAC_SECRET = 'export-secret-verify';
    const mod = await import('../../src/app');
    buildApp = mod.buildApp;
  });

  it('verifica presença de anchorId', async () => {
    const app = await buildApp();
    const exp = await app.inject({ method: 'GET', url: '/internal/audit-export?historyLimit=5&snapshotsLimit=2' });
    expect(exp.statusCode).toBe(200);
    const bundle = exp.json();
    expect(bundle.anchor.anchorId).toBe('anchor-verify');
    const verify = await app.inject({ method: 'GET', url: `/internal/audit-anchors/verify/${bundle.anchor.anchorId}` });
    expect(verify.statusCode).toBe(200);
    const body = verify.json();
    expect(body.found).toBe(true);
    expect(body.anchor.anchorId).toBe(bundle.anchor.anchorId);
  });
});
