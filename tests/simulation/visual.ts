/**
 * 🎨 VISUALIZAÇÃO TERMINAL - Simulação Kroova
 * 
 * Exibe resultados de simulação de forma visual no terminal
 */

import { SimulationEngine } from './engine';
import { ED01_CONFIG } from './configs';

interface VisualConfig {
  boosters: number;
  showCards: boolean;
  showDistribution: boolean;
  showPrizes: boolean;
}

function createBar(value: number, maxValue: number, width: number = 40): string {
  const filled = Math.round((value / maxValue) * width);
  const empty = width - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

function createPercentageBar(percentage: number, width: number = 30): string {
  const filled = Math.round((percentage / 100) * width);
  const empty = width - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

function displayHeader() {
  console.log('\n' + '═'.repeat(80));
  console.log('🎰 KROOVA - VISUALIZAÇÃO DE SIMULAÇÃO DE BOOSTERS');
  console.log('═'.repeat(80) + '\n');
}

function displayEconomics(result: any) {
  console.log('💰 ECONOMIA DO TESTE');
  console.log('─'.repeat(80));
  
  const revenue = result.totalRevenue;
  const recycle = result.totalRecycleValue;
  const jackpots = result.totalJackpots;
  const costs = result.operationalCosts;
  const profit = result.netProfit;
  
  console.log(`\n   Receita Total:        R$ ${revenue.toFixed(2).padStart(10)} ${createBar(revenue, revenue, 30)}`);
  console.log(`   Reciclagem:          -R$ ${recycle.toFixed(2).padStart(10)} ${createBar(recycle, revenue, 30)}`);
  console.log(`   Jackpots Pagos:      -R$ ${jackpots.toFixed(2).padStart(10)} ${createBar(jackpots, revenue, 30)}`);
  console.log(`   Custos Operacionais: -R$ ${costs.toFixed(2).padStart(10)} ${createBar(costs, revenue, 30)}`);
  console.log(`   ${'─'.repeat(70)}`);
  console.log(`   💎 LUCRO LÍQUIDO:     R$ ${profit.toFixed(2).padStart(10)} ${createBar(profit, revenue, 30)}`);
  console.log(`   📊 MARGEM:            ${result.profitMargin.toFixed(2).padStart(10)}% ${createPercentageBar(result.profitMargin)}`);
  console.log();
}

function displayRarityDistribution(result: any) {
  console.log('🎲 DISTRIBUIÇÃO DE RARIDADES');
  console.log('─'.repeat(80));
  
  const rarities = [
    { name: 'Trash', key: 'trash', expected: 70.85, emoji: '🟫' },
    { name: 'Meme', key: 'meme', expected: 20.0, emoji: '🔵' },
    { name: 'Viral', key: 'viral', expected: 8.0, emoji: '🟣' },
    { name: 'Legendary', key: 'legendary', expected: 1.0, emoji: '🟡' },
  ];
  
  console.log();
  const maxCount = Math.max(...(Object.values(result.rarityCount) as number[]));
  
  for (const rarity of rarities) {
    const count = result.rarityCount[rarity.key] || 0;
    const percentage = (count / result.totalCards) * 100;
    const diff = percentage - rarity.expected;
    const diffStr = diff >= 0 ? `+${diff.toFixed(2)}%` : `${diff.toFixed(2)}%`;
    const status = Math.abs(diff) < 0.5 ? '✅' : '⚠️';
    
    console.log(
      `   ${rarity.emoji} ${rarity.name.padEnd(10)} ${count.toString().padStart(6)} ` +
      `(${percentage.toFixed(2).padStart(5)}%) ${createBar(count, maxCount, 25)} ` +
      `${diffStr.padStart(8)} ${status}`
    );
  }
  
  const godmodeCount = result.godmodeCount;
  const godmodePercentage = (godmodeCount / result.totalCards) * 100;
  console.log(
    `   🌟 Godmode     ${godmodeCount.toString().padStart(6)} ` +
    `(${godmodePercentage.toFixed(3).padStart(5)}%) ${createBar(godmodeCount, maxCount, 25)}`
  );
  console.log();
}

function displayModeDistribution(result: any) {
  console.log('🎨 DISTRIBUIÇÃO DE MODOS VISUAIS');
  console.log('─'.repeat(80));
  
  const modes = [
    { name: 'Default', key: 'default', emoji: '⚪' },
    { name: 'Neon', key: 'neon', emoji: '💙' },
    { name: 'Glow', key: 'glow', emoji: '💚' },
    { name: 'Glitch', key: 'glitch', emoji: '💜' },
    { name: 'Ghost', key: 'ghost', emoji: '🤍' },
    { name: 'Holo', key: 'holo', emoji: '🌈' },
    { name: 'Dark', key: 'dark', emoji: '🖤' },
  ];
  
  console.log();
  const maxCount = Math.max(...(Object.values(result.modeCount) as number[]));
  
  for (const mode of modes) {
    const count = result.modeCount[mode.key] || 0;
    const percentage = (count / result.totalCards) * 100;
    
    console.log(
      `   ${mode.emoji} ${mode.name.padEnd(8)} ${count.toString().padStart(6)} ` +
      `(${percentage.toFixed(2).padStart(5)}%) ${createBar(count, maxCount, 30)}`
    );
  }
  console.log();
}

function displayPrizeBreakdown(result: any) {
  console.log('🌟 ANÁLISE DE PRÊMIOS GODMODE');
  console.log('─'.repeat(80));
  
  const prizes = Object.keys(result.godmodePrizeBreakdown)
    .map(Number)
    .sort((a, b) => b - a);
  
  if (prizes.length === 0) {
    console.log('\n   ⚠️  Nenhum prêmio Godmode nesta amostra\n');
    return;
  }
  
  console.log();
  const maxCount = Math.max(...(Object.values(result.godmodePrizeBreakdown) as number[]));
  const totalPrizes = (Object.values(result.godmodePrizeBreakdown) as number[]).reduce((a, b) => a + b, 0);
  
  for (const prize of prizes) {
    const count = result.godmodePrizeBreakdown[prize];
    const percentage = (count / totalPrizes) * 100;
    const totalPaid = prize * count;
    
    const emoji = prize >= 100 ? '💎' : prize >= 50 ? '🏆' : prize >= 20 ? '🥇' : prize >= 10 ? '🥈' : '🥉';
    
    console.log(
      `   ${emoji} R$ ${prize.toString().padStart(4)} × ${count.toString().padStart(3)} = R$ ${totalPaid.toFixed(2).padStart(8)} ` +
      `${createBar(count, maxCount, 20)} (${percentage.toFixed(1).padStart(5)}%)`
    );
  }
  
  console.log(`\n   💰 Total Pago em Prêmios: R$ ${result.totalJackpots.toFixed(2)}`);
  console.log(`   📈 Frequência Godmode: ${result.godmodeCount} / ${result.totalCards} (${((result.godmodeCount / result.totalCards) * 100).toFixed(3)}%)`);
  console.log();
}

function displayGodmodeCorrelation(result: any) {
  console.log('🔗 CORRELAÇÃO GODMODE (Raridade × Modo → Prêmio)');
  console.log('─'.repeat(80));
  
  const godmodes = result.cards.filter((c: any) => c.isGodmode);
  
  if (godmodes.length === 0) {
    console.log('\n   ⚠️  Nenhum Godmode nesta amostra\n');
    return;
  }
  
  // Agrupar por modo
  const byMode: Record<string, { count: number; totalPrize: number; prizes: number[] }> = {};
  
  for (const card of godmodes) {
    if (!byMode[card.mode]) {
      byMode[card.mode] = { count: 0, totalPrize: 0, prizes: [] };
    }
    byMode[card.mode].count++;
    byMode[card.mode].totalPrize += card.godmodePrize;
    byMode[card.mode].prizes.push(card.godmodePrize);
  }
  
  console.log('\n   Modo Visual    | Qtd | Prêmio Médio | Range');
  console.log('   ' + '─'.repeat(70));
  
  const sortedModes = Object.keys(byMode).sort(
    (a, b) => byMode[b].totalPrize / byMode[b].count - byMode[a].totalPrize / byMode[a].count
  );
  
  for (const mode of sortedModes) {
    const data = byMode[mode];
    const avg = data.totalPrize / data.count;
    const min = Math.min(...data.prizes);
    const max = Math.max(...data.prizes);
    
    const emoji = mode === 'dark' ? '🖤' : 
                  mode === 'holo' ? '🌈' : 
                  mode === 'ghost' ? '🤍' : 
                  mode === 'glitch' ? '💜' : 
                  mode === 'glow' ? '💚' : 
                  mode === 'neon' ? '💙' : '⚪';
    
    console.log(
      `   ${emoji} ${mode.padEnd(12)} | ${data.count.toString().padStart(3)} | ` +
      `R$ ${avg.toFixed(2).padStart(6)} | R$ ${min}-${max}`
    );
  }
  
  console.log();
}

function displaySampleCards(result: any, count: number = 10) {
  console.log('🃏 AMOSTRA DE CARTAS (Primeiras ' + count + ')');
  console.log('─'.repeat(80));
  
  console.log();
  console.log('   # | Raridade   | Modo      | Godmode | Prêmio  | Valor Recicl.');
  console.log('   ' + '─'.repeat(70));
  
  for (let i = 0; i < Math.min(count, result.cards.length); i++) {
    const card = result.cards[i];
    const godmodeStr = card.isGodmode ? `R$ ${card.godmodePrize.toFixed(2).padStart(6)}` : '   -   ';
    const emoji = card.isGodmode ? '🌟' : '  ';
    
    console.log(
      `   ${(i + 1).toString().padStart(2)} | ${card.rarity.padEnd(10)} | ` +
      `${card.mode.padEnd(9)} | ${emoji} | ${godmodeStr} | R$ ${card.recycleValue.toFixed(4)}`
    );
  }
  console.log();
}

function displayViability(result: any) {
  console.log('📈 VIABILIDADE DO MODELO');
  console.log('─'.repeat(80));
  
  const cac = result.config.costs.marketing_cac;
  const ltv = result.netProfit;
  const ratio = ltv / cac;
  
  console.log();
  console.log(`   CAC (Custo por Cliente):     R$ ${cac.toFixed(2)}`);
  console.log(`   LTV (Valor de Vida):         R$ ${ltv.toFixed(2)}`);
  console.log(`   Ratio LTV/CAC:               ${ratio.toFixed(2)}x ${createPercentageBar(Math.min(ratio / 5 * 100, 100))}`);
  console.log();
  
  if (ratio > 5) {
    console.log('   ✅ MODELO ALTAMENTE VIÁVEL - Excelente escalabilidade!');
  } else if (ratio > 3) {
    console.log('   ✅ MODELO VIÁVEL - Pode escalar com segurança');
  } else if (ratio > 1) {
    console.log('   ⚠️  MODELO MARGINAL - Risco ao escalar marketing');
  } else {
    console.log('   ❌ MODELO INVIÁVEL - CAC maior que LTV');
  }
  console.log();
}

function generateInsights(result: any): string[] {
  const insights: string[] = [];
  const margin = result.profitMargin;
  const godmodes = result.cards.filter((c: any) => c.isGodmode);
  const rtpActual = ((result.totalRecycleValue / result.totalRevenue) * 100);
  const rtpExpected = result.config.rtpTotal * 100;
  
  // Análise de Margem
  if (margin > 70) {
    insights.push('💰 Margem excepcional (>70%)! Há espaço para campanhas agressivas ou aumentar RTP.');
  } else if (margin > 60) {
    insights.push('✅ Margem saudável (>60%). Modelo robusto para crescimento sustentável.');
  } else if (margin > 50) {
    insights.push('👍 Margem boa (>50%). Sistema equilibrado entre lucro e experiência do usuário.');
  } else if (margin > 40) {
    insights.push('⚠️  Margem moderada (<50%). Cuidado ao aumentar custos de marketing.');
  } else {
    insights.push('🔴 Margem baixa (<40%). Considere reduzir RTP ou otimizar custos.');
  }
  
  // Análise de RTP
  const rtpDiff = Math.abs(rtpActual - rtpExpected);
  if (rtpDiff < 1) {
    insights.push('🎯 RTP real muito próximo do esperado. Algoritmo preciso!');
  } else if (rtpDiff > 3) {
    insights.push(`⚠️  RTP real (${rtpActual.toFixed(1)}%) desviou ${rtpDiff.toFixed(1)}% do esperado. Aumente amostra.`);
  }
  
  // Análise de Correlação Godmode
  if (godmodes.length > 0) {
    const byMode: Record<string, number[]> = {};
    for (const card of godmodes) {
      if (!byMode[card.mode]) byMode[card.mode] = [];
      byMode[card.mode].push(card.godmodePrize);
    }
    
    const avgDefault = byMode['default'] 
      ? byMode['default'].reduce((a, b) => a + b, 0) / byMode['default'].length 
      : 0;
    const avgPremium = ['dark', 'holo', 'ghost', 'glitch'].reduce((sum, mode) => {
      if (!byMode[mode]) return sum;
      return sum + byMode[mode].reduce((a, b) => a + b, 0) / byMode[mode].length;
    }, 0);
    
    if (avgPremium > avgDefault * 2) {
      insights.push('🔗 Correlação funcionando! Modos premium pagam 2x+ mais que Default.');
    } else if (avgPremium > avgDefault) {
      insights.push('✓ Correlação detectada: Modos premium têm prêmios maiores.');
    }
    
    // Análise de prêmios altos
    const highPrizes = godmodes.filter((c: any) => c.godmodePrize >= 50);
    if (highPrizes.length > 0) {
      const modes = highPrizes.map((c: any) => c.mode).join(', ');
      insights.push(`💎 ${highPrizes.length} prêmio(s) alto(s) (≥R$50) em modos: ${modes}`);
    }
  }
  
  // Análise de Jackpots vs Reciclagem
  const jackpotPercent = (result.totalJackpots / result.totalRevenue) * 100;
  const recyclePercent = ((result.totalRecycleValue - result.totalJackpots) / result.totalRevenue) * 100;
  
  if (jackpotPercent > recyclePercent) {
    insights.push('🎰 Jackpots pagaram mais que reciclagem normal! Rodada com muita sorte.');
  }
  
  // Análise de Distribuição
  const trashPercent = (result.rarityCount['trash'] / result.totalCards) * 100;
  const expectedTrash = 70.85;
  if (Math.abs(trashPercent - expectedTrash) < 0.5) {
    insights.push('✅ Distribuição de raridades precisa (<0.5% de erro). Sistema confiável.');
  }
  
  // Recomendações
  if (margin > 65 && result.config.rtpTotal < 0.25) {
    insights.push('💡 Sugestão: Margem alta permite aumentar RTP para melhorar retenção.');
  }
  
  if (result.totalBoosters < 1000) {
    insights.push('📊 Amostra pequena (<1000 boosters). Para mais precisão, rode 5000+.');
  }
  
  // LTV/CAC
  const ratio = result.netProfit / result.config.costs.marketing_cac;
  if (ratio > 100) {
    insights.push(`🚀 LTV/CAC de ${ratio.toFixed(0)}x é extraordinário! Invista pesado em marketing.`);
  } else if (ratio > 10) {
    insights.push(`📈 LTV/CAC de ${ratio.toFixed(0)}x permite escala agressiva.`);
  }
  
  return insights;
}

function displayInsights(result: any) {
  console.log('💡 INSIGHTS E RECOMENDAÇÕES');
  console.log('─'.repeat(80));
  
  const insights = generateInsights(result);
  
  if (insights.length === 0) {
    insights.push('✓ Sistema operando dentro dos parâmetros esperados.');
  }
  
  console.log();
  for (let i = 0; i < insights.length; i++) {
    console.log(`   ${i + 1}. ${insights[i]}`);
  }
  console.log();
}

async function runVisualSimulation(config: VisualConfig) {
  displayHeader();
  
  console.log(`⚙️  Configuração: ED01 - Colapso da Interface`);
  console.log(`📦 Boosters: ${config.boosters}`);
  console.log(`💳 Preço: R$ 0.50 por booster (5 cartas)`);
  console.log(`\n⏳ Processando simulação...\n`);
  
  const engine = new SimulationEngine(ED01_CONFIG);
  const result = engine.simulate(config.boosters);
  
  displayEconomics(result);
  displayViability(result);
  
  if (config.showDistribution) {
    displayRarityDistribution(result);
    displayModeDistribution(result);
  }
  
  if (config.showPrizes) {
    displayPrizeBreakdown(result);
    displayGodmodeCorrelation(result);
  }
  
  if (config.showCards) {
    displaySampleCards(result, 15);
  }
  
  displayInsights(result);
  
  console.log('═'.repeat(80));
  console.log('✅ Simulação concluída!');
  console.log('═'.repeat(80) + '\n');
}

// CLI
const args = process.argv.slice(2);
const boosters = parseInt(args[0]) || 1000;
const showCards = args.includes('--cards');
const showAll = args.includes('--all');

runVisualSimulation({
  boosters,
  showCards: showCards || showAll,
  showDistribution: true,
  showPrizes: true,
});
