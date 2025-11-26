import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const ROOT = path.resolve('c:/Kroova');
const SOURCE_MD = path.join(ROOT, 'ED01_250_CARDS_GENERATED.md');
const OUT_DIR = path.join(ROOT, 'data');
const JSON_OUT = path.join(OUT_DIR, 'ed01_cards.json');
const CSV_OUT = path.join(OUT_DIR, 'ed01_cards.csv');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR);

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
  if (!fs.existsSync(SOURCE_MD)) throw new Error('Source missing');
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
    const currency = 'BRL';
    const value = safeNumber(valueRaw);
    const description = descriptionRaw.trim();
    const frame = frameRaw.trim();
    const effect = deriveEffect(rarity_value);
    const contrast = rarity_value - trend;
    const hash = buildHash(name, rarity_value);
    const art = 'pending';
    rows.push({
      effect,
      contrast,
      rarity_value,
      rarity_icon,
      hash,
      name,
      trend,
      archetype,
      currency,
      value,
      description,
      frame,
      art
    });
  }
  return rows;
}

function exportJSON(rows) {
  const meta = {
    edition: 'ED01',
    theme: 'Colapso da Interface',
    total: rows.length,
    generated_at: new Date().toISOString()
  };
  fs.writeFileSync(JSON_OUT, JSON.stringify({ meta, cards: rows }, null, 2), 'utf8');
  console.log('JSON written:', JSON_OUT);
}

function exportCSV(rows) {
  const header = ['effect','contrast','rarity_value','rarity_icon','hash','name','trend','archetype','currency','value','description','frame','art'];
  const lines = [header.join(',')];
  for (const r of rows) {
    const esc = v => '"' + String(v).replace(/"/g,'""') + '"';
    lines.push(header.map(k => esc(r[k])).join(','));
  }
  fs.writeFileSync(CSV_OUT, lines.join('\n'), 'utf8');
  console.log('CSV written:', CSV_OUT);
}

function summarize(rows) {
  const rarity = rows.reduce((acc,r)=>{acc[r.rarity_icon]=(acc[r.rarity_icon]||0)+1;return acc;},{});
  console.log('Summary rarity:', rarity);
  const violations = {
    nameTooLong: rows.filter(r=>r.name.length>11).length,
    descTooLong: rows.filter(r=>r.description.length>130).length
  };
  console.log('Length violations:', violations);
}

function main() {
  const rows = parseMarkdown();
  if (rows.length !== 250) console.warn('Expected 250 rows, got', rows.length);
  exportJSON(rows);
  exportCSV(rows);
  summarize(rows);
}

main();
