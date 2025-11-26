// FX Service (placeholder) – converte valores cripto para BRL
// Estratégia: usa ENV para fallback e cache in-memory com TTL curto.

interface FxRateEntry {
  pair: string; // e.g. MATIC_BRL
  rate: number; // BRL por unidade
  fetchedAt: number;
}

const CACHE: Record<string, FxRateEntry> = {};
const DEFAULT_TTL_MS = 60_000; // 1 min

function now() { return Date.now(); }

function envFallback(pair: string): number {
  // Ex: FX_MATIC_BRL=3.25
  const key = 'FX_' + pair.toUpperCase();
  const raw = process.env[key];
  if (!raw) {
    // default placeholder MATIC rate
    if (pair.toUpperCase() === 'MATIC_BRL') return 3.20;
    return 1; // neutral fallback
  }
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

export async function getFxRate(pair: string, opts?: { ttlMs?: number }): Promise<number> {
  const ttl = opts?.ttlMs ?? DEFAULT_TTL_MS;
  const upper = pair.toUpperCase();
  const cached = CACHE[upper];
  if (cached && now() - cached.fetchedAt < ttl) return cached.rate;
  // Futuro: chamar API externa (CoinGecko / Exchange). Aqui só fallback ENV.
  const rate = envFallback(upper);
  CACHE[upper] = { pair: upper, rate, fetchedAt: now() };
  return rate;
}

export async function convertCryptoToBrl(pair: string, amountCrypto: number): Promise<number> {
  if (amountCrypto <= 0) return 0;
  const rate = await getFxRate(pair);
  return amountCrypto * rate;
}

export function clearFxCache() { Object.keys(CACHE).forEach(k => delete CACHE[k]); }
