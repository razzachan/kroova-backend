import { describe, it, expect } from 'vitest';
import { buildApp } from '../../src/app';

// Testa comportamento de cache do audit dashboard

describe('audit-dashboard cache', () => {
  it('retorna cached=false na primeira e cached=true na segunda dentro do TTL', async () => {
    const app = await buildApp();
    const first = await app.inject({ method: 'GET', url: '/internal/audit-dashboard?historyLimit=2&snapshotsLimit=1' });
    expect(first.statusCode).toBe(200);
    const b1 = first.json();
    expect(b1.cached).toBe(false);
    expect(typeof b1.generationMs).toBe('number');

    const second = await app.inject({ method: 'GET', url: '/internal/audit-dashboard?historyLimit=2&snapshotsLimit=1' });
    const b2 = second.json();
    expect(b2.cached).toBe(true);
    expect(b2.generationMs).toBe(b1.generationMs); // mesma geração usada
  });
});
