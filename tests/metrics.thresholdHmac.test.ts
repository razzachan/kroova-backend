import { describe, it, expect, beforeAll } from 'vitest';
// Set env BEFORE importing buildApp (which loads env)
process.env.AUDIT_HISTORY_HMAC_SECRET = 'secret-hmac-test-suite';
import { buildApp } from '../src/app';

// Testa geração e verificação de HMAC em mudanças de thresholds

describe('threshold changes HMAC', () => {
  beforeAll(() => {
    // já definido antes do import para garantir captura
  });

  it('gera hmac e valida na verificação', async () => {
    const app = await buildApp();
    // Faz uma mudança simples
    const res = await app.inject({
      method: 'POST',
      url: '/internal/deviation-thresholds',
      headers: { 'x-actor': 'tester-hmac' },
      payload: { skin: { positive: 0.151 }, reason: 'ajuste para teste hmac' }
    });
    expect(res.statusCode).toBe(200);

    // Verifica integridade
    const verify = await app.inject({ method: 'GET', url: '/internal/deviation-thresholds/verify?limit=5' });
    expect(verify.statusCode).toBe(200);
    const body = verify.json();
    expect(body.allValid).toBe(true);
    expect(body.allHmacValid).toBe(true);
    const item = body.items.find((it: any) => it.actor === 'tester-hmac');
    expect(item).toBeTruthy();
    expect(item.hmac).toMatch(/^[a-f0-9]{64}$/);
    expect(item.hmacValid).toBe(true);
  });
});
