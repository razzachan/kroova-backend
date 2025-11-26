import { EditionConfig, getEditionConfig } from '../../config/edition.js';

export function getSkinMultiplier(skin: string, edition: EditionConfig | undefined): number {
  if (!edition?.skins) return 1;
  return edition.skins.find(s => s.name === skin)?.multiplier || 1;
}

export function computeAdjustedLiquidity(baseLiquidity: number, skin: string, editionId: string): number {
  const edition = getEditionConfig(editionId);
  const mult = getSkinMultiplier(skin, edition);
  return +(baseLiquidity * mult).toFixed(2);
}

export function enforcePriceFloor(requestedPrice: number, baseLiquidity: number, skin: string, editionId: string): { ok: boolean; floor: number; adjusted?: number } {
  const floor = computeAdjustedLiquidity(baseLiquidity, skin, editionId);
  if (requestedPrice < floor) {
    return { ok: false, floor, adjusted: floor };
  }
  return { ok: true, floor };
}