import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Lightweight cache key constants (avoid TS import resolution at runtime)
const CACHE_KEYS = { ED01_CARDS: 'cards:ed01:all' };
async function cacheDel(_key) { /* no-op for seed script */ }

dotenv.config();

const ROOT = path.resolve('c:/Kroova');
const SOURCE_MD = path.join(ROOT, 'ED01_250_CARDS_GENERATED.md');
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const DRY_RUN = process.argv.includes('--dry');

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  if (DRY_RUN) {
    console.warn('[dry-run] Missing SUPABASE_URL/SERVICE_KEY: skipping writes');
  } else {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env');
    process.exit(1);
  }
}

const supabase = (!DRY_RUN && SUPABASE_URL && SUPABASE_SERVICE_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  : null;

function safeNumber(raw) {
  if (raw === undefined) return 0;
  const n = Number(String(raw).replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

function deriveEffect(score) {
  if (score >= 96) return 'god';
  if (score >= 86) return 'legend';
  if (score >= 61) return 'high';
  if (score >= 31) return 'medium';
  return 'low';
}

function buildHash(name, rarity) {
  return crypto.createHash('sha1').update(`${name}:${rarity}`).digest('hex').slice(0, 12);
}

function parseMarkdown() {
  if (!fs.existsSync(SOURCE_MD)) throw new Error('Source markdown not found');
  const raw = fs.readFileSync(SOURCE_MD, 'utf8');
  const lines = raw.split(/\r?\n/);
  const rows = [];
  for (const line of lines) {
    const match = line.match(/^(\d+)\.\s(.+)/);
    if (!match) continue;
    const payload = match[2].trim();
    const parts = payload.split('|');
    if (parts.length < 8) continue;
    const [nameRaw, rarityRaw, rarityIcon, archetypeRaw, trendRaw, valueRaw, descriptionRaw, frameRaw] = parts;
    const name = nameRaw.trim();
    const rarity_value = safeNumber(rarityRaw);
    const rarity_icon = rarityIcon.trim();
    const archetype = archetypeRaw.trim();
    const trend = safeNumber(trendRaw);
    const value_brl = safeNumber(valueRaw);
    const description = descriptionRaw.trim();
    const frame = frameRaw.trim();
    const effect = deriveEffect(rarity_value);
    const contrast = rarity_value - trend;
    const hash = buildHash(name, rarity_value);
    rows.push({ name, rarity_value, rarity_icon, archetype, trend, value_brl, description, frame, effect, contrast, hash });
  }
  return rows;
}

function buildDisplayId(index) {
  return `KRV-${String(index + 1).padStart(3, '0')}`;
}

function validate(rows) {
  const dist = rows.reduce((acc, r) => { acc[r.rarity_icon] = (acc[r.rarity_icon] || 0) + 1; return acc; }, {});
  const nameViol = rows.filter(r => r.name.length > 11).length;
  const descViol = rows.filter(r => r.description.length > 130).length;
  const hashes = new Set();
  const duplicate = [];
  for (const r of rows) { if (hashes.has(r.hash)) duplicate.push(r.hash); hashes.add(r.hash); }
  return { dist, nameViol, descViol, duplicate };
}

function mapRow(r, globalIndex) {
  return {
    display_id: buildDisplayId(globalIndex),
    name: r.name,
    description: r.description,
    rarity: r.rarity_icon,
    archetype: r.archetype,
    base_liquidity_brl: r.value_brl,
    base_liquidity_crypto: null,
    edition_id: 'ED01',
    image_url: null,
    metadata: {
      rarity_value: r.rarity_value,
      trend: r.trend,
      frame: r.frame,
      effect: r.effect,
      contrast: r.contrast,
      hash: r.hash
    }
  };
}

async function upsertCards(rows) {
  console.log('Seeding', rows.length, 'cards into cards_base...');
  if (DRY_RUN) {
    console.log('[dry-run] Skipping Supabase writes. Showing first 3 mapped rows:');
    const preview = rows.slice(0, 3).map((r, i) => mapRow(r, i));
    console.dir(preview, { depth: null });
    return;
  }
  const BATCH_SIZE = 50;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const slice = rows.slice(i, i + BATCH_SIZE).map((r, idx) => mapRow(r, i + idx));
    const { error } = await supabase.from('cards_base').upsert(slice, { onConflict: 'display_id' });
    if (error) {
      console.error('Upsert error batch starting at', i, error);
      process.exit(1);
    }
    console.log(`Batch ${i / BATCH_SIZE + 1} inserted: ${slice.length} cards`);
  }
}

async function main() {
  try {
    const rows = parseMarkdown();
    if (rows.length === 0) {
      console.error('No rows parsed');
      process.exit(1);
    }
    if (rows.length !== 250) {
      console.warn('Expected 250 rows, got', rows.length);
    }
    const stats = validate(rows);
    console.log('Distribution:', stats.dist);
    console.log('Name violations (>11):', stats.nameViol);
    console.log('Description violations (>130):', stats.descViol);
    console.log('Duplicate hashes:', stats.duplicate.length, stats.duplicate.slice(0,5));
    if (stats.nameViol || stats.descViol || stats.duplicate.length) {
      console.warn('Validation issues detected. Abort before writing.');
      if (!DRY_RUN) process.exit(1);
    }
    await upsertCards(rows);
    if (!DRY_RUN) {
      try { await cacheDel(CACHE_KEYS.ED01_CARDS); } catch {}
    }
    console.log(DRY_RUN ? 'Dry-run completed.' : 'Seed completed successfully.');
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

main();