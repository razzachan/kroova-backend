/**
 * 🎰 KROOVA SIMULATION ENGINE
 * 
 * Core engine para simular abertura de boosters com diferentes configurações
 */

export interface EditionConfig {
  name: string;
  boosterPrice: number;
  cardsPerBooster: number;
  rtpTotal: number;
  rtpRecycleNormal: number;
  rtpJackpots: number;
  
  rarityDistribution: Record<string, number>;
  modeDistribution: Record<string, number>;
  modeMultipliers: Record<string, number>;
  godmodePrizeWeights: Record<number, number>;
  
  costs: {
    payment_gateway: number;
    server_per_booster: number;
    support_per_user: number;
    marketing_cac: number;
  };
}

export interface Card {
  boosterNumber: number;
  cardNumber: number;
  rarity: string;
  mode: string;
  isGodmode: boolean;
  godmodePrize: number;
  recycleValue: number;
}

export interface SimulationResult {
  runId: string;
  timestamp: string;
  config: EditionConfig;
  totalBoosters: number;
  totalCards: number;
  totalRevenue: number;
  totalRecycleValue: number;
  totalJackpots: number;
  operationalCosts: number;
  netProfit: number;
  profitMargin: number;
  rarityCount: Record<string, number>;
  modeCount: Record<string, number>;
  godmodeCount: number;
  godmodePrizeBreakdown: Record<number, number>;
  avgRecyclePerCard: number;
  avgRecyclePerBooster: number;
  cards: Card[];
}

export class SimulationEngine {
  // Scores de raridade para correlação com prêmios
  private readonly RARITY_SCORES: Record<string, number> = {
    trash: 1,
    meme: 2,
    viral: 4,
    legendary: 7,
  };

  // Scores de modo visual para correlação com prêmios
  private readonly MODE_SCORES: Record<string, number> = {
    default: 1,
    neon: 2,
    glow: 3,
    glitch: 4,
    ghost: 6,
    holo: 8,
    dark: 12,
  };

  constructor(private config: EditionConfig) {}

  /**
   * Sorteia um valor baseado em distribuição de probabilidades
   */
  private rollDistribution(distribution: Record<string, number>): string {
    const random = Math.random() * 100;
    let accumulated = 0;

    for (const [key, percentage] of Object.entries(distribution)) {
      accumulated += percentage;
      if (random <= accumulated) {
        return key;
      }
    }

    return Object.keys(distribution)[0];
  }

  /**
   * Calcula score da carta baseado em raridade e modo
   * Score = (Raridade × 40%) + (Modo × 60%)
   */
  private calculateCardScore(rarity: string, mode: string): number {
    const rarityScore = this.RARITY_SCORES[rarity] || 1;
    const modeScore = this.MODE_SCORES[mode] || 1;
    return rarityScore * 0.4 + modeScore * 0.6;
  }

  /**
   * Retorna prêmios possíveis baseado no score da carta
   */
  private getEligiblePrizes(cardScore: number): number[] {
    const allPrizes = Object.keys(this.config.godmodePrizeWeights).map(Number);

    // Faixas de score e prêmios correspondentes
    if (cardScore >= 13.1) return allPrizes.filter((p) => p >= 500); // R$ 500, 1000
    if (cardScore >= 11.1) return allPrizes.filter((p) => p >= 200 && p <= 500); // R$ 200, 500
    if (cardScore >= 9.1) return allPrizes.filter((p) => p >= 100 && p <= 200); // R$ 100, 200
    if (cardScore >= 7.1) return allPrizes.filter((p) => p >= 50 && p <= 100); // R$ 50, 100
    if (cardScore >= 5.1) return allPrizes.filter((p) => p >= 20 && p <= 50); // R$ 20, 50
    if (cardScore >= 3.6) return allPrizes.filter((p) => p >= 10 && p <= 20); // R$ 10, 20
    if (cardScore >= 2.1) return allPrizes.filter((p) => p >= 5 && p <= 10); // R$ 5, 10
    return allPrizes.filter((p) => p === 5); // Apenas R$ 5
  }

  /**
   * Sorteia prêmio Godmode baseado em pesos E score da carta
   */
  private rollGodmodePrize(rarity: string, mode: string): number {
    const cardScore = this.calculateCardScore(rarity, mode);
    const eligiblePrizes = this.getEligiblePrizes(cardScore);

    // Se não há prêmios elegíveis, retorna o menor
    if (eligiblePrizes.length === 0) {
      return 5;
    }

    // Filtra apenas os pesos dos prêmios elegíveis
    const weights = this.config.godmodePrizeWeights;
    const eligibleWeights: Record<number, number> = {};
    let totalWeight = 0;

    for (const prize of eligiblePrizes) {
      if (weights[prize]) {
        eligibleWeights[prize] = weights[prize];
        totalWeight += weights[prize];
      }
    }

    // Sorteia entre os prêmios elegíveis
    const random = Math.random() * totalWeight;
    let accumulated = 0;

    for (const [prize, weight] of Object.entries(eligibleWeights)) {
      accumulated += weight;
      if (random <= accumulated) {
        return Number(prize);
      }
    }

    // Fallback: retorna o menor prêmio elegível
    return eligiblePrizes[0];
  }

  /**
   * Calcula valor de reciclagem de uma carta
   */
  private calculateRecycleValue(card: Card, baseValue: number): number {
    if (card.isGodmode && card.godmodePrize > 0) {
      return card.godmodePrize;
    }

    const modeMultiplier = this.config.modeMultipliers[card.mode] || 1.0;
    return baseValue * modeMultiplier;
  }

  /**
   * Gera uma carta aleatória
   */
  private generateCard(
    boosterNum: number,
    cardNum: number,
    baseRecycleValue: number,
  ): Card {
    const rarity = this.rollDistribution(this.config.rarityDistribution);
    const mode = this.rollDistribution(this.config.modeDistribution);
    const isGodmode = rarity === "godmode";
    const actualRarity = isGodmode ? "legendary" : rarity;
    const godmodePrize = isGodmode ? this.rollGodmodePrize(actualRarity, mode) : 0;

    const card: Card = {
      boosterNumber: boosterNum,
      cardNumber: cardNum,
      rarity: actualRarity,
      mode,
      isGodmode,
      godmodePrize,
      recycleValue: 0,
    };

    card.recycleValue = this.calculateRecycleValue(card, baseRecycleValue);
    return card;
  }

  /**
   * Simula abertura de N boosters
   */
  simulate(count: number, runId?: string): SimulationResult {
    const { boosterPrice, cardsPerBooster, rtpTotal, rtpRecycleNormal, costs } =
      this.config;

    const totalRevenue = count * boosterPrice;
    const totalRtpPool = totalRevenue * rtpTotal;
    const recyclePool = totalRtpPool * rtpRecycleNormal;

    const totalCards = count * cardsPerBooster;
    const baseRecycleValue = recyclePool / totalCards / 2;

    const cards: Card[] = [];
    const rarityCount: Record<string, number> = {};
    const modeCount: Record<string, number> = {};
    const godmodePrizeBreakdown: Record<number, number> = {};
    let godmodeCount = 0;
    let cardCounter = 1;

    for (let boosterNum = 1; boosterNum <= count; boosterNum++) {
      for (let i = 1; i <= cardsPerBooster; i++) {
        const card = this.generateCard(boosterNum, cardCounter, baseRecycleValue);
        cards.push(card);

        rarityCount[card.rarity] = (rarityCount[card.rarity] || 0) + 1;
        modeCount[card.mode] = (modeCount[card.mode] || 0) + 1;

        if (card.isGodmode) {
          godmodeCount++;
          if (card.godmodePrize > 0) {
            godmodePrizeBreakdown[card.godmodePrize] =
              (godmodePrizeBreakdown[card.godmodePrize] || 0) + 1;
          }
        }

        cardCounter++;
      }
    }

    const totalRecycleValue = cards.reduce((sum, card) => sum + card.recycleValue, 0);
    const totalJackpots = cards
      .filter((c) => c.isGodmode && c.godmodePrize > 0)
      .reduce((sum, card) => sum + card.godmodePrize, 0);

    const paymentFees = totalRevenue * costs.payment_gateway;
    const serverCosts = count * costs.server_per_booster;
    const operationalCosts = paymentFees + serverCosts;

    const netProfit = totalRevenue - totalRecycleValue - operationalCosts;
    const profitMargin = (netProfit / totalRevenue) * 100;

    return {
      runId: runId || `sim_${Date.now()}`,
      timestamp: new Date().toISOString(),
      config: this.config,
      totalBoosters: count,
      totalCards,
      totalRevenue,
      totalRecycleValue,
      totalJackpots,
      operationalCosts,
      netProfit,
      profitMargin,
      rarityCount,
      modeCount,
      godmodeCount,
      godmodePrizeBreakdown,
      avgRecyclePerCard: totalRecycleValue / totalCards,
      avgRecyclePerBooster: totalRecycleValue / count,
      cards,
    };
  }

  /**
   * Roda múltiplas simulações
   */
  runMultiple(iterations: number, boostersPerRun: number): SimulationResult[] {
    const results: SimulationResult[] = [];

    for (let i = 0; i < iterations; i++) {
      const runId = `batch_${Date.now()}_${i + 1}`;
      const result = this.simulate(boostersPerRun, runId);
      results.push(result);
    }

    return results;
  }
}
