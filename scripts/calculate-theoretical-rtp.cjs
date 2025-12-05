/**
 * Calcula RTP TEÓRICO do sistema HYBRID (market_tier + skin_boost)
 */

// Valores base APÓS migration (aumentados)
const cardValues = {
  trash: {
    tier1: 0.0086,
    tier2: 0.0086
  },
  meme: {
    tier1: 0.0473,  // × 1.0
    tier2: 0.0710,  // × 1.5
    tier3: 0.1040   // × 2.2
  },
  viral: {
    tier1: 0.1470,  // × 1.0
    tier2: 0.1910,  // × 1.3
    tier3: 0.2646,  // × 1.8
    tier4: 0.3675   // × 2.5
  },
  legendary: {
    tier1: 0.3000,  // × 1.0
    tier2: 0.3600,  // × 1.2
    tier3: 0.5000,  // × 1.5
    tier4: 0.8000,  // × 2.0
    tier5: 1.8000   // × 3.5
  },
  godmode: {
    tier5: 9.8000   // × 7.0
  }
};

// Configuração dos tiers
const tiers = [
  {
    name: 'Básico',
    price: 0.50,
    marketTiers: [1, 2],
    rarity: { trash: 55, meme: 35, viral: 8, legendary: 2, godmode: 0 },
    skinBoost: { default: 82, premium: 15, ghost: 3, holo: 0, dark: 0, glitch: 0 }
  },
  {
    name: 'Padrão',
    price: 1.00,
    marketTiers: [1, 2, 3],
    rarity: { trash: 45, meme: 35, viral: 15, legendary: 5, godmode: 0 },
    skinBoost: { default: 75, premium: 18, ghost: 5, holo: 2, dark: 0, glitch: 0 }
  },
  {
    name: 'Premium',
    price: 2.00,
    marketTiers: [2, 3, 4],
    rarity: { trash: 30, meme: 30, viral: 28, legendary: 11, godmode: 1 },
    skinBoost: { default: 62, premium: 25, ghost: 8, holo: 4, dark: 1, glitch: 0 }
  },
  {
    name: 'Elite',
    price: 5.00,
    marketTiers: [3, 4, 5],
    rarity: { trash: 15, meme: 20, viral: 35, legendary: 26, godmode: 4 },
    skinBoost: { default: 46, premium: 30, ghost: 12, holo: 8, dark: 3, glitch: 1 }
  },
  {
    name: 'Whale',
    price: 10.00,
    marketTiers: [4, 5],
    rarity: { trash: 5, meme: 10, viral: 35, legendary: 40, godmode: 10 },
    skinBoost: { default: 30, premium: 35, ghost: 15, holo: 12, dark: 6, glitch: 2 }
  }
];

const skinMultipliers = {
  default: 1.0,
  premium: 1.5,
  ghost: 3.0,
  holo: 2.5,
  dark: 4.0,
  glitch: 6.0
};

function calculateExpectedValue(tier) {
  let totalValue = 0;
  
  // Para cada raridade
  for (const [rarity, prob] of Object.entries(tier.rarity)) {
    if (prob === 0) continue;
    
    // Valor médio da carta dessa raridade (considerando market_tiers permitidos)
    let avgCardValue = 0;
    const allowedTiers = tier.marketTiers;
    
    if (rarity === 'trash') {
      avgCardValue = cardValues.trash.tier1; // sempre tier 1
    } else if (rarity === 'meme') {
      const validTiers = allowedTiers.filter(t => t <= 3);
      avgCardValue = validTiers.reduce((sum, t) => sum + cardValues.meme[`tier${t}`], 0) / validTiers.length;
    } else if (rarity === 'viral') {
      const validTiers = allowedTiers.filter(t => t <= 4);
      avgCardValue = validTiers.reduce((sum, t) => sum + cardValues.viral[`tier${t}`], 0) / validTiers.length;
    } else if (rarity === 'legendary') {
      const validTiers = allowedTiers.filter(t => t <= 5);
      avgCardValue = validTiers.reduce((sum, t) => sum + cardValues.legendary[`tier${t}`], 0) / validTiers.length;
    } else if (rarity === 'godmode') {
      avgCardValue = cardValues.godmode.tier5;
    }
    
    // Multiplicador médio de skin
    let avgSkinMult = 0;
    for (const [skin, skinProb] of Object.entries(tier.skinBoost)) {
      avgSkinMult += (skinProb / 100) * skinMultipliers[skin];
    }
    
    // Valor esperado dessa raridade = prob × avgCard × avgSkin
    const rarityValue = (prob / 100) * avgCardValue * avgSkinMult;
    totalValue += rarityValue;
    
    console.log(`  ${rarity}: ${prob}% × R$ ${avgCardValue.toFixed(4)} × ${avgSkinMult.toFixed(2)}x = R$ ${rarityValue.toFixed(4)}`);
  }
  
  return totalValue * 5; // 5 cartas por booster
}

console.log('🎰 CÁLCULO DE RTP TEÓRICO - SISTEMA HYBRID\n');
console.log('============================================\n');

for (const tier of tiers) {
  console.log(`${tier.name} (R$ ${tier.price.toFixed(2)}):`);
  console.log(`Market tiers: ${tier.marketTiers.join(', ')}`);
  console.log(`Skins especiais: ${100 - tier.skinBoost.default}%\n`);
  
  const expectedReturn = calculateExpectedValue(tier);
  const rtp = (expectedReturn / tier.price) * 100;
  
  console.log(`Retorno esperado: R$ ${expectedReturn.toFixed(2)}`);
  console.log(`RTP: ${rtp.toFixed(1)}%`);
  console.log(`Status: ${rtp >= 65 && rtp <= 75 ? '✅ OK' : rtp < 65 ? '⚠️ Baixo' : '⚠️ Alto'}`);
  console.log('\n' + '='.repeat(44) + '\n');
}
