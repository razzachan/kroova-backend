// ==========================================================================
// TESTE: Prize Calculator - Validar distribuição de RTP
// ==========================================================================
import { calculateBoosterPrize, calculateExpectedRTP, simulateOpenings } from '../lib/prizeCalculator';

const tiers = ['Básico', 'Padrão', 'Premium', 'Elite', 'Whale'];
const prices = [0.50, 1.00, 2.00, 5.00, 10.00];

console.log('==========================================================================');
console.log('🎰 TESTE DO SISTEMA DE PRÊMIOS - SLOT MACHINE');
console.log('==========================================================================\n');

// Testar RTP esperado teórico
console.log('📊 RTP MÉDIO ESPERADO (TEÓRICO):');
console.log('─'.repeat(70));
tiers.forEach((tier, index) => {
  const expectedRtp = calculateExpectedRTP(tier as any);
  const houseEdge = (100 - expectedRtp).toFixed(2);
  console.log(`${tier.padEnd(10)} → RTP: ${expectedRtp.toFixed(2)}% | House Edge: ${houseEdge}%`);
});

console.log('\n');
console.log('🎲 SIMULAÇÃO: 10,000 aberturas por tier');
console.log('─'.repeat(70));

tiers.forEach((tier, index) => {
  const boosterType = {
    id: `test-${tier}`,
    name: `${tier} Alpha`,
    price_brl: prices[index],
    tier
  };
  
  const results = simulateOpenings(boosterType, 10000);
  
  console.log(`\n${tier} (R$ ${prices[index].toFixed(2)}):`);
  console.log(`  Total gasto: R$ ${results.total_spent.toFixed(2)}`);
  console.log(`  Total ganho: R$ ${results.total_won.toFixed(2)}`);
  console.log(`  RTP Real: ${results.avg_rtp.toFixed(2)}%`);
  console.log(`  House Edge Real: ${(100 - results.avg_rtp).toFixed(2)}%`);
  console.log(`  Distribuição:`);
  console.log(`    - Loss: ${results.distribution.loss} (${(results.distribution.loss/100).toFixed(1)}%)`);
  console.log(`    - Near Even: ${results.distribution.near_even} (${(results.distribution.near_even/100).toFixed(1)}%)`);
  console.log(`    - Small Win: ${results.distribution.small_win} (${(results.distribution.small_win/100).toFixed(1)}%)`);
  console.log(`    - Jackpot: ${results.distribution.jackpot} (${(results.distribution.jackpot/100).toFixed(1)}%)`);
  
  if (results.biggest_win) {
    console.log(`  Maior Jackpot: R$ ${results.biggest_win.prize_amount_brl.toFixed(2)} (${results.biggest_win.rtp_percentage.toFixed(0)}% RTP) 🎰`);
  }
});

console.log('\n');
console.log('✅ VALIDAÇÃO:');
console.log('─'.repeat(70));
console.log('✓ RTPs médios devem ficar entre 30-45% (house edge 55-70%)');
console.log('✓ Jackpots devem ocorrer ~1% das vezes');
console.log('✓ Losses devem ocorrer 50-75% das vezes (dependendo do tier)');
console.log('✓ Jackpots no Whale devem chegar a 800-1500% RTP');
console.log('==========================================================================');
