import { describe, it, expect } from 'vitest';
import { buildApp } from '../../src/app';

// Testa rate limit de mudanças de thresholds
// Usa actor distinto para validar bloqueio

describe('POST /internal/deviation-thresholds rate limit', () => {
  it('bloqueia segunda mudança rápida para mesmo actor', async () => {
    const app = await buildApp();
    const actor = 'tester-rate';
    const first = await app.inject({
      method: 'POST',
      url: '/internal/deviation-thresholds',
      headers: { 'x-actor': actor },
      payload: { skin: { positive: 0.16 } }
    });
    expect(first.statusCode).toBe(200);

    const second = await app.inject({
      method: 'POST',
      url: '/internal/deviation-thresholds',
      headers: { 'x-actor': actor },
      payload: { skin: { positive: 0.17 } }
    });
    // Em ambiente de teste valor padrão é 60s; segunda chamada imediata deve ser 429
    expect(second.statusCode).toBe(429);
    const body = second.json();
    expect(body.error).toBe('Rate limit threshold change');
  });

  it('permite mudança para actor diferente imediatamente', async () => {
    const app = await buildApp();
    const a1 = await app.inject({ method: 'POST', url: '/internal/deviation-thresholds', headers: { 'x-actor': 'actor-a' }, payload: { skin: { positive: 0.18 } } });
    expect(a1.statusCode).toBe(200);
    const a2 = await app.inject({ method: 'POST', url: '/internal/deviation-thresholds', headers: { 'x-actor': 'actor-b' }, payload: { skin: { positive: 0.19 } } });
    expect(a2.statusCode).toBe(200);
  });
});
