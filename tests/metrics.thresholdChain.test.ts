import { describe, it, expect, beforeAll } from 'vitest';
import { buildApp } from '../src/app';

// Testa encadeamento de prevHash em mudanças de thresholds

describe('threshold changes chain', () => {
  beforeAll(() => {
    process.env.AUDIT_HISTORY_HMAC_SECRET = 'secret-hmac-chain';
  });

  it('gera cadeia com prevHash e valida chainValid', async () => {
    const app = await buildApp();
    // Duas mudanças para encadear
    const r1 = await app.inject({
      method: 'POST',
      url: '/internal/deviation-thresholds',
      headers: { 'x-actor': 'chain-a' },
      payload: { skin: { positive: 0.152 }, reason: 'primeiro ajuste chain' }
    });
    expect(r1.statusCode).toBe(200);
    // evitar rate limit alterando actor
    const r2 = await app.inject({
      method: 'POST',
      url: '/internal/deviation-thresholds',
      headers: { 'x-actor': 'chain-b' },
      payload: { rarity: { positive: 0.201 }, reason: 'segundo ajuste chain' }
    });
    expect(r2.statusCode).toBe(200);

    const verify = await app.inject({ method: 'GET', url: '/internal/deviation-thresholds/verify?limit=5' });
    expect(verify.statusCode).toBe(200);
    const body = verify.json();
    expect(body.chainValid).toBe(true);
    const chainItems = body.items.filter((it: any) => it.actor && it.actor.startsWith('chain-'));
    expect(chainItems.length).toBeGreaterThanOrEqual(2);
    const second = chainItems[0]; // mais recente
    if (second.prevHash) {
      const prev = chainItems.find((it: any) => it.hash === second.prevHash);
      expect(prev).toBeTruthy();
      expect(second.prevMatch).toBe(true);
    }
  });
});
