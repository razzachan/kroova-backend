#!/usr/bin/env node
/**
 * 📊 KROOVA SIMULATION DASHBOARD
 * 
 * Visualiza histórico de simulações e tendências
 */

import { readdirSync, readFileSync, statSync } from "fs";
import { join } from "path";

const RESULTS_DIR = join(process.cwd(), "tests", "simulation", "results");

interface HistoryEntry {
  filename: string;
  date: Date;
  config: string;
  boosters: number;
  iterations: number;
  avgProfit: number;
  avgMargin: number;
  ratio: number;
}

function loadHistory(): HistoryEntry[] {
  try {
    const files = readdirSync(RESULTS_DIR).filter((f) => f.endsWith(".json"));
    const entries: HistoryEntry[] = [];

    for (const file of files) {
      const path = join(RESULTS_DIR, file);
      const content = readFileSync(path, "utf-8");
      const data = JSON.parse(content);

      if (data.statistics && data.config) {
        const stats = statSync(path);
        entries.push({
          filename: file,
          date: stats.mtime,
          config: data.config.name || "Unknown",
          boosters: data.metadata?.boostersPerSimulation || 0,
          iterations: data.metadata?.totalSimulations || 0,
          avgProfit: data.statistics.avgProfit || 0,
          avgMargin: data.statistics.avgMargin || 0,
          ratio:
            data.statistics.avgProfit / (data.config.costs?.marketing_cac || 1),
        });
      }
    }

    return entries.sort((a, b) => b.date.getTime() - a.date.getTime());
  } catch (error) {
    return [];
  }
}

function printDashboard(entries: HistoryEntry[]): void {
  console.log("\n" + "=".repeat(80));
  console.log("📊 KROOVA SIMULATION DASHBOARD");
  console.log("=".repeat(80));

  if (entries.length === 0) {
    console.log("\n⚠️  Nenhuma simulação encontrada. Rode: npm run simulate\n");
    return;
  }

  console.log(`\n📈 Total de simulações: ${entries.length}`);
  console.log(`📅 Última simulação: ${entries[0].date.toLocaleString("pt-BR")}`);

  console.log("\n" + "-".repeat(80));
  console.log("📋 HISTÓRICO RECENTE (últimas 10 simulações)\n");

  const recent = entries.slice(0, 10);

  console.log(
    "| Data/Hora | Config | Boosters | Lucro | Margem | Ratio | Status |",
  );
  console.log("|" + "-".repeat(78) + "|");

  for (const entry of recent) {
    const date = entry.date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
    const status = entry.ratio > 3 ? "✅" : entry.ratio > 1 ? "⚠️" : "❌";
    const configShort = entry.config.substring(0, 20).padEnd(20);

    console.log(
      `| ${date.padEnd(9)} | ${configShort} | ${entry.boosters.toString().padStart(8)} | ` +
        `R$ ${entry.avgProfit.toFixed(0).padStart(5)} | ${entry.avgMargin.toFixed(1).padStart(5)}% | ` +
        `${entry.ratio.toFixed(1).padStart(5)}x | ${status.padEnd(6)} |`,
    );
  }

  console.log("\n" + "-".repeat(80));
  console.log("📊 ESTATÍSTICAS AGREGADAS\n");

  const avgProfit = entries.reduce((sum, e) => sum + e.avgProfit, 0) / entries.length;
  const avgMargin = entries.reduce((sum, e) => sum + e.avgMargin, 0) / entries.length;
  const avgRatio = entries.reduce((sum, e) => sum + e.ratio, 0) / entries.length;

  console.log(`   Lucro Médio (todas as simulações): R$ ${avgProfit.toFixed(2)}`);
  console.log(`   Margem Média: ${avgMargin.toFixed(1)}%`);
  console.log(`   LTV/CAC Ratio Médio: ${avgRatio.toFixed(1)}x`);

  const bestEntry = entries.reduce((prev, curr) =>
    curr.avgProfit > prev.avgProfit ? curr : prev,
  );
  const worstEntry = entries.reduce((prev, curr) =>
    curr.avgProfit < prev.avgProfit ? curr : prev,
  );

  console.log(`\n   🏆 Melhor resultado: R$ ${bestEntry.avgProfit.toFixed(2)} (${bestEntry.config})`);
  console.log(`   📉 Pior resultado: R$ ${worstEntry.avgProfit.toFixed(2)} (${worstEntry.config})`);

  // Análise por config
  const byConfig: Record<string, HistoryEntry[]> = {};
  for (const entry of entries) {
    if (!byConfig[entry.config]) {
      byConfig[entry.config] = [];
    }
    byConfig[entry.config].push(entry);
  }

  console.log("\n" + "-".repeat(80));
  console.log("🎯 PERFORMANCE POR CONFIGURAÇÃO\n");

  for (const [config, configEntries] of Object.entries(byConfig)) {
    if (configEntries.length > 0) {
      const avg =
        configEntries.reduce((sum, e) => sum + e.avgProfit, 0) / configEntries.length;
      const count = configEntries.length;
      console.log(`   ${config}:`);
      console.log(`      Simulações: ${count}`);
      console.log(`      Lucro Médio: R$ ${avg.toFixed(2)}`);
    }
  }

  console.log("\n" + "=".repeat(80));
  console.log("💡 COMANDOS ÚTEIS:");
  console.log("   npm run simulate              # Nova simulação");
  console.log("   npm run simulate:compare      # Comparar configs");
  console.log("   npm run simulate:deep         # Simulação profunda");
  console.log("=".repeat(80) + "\n");
}

// ========================================
// MAIN
// ========================================

const entries = loadHistory();
printDashboard(entries);
