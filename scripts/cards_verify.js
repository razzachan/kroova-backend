import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const ROOT = path.resolve('c:/Kroova');
const SOURCE_MD = path.join(ROOT, 'ED01_250_CARDS_GENERATED.md');

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
  if (!fs.existsSync(SOURCE_MD)) throw new Error('Source MD not found');
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

async function main() {
  const rows = parseMarkdown();
  if (rows.length !== 250) {
    console.warn('Expected 250 rows, got', rows.length);
  }
  let nameViol = 0;
  let descViol = 0;
  const hashes = new Set();
  const duplicates = [];
  for (const r of rows) {
    if (r.name.length > 11) nameViol++;
    if (r.description.length > 130) descViol++;
    if (hashes.has(r.hash)) duplicates.push(r.hash);
    hashes.add(r.hash);
  }
  console.log('Total cards:', rows.length);
  console.log('Name length violations:', nameViol);
  console.log('Description length violations:', descViol);
  console.log('Duplicate hashes:', duplicates.length, duplicates.slice(0, 10));
  const rarityDist = rows.reduce((acc, r) => { acc[r.rarity_icon] = (acc[r.rarity_icon] || 0) + 1; return acc; }, {});
  console.log('Rarity distribution:', rarityDist);
  if (!nameViol && !descViol && duplicates.length === 0) {
    console.log('Integrity OK ✅');
  } else {
    console.log('Integrity issues detected ❌');
  }
}

main();