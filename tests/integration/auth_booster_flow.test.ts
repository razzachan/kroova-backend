import { describe, it, expect } from 'vitest';
import { buildApp } from '../../src/app.js';
import { randomUUID } from 'crypto';
import { supabaseAdmin } from '../../src/config/supabase.js';

// Helper to wait small intervals (e.g., for DB consistency)
function delay(ms: number) { return new Promise(res => setTimeout(res, ms)); }


describe('Integration: Auth + Booster Flow', () => {
  it('register -> login -> refresh -> credit wallet -> purchase booster -> open booster', async () => {
    const app = await buildApp();
    const email = `int_${randomUUID()}@krouva.test`; // transição
    const password = 'Test@123456';

    // 1. Register
    const registerRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: { email, password, name: 'User Int' },
    });
    console.log('Register status', registerRes.statusCode);
    if (registerRes.statusCode !== 200) {
      // debug output
      console.error('Register response body:', registerRes.body);
    }
    expect(registerRes.statusCode).toBe(200);
    const regBody = registerRes.json();
    expect(regBody.ok).toBe(true);
    const { user, access_token, refresh_token } = regBody.data;
    expect(user.id).toBeTruthy();
    expect(access_token).toBeTruthy();
    expect(refresh_token).toBeTruthy();

    // 2. Login
    const loginRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: { email, password },
    });
    console.log('Login status', loginRes.statusCode);
    expect(loginRes.statusCode).toBe(200);
    const loginBody = loginRes.json();
    expect(loginBody.data.access_token).toBeTruthy();
    expect(loginBody.data.refresh_token).toBeTruthy();
    const refreshTokenForRotation = loginBody.data.refresh_token;

    // 3. Refresh
    const refreshRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/refresh',
      payload: { refresh_token: refreshTokenForRotation },
    });
    console.log('Refresh status', refreshRes.statusCode);
    expect(refreshRes.statusCode).toBe(200);
    const refreshBody = refreshRes.json();
    expect(refreshBody.data.access_token).toBeTruthy();
    expect(refreshBody.data.refresh_token).toBeTruthy();

    const authHeader = `Bearer ${loginBody.data.access_token}`;

    // 4. Credit wallet via admin client (bypass missing endpoint)
    await supabaseAdmin.from('wallets').update({ balance_brl: 50 }).eq('user_id', user.id);

    // 5. List boosters
    const boostersRes = await app.inject({ method: 'GET', url: '/api/v1/boosters' });
    console.log('Boosters list status', boostersRes.statusCode);
    expect(boostersRes.statusCode).toBe(200);
    const boostersBody = boostersRes.json();
    const boosterType = boostersBody.data.find((b: any) => b.price_brl && b.price_brl <= 50);
    expect(boosterType).toBeTruthy();

    // 6. Purchase booster
    const purchaseRes = await app.inject({
      method: 'POST',
      url: '/api/v1/boosters/purchase',
      headers: { Authorization: authHeader },
      payload: { booster_type_id: boosterType.id, quantity: 1, currency: 'brl' },
    });
    console.log('Purchase status', purchaseRes.statusCode);
    if (purchaseRes.statusCode !== 200) {
      console.error('Purchase response body:', purchaseRes.body);
    }
    expect(purchaseRes.statusCode).toBe(200);
    const purchaseBody = purchaseRes.json();
    expect(purchaseBody.data.boosters.length).toBeGreaterThan(0);
    const openingId = purchaseBody.data.boosters[0].id;
    expect(openingId).toBeTruthy();

    // Wait briefly for DB write consistency
    await delay(100);

    // 7. Open booster
    const openRes = await app.inject({
      method: 'POST',
      url: '/api/v1/boosters/open',
      headers: { Authorization: authHeader },
      payload: { booster_opening_id: openingId },
    });
    console.log('Open status', openRes.statusCode);
    expect(openRes.statusCode).toBe(200);
    const openBody = openRes.json();
    expect(openBody.ok).toBe(true);

    // 8. Metrics endpoint (Prometheus format)
    const metricsRes = await app.inject({ method: 'GET', url: '/internal/metrics' });
    expect(metricsRes.statusCode).toBe(200);
    const text = metricsRes.body as string;
    expect(text).toMatch(/http_requests_total/);
    expect(text).toMatch(/booster_purchase_total/);
    expect(text).toMatch(/booster_open_total/);
    // New rarity counters should exist (even if zero early)
    expect(text).toMatch(/card_rarity_trash_total/);
    expect(text).toMatch(/card_rarity_meme_total/);
    expect(text).toMatch(/card_rarity_viral_total/);
    expect(text).toMatch(/card_rarity_legendary_total/);
    expect(text).toMatch(/card_rarity_godmode_total/);
    // Jackpot counters (may be zero if no godmode hit)
    expect(text).toMatch(/jackpot_hits_total/);
    expect(text).toMatch(/jackpot_payout_brl_total/);

    // No direct PG connection used
  }, 30000);
});
