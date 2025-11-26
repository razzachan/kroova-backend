import { describe, it, expect } from 'vitest';
import { buildApp } from '../../src/app';

describe('GET /internal/audit-dashboard', () => {
  it('retorna estrutura consolidada com chaves principais', async () => {
    const app = await buildApp();
    // gerar alguns snapshots e alterações para enriquecer dados
    await app.inject({ method: 'POST', url: '/internal/deviation-thresholds', payload: { skin: { positive: 0.16 }, reason: 'ajuste inicial' } });
    await app.inject({ method: 'POST', url: '/internal/deviation-thresholds', payload: { rarity: { positive: 0.21 }, reason: 'ajuste raridade' } });
    await app.inject({ method: 'POST', url: '/internal/distribution-snapshot/save' });
    const res = await app.inject({ method: 'GET', url: '/internal/audit-dashboard?historyLimit=5&snapshotsLimit=2' });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.thresholds).toBeDefined();
    expect(body.thresholdHistory).toBeInstanceOf(Array);
    expect(body.thresholdVerification).toBeDefined();
    expect(body.currentDistribution).toBeDefined();
    expect(body.snapshots).toBeDefined();
  });
});
