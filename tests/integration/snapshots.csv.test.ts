import { describe, it, expect } from 'vitest';
import { buildApp } from '../../src/app';

// Integração leve do endpoint CSV
describe('GET /internal/distribution-snapshots.csv', () => {
  it('retorna CSV com headers de raridade e skins após alguns snapshots salvos', async () => {
    const app = await buildApp();
    // gerar alguns snapshots persistindo (em test cai em memória)
    for (let i = 0; i < 3; i++) {
      await app.inject({ method: 'POST', url: '/internal/distribution-snapshot/save' });
    }
    const res = await app.inject({ method: 'GET', url: '/internal/distribution-snapshots.csv?limit=3' });
    expect(res.statusCode).toBe(200);
    const body = res.body.trim();
    const lines = body.split('\n');
    expect(lines.length).toBeGreaterThan(1); // header + pelo menos 1 linha
    const header = lines[0];
    expect(header).toContain('timestamp');
    expect(header).toContain('rarity_trash_count');
    expect(header).toContain('skin_default_count');
  });
});
