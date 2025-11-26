#!/usr/bin/env node
/**
 * 🎰 KROOVA SIMULATION CLI
 * 
 * Interface de linha de comando para rodar simulações
 * 
 * Uso:
 *   npm run simulate                          # Simula ED01 padrão
 *   npm run simulate -- --config PREMIUM      # Simula config específica
 *   npm run simulate -- --boosters 5000       # Simula 5000 boosters
 *   npm run simulate -- --iterations 20       # Roda 20 simulações
 *   npm run simulate -- --compare             # Compara todas as configs
 */

import { SimulationEngine } from "./engine.js";
import { CONFIGS, ED01_CONFIG } from "./configs.js";
import { SimulationReporter } from "./reporter.js";

interface CLIOptions {
  config: string;
  boosters: number;
  iterations: number;
  compare: boolean;
  detailed: boolean;
  csv: boolean;
  help: boolean;
}

function parseArgs(): CLIOptions {
  const args = process.argv.slice(2);
  const options: CLIOptions = {
    config: "ED01",
    boosters: 1000,
    iterations: 10,
    compare: false,
    detailed: false,
    csv: false,
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else if (arg === "--config" || arg === "-c") {
      options.config = args[++i];
    } else if (arg === "--boosters" || arg === "-b") {
      options.boosters = parseInt(args[++i]);
    } else if (arg === "--iterations" || arg === "-i") {
      options.iterations = parseInt(args[++i]);
    } else if (arg === "--compare") {
      options.compare = true;
    } else if (arg === "--detailed" || arg === "-d") {
      options.detailed = true;
    } else if (arg === "--csv") {
      options.csv = true;
    }
  }

  return options;
}

function printHelp(): void {
  console.log(`
🎰 KROOVA SIMULATION CLI

USAGE:
  npm run simulate [options]

OPTIONS:
  --config, -c <name>      Configuração a usar (padrão: ED01)
  --boosters, -b <number>  Número de boosters por simulação (padrão: 1000)
  --iterations, -i <number> Número de simulações (padrão: 10)
  --detailed, -d           Mostra distribuição detalhada
  --csv                    Exporta cartas para CSV
  --compare                Compara todas as configurações
  --help, -h               Mostra esta ajuda

CONFIGS DISPONÍVEIS:
  ED01         - Configuração padrão (R$ 0.50, RTP 18%)
  CONSERVATIVE - RTP conservador (12%)
  AGGRESSIVE   - RTP agressivo (25%)
  PREMIUM      - Booster premium (R$ 1.00, 10 cartas)
  MINI         - Booster mini (R$ 0.25, 3 cartas)
  HIGH_CAC     - Alto custo de aquisição (R$ 5.00)
  LOW_CAC      - Baixo custo de aquisição (R$ 0.50)

EXEMPLOS:
  npm run simulate
  npm run simulate -- --config PREMIUM --boosters 5000
  npm run simulate -- --iterations 20 --detailed
  npm run simulate -- --compare
  npm run simulate -- --csv
  `);
}

function runSingleSimulation(options: CLIOptions): void {
  const config = CONFIGS[options.config];

  if (!config) {
    console.error(`❌ Configuração "${options.config}" não encontrada`);
    console.log(`\nConfigs disponíveis: ${Object.keys(CONFIGS).join(", ")}`);
    process.exit(1);
  }

  console.log(`\n🚀 Iniciando simulação: ${config.name}`);
  console.log(`   Boosters: ${options.boosters}`);
  console.log(`   Iterações: ${options.iterations}\n`);

  const engine = new SimulationEngine(config);
  const results = engine.runMultiple(options.iterations, options.boosters);
  const stats = SimulationReporter.calculateStats(results);

  SimulationReporter.printConsoleReport(results, stats, options.detailed);

  // Salva resultados
  const jsonPath = SimulationReporter.saveJSON(results, stats);
  console.log(`\n💾 Resultados salvos em: ${jsonPath}`);

  const mdPath = SimulationReporter.saveMarkdownReport(results, stats);
  console.log(`📄 Relatório Markdown: ${mdPath}`);

  // Exporta CSV se solicitado
  if (options.csv && results.length > 0) {
    const csvPath = SimulationReporter.saveCSV(results[0]);
    console.log(`📊 CSV exportado: ${csvPath}`);
  }

  console.log("\n✅ Simulação concluída!\n");
}

function runComparison(options: CLIOptions): void {
  console.log("\n🔬 COMPARAÇÃO DE CONFIGURAÇÕES\n");
  console.log("=".repeat(70));

  const results: Array<{
    config: string;
    stats: any;
  }> = [];

  for (const [name, config] of Object.entries(CONFIGS)) {
    console.log(`\n🎯 Simulando: ${config.name}...`);

    const engine = new SimulationEngine(config);
    const simResults = engine.runMultiple(options.iterations, options.boosters);
    const stats = SimulationReporter.calculateStats(simResults);

    results.push({ config: name, stats });

    console.log(
      `   Lucro Médio: R$ ${stats.avgProfit.toFixed(2)} | Margem: ${stats.avgMargin.toFixed(1)}%`,
    );
  }

  console.log("\n" + "=".repeat(70));
  console.log("📊 COMPARAÇÃO FINAL\n");

  console.log(
    "| Config | Lucro | Margem | LTV/CAC | Status |".padEnd(70) + "|",
  );
  console.log("|" + "-".repeat(68) + "|");

  for (const { config, stats } of results) {
    const configObj = CONFIGS[config];
    const ratio = stats.avgProfit / configObj.costs.marketing_cac;
    const status = ratio > 3 ? "✅" : ratio > 1 ? "⚠️" : "❌";

    const line = `| ${config.padEnd(12)} | R$ ${stats.avgProfit.toFixed(2).padStart(6)} | ${stats.avgMargin.toFixed(1).padStart(5)}% | ${ratio.toFixed(1).padStart(7)}x | ${status.padEnd(6)} |`;
    console.log(line);
  }

  console.log("\n" + "=".repeat(70));

  // Identifica melhor configuração
  const best = results.reduce((prev, curr) =>
    curr.stats.avgProfit > prev.stats.avgProfit ? curr : prev,
  );

  console.log(`\n🏆 MELHOR CONFIGURAÇÃO: ${CONFIGS[best.config].name}`);
  console.log(
    `   Lucro: R$ ${best.stats.avgProfit.toFixed(2)} | Margem: ${best.stats.avgMargin.toFixed(1)}%`,
  );
  console.log("\n");
}

// ========================================
// MAIN
// ========================================

const options = parseArgs();

if (options.help) {
  printHelp();
  process.exit(0);
}

if (options.compare) {
  runComparison(options);
} else {
  runSingleSimulation(options);
}
