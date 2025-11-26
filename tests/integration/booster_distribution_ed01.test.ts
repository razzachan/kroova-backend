import { describe, it, expect } from 'vitest';
import { buildApp } from '../../src/app.js';
import fs from 'fs';
import path from 'path';
import { supabaseAdmin } from '../../src/config/supabase.js';
import { randomUUID } from 'crypto';

// Simple parser replicating seed logic (kept internal to test for isolation)
function parseCards() {
  const SOURCE_MD = path.join(path.resolve('c:/Kroova'), 'ED01_250_CARDS_GENERATED.md');
  const raw = fs.readFileSync(SOURCE_MD, 'utf8');
  const lines = raw.split(/\r?\n/);
  const rows: any[] = [];
  for (const line of lines) {
    const match = line.match(/^(\d+)\.\s(.+)/);
    if (!match) continue;
    const payload = match[2].trim();
    const parts = payload.split('|');
    if (parts.length < 8) continue;
    const [nameRaw, rarityValueRaw, rarityIcon, archetypeRaw, trendRaw, valueRaw, descriptionRaw, frameRaw] = parts;
    rows.push({
      name: nameRaw.trim(),
      rarity_value: Number(rarityValueRaw.replace(/[^0-9.]/g,'')) || 0,
      rarity: rarityIcon.trim(),
      archetype: archetypeRaw.trim(),
      trend: Number(trendRaw.replace(/[^0-9.]/g,'')) || 0,
      value_brl: Number(valueRaw.replace(/[^0-9.]/g,'')) || 0,
      description: descriptionRaw.trim(),
      frame: frameRaw.trim(),
    });
  }
  return rows;
}

function buildDisplayId(index: number) {
  return `KRV-${String(index + 1).padStart(3, '0')}`;
}

async function seedInMemory(rows: any[]) {
  // Insert minimal subset needed: id, rarity, edition_id
  const editionId = 'ED01';
  const mapped = rows.map((r, idx) => ({
    id: randomUUID(),
    display_id: buildDisplayId(idx),
    name: r.name,
    rarity: r.rarity,
    edition_id: editionId,
    base_liquidity_brl: r.value_brl,
    metadata: { rarity_value: r.rarity_value }
  }));
  await supabaseAdmin.from('cards_base').insert(mapped);
  return mapped;
}

describe('Booster distribution with real ED01 cards', () => {
  it('approximates target rarity distribution over many openings', async () => {
    const app = await buildApp();
    const cards = parseCards();
    expect(cards.length).toBe(250);
    await seedInMemory(cards);

    // Register test user
    const email = `dist_${randomUUID()}@krouva.test`; // transição
    const password = 'Dist@123456';
    const regRes = await app.inject({ method: 'POST', url: '/api/v1/auth/register', payload: { email, password, name: 'Dist User' } });
    expect(regRes.statusCode).toBe(200);
    const { data: regData } = regRes.json();
    const token = regData.access_token;
    const authHeader = { Authorization: `Bearer ${token}` };

    // Credit wallet sufficiently
    await supabaseAdmin.from('wallets').update({ balance_brl: 500 }).eq('user_id', regData.user.id);

    // Fetch booster type (test env returns fabricated list)
    const boosterRes = await app.inject({ method: 'GET', url: '/api/v1/boosters' });
    expect(boosterRes.statusCode).toBe(200);
    const boosterType = boosterRes.json().data[0];
    expect(boosterType).toBeTruthy();

    const targetDist = boosterType.rarity_distribution; // { trash: 60, meme:25, viral:10, legendary:4, godmode:1 }

    const purchaseQtyA = 100; // schema max per request
    const purchaseA = await app.inject({ method: 'POST', url: '/api/v1/boosters/purchase', headers: authHeader, payload: { booster_type_id: boosterType.id, quantity: purchaseQtyA, currency: 'brl' } });
    if (purchaseA.statusCode !== 200) {
      console.error('Purchase A response body:', purchaseA.body);
    }
    expect(purchaseA.statusCode).toBe(200);
    const purchaseQtyB = 100;
    const purchaseB = await app.inject({ method: 'POST', url: '/api/v1/boosters/purchase', headers: authHeader, payload: { booster_type_id: boosterType.id, quantity: purchaseQtyB, currency: 'brl' } });
    if (purchaseB.statusCode !== 200) {
      console.error('Purchase B response body:', purchaseB.body);
    }
    expect(purchaseB.statusCode).toBe(200);
    const allBoosters = [...purchaseA.json().data.boosters, ...purchaseB.json().data.boosters];

    const rarityCounts: Record<string, number> = { trash:0, meme:0, viral:0, legendary:0, godmode:0 };

    // Open all boosters sequentially
    for (const b of allBoosters) {
      const openRes = await app.inject({ method: 'POST', url: '/api/v1/boosters/open', headers: authHeader, payload: { booster_opening_id: b.id } });
      expect(openRes.statusCode).toBe(200);
      const openBody = openRes.json();
      for (const card of openBody.data.cards) {
        // card has base_id pattern base-<rarity>-<i> in test open logic
        const baseId = card.base_id as string;
        const rarity = baseId.split('-')[1];
        if (rarityCounts[rarity] !== undefined) rarityCounts[rarity]++;
      }
    }

    const totalCards = Object.values(rarityCounts).reduce((a,b)=>a+b,0);
    expect(totalCards).toBeGreaterThan(900); // sanity

    const observedPct: Record<string, number> = {}; 
    for (const [r,count] of Object.entries(rarityCounts)) {
      observedPct[r] = (count/totalCards)*100;
    }

    // Tolerances: larger pools can have tighter tolerance; rare tiers looser
    for (const [rarity, targetRaw] of Object.entries(targetDist)) {
      const target = Number(targetRaw);
      const obs = observedPct[rarity];
      if (!Number.isFinite(target)) continue;
      if (rarity === 'legendary' || rarity === 'godmode') {
        expect(rarityCounts[rarity]).toBeGreaterThan(0);
        expect(obs).toBeGreaterThan(target * 0.3);
      } else {
        expect(obs).toBeGreaterThan(target - 5);
        expect(obs).toBeLessThan(target + 5);
      }
    }
  }, 60000);
});
