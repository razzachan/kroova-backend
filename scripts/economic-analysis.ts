/**
 * 🎰 KROOVA BOOSTER ECONOMIC ANALYSIS
 * 
 * Análise econômica detalhada com:
 * - Múltiplas simulações (10x de 1000 boosters)
 * - Cálculo de desvio padrão
 * - Análise de viabilidade econômica
 * - Exportação para JSON
 */

import { writeFileSync } from "fs";
import { join } from "path";

// ========================================
// CONFIGURAÇÃO DA EDIÇÃO 01
// ========================================

const ED01_CONFIG = {
  name: "ED01 - Colapso da Interface",
  boosterPrice: 0.50,
  cardsPerBooster: 5,
  rtpTotal: 0.18,
  rtpRecycleNormal: 0.70,
  rtpJackpots: 0.30,
  
  rarityDistribution: {
    trash: 70.85,
    meme: 20.00,
    viral: 8.00,
    legendary: 1.00,
    godmode: 0.15,
  },
  
  modeDistribution: {
    default: 60.0,
    neon: 20.0,
    glow: 10.0,
    glitch: 5.0,
    ghost: 3.0,
    holo: 1.5,
    dark: 0.5,
  },
  
  modeMultipliers: {
    default: 1.0,
    neon: 2.0,
    glow: 3.0,
    glitch: 4.0,
    ghost: 6.0,
    holo: 8.0,
    dark: 12.0,
  },
  
  godmodePrizes: [5, 10, 20, 50, 100, 200, 500, 1000],
  
  godmodePrizeWeights: {
    5: 50.0,
    10: 25.0,
    20: 12.5,
    50: 6.25,
    100: 3.125,
    200: 1.5625,
    500: 0.78125,
    1000: 0.39063,
  },
  
  // Custos operacionais (estimados)
  costs: {
    payment_gateway: 0.04, // 4% Stripe
    server_per_booster: 0.001, // R$ 0,001 por booster
    support_per_user: 0.05, // R$ 0,05 por usuário
    marketing_cac: 2.00, // R$ 2,00 custo de aquisição por cliente
  },
};

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
  operationalCosts: number;
  netProfit: number;
  profitMargin: number;
  rarityCount: Record<string, number>;
  modeCount: Record<string, number>;
  godmodeCount: number;
  godmodePrizeBreakdown: Record<number, number>;
  avgRecyclePerCard: number;
  avgRecyclePerBooster: number;
}

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
  
  return 5;
}

function calculateRecycleValue(card: Card, baseValue: number): number {
  if (card.isGodmode && card.godmodePrize) {
    return card.godmodePrize;
  }
  
  const modeMultiplier = ED01_CONFIG.modeMultipliers[card.mode as keyof typeof ED01_CONFIG.modeMultipliers] || 1.0;
  return baseValue * modeMultiplier;
}

function generateCard(baseRecycleValue: number): Card {
  const rarity = rollDistribution(ED01_CONFIG.rarityDistribution);
  const mode = rollDistribution(ED01_CONFIG.modeDistribution);
  const isGodmode = rarity === "godmode";
  const godmodePrize = isGodmode ? rollGodmodePrize() : undefined;
  
  const card: Card = {
    rarity: isGodmode ? "legendary" : rarity,
    mode,
    isGodmode,
    godmodePrize,
    recycleValue: 0,
  };
  
  card.recycleValue = calculateRecycleValue(card, baseRecycleValue);
  return card;
}

function simulateBoosters(count: number): SimulationResult {
  const { boosterPrice, cardsPerBooster, rtpTotal, rtpRecycleNormal, costs } = ED01_CONFIG;
  
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
  
  for (let i = 0; i < totalCards; i++) {
    const card = generateCard(baseRecycleValue);
    cards.push(card);
    
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
  
  const totalRecycleValue = cards.reduce((sum, card) => sum + card.recycleValue, 0);
  const totalJackpots = cards
    .filter((c) => c.isGodmode && c.godmodePrize)
    .reduce((sum, card) => sum + (card.godmodePrize || 0), 0);
  
  // Custos operacionais
  const paymentFees = totalRevenue * costs.payment_gateway;
  const serverCosts = count * costs.server_per_booster;
  const operationalCosts = paymentFees + serverCosts;
  
  const netProfit = totalRevenue - totalRecycleValue - operationalCosts;
  const profitMargin = (netProfit / totalRevenue) * 100;
  
  return {
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
  };
}

function runMultipleSimulations(iterations: number, boostersPerRun: number) {
  console.log(`\n🔬 Executando ${iterations} simulações de ${boostersPerRun} boosters cada...\n`);
  
  const results: SimulationResult[] = [];
  
  for (let i = 0; i < iterations; i++) {
    const result = simulateBoosters(boostersPerRun);
    results.push(result);
    console.log(`   Simulação ${i + 1}/${iterations}: Lucro = R$ ${result.netProfit.toFixed(2)} (${result.profitMargin.toFixed(2)}%)`);
  }
  
  return results;
}

function calculateStats(results: SimulationResult[]) {
  const profits = results.map((r) => r.netProfit);
  const margins = results.map((r) => r.profitMargin);
  const recycleValues = results.map((r) => r.totalRecycleValue);
  const jackpots = results.map((r) => r.totalJackpots);
  
  const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
  const stdDev = (arr: number[]) => {
    const mean = avg(arr);
    const variance = arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / arr.length;
    return Math.sqrt(variance);
  };
  
  return {
    avgProfit: avg(profits),
    stdDevProfit: stdDev(profits),
    minProfit: Math.min(...profits),
    maxProfit: Math.max(...profits),
    
    avgMargin: avg(margins),
    stdDevMargin: stdDev(margins),
    minMargin: Math.min(...margins),
    maxMargin: Math.max(...margins),
    
    avgRecycle: avg(recycleValues),
    stdDevRecycle: stdDev(recycleValues),
    
    avgJackpots: avg(jackpots),
    stdDevJackpots: stdDev(jackpots),
  };
}

function printDetailedReport(results: SimulationResult[], stats: ReturnType<typeof calculateStats>) {
  const firstResult = results[0];
  
  console.log("\n" + "=".repeat(70));
  console.log("🃏 KROOVA ECONOMIC ANALYSIS - DETAILED REPORT");
  console.log("=".repeat(70));
  
  console.log(`\n📊 CONFIGURAÇÃO: ${ED01_CONFIG.name}`);
  console.log(`   Preço por Booster: R$ ${ED01_CONFIG.boosterPrice.toFixed(2)}`);
  console.log(`   Cartas por Booster: ${ED01_CONFIG.cardsPerBooster}`);
  console.log(`   RTP Total: ${(ED01_CONFIG.rtpTotal * 100).toFixed(0)}%`);
  console.log(`   RTP Reciclagem: ${(ED01_CONFIG.rtpRecycleNormal * 100).toFixed(0)}% do RTP`);
  console.log(`   RTP Jackpots: ${(ED01_CONFIG.rtpJackpots * 100).toFixed(0)}% do RTP`);
  
  console.log("\n💰 ESTATÍSTICAS ECONÔMICAS (média de " + results.length + " simulações):");
  console.log(`   Receita: R$ ${firstResult.totalRevenue.toFixed(2)}`);
  console.log(`   Reciclagem Média: R$ ${stats.avgRecycle.toFixed(2)} (±${stats.stdDevRecycle.toFixed(2)})`);
  console.log(`   Jackpots Médios: R$ ${stats.avgJackpots.toFixed(2)} (±${stats.stdDevJackpots.toFixed(2)})`);
  console.log(`   Custos Operacionais: R$ ${firstResult.operationalCosts.toFixed(2)}`);
  console.log(`      → Gateway (4%): R$ ${(firstResult.totalRevenue * 0.04).toFixed(2)}`);
  console.log(`      → Servidor: R$ ${(firstResult.totalBoosters * ED01_CONFIG.costs.server_per_booster).toFixed(2)}`);
  
  console.log("\n💎 LUCRO:");
  console.log(`   Lucro Médio: R$ ${stats.avgProfit.toFixed(2)} (±${stats.stdDevProfit.toFixed(2)})`);
  console.log(`   Margem Média: ${stats.avgMargin.toFixed(2)}% (±${stats.stdDevMargin.toFixed(2)}%)`);
  console.log(`   Range: R$ ${stats.minProfit.toFixed(2)} até R$ ${stats.maxProfit.toFixed(2)}`);
  console.log(`   Margem Range: ${stats.minMargin.toFixed(2)}% até ${stats.maxMargin.toFixed(2)}%`);
  
  console.log("\n🎲 DISTRIBUIÇÃO MÉDIA DE RARIDADES:");
  const avgRarities: Record<string, number> = {};
  for (const result of results) {
    for (const [rarity, count] of Object.entries(result.rarityCount)) {
      avgRarities[rarity] = (avgRarities[rarity] || 0) + count / results.length;
    }
  }
  for (const [rarity, count] of Object.entries(avgRarities)) {
    const percentage = (count / firstResult.totalCards) * 100;
    const expected = ED01_CONFIG.rarityDistribution[rarity as keyof typeof ED01_CONFIG.rarityDistribution] || 0;
    console.log(`   ${rarity.padEnd(10)}: ${count.toFixed(0).padStart(5)} (${percentage.toFixed(2)}% vs ${expected.toFixed(2)}% esperado)`);
  }
  
  console.log("\n🌟 GODMODE JACKPOTS:");
  const avgGodmodes = results.reduce((sum, r) => sum + r.godmodeCount, 0) / results.length;
  console.log(`   Média de Godmodes: ${avgGodmodes.toFixed(1)} (${((avgGodmodes / firstResult.totalCards) * 100).toFixed(4)}%)`);
  
  const allGodmodePrizes: Record<number, number> = {};
  for (const result of results) {
    for (const [prize, count] of Object.entries(result.godmodePrizeBreakdown)) {
      allGodmodePrizes[Number(prize)] = (allGodmodePrizes[Number(prize)] || 0) + count / results.length;
    }
  }
  
  console.log("\n   Breakdown Médio por Valor:");
  for (const prize of ED01_CONFIG.godmodePrizes.sort((a, b) => b - a)) {
    const count = allGodmodePrizes[prize] || 0;
    if (count > 0) {
      const value = count * prize;
      console.log(`   R$ ${prize.toString().padStart(4)}: ${count.toFixed(1).padStart(5)}x = R$ ${value.toFixed(2)}`);
    }
  }
  
  console.log("\n📈 ANÁLISE DE VIABILIDADE:");
  const breakEvenUsers = Math.ceil(ED01_CONFIG.costs.marketing_cac / stats.avgProfit * firstResult.totalBoosters);
  const ltv = stats.avgProfit; // Lifetime value por 1000 boosters
  
  console.log(`   CAC (Custo Aquisição): R$ ${ED01_CONFIG.costs.marketing_cac.toFixed(2)}`);
  console.log(`   LTV por ${firstResult.totalBoosters} boosters: R$ ${ltv.toFixed(2)}`);
  console.log(`   LTV/CAC Ratio: ${(ltv / ED01_CONFIG.costs.marketing_cac).toFixed(2)}x`);
  
  if (ltv > ED01_CONFIG.costs.marketing_cac * 3) {
    console.log(`   ✅ VIÁVEL: LTV é ${(ltv / ED01_CONFIG.costs.marketing_cac).toFixed(1)}x o CAC (ótimo!)`);
  } else if (ltv > ED01_CONFIG.costs.marketing_cac) {
    console.log(`   ⚠️  MARGEM APERTADA: LTV é apenas ${(ltv / ED01_CONFIG.costs.marketing_cac).toFixed(1)}x o CAC`);
  } else {
    console.log(`   ❌ INVIÁVEL: LTV menor que CAC`);
  }
  
  console.log("\n" + "=".repeat(70));
}

// ========================================
// EXECUÇÃO
// ========================================

console.log("\n🚀 KROOVA BOOSTER ECONOMIC ANALYSIS");
console.log("=".repeat(70));

const iterations = 10;
const boostersPerRun = 1000;

const results = runMultipleSimulations(iterations, boostersPerRun);
const stats = calculateStats(results);

printDetailedReport(results, stats);

// Salvar resultados em JSON
const output = {
  config: ED01_CONFIG,
  simulationParams: {
    iterations,
    boostersPerRun,
    totalBoostersSimulated: iterations * boostersPerRun,
  },
  statistics: stats,
  allResults: results,
  generatedAt: new Date().toISOString(),
};

const outputPath = join(process.cwd(), "simulation-results.json");
writeFileSync(outputPath, JSON.stringify(output, null, 2));

console.log(`\n💾 Resultados salvos em: ${outputPath}`);
console.log("✅ Análise concluída!\n");
