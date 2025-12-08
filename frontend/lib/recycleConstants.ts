/**
 * RECYCLE SYSTEM CONSTANTS
 * Mathematical definitions for the recycle points economy
 */

// ============================================================================
// POINTS PER RARITY
// ============================================================================
export const RECYCLE_POINTS_BY_RARITY: Record<string, number> = {
  'trash': 1,      // R$ 0.01 equivalent
  'meme': 2,       // R$ 0.02 equivalent
  'viral': 5,      // R$ 0.05 equivalent
  'legendary': 10, // R$ 0.10 equivalent
  'mythic': 20     // R$ 0.20 equivalent
};

// ============================================================================
// BOOSTER COSTS IN POINTS
// ============================================================================
export const BOOSTER_POINTS_COST: Record<string, number> = {
  'Básico': 50,    // R$ 0.50 / 0.01 = 50 points
  'Padrão': 100,   // R$ 1.00 / 0.01 = 100 points
  'Premium': 200,  // R$ 2.00 / 0.01 = 200 points
  'Elite': 500,    // R$ 5.00 / 0.01 = 500 points
  'Whale': 1000    // R$ 10.00 / 0.01 = 1000 points
};

// ============================================================================
// CONVERSION RATE
// ============================================================================
export const POINTS_TO_BRL_RATE = 0.01; // 1 point = R$ 0.01
export const BRL_TO_POINTS_RATE = 100;  // R$ 1.00 = 100 points

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get recycle points for a card based on rarity
 */
export function getRecyclePoints(rarity: string): number {
  return RECYCLE_POINTS_BY_RARITY[rarity.toLowerCase()] || 1;
}

/**
 * Get points cost for a booster tier
 */
export function getBoosterPointsCost(tier: string): number {
  return BOOSTER_POINTS_COST[tier] || 50;
}

/**
 * Calculate which boosters a player can afford with their points
 */
export function getAffordableBoosters(totalPoints: number): Array<{
  tier: string;
  cost: number;
  canAfford: boolean;
  maxQuantity: number;
}> {
  return Object.entries(BOOSTER_POINTS_COST).map(([tier, cost]) => ({
    tier,
    cost,
    canAfford: totalPoints >= cost,
    maxQuantity: Math.floor(totalPoints / cost)
  }));
}

/**
 * Convert BRL amount to points
 */
export function brlToPoints(brl: number): number {
  return Math.floor(brl * BRL_TO_POINTS_RATE);
}

/**
 * Convert points to BRL amount
 */
export function pointsToBrl(points: number): number {
  return points * POINTS_TO_BRL_RATE;
}
