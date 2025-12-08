// ==========================================================================
// SISTEMA DE CÁLCULO DE PRÊMIOS - SLOT MACHINE PSYCHOLOGY
// ==========================================================================
// Implementa lógica de RTP variável para criar experiência de slot machine
// onde jogador perde na maioria das vezes MAS jackpots compensam emocionalmente

export interface BoosterType {
  id: string;
  name: string;
  price_brl: number;
  tier: string; // 'Básico', 'Padrão', 'Premium', 'Elite', 'Whale'
}

export interface DroppedCard {
  id: string;
  base_id: string;
  rarity: string;
  skin: string;
  base_liquidity_brl: number;
}

export interface PrizeResult {
  prize_amount_brl: number;
  rtp_percentage: number;
  prize_tier: 'loss' | 'near_even' | 'small_win' | 'jackpot';
  calculation_details: {
    booster_cost: number;
    random_roll: number;
    distribution_hit: string;
    multiplier_used: number;
  };
}

// ==========================================================================
// CONFIGURAÇÃO: Probabilidades por tier de booster
// ==========================================================================
const RTP_DISTRIBUTION_BY_TIER = {
  // Básico: Mais "generoso" em % mas valores absolutos pequenos
  'Básico': {
    loss: { weight: 50, rtp_range: [0.20, 0.50] },      // 50%: 20-50% RTP
    near_even: { weight: 35, rtp_range: [0.60, 0.90] }, // 35%: 60-90% RTP
    small_win: { weight: 14, rtp_range: [1.00, 1.50] }, // 14%: 100-150% RTP
    jackpot: { weight: 1, rtp_range: [3.00, 5.00] }     // 1%: 300-500% RTP
  },
  
  // Padrão: Balanceado
  'Padrão': {
    loss: { weight: 60, rtp_range: [0.15, 0.45] },      // 60%: 15-45% RTP
    near_even: { weight: 30, rtp_range: [0.60, 0.90] }, // 30%: 60-90% RTP
    small_win: { weight: 9, rtp_range: [1.00, 2.00] },  // 9%: 100-200% RTP
    jackpot: { weight: 1, rtp_range: [5.00, 8.00] }     // 1%: 500-800% RTP 🎰
  },
  
  // Premium: Menos generoso mas jackpots maiores
  'Premium': {
    loss: { weight: 65, rtp_range: [0.10, 0.40] },      // 65%: 10-40% RTP
    near_even: { weight: 27, rtp_range: [0.60, 0.90] }, // 27%: 60-90% RTP
    small_win: { weight: 7, rtp_range: [1.00, 2.50] },  // 7%: 100-250% RTP
    jackpot: { weight: 1, rtp_range: [6.00, 10.00] }    // 1%: 600-1000% RTP 🎰🎰
  },
  
  // Elite: Muito difícil ganhar mas jackpots ÉPICOS
  'Elite': {
    loss: { weight: 70, rtp_range: [0.08, 0.35] },      // 70%: 8-35% RTP
    near_even: { weight: 23, rtp_range: [0.60, 0.90] }, // 23%: 60-90% RTP
    small_win: { weight: 6, rtp_range: [1.00, 2.00] },  // 6%: 100-200% RTP
    jackpot: { weight: 1, rtp_range: [7.00, 12.00] }    // 1%: 700-1200% RTP 🎰🎰🎰
  },
  
  // Whale: House edge máximo mas jackpots LENDÁRIOS
  'Whale': {
    loss: { weight: 75, rtp_range: [0.05, 0.30] },      // 75%: 5-30% RTP
    near_even: { weight: 20, rtp_range: [0.60, 0.85] }, // 20%: 60-85% RTP
    small_win: { weight: 4, rtp_range: [1.00, 1.80] },  // 4%: 100-180% RTP
    jackpot: { weight: 1, rtp_range: [8.00, 15.00] }    // 1%: 800-1500% RTP 🎰🎰🎰🎰
  }
};

// ==========================================================================
// FUNÇÃO PRINCIPAL: Calcular prêmio do booster
// ==========================================================================
export function calculateBoosterPrize(
  boosterType: BoosterType,
  droppedCards: DroppedCard[]
): PrizeResult {
  const boosterCost = boosterType.price_brl;
  
  // Identificar tier do booster (primeiro termo do nome)
  const tierName = boosterType.name.split(' ')[0] as keyof typeof RTP_DISTRIBUTION_BY_TIER;
  const distribution = RTP_DISTRIBUTION_BY_TIER[tierName] || RTP_DISTRIBUTION_BY_TIER['Padrão'];
  
  // Calcular total weight
  const totalWeight = 
    distribution.loss.weight +
    distribution.near_even.weight +
    distribution.small_win.weight +
    distribution.jackpot.weight;
  
  // Random roll (0-100)
  const randomRoll = Math.random() * totalWeight;
  
  // Determinar qual tier de prêmio caiu
  let cumulativeWeight = 0;
  let selectedTier: 'loss' | 'near_even' | 'small_win' | 'jackpot' = 'loss';
  let rtpRange: [number, number] = [0.20, 0.50];
  
  // Loss
  cumulativeWeight += distribution.loss.weight;
  if (randomRoll < cumulativeWeight) {
    selectedTier = 'loss';
    rtpRange = distribution.loss.rtp_range as [number, number];
  }
  // Near Even
  else {
    cumulativeWeight += distribution.near_even.weight;
    if (randomRoll < cumulativeWeight) {
      selectedTier = 'near_even';
      rtpRange = distribution.near_even.rtp_range as [number, number];
    }
    // Small Win
    else {
      cumulativeWeight += distribution.small_win.weight;
      if (randomRoll < cumulativeWeight) {
        selectedTier = 'small_win';
        rtpRange = distribution.small_win.rtp_range as [number, number];
      }
      // Jackpot
      else {
        selectedTier = 'jackpot';
        rtpRange = distribution.jackpot.rtp_range as [number, number];
      }
    }
  }
  
  // Calcular RTP multiplier dentro do range
  const [minRtp, maxRtp] = rtpRange;
  const rtpMultiplier = minRtp + (Math.random() * (maxRtp - minRtp));
  
  // Calcular prêmio final
  const prizeAmount = boosterCost * rtpMultiplier;
  const rtpPercentage = rtpMultiplier * 100;
  
  return {
    prize_amount_brl: Math.max(0.01, parseFloat(prizeAmount.toFixed(2))),
    rtp_percentage: parseFloat(rtpPercentage.toFixed(2)),
    prize_tier: selectedTier,
    calculation_details: {
      booster_cost: boosterCost,
      random_roll: parseFloat(randomRoll.toFixed(2)),
      distribution_hit: selectedTier,
      multiplier_used: parseFloat(rtpMultiplier.toFixed(4))
    }
  };
}

// ==========================================================================
// FUNÇÃO: Calcular RTP médio esperado (para validação)
// ==========================================================================
export function calculateExpectedRTP(tierName: keyof typeof RTP_DISTRIBUTION_BY_TIER): number {
  const distribution = RTP_DISTRIBUTION_BY_TIER[tierName];
  
  const totalWeight = 
    distribution.loss.weight +
    distribution.near_even.weight +
    distribution.small_win.weight +
    distribution.jackpot.weight;
  
  // Calcular RTP médio de cada tier
  const lossAvgRtp = (distribution.loss.rtp_range[0] + distribution.loss.rtp_range[1]) / 2;
  const nearEvenAvgRtp = (distribution.near_even.rtp_range[0] + distribution.near_even.rtp_range[1]) / 2;
  const smallWinAvgRtp = (distribution.small_win.rtp_range[0] + distribution.small_win.rtp_range[1]) / 2;
  const jackpotAvgRtp = (distribution.jackpot.rtp_range[0] + distribution.jackpot.rtp_range[1]) / 2;
  
  // Média ponderada
  const weightedRtp = 
    (lossAvgRtp * distribution.loss.weight +
     nearEvenAvgRtp * distribution.near_even.weight +
     smallWinAvgRtp * distribution.small_win.weight +
     jackpotAvgRtp * distribution.jackpot.weight) / totalWeight;
  
  return parseFloat((weightedRtp * 100).toFixed(2));
}

// ==========================================================================
// FUNÇÃO: Simular N aberturas (para testes)
// ==========================================================================
export function simulateOpenings(
  boosterType: BoosterType,
  numOpenings: number
): {
  total_spent: number;
  total_won: number;
  avg_rtp: number;
  distribution: Record<string, number>;
  biggest_win: PrizeResult | null;
} {
  let totalSpent = 0;
  let totalWon = 0;
  const distribution: Record<string, number> = {
    loss: 0,
    near_even: 0,
    small_win: 0,
    jackpot: 0
  };
  let biggestWin: PrizeResult | null = null;
  
  for (let i = 0; i < numOpenings; i++) {
    const prize = calculateBoosterPrize(boosterType, []);
    
    totalSpent += boosterType.price_brl;
    totalWon += prize.prize_amount_brl;
    distribution[prize.prize_tier]++;
    
    if (!biggestWin || prize.prize_amount_brl > biggestWin.prize_amount_brl) {
      biggestWin = prize;
    }
  }
  
  return {
    total_spent: parseFloat(totalSpent.toFixed(2)),
    total_won: parseFloat(totalWon.toFixed(2)),
    avg_rtp: parseFloat(((totalWon / totalSpent) * 100).toFixed(2)),
    distribution,
    biggest_win: biggestWin
  };
}

// ==========================================================================
// EXPORTS
// ==========================================================================
export default {
  calculateBoosterPrize,
  calculateExpectedRTP,
  simulateOpenings,
  RTP_DISTRIBUTION_BY_TIER
};
