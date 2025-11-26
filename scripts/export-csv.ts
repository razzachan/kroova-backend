/**
 * 📊 KROOVA BOOSTER - CSV EXPORT
 * 
 * Gera CSV com todas as cartas de uma simulação para análise no Excel
 */

import { writeFileSync } from "fs";
import { join } from "path";

const ED01_CONFIG = {
  boosterPrice: 0.50,
  cardsPerBooster: 5,
  rtpTotal: 0.18,
  rtpRecycleNormal: 0.70,
  
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
};

interface Card {
  boosterNumber: number;
  cardNumber: number;
  rarity: string;
  mode: string;
  isGodmode: boolean;
  godmodePrize: number;
  recycleValue: number;
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
  if (card.isGodmode && card.godmodePrize > 0) {
    return card.godmodePrize;
  }
  
  const modeMultiplier = ED01_CONFIG.modeMultipliers[card.mode as keyof typeof ED01_CONFIG.modeMultipliers] || 1.0;
  return baseValue * modeMultiplier;
}

function generateCard(boosterNum: number, cardNum: number, baseRecycleValue: number): Card {
  const rarity = rollDistribution(ED01_CONFIG.rarityDistribution);
  const mode = rollDistribution(ED01_CONFIG.modeDistribution);
  const isGodmode = rarity === "godmode";
  const godmodePrize = isGodmode ? rollGodmodePrize() : 0;
  
  const card: Card = {
    boosterNumber: boosterNum,
    cardNumber: cardNum,
    rarity: isGodmode ? "legendary" : rarity,
    mode,
    isGodmode,
    godmodePrize,
    recycleValue: 0,
  };
  
  card.recycleValue = calculateRecycleValue(card, baseRecycleValue);
  return card;
}

function simulateBoosters(count: number): Card[] {
  const { boosterPrice, cardsPerBooster, rtpTotal, rtpRecycleNormal } = ED01_CONFIG;
  
  const totalRevenue = count * boosterPrice;
  const totalRtpPool = totalRevenue * rtpTotal;
  const recyclePool = totalRtpPool * rtpRecycleNormal;
  
  const totalCards = count * cardsPerBooster;
  const baseRecycleValue = recyclePool / totalCards / 2;
  
  const cards: Card[] = [];
  let cardCounter = 1;
  
  for (let boosterNum = 1; boosterNum <= count; boosterNum++) {
    for (let i = 1; i <= cardsPerBooster; i++) {
      const card = generateCard(boosterNum, cardCounter, baseRecycleValue);
      cards.push(card);
      cardCounter++;
    }
  }
  
  return cards;
}

function generateCSV(cards: Card[]): string {
  const headers = [
    "Booster #",
    "Card #",
    "Raridade",
    "Modo Visual",
    "Godmode?",
    "Prêmio Godmode",
    "Valor Reciclagem",
  ];
  
  const rows = cards.map((card) => [
    card.boosterNumber,
    card.cardNumber,
    card.rarity,
    card.mode,
    card.isGodmode ? "SIM" : "NÃO",
    card.godmodePrize > 0 ? `R$ ${card.godmodePrize.toFixed(2)}` : "-",
    `R$ ${card.recycleValue.toFixed(4)}`,
  ]);
  
  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");
  
  return csvContent;
}

function printSummary(cards: Card[]) {
  const totalValue = cards.reduce((sum, card) => sum + card.recycleValue, 0);
  const godmodes = cards.filter((c) => c.isGodmode);
  const totalJackpots = godmodes.reduce((sum, card) => sum + card.godmodePrize, 0);
  
  const rarityCount: Record<string, number> = {};
  const modeCount: Record<string, number> = {};
  
  cards.forEach((card) => {
    rarityCount[card.rarity] = (rarityCount[card.rarity] || 0) + 1;
    modeCount[card.mode] = (modeCount[card.mode] || 0) + 1;
  });
  
  console.log("\n" + "=".repeat(60));
  console.log("📊 RESUMO DA SIMULAÇÃO");
  console.log("=".repeat(60));
  
  console.log(`\nTotal de cartas: ${cards.length}`);
  console.log(`Valor total de reciclagem: R$ ${totalValue.toFixed(2)}`);
  console.log(`Total em jackpots Godmode: R$ ${totalJackpots.toFixed(2)}`);
  console.log(`Godmodes encontrados: ${godmodes.length} (${((godmodes.length / cards.length) * 100).toFixed(3)}%)`);
  
  console.log("\n🎲 Raridades:");
  Object.entries(rarityCount)
    .sort((a, b) => b[1] - a[1])
    .forEach(([rarity, count]) => {
      const pct = ((count / cards.length) * 100).toFixed(2);
      console.log(`   ${rarity.padEnd(10)}: ${count.toString().padStart(5)} (${pct}%)`);
    });
  
  console.log("\n✨ Modos Visuais:");
  Object.entries(modeCount)
    .sort((a, b) => b[1] - a[1])
    .forEach(([mode, count]) => {
      const pct = ((count / cards.length) * 100).toFixed(2);
      const mult = ED01_CONFIG.modeMultipliers[mode as keyof typeof ED01_CONFIG.modeMultipliers];
      console.log(`   ${mode.padEnd(10)}: ${count.toString().padStart(5)} (${pct}%) [${mult}x]`);
    });
  
  if (godmodes.length > 0) {
    console.log("\n🌟 Godmodes:");
    godmodes.forEach((card, i) => {
      console.log(
        `   ${(i + 1).toString().padStart(2)}. Booster #${card.boosterNumber.toString().padStart(4)} | ` +
        `${card.mode.padEnd(8)} ${card.rarity.padEnd(10)} | R$ ${card.godmodePrize.toFixed(2)}`
      );
    });
  }
  
  console.log("\n" + "=".repeat(60));
}

// ========================================
// EXECUÇÃO
// ========================================

console.log("\n🚀 Gerando simulação de 1000 boosters...\n");

const cards = simulateBoosters(1000);
printSummary(cards);

const csv = generateCSV(cards);
const csvPath = join(process.cwd(), "booster-cards.csv");
writeFileSync(csvPath, csv, "utf-8");

console.log(`\n💾 CSV exportado para: ${csvPath}`);
console.log("📊 Abra no Excel para análise detalhada");
console.log("✅ Concluído!\n");
