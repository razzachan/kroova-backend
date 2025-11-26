/**
 * 🧪 TESTE DE VALIDAÇÃO: Sistema de Correlação Godmode
 * 
 * Este script valida que prêmios Godmode estão correlacionados
 * corretamente com raridade e modo visual das cartas
 */

import { SimulationEngine } from './engine';
import { ED01_CONFIG } from './configs';

interface CorrelationTest {
  rarity: string;
  mode: string;
  expectedScoreMin: number;
  expectedScoreMax: number;
  expectedPrizes: number[];
}

const CORRELATION_TESTS: CorrelationTest[] = [
  {
    rarity: 'trash',
    mode: 'default',
    expectedScoreMin: 1.0,
    expectedScoreMax: 1.0,
    expectedPrizes: [5],
  },
  {
    rarity: 'legendary',
    mode: 'dark',
    expectedScoreMin: 10.0,
    expectedScoreMax: 10.0,
    expectedPrizes: [100, 200],
  },
  {
    rarity: 'legendary',
    mode: 'holo',
    expectedScoreMin: 7.6,
    expectedScoreMax: 7.6,
    expectedPrizes: [50, 100],
  },
  {
    rarity: 'legendary',
    mode: 'ghost',
    expectedScoreMin: 6.4,
    expectedScoreMax: 6.4,
    expectedPrizes: [20, 50],
  },
  {
    rarity: 'viral',
    mode: 'glow',
    expectedScoreMin: 3.4,
    expectedScoreMax: 3.4,
    expectedPrizes: [5, 10],
  },
  {
    rarity: 'meme',
    mode: 'neon',
    expectedScoreMin: 2.0,
    expectedScoreMax: 2.0,
    expectedPrizes: [5],
  },
];

function validateCorrelation() {
  console.log('\n🧪 VALIDAÇÃO DO SISTEMA DE CORRELAÇÃO GODMODE');
  console.log('='.repeat(60));

  const engine = SimulationEngine as any;
  const instance = new SimulationEngine(ED01_CONFIG);

  let allPassed = true;

  for (const test of CORRELATION_TESTS) {
    const score = (instance as any).calculateCardScore(test.rarity, test.mode);
    const eligiblePrizes = (instance as any).getEligiblePrizes(score);

    const scoreMatches =
      score >= test.expectedScoreMin && score <= test.expectedScoreMax;
    const prizesMatch =
      JSON.stringify(eligiblePrizes.sort()) ===
      JSON.stringify(test.expectedPrizes.sort());

    const passed = scoreMatches && prizesMatch;
    allPassed = allPassed && passed;

    console.log(
      `\n${passed ? '✅' : '❌'} ${test.rarity.toUpperCase()} ${test.mode.toUpperCase()}`,
    );
    console.log(`   Score: ${score.toFixed(2)} (esperado: ${test.expectedScoreMin}-${test.expectedScoreMax})`);
    console.log(`   Prêmios: R$ ${eligiblePrizes.join(', ')}`);
    console.log(`   Esperado: R$ ${test.expectedPrizes.join(', ')}`);

    if (!passed) {
      console.log('   ⚠️  FALHOU NA VALIDAÇÃO');
    }
  }

  console.log('\n' + '='.repeat(60));
  if (allPassed) {
    console.log('✅ TODOS OS TESTES PASSARAM!\n');
  } else {
    console.log('❌ ALGUNS TESTES FALHARAM\n');
    process.exit(1);
  }
}

async function runPracticalTest() {
  console.log('\n🎰 TESTE PRÁTICO: Simulando 10.000 boosters');
  console.log('='.repeat(60));

  const engine = new SimulationEngine(ED01_CONFIG);
  const result = engine.simulate(10000);

  const godmodeCards = result.cards.filter((c) => c.isGodmode);
  console.log(`\n📊 Total de Godmodes: ${godmodeCards.length} (${((godmodeCards.length / result.totalCards) * 100).toFixed(3)}%)`);

  // Agrupar por modo
  const byMode: Record<string, { count: number; totalPrize: number }> = {};
  for (const card of godmodeCards) {
    if (!byMode[card.mode]) {
      byMode[card.mode] = { count: 0, totalPrize: 0 };
    }
    byMode[card.mode].count++;
    byMode[card.mode].totalPrize += card.godmodePrize;
  }

  console.log('\n🎨 Prêmio Médio por Modo Visual:');
  const modes = Object.keys(byMode).sort(
    (a, b) => byMode[b].totalPrize / byMode[b].count - byMode[a].totalPrize / byMode[a].count,
  );

  for (const mode of modes) {
    const avg = byMode[mode].totalPrize / byMode[mode].count;
    console.log(`   ${mode.padEnd(8)} | ${byMode[mode].count.toString().padStart(3)} cartas | R$ ${avg.toFixed(2)} (média)`);
  }

  // Verificar correlação
  console.log('\n✅ Validação de Correlação:');
  const defaultAvg = byMode['default']
    ? byMode['default'].totalPrize / byMode['default'].count
    : 0;
  const darkAvg = byMode['dark'] ? byMode['dark'].totalPrize / byMode['dark'].count : 0;
  const holoAvg = byMode['holo'] ? byMode['holo'].totalPrize / byMode['holo'].count : 0;

  if (darkAvg > defaultAvg) {
    console.log('   ✅ Dark tem prêmio médio maior que Default');
  } else {
    console.log('   ⚠️  Dark deveria ter prêmio maior que Default');
  }

  if (holoAvg > defaultAvg) {
    console.log('   ✅ Holo tem prêmio médio maior que Default');
  } else {
    console.log('   ⚠️  Holo deveria ter prêmio maior que Default');
  }

  // Distribuição de prêmios
  const prizeBreakdown: Record<number, number> = {};
  for (const card of godmodeCards) {
    prizeBreakdown[card.godmodePrize] =
      (prizeBreakdown[card.godmodePrize] || 0) + 1;
  }

  console.log('\n💰 Distribuição de Prêmios:');
  const prizes = Object.keys(prizeBreakdown)
    .map(Number)
    .sort((a, b) => b - a);
  for (const prize of prizes) {
    const count = prizeBreakdown[prize];
    const percentage = ((count / godmodeCards.length) * 100).toFixed(1);
    console.log(`   R$ ${prize.toString().padStart(4)} | ${count.toString().padStart(3)}x (${percentage}%)`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Teste prático concluído!\n');
}

async function main() {
  try {
    validateCorrelation();
    await runPracticalTest();
  } catch (error) {
    console.error('\n❌ Erro durante validação:', error);
    process.exit(1);
  }
}

main();
