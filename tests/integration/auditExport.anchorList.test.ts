import { describe, it, expect, beforeAll } from 'vitest';
import http from 'http';

let received: any[] = [];
let server: http.Server;
let port = 5558;
let buildApp: any;

describe('audit anchors listing', () => {
  beforeAll(async () => {
    received = [];
    server = http.createServer((req, res) => {
      if (req.method === 'POST') {
        let body = '';
        req.on('data', c => body += c);
        req.on('end', () => {
          received.push(body);
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ anchorId: 'anchor-test' }));
        });
      } else { res.statusCode = 404; res.end(); }
    }).listen(port);
    process.env.AUDIT_ANCHOR_ENABLED = 'true';
    process.env.AUDIT_ANCHOR_URL = `http://localhost:${port}`;
    process.env.AUDIT_EXPORT_HMAC_SECRET = 'export-secret-list';
    const mod = await import('../../src/app');
    buildApp = mod.buildApp;
  });

  it('retorna âncora criada em /internal/audit-anchors', async () => {
    const app = await buildApp();
    const resExport = await app.inject({ method: 'GET', url: '/internal/audit-export?historyLimit=3&snapshotsLimit=1' });
    expect(resExport.statusCode).toBe(200);
    const bundle = resExport.json();
    expect(bundle.anchor).toBeTruthy();

    const resList = await app.inject({ method: 'GET', url: '/internal/audit-anchors?limit=10' });
    expect(resList.statusCode).toBe(200);
    const list = resList.json();
    expect(list.items.length).toBeGreaterThanOrEqual(1);
    expect(list.items[0].anchorId).toBe('anchor-test');
  });
});
