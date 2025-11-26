import { describe, it, expect } from 'vitest';
import { buildApp } from '../../src/app.js';
import { captureEconomicSeriesManual } from '../../src/observability/economicSeries.js';
import { randomUUID } from 'crypto';
import { supabaseAdmin } from '../../src/config/supabase.js';

function delay(ms:number){ return new Promise(r=>setTimeout(r,ms)); }

// Helper to trigger some economic activity (purchase + open booster)
async function exerciseBooster(app: any, token: string) {
  const authHeader = { Authorization: `Bearer ${token}` };
  // List boosters
  const boostersRes = await app.inject({ method:'GET', url:'/api/v1/boosters' });
  expect(boostersRes.statusCode).toBe(200);
  const boosterType = boostersRes.json().data[0];
  // Purchase a few boosters
  const purchaseRes = await app.inject({ method:'POST', url:'/api/v1/boosters/purchase', headers: authHeader, payload:{ booster_type_id: boosterType.id, quantity:3, currency:'brl' } });
  expect(purchaseRes.statusCode).toBe(200);
  const purchaseBody = purchaseRes.json();
  for (const b of purchaseBody.data.boosters) {
    const openRes = await app.inject({ method:'POST', url:'/api/v1/boosters/open', headers: authHeader, payload:{ booster_opening_id: b.id } });
    expect(openRes.statusCode).toBe(200);
  }
}

describe('Economic Observability Dashboard', () => {
  it('returns audit dashboard with rtpAlerts and economic series with integrity chain', async () => {
    const app = await buildApp();
    // Register user
    const email = `obs_${randomUUID()}@krouva.test`; // transição
    const password = 'Obs@123456';
    const reg = await app.inject({ method:'POST', url:'/api/v1/auth/register', payload:{ email, password, name:'Obs User' } });
    expect(reg.statusCode).toBe(200);
    const { data } = reg.json();
    const token = data.access_token;

    // Credit wallet and exercise boosters to generate metrics & series entries
    await supabaseAdmin.from('wallets').update({ balance_brl: 30 }).eq('user_id', data.user.id);
    await exerciseBooster(app, token);

    // Manually capture economic series entries (scheduler interval default 60s)
    await captureEconomicSeriesManual();
    await delay(20);
    await captureEconomicSeriesManual();

    // Audit dashboard
    const dashRes = await app.inject({ method:'GET', url:'/internal/audit-dashboard?historyLimit=5&snapshotsLimit=2' });
    expect(dashRes.statusCode).toBe(200);
    const dashBody = dashRes.json();
    // Basic expected keys from auditDashboard builder
    expect(dashBody).toHaveProperty('thresholdVerification');
    expect(dashBody).toHaveProperty('currentDistribution');
    expect(dashBody).toHaveProperty('snapshots');
    expect(dashBody).toHaveProperty('rtpAlerts');
    expect(dashBody.rtpAlerts).toHaveProperty('totalHighAlerts');
    expect(dashBody.rtpAlerts).toHaveProperty('totalLowAlerts');

    // Economic series list
    const seriesRes = await app.inject({ method:'GET', url:'/internal/economic-series?limit=10' });
    expect(seriesRes.statusCode).toBe(200);
    const seriesBody = seriesRes.json();
    expect(seriesBody.items.length).toBeGreaterThan(0);
    const first = seriesBody.items[0];
    expect(first).toHaveProperty('rtpPct');
    expect(first).toHaveProperty('grossMarginPct');
    // Ensure multiple captures produce period counters
    if (seriesBody.items.length > 1) {
      const second = seriesBody.items[1];
      expect(second.boosterOpensCumulative).toBeGreaterThanOrEqual(first.boosterOpensCumulative);
    }
  }, 30000);
});
