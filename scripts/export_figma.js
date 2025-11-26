import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const ROOT = path.resolve('c:/Kroova');
const SOURCE_MD = path.join(ROOT, 'ED01_250_CARDS_GENERATED.md');
const OUT_DIR = path.join(ROOT, 'data');
const FIGMA_CSV = path.join(OUT_DIR, 'ed01_figma.csv');

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
    const rarity = rarityIcon.trim();
    const archetype = archetypeRaw.trim();
    const trend = safeNumber(trendRaw);
    const valor_brl = safeNumber(valueRaw);
    const description = descriptionRaw.trim();
    const frame = frameRaw.trim();
    const effect = deriveEffect(rarity_value);
    const contrast = rarity_value - trend;
    const hash = buildHash(name, rarity_value);
    rows.push({ name, rarity_value, rarity, archetype, trend, valor_brl, description, frame, effect, contrast, hash });
  }
  return rows;
}

const RARITY_COLOR = {
  trash: '#6B6B6B',
  meme: '#FF8F1F',
  viral: '#FF3EC3',
  legendary: '#6DFFB7',
  godmode: '#FFD700'
};

function exportFigma(rows) {
  const header = [
    'display_id','name','rarity','rarity_value','archetype','trend','frame','valor_brl','description','color_token','effect','contrast','hash'
  ];
  const lines = [header.join(',')];
  rows.forEach((r, i) => {
    const displayId = `KRV-${String(i + 1).padStart(3, '0')}`;
    const color = RARITY_COLOR[r.rarity] || '#FFFFFF';
    const esc = v => '"' + String(v).replace(/"/g, '""') + '"';
    lines.push([
      displayId,r.name,r.rarity,r.rarity_value,r.archetype,r.trend,r.frame,r.valor_brl,r.description,color,r.effect,r.contrast,r.hash
    ].map(esc).join(','));
  });
  fs.writeFileSync(FIGMA_CSV, lines.join('\n'), 'utf8');
  console.log('Figma CSV written:', FIGMA_CSV);
}

function main() {
  const rows = parseMarkdown();
  if (rows.length === 0) {
    console.error('No rows parsed');
    process.exit(1);
  }
  exportFigma(rows);
}

main();