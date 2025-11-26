import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import XLSX from 'xlsx';

// Configuration
const ROOT = path.resolve('c:/Kroova');
const SOURCE_MD = path.join(ROOT, 'ED01_250_CARDS_GENERATED.md');
const OUTPUT_XLSX = path.join(ROOT, 'kroova.xlsx');

const HEADER = [
  '#effect',
  '#contrast',
  '#rarity_value',
  '#rarity_icon',
  '#hash',
  '#name',
  '#trend',
  '#archetype',
  '#currency',
  '#value',
  '#description',
  '#frame',
  '#art'
];

function deriveEffect(score) {
  if (score >= 96) return 'god';
  if (score >= 86) return 'legend';
  if (score >= 61) return 'high';
  if (score >= 31) return 'medium';
  return 'low';
}

function safeNumber(raw) {
  if (raw === undefined) return 0;
  const n = Number(String(raw).replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

function buildHash(name, rarity) {
  return crypto.createHash('sha1').update(`${name}:${rarity}`).digest('hex').slice(0, 12);
}

function parseMarkdown() {
  if (!fs.existsSync(SOURCE_MD)) {
    console.error('Source markdown not found:', SOURCE_MD);
    process.exit(1);
  }
  const raw = fs.readFileSync(SOURCE_MD, 'utf8');
  const lines = raw.split(/\r?\n/);
  const rows = [];
  for (const line of lines) {
    const match = line.match(/^(\d+)\.\s(.+)/);
    if (!match) continue;
    const payload = match[2].trim();
    const parts = payload.split('|');
    // Expect: name | rarity_value | rarity_icon | archetype | trendScore | value | description | frame
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
    const contrast = rarity_value - trend; // simple delta metric
    const hash = buildHash(name, rarity_value);
    const art = 'pending';
    // Validation (soft): length checks
    if (name.length > 11) {
      // We keep it but warn
      console.warn(`Name exceeds 11 chars: ${name}`);
    }
    if (description.length > 130) {
      console.warn(`Description exceeds 130 chars: ${name}`);
    }
    rows.push({ effect, contrast, rarity_value, rarity_icon, hash, name, trend, archetype, currency, value, description, frame, art });
  }
  return rows;
}

function toSheetData(rows) {
  const data = [HEADER];
  for (const r of rows) {
    data.push([
      r.effect,
      r.contrast,
      r.rarity_value,
      r.rarity_icon,
      r.hash,
      r.name,
      r.trend,
      r.archetype,
      r.currency,
      r.value,
      r.description,
      r.frame,
      r.art
    ]);
  }
  return data;
}

function backupIfExists() {
  if (fs.existsSync(OUTPUT_XLSX)) {
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backup = path.join(ROOT, `kroova_backup_${stamp}.xlsx`);
    fs.renameSync(OUTPUT_XLSX, backup);
    console.log('Backup created:', backup);
  }
}

function main() {
  console.log('Parsing markdown cards...');
  const rows = parseMarkdown();
  if (rows.length === 0) {
    console.error('No rows parsed. Abort.');
    process.exit(1);
  }
  console.log(`Parsed ${rows.length} card rows.`);
  backupIfExists();
  const wb = XLSX.utils.book_new();
  const sheetData = toSheetData(rows);
  const ws = XLSX.utils.aoa_to_sheet(sheetData);
  XLSX.utils.book_append_sheet(wb, ws, 'ED01');
  XLSX.writeFile(wb, OUTPUT_XLSX);
  console.log('Workbook written:', OUTPUT_XLSX);
  // Quick summary
  const rarityBuckets = rows.reduce((acc, r) => { acc[r.rarity_icon] = (acc[r.rarity_icon] || 0) + 1; return acc; }, {});
  console.log('Rarity distribution:', rarityBuckets);
  const violations = {
    nameTooLong: rows.filter(r => r.name.length > 11).length,
    descTooLong: rows.filter(r => r.description.length > 130).length
  };
  console.log('Length violations:', violations);
  if (violations.nameTooLong === 0 && violations.descTooLong === 0) {
    console.log('All length constraints satisfied.');
  }
}

main();
