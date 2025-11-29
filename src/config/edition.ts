export interface EditionConfig {
  id: string;
  boosterPriceBrl: number;
  cardsPerBooster: number;
  rarityDistribution: Record<string, number>; // % total ≈ 100
  plannedJackpotRtpPct: number; // fraction (e.g. 0.054)
  rtpTotalTargetPct?: number; // overall RTP target (0-1 fraction)
  rtpSplit?: { recyclingNormalPct: number; jackpotsPct: number }; // fractions of RTP total
  skins?: { name: string; weight: number; multiplier: number }[]; // future expansion
  // Pity system flags (phase1 only tracking attempts)
  pityEnabled?: boolean;
  pityCapMultiplier?: number; // planned cap multiplier for probability (phase2)
  pityThresholds?: number[]; // marcos de tentativas
  pityIncrements?: number[]; // incrementos relativos (multiplicador sobre basePct, ex 0.10 => +10% da base)
  pityRewardType?: string; // Tipo de recompensa do pity system
  pityRewardQuantity?: number; // Quantidade de boosters na recompensa
  skinEconomyEnabled?: boolean; // controla aplicação de multiplicador em reciclagem/marketplace
}

const ED01: EditionConfig = {
  id: 'ED01',
  boosterPriceBrl: 0.5,
  cardsPerBooster: 5,
  rarityDistribution: { trash: 60, meme: 25, viral: 10, legendary: 4, godmode: 1 },
  plannedJackpotRtpPct: 0.054, // 5.4% do preço do booster destinado a jackpots escalonados por booster
  rtpTotalTargetPct: 0.18, // 18% global (exemplo)
  rtpSplit: { recyclingNormalPct: 0.7, jackpotsPct: 0.3 },
  skins: [
    { name: 'default', weight: 70, multiplier: 1 },
    { name: 'neon', weight: 12, multiplier: 2 },
    { name: 'glow', weight: 8, multiplier: 3 },
    { name: 'glitch', weight: 5, multiplier: 4 },
    { name: 'ghost', weight: 3, multiplier: 6 },
    { name: 'holo', weight: 1.5, multiplier: 8 },
    { name: 'dark', weight: 0.5, multiplier: 12 },
  ],
  pityEnabled: true, // ATIVADO: 3 boosters grátis a cada 50 boosters (RTP +6%)
  pityCapMultiplier: 2,
  pityThresholds: [50], // A cada 50 boosters = 3 boosters grátis
  pityIncrements: [0], // Não aumenta chance de Godmode, apenas premia com boosters
  pityRewardType: 'free_booster', // Tipo de recompensa
  pityRewardQuantity: 3, // Quantidade de boosters na recompensa
  skinEconomyEnabled: true,
};

const editions: Record<string, EditionConfig> = { [ED01.id]: ED01 };

export function getEditionConfig(id: string): EditionConfig | undefined {
  return editions[id];
}

export function listEditionConfigs(): EditionConfig[] {
  return Object.values(editions);
}
