/**
 * 📈 KROOVA SIMULATION REPORTER
 * 
 * Gera relatórios formatados e exporta dados
 */

import { writeFileSync } from "fs";
import { join } from "path";
import type { SimulationResult } from "./engine.js";

export interface Statistics {
  avgProfit: number;
  stdDevProfit: number;
  minProfit: number;
  maxProfit: number;
  avgMargin: number;
  stdDevMargin: number;
  minMargin: number;
  maxMargin: number;
  avgRecycle: number;
  stdDevRecycle: number;
  avgJackpots: number;
  stdDevJackpots: number;
}

export class SimulationReporter {
  /**
   * Calcula estatísticas de múltiplas simulações
   */
  static calculateStats(results: SimulationResult[]): Statistics {
    const profits = results.map((r) => r.netProfit);
    const margins = results.map((r) => r.profitMargin);
    const recycleValues = results.map((r) => r.totalRecycleValue);
    const jackpots = results.map((r) => r.totalJackpots);

    const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
    const stdDev = (arr: number[]) => {
      const mean = avg(arr);
      const variance =
        arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / arr.length;
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

  /**
   * Imprime relatório no console
   */
  static printConsoleReport(
    results: SimulationResult[],
    stats: Statistics,
    detailed = false,
  ): void {
    const firstResult = results[0];
    const config = firstResult.config;

    console.log("\n" + "=".repeat(70));
    console.log("🃏 KROOVA SIMULATION REPORT");
    console.log("=".repeat(70));

    console.log(`\n📊 CONFIGURAÇÃO: ${config.name}`);
    console.log(`   Data: ${new Date().toLocaleString("pt-BR")}`);
    console.log(`   Simulações: ${results.length}x de ${firstResult.totalBoosters} boosters`);
    console.log(`   Total de cartas: ${firstResult.totalCards * results.length}`);

    console.log("\n💰 ECONOMIA:");
    console.log(
      `   Receita por rodada: R$ ${firstResult.totalRevenue.toFixed(2)}`,
    );
    console.log(
      `   Reciclagem Média: R$ ${stats.avgRecycle.toFixed(2)} (±${stats.stdDevRecycle.toFixed(2)})`,
    );
    console.log(
      `   Jackpots Médios: R$ ${stats.avgJackpots.toFixed(2)} (±${stats.stdDevJackpots.toFixed(2)})`,
    );
    console.log(
      `   Custos Operacionais: R$ ${firstResult.operationalCosts.toFixed(2)}`,
    );

    console.log("\n💎 LUCRO:");
    console.log(
      `   Lucro Médio: R$ ${stats.avgProfit.toFixed(2)} (±${stats.stdDevProfit.toFixed(2)})`,
    );
    console.log(
      `   Margem Média: ${stats.avgMargin.toFixed(2)}% (±${stats.stdDevMargin.toFixed(2)}%)`,
    );
    console.log(
      `   Range: R$ ${stats.minProfit.toFixed(2)} até R$ ${stats.maxProfit.toFixed(2)}`,
    );

    if (detailed) {
      console.log("\n🎲 DISTRIBUIÇÃO MÉDIA DE RARIDADES:");
      const avgRarities: Record<string, number> = {};
      for (const result of results) {
        for (const [rarity, count] of Object.entries(result.rarityCount)) {
          avgRarities[rarity] = (avgRarities[rarity] || 0) + count / results.length;
        }
      }
      for (const [rarity, count] of Object.entries(avgRarities)) {
        const percentage = (count / firstResult.totalCards) * 100;
        const expected = config.rarityDistribution[rarity] || 0;
        const diff = percentage - expected;
        console.log(
          `   ${rarity.padEnd(10)}: ${count.toFixed(0).padStart(5)} ` +
            `(${percentage.toFixed(2)}% vs ${expected.toFixed(2)}% esperado, ` +
            `diff: ${diff >= 0 ? "+" : ""}${diff.toFixed(2)}%)`,
        );
      }

      console.log("\n🌟 GODMODE JACKPOTS:");
      const avgGodmodes =
        results.reduce((sum, r) => sum + r.godmodeCount, 0) / results.length;
      console.log(
        `   Média: ${avgGodmodes.toFixed(1)} (${((avgGodmodes / firstResult.totalCards) * 100).toFixed(4)}%)`,
      );
    }

    console.log("\n📈 VIABILIDADE:");
    const ltv = stats.avgProfit;
    const cac = config.costs.marketing_cac;
    const ratio = ltv / cac;

    console.log(`   CAC: R$ ${cac.toFixed(2)}`);
    console.log(`   LTV (${firstResult.totalBoosters} boosters): R$ ${ltv.toFixed(2)}`);
    console.log(`   LTV/CAC Ratio: ${ratio.toFixed(2)}x`);

    if (ratio > 3) {
      console.log(`   ✅ VIÁVEL: Ratio ${ratio.toFixed(1)}x é excelente`);
    } else if (ratio > 1) {
      console.log(`   ⚠️  MARGEM APERTADA: Ratio ${ratio.toFixed(1)}x é baixo`);
    } else {
      console.log(`   ❌ INVIÁVEL: LTV menor que CAC`);
    }

    console.log("\n" + "=".repeat(70));
  }

  /**
   * Salva resultados em JSON
   */
  static saveJSON(
    results: SimulationResult[],
    stats: Statistics,
    filename?: string,
  ): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const outputFilename = filename || `simulation_${timestamp}.json`;
    const outputPath = join(
      process.cwd(),
      "tests",
      "simulation",
      "results",
      outputFilename,
    );

    const output = {
      metadata: {
        generatedAt: new Date().toISOString(),
        totalSimulations: results.length,
        boostersPerSimulation: results[0]?.totalBoosters,
        totalCardsSimulated: results.reduce((sum, r) => sum + r.totalCards, 0),
      },
      config: results[0]?.config,
      statistics: stats,
      results: results.map((r) => ({
        ...r,
        cards: undefined, // Remove cards para reduzir tamanho do arquivo
      })),
    };

    writeFileSync(outputPath, JSON.stringify(output, null, 2));
    return outputPath;
  }

  /**
   * Salva cartas detalhadas em CSV
   */
  static saveCSV(result: SimulationResult, filename?: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const outputFilename = filename || `cards_${timestamp}.csv`;
    const outputPath = join(
      process.cwd(),
      "tests",
      "simulation",
      "results",
      outputFilename,
    );

    const headers = [
      "Booster",
      "Card",
      "Raridade",
      "Modo",
      "Godmode",
      "Premio",
      "Valor",
    ];

    const rows = result.cards.map((card) => [
      card.boosterNumber,
      card.cardNumber,
      card.rarity,
      card.mode,
      card.isGodmode ? "SIM" : "NAO",
      card.godmodePrize > 0 ? card.godmodePrize.toFixed(2) : "",
      card.recycleValue.toFixed(4),
    ]);

    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    writeFileSync(outputPath, csv, "utf-8");
    return outputPath;
  }

  /**
   * Gera relatório Markdown completo
   */
  static generateMarkdownReport(
    results: SimulationResult[],
    stats: Statistics,
  ): string {
    const firstResult = results[0];
    const config = firstResult.config;
    const timestamp = new Date().toISOString();

    const markdown = `# 🎰 Relatório de Simulação - ${config.name}

**Data:** ${new Date().toLocaleString("pt-BR")}  
**Simulações:** ${results.length}x de ${firstResult.totalBoosters} boosters  
**Total de cartas:** ${firstResult.totalCards * results.length}  

---

## 📊 Resumo Executivo

### Lucratividade

| Métrica | Valor |
|---------|-------|
| **Lucro Médio** | R$ ${stats.avgProfit.toFixed(2)} (±${stats.stdDevProfit.toFixed(2)}) |
| **Margem Média** | ${stats.avgMargin.toFixed(2)}% (±${stats.stdDevMargin.toFixed(2)}%) |
| **Range de Lucro** | R$ ${stats.minProfit.toFixed(2)} a R$ ${stats.maxProfit.toFixed(2)} |
| **LTV/CAC Ratio** | ${(stats.avgProfit / config.costs.marketing_cac).toFixed(2)}x |

### Economia

| Métrica | Valor |
|---------|-------|
| Receita por ${firstResult.totalBoosters} boosters | R$ ${firstResult.totalRevenue.toFixed(2)} |
| Reciclagem Média | R$ ${stats.avgRecycle.toFixed(2)} |
| Jackpots Médios | R$ ${stats.avgJackpots.toFixed(2)} |
| Custos Operacionais | R$ ${firstResult.operationalCosts.toFixed(2)} |

---

## 🎲 Distribuição de Cartas

${this.generateRarityTable(results, config)}

---

## 🌟 Análise de Godmodes

${this.generateGodmodeAnalysis(results, firstResult)}

---

## 📈 Conclusão

${this.generateConclusion(stats, config)}

---

*Relatório gerado automaticamente em ${timestamp}*
`;

    return markdown;
  }

  /**
   * Salva relatório Markdown
   */
  static saveMarkdownReport(
    results: SimulationResult[],
    stats: Statistics,
    filename?: string,
  ): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const outputFilename = filename || `report_${timestamp}.md`;
    const outputPath = join(
      process.cwd(),
      "tests",
      "simulation",
      "reports",
      outputFilename,
    );

    const markdown = this.generateMarkdownReport(results, stats);
    writeFileSync(outputPath, markdown, "utf-8");

    return outputPath;
  }

  private static generateRarityTable(
    results: SimulationResult[],
    config: any,
  ): string {
    const avgRarities: Record<string, number> = {};
    const totalCards = results[0].totalCards;

    for (const result of results) {
      for (const [rarity, count] of Object.entries(result.rarityCount)) {
        avgRarities[rarity] = (avgRarities[rarity] || 0) + count / results.length;
      }
    }

    let table = "| Raridade | Quantidade | % Real | % Esperado | Diferença |\n";
    table += "|----------|------------|--------|------------|-----------||\n";

    for (const [rarity, count] of Object.entries(avgRarities)) {
      const percentage = (count / totalCards) * 100;
      const expected = config.rarityDistribution[rarity] || 0;
      const diff = percentage - expected;
      const status = Math.abs(diff) < 0.5 ? "✅" : "⚠️";

      table += `| ${rarity} | ${count.toFixed(0)} | ${percentage.toFixed(2)}% | ${expected.toFixed(2)}% | ${diff >= 0 ? "+" : ""}${diff.toFixed(2)}% ${status} |\n`;
    }

    return table;
  }

  private static generateGodmodeAnalysis(
    results: SimulationResult[],
    firstResult: SimulationResult,
  ): string {
    const avgGodmodes =
      results.reduce((sum, r) => sum + r.godmodeCount, 0) / results.length;
    const percentage = (avgGodmodes / firstResult.totalCards) * 100;

    let analysis = `Média de Godmodes: **${avgGodmodes.toFixed(1)}** (${percentage.toFixed(4)}%)\n\n`;

    const allPrizes: Record<number, number> = {};
    for (const result of results) {
      for (const [prize, count] of Object.entries(result.godmodePrizeBreakdown)) {
        allPrizes[Number(prize)] = (allPrizes[Number(prize)] || 0) + count / results.length;
      }
    }

    if (Object.keys(allPrizes).length > 0) {
      analysis += "### Breakdown por Valor\n\n";
      analysis += "| Prêmio | Quantidade Média | Valor Total |\n";
      analysis += "|--------|------------------|-------------|\n";

      for (const [prize, count] of Object.entries(allPrizes).sort(
        (a, b) => Number(b[0]) - Number(a[0]),
      )) {
        const value = count * Number(prize);
        analysis += `| R$ ${prize} | ${count.toFixed(1)}x | R$ ${value.toFixed(2)} |\n`;
      }
    }

    return analysis;
  }

  private static generateConclusion(stats: Statistics, config: any): string {
    const ratio = stats.avgProfit / config.costs.marketing_cac;
    let conclusion = "";

    if (ratio > 3) {
      conclusion = `✅ **MODELO VIÁVEL**: Com margem de ${stats.avgMargin.toFixed(1)}% e LTV/CAC de ${ratio.toFixed(1)}x, o modelo é altamente lucrativo e escalável.`;
    } else if (ratio > 1) {
      conclusion = `⚠️ **MARGEM APERTADA**: Com LTV/CAC de ${ratio.toFixed(1)}x, o modelo é viável mas tem pouca margem para otimização.`;
    } else {
      conclusion = `❌ **MODELO INVIÁVEL**: O LTV (R$ ${stats.avgProfit.toFixed(2)}) não cobre o CAC (R$ ${config.costs.marketing_cac.toFixed(2)}).`;
    }

    conclusion += `\n\nA variação de ±${stats.stdDevMargin.toFixed(1)}% na margem é ${stats.stdDevMargin > 20 ? "alta" : "aceitável"}, `;
    conclusion += stats.stdDevMargin > 20
      ? "sugerindo necessidade de maior volume para estabilizar resultados."
      : "indicando previsibilidade adequada.";

    return conclusion;
  }
}
