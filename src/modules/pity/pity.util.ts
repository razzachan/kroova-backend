import { EditionConfig } from '../../config/edition.js';

export interface PityCalcInput {
  baseGodmodePct: number; // porcentagem base (ex 1)
  attempts: number; // tentativas desde último godmode
  thresholds: number[]; // ordenados asc
  increments: number[]; // mesmo length
  capMultiplier: number; // multiplicador máximo
}

export interface PityCalcResult {
  boostedGodmodePct: number; // porcentagem final após incremento
  appliedIncrement: number; // incremento relativo aplicado (ex 0.25 => +25% da base)
  capped: boolean; // se atingiu cap
}

export function computePityGodmodePct(input: PityCalcInput): PityCalcResult {
  const { baseGodmodePct, attempts, thresholds, increments, capMultiplier } = input;
  if (baseGodmodePct <= 0 || thresholds.length === 0 || increments.length !== thresholds.length) {
    return { boostedGodmodePct: baseGodmodePct, appliedIncrement: 0, capped: false };
  }
  let appliedIncrement = 0;
  for (let i = 0; i < thresholds.length; i++) {
    if (attempts >= thresholds[i]) {
      appliedIncrement = increments[i];
    } else {
      break;
    }
  }
  let boosted = baseGodmodePct + baseGodmodePct * appliedIncrement;
  const cap = baseGodmodePct * capMultiplier;
  let capped = false;
  if (boosted > cap) {
    boosted = cap;
    capped = true;
  }
  // evita ultrapassar 100%
  if (boosted > 100) {
    boosted = 100;
    capped = true;
  }
  return { boostedGodmodePct: boosted, appliedIncrement, capped };
}

// Re-normaliza outras raridades mantendo proporções relativas originais
export function renormalizeDistribution(dist: Record<string, number>, newGodmodePct: number): Record<string, number> {
  const baseGod = dist['godmode'] || 0;
  if (baseGod <= 0) return dist; // sem godmode
  if (newGodmodePct <= baseGod) return dist; // nada a fazer se não houve aumento
  const totalWithoutGod = 100 - baseGod;
  const remaining = 100 - newGodmodePct;
  const scale = remaining / totalWithoutGod;
  const out: Record<string, number> = {};
  for (const [rarity, pct] of Object.entries(dist)) {
    if (rarity === 'godmode') {
      out[rarity] = newGodmodePct;
    } else {
      out[rarity] = +(pct * scale).toFixed(6);
    }
  }
  return out;
}

export function applyPityDistribution(original: Record<string, number>, attempts: number, edition: EditionConfig): { dist: Record<string, number>; boostedGodmodePct: number } {
  if (!edition.pityEnabled) {
    return { dist: original, boostedGodmodePct: original['godmode'] || 0 };
  }
  const baseGod = original['godmode'] || 0;
  const thresholds = edition.pityThresholds || [];
  const increments = edition.pityIncrements || [];
  const capMultiplier = edition.pityCapMultiplier || 1;
  const { boostedGodmodePct } = computePityGodmodePct({ baseGodmodePct: baseGod, attempts, thresholds, increments, capMultiplier });
  const dist = renormalizeDistribution(original, boostedGodmodePct);
  return { dist, boostedGodmodePct };
}