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
// Economy design: Points cost = 150% of booster price
// This prevents exploit loops (buy → open → sell → recycle → repeat)
// 
// Math:
// - Básico R$ 0.50 × 150% = R$ 0.75 = 75 points
// - Padrão R$ 1.00 × 150% = R$ 1.50 = 150 points
// - Premium R$ 2.00 × 150% = R$ 3.00 = 300 points
// - Elite R$ 5.00 × 150% = R$ 7.50 = 750 points
// - Whale R$ 10.00 × 150% = R$ 15.00 = 1500 points
//
// Why 150%?
// - Boosters have 65-72% RTP (return to player)
// - Even with max RTP (72%), player gets R$ 0.72 from R$ 1.00 booster
// - To get 150 points, need to recycle R$ 1.50 worth of cards
// - But cards only return 65-72% of value, so actual cost is ~R$ 2.00+
// - This creates sustainable sink: players trade excess trash for variety
export const BOOSTER_POINTS_COST: Record<string, number> = {
  'Básico': 75,     // R$ 0.50 × 150% = 75 points (requires ~R$ 1.00 in recycled cards)
  'Padrão': 150,    // R$ 1.00 × 150% = 150 points (requires ~R$ 2.00 in recycled cards)
  'Premium': 300,   // R$ 2.00 × 150% = 300 points (requires ~R$ 4.00 in recycled cards)
  'Elite': 750,     // R$ 5.00 × 150% = 750 points (requires ~R$ 10.00 in recycled cards)
  'Whale': 1500     // R$ 10.00 × 150% = 1500 points (requires ~R$ 20.00 in recycled cards)
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
