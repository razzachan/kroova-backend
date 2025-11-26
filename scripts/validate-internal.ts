// Force test mode BEFORE imports that read env
process.env.NODE_ENV = 'test';
import { buildApp } from '../src/app.js';
import { env } from '../src/config/env.js';
import jwt from 'jsonwebtoken';

async function run() {
  const app = await buildApp();
  const results: any = { steps: [] };
  const push = (name: string, ok: boolean, detail?: any) => results.steps.push({ name, ok, detail });

  // 1) Health
  try {
    const r = await app.inject({ method: 'GET', url: '/health' });
    push('health', r.statusCode === 200, r.json());
  } catch (e: any) {
    push('health', false, e.message);
  }

  const email = 'internal_test@krouva.com';
  const password = 'senha123';
  let accessToken: string | null = null;
  let userId: string | null = null;

  // 2) Register or login fallback
  try {
    const reg = await app.inject({ method: 'POST', url: '/api/v1/auth/register', payload: { email, password, name: 'Usuario Interno' } });
    const body = reg.json();
    if (reg.statusCode === 200) {
      userId = body.data.user.id;
      // Manual JWT to avoid secret mismatch due to early imports
      accessToken = jwt.sign({ sub: userId, email, role: 'user' }, env.jwtSecret, { expiresIn: '15m' });
      push('register', true, { userId, manualToken: true });
    } else {
      throw new Error('register failed');
    }
  } catch {
    const login = await app.inject({ method: 'POST', url: '/api/v1/auth/login', payload: { email, password } });
    const body = login.json();
    if (login.statusCode === 200) {
      userId = body.data.user.id;
      accessToken = jwt.sign({ sub: userId, email, role: 'user' }, env.jwtSecret, { expiresIn: '15m' });
      push('login', true, { userId, manualToken: true });
    } else {
      push('login', false, body);
    }
  }

  if (!accessToken || !userId) {
    console.log(JSON.stringify(results, null, 2));
    process.exit(1);
  }
  const authHeader = { Authorization: `Bearer ${accessToken}` };

  // 3) Set CPF (needed for recycle & marketplace) using a known valid CPF pattern
  try {
    const cpfRes = await app.inject({ method: 'POST', url: '/api/v1/users/cpf', headers: authHeader, payload: { cpf: '52998224725' } });
    push('setCpf', cpfRes.statusCode === 200, cpfRes.json());
  } catch (e: any) {
    push('setCpf', false, e.message);
  }

  // 4) Dev deposit
  try {
    const dep = await app.inject({ method: 'POST', url: '/api/v1/wallet/deposit/dev', headers: authHeader, payload: { amount_brl: 500 } });
    push('depositDev', dep.statusCode === 200, dep.json());
  } catch (e: any) {
    push('depositDev', false, e.message);
  }

  // 5) List boosters
  let boosterTypeId: string | null = null;
  try {
    const boosters = await app.inject({ method: 'GET', url: '/api/v1/boosters' });
    const body = boosters.json();
    boosterTypeId = body.data?.[0]?.id || null;
    push('listBoosters', boosters.statusCode === 200 && !!boosterTypeId, { boosterTypeId });
  } catch (e: any) {
    push('listBoosters', false, e.message);
  }

  // 6) Purchase booster
  let openingId: string | null = null;
  if (boosterTypeId) {
    try {
      const purchase = await app.inject({ method: 'POST', url: '/api/v1/boosters/purchase', headers: authHeader, payload: { booster_type_id: boosterTypeId, quantity: 1, currency: 'brl' } });
      const body = purchase.json();
      openingId = body.data?.boosters?.[0]?.id || null;
      push('purchaseBooster', purchase.statusCode === 200 && !!openingId, { openingId });
    } catch (e: any) {
      push('purchaseBooster', false, e.message);
    }
  }

  // 7) Open booster
  let cardInstanceId: string | null = null;
  if (openingId) {
    try {
      const open = await app.inject({ method: 'POST', url: '/api/v1/boosters/open', headers: authHeader, payload: { booster_opening_id: openingId } });
      const body = open.json();
      cardInstanceId = body.data?.cards?.[0]?.id || null;
      push('openBooster', open.statusCode === 200 && !!cardInstanceId, { cardInstanceId });
    } catch (e: any) {
      push('openBooster', false, e.message);
    }
  }

  // 8) Recycle card
  if (cardInstanceId) {
    try {
      const recycle = await app.inject({ method: 'POST', url: `/api/v1/cards/${cardInstanceId}/recycle`, headers: authHeader });
      push('recycleCard', recycle.statusCode === 200, recycle.json());
    } catch (e: any) {
      push('recycleCard', false, e.message);
    }
  }

  // 9) Marketplace listing (need another card, so skip if only one left)
  let secondCardId: string | null = null;
  try {
    const inv = await app.inject({ method: 'GET', url: '/api/v1/inventory', headers: authHeader });
    const body = inv.json();
    const cards = body.data?.cards || [];
    secondCardId = cards.length > 0 ? cards[0].id : null;
    push('inventory', inv.statusCode === 200, { count: cards.length });
  } catch (e: any) {
    push('inventory', false, e.message);
  }

  if (secondCardId) {
    try {
      const listing = await app.inject({ method: 'POST', url: '/api/v1/market/listings', headers: authHeader, payload: { card_instance_id: secondCardId, price_brl: 1.5 } });
      push('marketListing', listing.statusCode === 200, listing.json());
    } catch (e: any) {
      push('marketListing', false, e.message);
    }
  }

  // 10) Final wallet
  try {
    const wallet = await app.inject({ method: 'GET', url: '/api/v1/wallet', headers: authHeader });
    push('walletFinal', wallet.statusCode === 200, wallet.json());
  } catch (e: any) {
    push('walletFinal', false, e.message);
  }

  console.log(JSON.stringify(results, null, 2));
  await app.close();
}

run().catch(e => {
  console.error('validator fatal', e);
  process.exit(1);
});
