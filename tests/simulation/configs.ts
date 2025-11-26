/**
 * 📊 KROOVA SIMULATION CONFIGS
 * 
 * Configurações pré-definidas para diferentes edições e cenários
 */

import type { EditionConfig } from "./engine.js";

/**
 * Edição 01 - Colapso da Interface (configuração atual)
 */
export const ED01_CONFIG: EditionConfig = {
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
  
  costs: {
    payment_gateway: 0.04,
    server_per_booster: 0.001,
    support_per_user: 0.05,
    marketing_cac: 2.00,
  },
};

/**
 * Cenário Conservador - RTP mais baixo (para testar viabilidade mínima)
 */
export const CONSERVATIVE_CONFIG: EditionConfig = {
  ...ED01_CONFIG,
  name: "Cenário Conservador (RTP 12%)",
  rtpTotal: 0.12,
};

/**
 * Cenário Agressivo - RTP mais alto (para testar com mais prêmios)
 */
export const AGGRESSIVE_CONFIG: EditionConfig = {
  ...ED01_CONFIG,
  name: "Cenário Agressivo (RTP 25%)",
  rtpTotal: 0.25,
};

/**
 * Booster Premium - Preço mais alto com mais cartas
 */
export const PREMIUM_BOOSTER: EditionConfig = {
  ...ED01_CONFIG,
  name: "Booster Premium (R$ 1.00 / 10 cartas)",
  boosterPrice: 1.00,
  cardsPerBooster: 10,
  rtpTotal: 0.20,
};

/**
 * Booster Mini - Preço mais baixo com menos cartas
 */
export const MINI_BOOSTER: EditionConfig = {
  ...ED01_CONFIG,
  name: "Booster Mini (R$ 0.25 / 3 cartas)",
  boosterPrice: 0.25,
  cardsPerBooster: 3,
  rtpTotal: 0.15,
};

/**
 * Cenário Alto CAC - Marketing caro
 */
export const HIGH_CAC_CONFIG: EditionConfig = {
  ...ED01_CONFIG,
  name: "Alto CAC (R$ 5.00)",
  costs: {
    ...ED01_CONFIG.costs,
    marketing_cac: 5.00,
  },
};

/**
 * Cenário Baixo CAC - Marketing eficiente
 */
export const LOW_CAC_CONFIG: EditionConfig = {
  ...ED01_CONFIG,
  name: "Baixo CAC (R$ 0.50)",
  costs: {
    ...ED01_CONFIG.costs,
    marketing_cac: 0.50,
  },
};

/**
 * Mapa de configurações disponíveis
 */
export const CONFIGS: Record<string, EditionConfig> = {
  ED01: ED01_CONFIG,
  CONSERVATIVE: CONSERVATIVE_CONFIG,
  AGGRESSIVE: AGGRESSIVE_CONFIG,
  PREMIUM: PREMIUM_BOOSTER,
  MINI: MINI_BOOSTER,
  HIGH_CAC: HIGH_CAC_CONFIG,
  LOW_CAC: LOW_CAC_CONFIG,
};
