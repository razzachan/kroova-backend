import { describe, it, expect, beforeAll } from 'vitest';
import crypto from 'crypto';

// buildApp será importado dinamicamente após configurar env vars
let buildApp: any;
function hmac(secret: string, body: any) {
  return crypto.createHmac('sha256', secret).update(JSON.stringify(body)).digest('hex');
}

describe('audit export signed', () => {
  beforeAll(() => {
    process.env.AUDIT_HISTORY_HMAC_SECRET = 'hist-secret';
    process.env.AUDIT_EXPORT_HMAC_SECRET = 'export-secret';
    return import('../../src/app').then(mod => { buildApp = mod.buildApp; });
  });

  it('retorna bundle JSON com assinatura válida', async () => {
    const app = await buildApp();
    // gerar algumas mudanças
    const r1 = await app.inject({ method: 'POST', url: '/internal/deviation-thresholds', headers: { 'x-actor': 'exp-a' }, payload: { skin: { positive: 0.153 }, reason: 'ajuste export 1' } });
    expect(r1.statusCode).toBe(200);
    const r2 = await app.inject({ method: 'POST', url: '/internal/deviation-thresholds', headers: { 'x-actor': 'exp-b' }, payload: { rarity: { positive: 0.202 }, reason: 'ajuste export 2' } });
    expect(r2.statusCode).toBe(200);

    const res = await app.inject({ method: 'GET', url: '/internal/audit-export?historyLimit=50&snapshotsLimit=5' });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.signature).toMatch(/^[a-f0-9]{64}$/);
    expect(body.signatureAlgo).toBe('HMAC-SHA256');
    const signature = body.signature;
    // recomputar assinatura sobre corpo sem signature fields
    const clone = { ...body };
    delete clone.signature; delete clone.signatureAlgo;
    const recomputed = hmac('export-secret', clone);
    expect(recomputed).toBe(signature);
    expect(body.thresholdVerification.allValid).toBe(true);
    expect(body.thresholdVerification.allHmacValid).toBe(true);
    expect(body.thresholdVerification.chainValid).toBe(true);
  });

  it('retorna CSV com seções e assinatura no footer', async () => {
    const app = await buildApp();
    const res = await app.inject({ method: 'GET', url: '/internal/audit-export?format=csv&historyLimit=10&snapshotsLimit=2' });
    expect(res.statusCode).toBe(200);
    const text = res.body as string;
    expect(text).toContain('#threshold_changes');
    expect(text).toContain('#snapshots');
    expect(text).toMatch(/#signature algo=HMAC-SHA256 value=[a-f0-9]{64}/);
  });
});
