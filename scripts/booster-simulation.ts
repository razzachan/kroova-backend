/**
 * 🎰 KROOVA BOOSTER SIMULATION
 * 
 * Simula abertura de 1000 boosters (5000 cartas) para validar:
 * - Distribuição de raridades
 * - Distribuição de modos visuais
 * - Valor total de reciclagem
 * - Lucro esperado
 * 
 * Baseado em: KROOVA_BOOSTER_ALGORITHM.md
 */

// ========================================
// CONFIGURAÇÃO DA EDIÇÃO 01
// ========================================

const ED01_CONFIG = {
  // Preço
  boosterPrice: 0.50, // R$ 0,50 por booster
  cardsPerBooster: 5,
  
  // RTP (Return to Player) - quanto volta para o jogador
  rtpTotal: 0.18, // 18% do faturamento volta
  rtpRecycleNormal: 0.70, // 70% do RTP vai para reciclagem normal
  rtpJackpots: 0.30, // 30% do RTP vai para jackpots
  
  // Distribuição de Raridades (%)
  rarityDistribution: {
    trash: 70.85,
    meme: 20.00,
    viral: 8.00,
    legendary: 1.00,
    godmode: 0.15,
  },
  
  // Distribuição de Modos Visuais (%)
  modeDistribution: {
    default: 60.0,
    neon: 20.0,
    glow: 10.0,
    glitch: 5.0,
    ghost: 3.0,
    holo: 1.5,
    dark: 0.5,
  },
  
  // Multiplicadores de Valor por Modo Visual
  modeMultipliers: {
    default: 1.0,
    neon: 2.0,
    glow: 3.0,
    glitch: 4.0,
    ghost: 6.0,
    holo: 8.0,
    dark: 12.0,
  },
  
  // Prêmios Godmode (R$)
  godmodePrizes: [5, 10, 20, 50, 100, 200, 500, 1000],
  
  // Distribuição de prêmios Godmode (probabilidades relativas)
  // Quanto maior o prêmio, menor a chance
  godmodePrizeWeights: {
    5: 50.0,    // 50% dos godmodes são R$5
    10: 25.0,   // 25% são R$10
    20: 12.5,   // 12.5% são R$20
    50: 6.25,   // 6.25% são R$50
    100: 3.125, // 3.125% são R$100
    200: 1.5625,
    500: 0.78125,
    1000: 0.39063,
  },
};

// ========================================
// TIPOS
// ========================================

interface Card {
  rarity: string;
  mode: string;
  isGodmode: boolean;
  godmodePrize?: number;
  recycleValue: number;
}

interface SimulationResult {
  totalBoosters: number;
  totalCards: number;
  totalRevenue: number;
  totalRecycleValue: number;
  totalJackpots: number;
  profit: number;
  profitMargin: number;
  
  rarityCount: Record<string, number>;
  modeCount: Record<string, number>;
  godmodeCount: number;
  godmodePrizeBreakdown: Record<number, number>;
  
  cards: Card[];
}

// ========================================
// FUNÇÕES DE SIMULAÇÃO
// ========================================

/**
 * Sorteia um valor baseado em distribuição de probabilidades
 */
function rollDistribution(distribution: Record<string, number>): string {
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
 * Sorteia prêmio Godmode baseado em pesos
 */
function rollGodmodePrize(): number {
  const weights = ED01_CONFIG.godmodePrizeWeights;
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  const random = Math.random() * totalWeight;
  let accumulated = 0;
  
  for (const [prize, weight] of Object.entries(weights)) {
    accumulated += weight;
    if (random <= accumulated) {
      return Number(prize);
    }
  }
  
  return 5; // Fallback
}

/**
 * Calcula valor de reciclagem de uma carta
 */
function calculateRecycleValue(card: Card, baseValue: number): number {
  if (card.isGodmode && card.godmodePrize) {
    return card.godmodePrize;
  }
  
  const modeMultiplier = ED01_CONFIG.modeMultipliers[card.mode as keyof typeof ED01_CONFIG.modeMultipliers] || 1.0;
  return baseValue * modeMultiplier;
}

/**
 * Gera uma carta aleatória
 */
function generateCard(baseRecycleValue: number): Card {
  const rarity = rollDistribution(ED01_CONFIG.rarityDistribution);
  const mode = rollDistribution(ED01_CONFIG.modeDistribution);
  
  // Godmode é determinado pela raridade "godmode"
  const isGodmode = rarity === "godmode";
  const godmodePrize = isGodmode ? rollGodmodePrize() : undefined;
  
  const card: Card = {
    rarity: isGodmode ? "legendary" : rarity, // Godmode herda legendary como base
    mode,
    isGodmode,
    godmodePrize,
    recycleValue: 0,
  };
  
  card.recycleValue = calculateRecycleValue(card, baseRecycleValue);
  
  return card;
}

/**
 * Simula abertura de N boosters
 */
function simulateBoosters(count: number): SimulationResult {
  const { boosterPrice, cardsPerBooster, rtpTotal, rtpRecycleNormal } = ED01_CONFIG;
  
  // Cálculos econômicos
  const totalRevenue = count * boosterPrice;
  const totalRtpPool = totalRevenue * rtpTotal;
  const recyclePool = totalRtpPool * rtpRecycleNormal;
  const jackpotPool = totalRtpPool * ED01_CONFIG.rtpJackpots;
  
  // Valor base de reciclagem por carta (sem multiplicadores)
  // Distribuído proporcionalmente entre todas as cartas
  const totalCards = count * cardsPerBooster;
  const baseRecycleValue = recyclePool / totalCards / 2; // Dividido por 2 para compensar multiplicadores
  
  // Gera todas as cartas
  const cards: Card[] = [];
  const rarityCount: Record<string, number> = {};
  const modeCount: Record<string, number> = {};
  const godmodePrizeBreakdown: Record<number, number> = {};
  let godmodeCount = 0;
  
  for (let i = 0; i < totalCards; i++) {
    const card = generateCard(baseRecycleValue);
    cards.push(card);
    
    // Contadores
    rarityCount[card.rarity] = (rarityCount[card.rarity] || 0) + 1;
    modeCount[card.mode] = (modeCount[card.mode] || 0) + 1;
    
    if (card.isGodmode) {
      godmodeCount++;
      if (card.godmodePrize) {
        godmodePrizeBreakdown[card.godmodePrize] =
          (godmodePrizeBreakdown[card.godmodePrize] || 0) + 1;
      }
    }
  }
  
  // Calcula valores totais
  const totalRecycleValue = cards.reduce((sum, card) => sum + card.recycleValue, 0);
  const totalJackpots = cards
    .filter((c) => c.isGodmode && c.godmodePrize)
    .reduce((sum, card) => sum + (card.godmodePrize || 0), 0);
  
  const profit = totalRevenue - totalRecycleValue;
  const profitMargin = (profit / totalRevenue) * 100;
  
  return {
    totalBoosters: count,
    totalCards,
    totalRevenue,
    totalRecycleValue,
    totalJackpots,
    profit,
    profitMargin,
    rarityCount,
    modeCount,
    godmodeCount,
    godmodePrizeBreakdown,
    cards,
  };
}

// ========================================
// RELATÓRIO
// ========================================

function printReport(result: SimulationResult) {
  console.log("\n" + "=".repeat(60));
  console.log("🃏 KROOVA BOOSTER SIMULATION REPORT");
  console.log("=".repeat(60));
  
  console.log("\n📦 VOLUME:");
  console.log(`   Total Boosters: ${result.totalBoosters.toLocaleString()}`);
  console.log(`   Total Cards: ${result.totalCards.toLocaleString()}`);
  
  console.log("\n💰 ECONOMIA:");
  console.log(`   Receita Total: R$ ${result.totalRevenue.toFixed(2)}`);
  console.log(`   Reciclagem Total: R$ ${result.totalRecycleValue.toFixed(2)}`);
  console.log(`   Jackpots Pagos: R$ ${result.totalJackpots.toFixed(2)}`);
  console.log(`   LUCRO: R$ ${result.profit.toFixed(2)}`);
  console.log(`   Margem: ${result.profitMargin.toFixed(2)}%`);
  
  console.log("\n🎲 DISTRIBUIÇÃO DE RARIDADES:");
  for (const [rarity, count] of Object.entries(result.rarityCount)) {
    const percentage = (count / result.totalCards) * 100;
    const expected = ED01_CONFIG.rarityDistribution[rarity as keyof typeof ED01_CONFIG.rarityDistribution] || 0;
    const diff = percentage - expected;
    console.log(
      `   ${rarity.padEnd(10)}: ${count.toString().padStart(5)} (${percentage.toFixed(2)}%) ` +
      `[esperado: ${expected.toFixed(2)}%, diff: ${diff >= 0 ? "+" : ""}${diff.toFixed(2)}%]`
    );
  }
  
  console.log("\n✨ DISTRIBUIÇÃO DE MODOS VISUAIS:");
  for (const [mode, count] of Object.entries(result.modeCount)) {
    const percentage = (count / result.totalCards) * 100;
    const expected = ED01_CONFIG.modeDistribution[mode as keyof typeof ED01_CONFIG.modeDistribution] || 0;
    const multiplier = ED01_CONFIG.modeMultipliers[mode as keyof typeof ED01_CONFIG.modeMultipliers] || 1;
    console.log(
      `   ${mode.padEnd(10)}: ${count.toString().padStart(5)} (${percentage.toFixed(2)}%) ` +
      `[mult: ${multiplier}x, esperado: ${expected.toFixed(2)}%]`
    );
  }
  
  console.log("\n🌟 GODMODE JACKPOTS:");
  console.log(`   Total Godmodes: ${result.godmodeCount} (${((result.godmodeCount / result.totalCards) * 100).toFixed(4)}%)`);
  
  if (Object.keys(result.godmodePrizeBreakdown).length > 0) {
    console.log("\n   Breakdown por valor:");
    for (const prize of ED01_CONFIG.godmodePrizes.sort((a, b) => b - a)) {
      const count = result.godmodePrizeBreakdown[prize] || 0;
      const value = count * prize;
      if (count > 0) {
        console.log(
          `   R$ ${prize.toString().padStart(4)}: ${count.toString().padStart(3)}x = R$ ${value.toFixed(2)}`
        );
      }
    }
  }
  
  console.log("\n📊 CARTAS MAIS VALIOSAS (Top 20):");
  const topCards = result.cards
    .sort((a, b) => b.recycleValue - a.recycleValue)
    .slice(0, 20);
  
  topCards.forEach((card, i) => {
    const godmode = card.isGodmode ? `💎 Godmode R$${card.godmodePrize}` : "";
    console.log(
      `   ${(i + 1).toString().padStart(2)}. ${card.mode.padEnd(8)} | ${card.rarity.padEnd(10)} | ` +
      `R$ ${card.recycleValue.toFixed(2).padStart(8)} ${godmode}`
    );
  });
  
  console.log("\n" + "=".repeat(60));
  console.log("✅ Simulação concluída!");
  console.log("=".repeat(60) + "\n");
}

// ========================================
// EXECUÇÃO
// ========================================

console.log("\n🚀 Iniciando simulação de 1000 boosters...\n");

const result = simulateBoosters(1000);
printReport(result);

// Exporta resultado para análise posterior
console.log("💾 Para análise detalhada, os dados estão disponíveis na variável 'result'");
console.log(`   Total de ${result.cards.length} cartas geradas`);
