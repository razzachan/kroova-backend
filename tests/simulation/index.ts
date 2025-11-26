/**
 * 🎰 KROOVA SIMULATION - Public API
 * 
 * Exporta todos os componentes para uso programático
 */

export { SimulationEngine } from "./engine.js";
export type { EditionConfig, Card, SimulationResult } from "./engine.js";

export { SimulationReporter } from "./reporter.js";
export type { Statistics } from "./reporter.js";

export {
  CONFIGS,
  ED01_CONFIG,
  CONSERVATIVE_CONFIG,
  AGGRESSIVE_CONFIG,
  PREMIUM_BOOSTER,
  MINI_BOOSTER,
  HIGH_CAC_CONFIG,
  LOW_CAC_CONFIG,
} from "./configs.js";

/**
 * Atalho para simular rapidamente
 */
export function quickSimulate(
  boosters = 1000,
  iterations = 10,
  configName: keyof typeof CONFIGS = "ED01",
) {
  const { SimulationEngine } = await import("./engine.js");
  const { CONFIGS } = await import("./configs.js");
  const { SimulationReporter } = await import("./reporter.js");

  const config = CONFIGS[configName];
  const engine = new SimulationEngine(config);
  const results = engine.runMultiple(iterations, boosters);
  const stats = SimulationReporter.calculateStats(results);

  return { results, stats };
}
