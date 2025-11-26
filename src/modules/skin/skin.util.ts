import { EditionConfig } from '../../config/edition.js';

export interface SkinConfig { name: string; weight: number; multiplier: number }

export function rollSkinWeighted(skins: SkinConfig[], rng: () => number = Math.random): string {
  if (!skins || skins.length === 0) return 'default';
  const total = skins.reduce((a, s) => a + s.weight, 0);
  let r = rng() * total;
  for (const s of skins) {
    if (r < s.weight) return s.name;
    r -= s.weight;
  }
  return skins[skins.length - 1].name;
}

export function chooseSkin(edition: EditionConfig | undefined, rng: () => number = Math.random): string {
  if (!edition || !edition.skins) return 'default';
  return rollSkinWeighted(edition.skins, rng);
}
