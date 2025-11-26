export interface RarityDistribution { [rarity: string]: number }

export function rollRarity(distribution: RarityDistribution): string {
  const total = Object.values(distribution).reduce((a, b) => a + b, 0) || 100;
  let random = Math.random() * total;
  for (const [rarity, pct] of Object.entries(distribution)) {
    if (pct <= 0) continue;
    if (random < pct) return rarity;
    random -= pct;
  }
  return 'trash';
}