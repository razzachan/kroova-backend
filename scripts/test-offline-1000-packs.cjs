/**
 * TESTE OFFLINE COMPLETO - 1000 boosters por tier
 * Simula sistema HYBRID (market_tier + skin_boost)
 */

const https = require('https');

const SUPABASE_URL = 'mmcytphoeyxeylvaqjgr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tY3l0cGhvZXl4ZXlsdmFxamdyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDExNDIyMCwiZXhwIjoyMDc5NjkwMjIwfQ.mPKc2a3A4kL1LUzX9BjTsaCz3OGAWLGIBYV0TSa20Fw';

// Valores base APÓS migration (aumentados por market_tier)
const cardValuesByTier = {
  trash: {
    1: 0.0086,
    2: 0.0086
  },
  meme: {
    1: 0.0615,  // 0.0473 × 1.3
    2: 0.0946,  // 0.0473 × 2.0
    3: 0.1419   // 0.0473 × 3.0
  },
  viral: {
    1: 0.1764,  // 0.1470 × 1.2
    2: 0.2352,  // 0.1470 × 1.6
    3: 0.3381,  // 0.1470 × 2.3
    4: 0.5145   // 0.1470 × 3.5
  },
  legendary: {
    1: 0.5340,  // 0.4450 × 1.2
    2: 0.7120,  // 0.4450 × 1.6
    3: 0.9790,  // 0.4450 × 2.2
    4: 1.4240,  // 0.4450 × 3.2
    5: 2.2250   // 0.4450 × 5.0
  },
  godmode: {
    5: 5.6000   // 1.40 × 4.0
  }
};

const skinMultipliers = {
  default: 1.0,
  premium: 1.5,
  ghost: 3.0,
  holo: 2.5,
  dark: 4.0,
  glitch: 6.0
};

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: SUPABASE_URL,
      path: path,
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

function getCardValue(rarity, marketTier) {
  if (!cardValuesByTier[rarity]) return 0.01;
  if (!cardValuesByTier[rarity][marketTier]) {
    // Fallback: usar tier mais próximo
    const tiers = Object.keys(cardValuesByTier[rarity]).map(Number);
    const closestTier = tiers.reduce((prev, curr) => 
      Math.abs(curr - marketTier) < Math.abs(prev - marketTier) ? curr : prev
    );
    return cardValuesByTier[rarity][closestTier];
  }
  return cardValuesByTier[rarity][marketTier];
}

function selectSkin(skinBoost) {
  const roll = Math.random() * 100;
  let cumulative = 0;
  
  // Ordem: glitch > dark > ghost > holo > premium > default
  const skins = ['glitch', 'dark', 'ghost', 'holo', 'premium'];
  
  for (const skin of skins) {
    cumulative += skinBoost[skin] || 0;
    if (roll < cumulative) {
      return { type: skin, multiplier: skinMultipliers[skin] };
    }
  }
  
  return { type: 'default', multiplier: 1.0 };
}

function simulateBoosterOpening(tier) {
  const cards = [];
  const { rarity_distribution, market_tier_filter, skin_boost, value_adjustment } = tier;
  
  for (let i = 0; i < 5; i++) {
    // Selecionar raridade
    const rand = Math.random() * 100;
    let cumulative = 0;
    let selectedRarity = 'trash';
    
    for (const [rarity, prob] of Object.entries(rarity_distribution)) {
      cumulative += prob;
      if (rand < cumulative) {
        selectedRarity = rarity;
        break;
      }
    }
    
    // Selecionar market_tier dentro do range permitido
    const minTier = market_tier_filter.min;
    const maxTier = market_tier_filter.max;
    const marketTier = minTier + Math.floor(Math.random() * (maxTier - minTier + 1));
    
    // Valor base da carta
    const baseValue = getCardValue(selectedRarity, marketTier);
    
    // Selecionar skin
    const skin = selectSkin(skin_boost);
    
    // Valor final (aplicar value_adjustment do tier)
    const valueAdj = value_adjustment || 1.0;
    const finalValue = baseValue * skin.multiplier * valueAdj;
    
    cards.push({
      rarity: selectedRarity,
      marketTier,
      baseValue,
      skinType: skin.type,
      skinMultiplier: skin.multiplier,
      valueAdjustment: valueAdj,
      finalValue
    });
  }
  
  return cards;
}

async function runOfflineTest() {
  console.log('🎰 TESTE OFFLINE - 1000 BOOSTERS POR TIER\n');
  console.log('Buscando configurações dos tiers...\n');
  
  // Buscar booster_types
  const tiers = await makeRequest('/rest/v1/booster_types?edition_id=eq.ED01&select=*&order=price_brl');
  
  if (!tiers || tiers.length === 0) {
    console.error('❌ Erro ao buscar tiers');
    return;
  }
  
  // Agrupar por preço (múltiplas variantes por preço)
  const tiersByPrice = {};
  for (const tier of tiers) {
    if (!tiersByPrice[tier.price_brl]) {
      tiersByPrice[tier.price_brl] = tier;
    }
  }
  
  const sortedTiers = Object.values(tiersByPrice).sort((a, b) => a.price_brl - b.price_brl);
  
  console.log('✅ Configurações carregadas!\n');
  console.log('============================================\n');
  
  const results = [];
  
  for (const tier of sortedTiers) {
    console.log(`\n📦 TESTANDO: ${tier.name} (R$ ${tier.price_brl.toFixed(2)})`);
    console.log(`Market Tiers: ${tier.market_tier_filter.min}-${tier.market_tier_filter.max}`);
    console.log(`Skin Boost: premium ${tier.skin_boost.premium}%, ghost ${tier.skin_boost.ghost}%, holo ${tier.skin_boost.holo}%, dark ${tier.skin_boost.dark}%, glitch ${tier.skin_boost.glitch}%`);
    console.log(`Raridades: ${JSON.stringify(tier.rarity_distribution)}`);
    console.log('\nSimulando 1000 aberturas...');
    
    let totalSpent = 0;
    let totalReturn = 0;
    const rarityCount = {};
    const skinCount = {};
    const values = [];
    
    for (let i = 0; i < 1000; i++) {
      const cards = simulateBoosterOpening(tier);
      const boosterValue = cards.reduce((sum, card) => sum + card.finalValue, 0);
      
      totalSpent += tier.price_brl;
      totalReturn += boosterValue;
      values.push(boosterValue);
      
      // Contar raridades e skins
      for (const card of cards) {
        rarityCount[card.rarity] = (rarityCount[card.rarity] || 0) + 1;
        skinCount[card.skinType] = (skinCount[card.skinType] || 0) + 1;
      }
    }
    
    const rtp = (totalReturn / totalSpent) * 100;
    const avgReturn = totalReturn / 1000;
    const minReturn = Math.min(...values);
    const maxReturn = Math.max(...values);
    const expectedReturn = tier.price_brl * 0.70;
    
    console.log(`\n📊 RESULTADOS:`);
    console.log(`   Gasto total: R$ ${totalSpent.toFixed(2)}`);
    console.log(`   Retorno total: R$ ${totalReturn.toFixed(2)}`);
    console.log(`   RTP: ${rtp.toFixed(2)}%`);
    console.log(`   Retorno médio/booster: R$ ${avgReturn.toFixed(2)} (esperado: R$ ${expectedReturn.toFixed(2)})`);
    console.log(`   Min/Max: R$ ${minReturn.toFixed(2)} / R$ ${maxReturn.toFixed(2)}`);
    
    console.log(`\n   🎴 Distribuição de Raridades (5000 cartas):`);
    const totalCards = Object.values(rarityCount).reduce((a, b) => a + b, 0);
    for (const [rarity, count] of Object.entries(rarityCount).sort((a, b) => b[1] - a[1])) {
      const percent = (count / totalCards) * 100;
      const expected = tier.rarity_distribution[rarity] || 0;
      const diff = percent - expected;
      console.log(`      ${rarity}: ${count} (${percent.toFixed(1)}% vs ${expected}% esperado, diff: ${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%)`);
    }
    
    console.log(`\n   ✨ Distribuição de Skins (5000 cartas):`);
    for (const [skin, count] of Object.entries(skinCount).sort((a, b) => b[1] - a[1])) {
      const percent = (count / totalCards) * 100;
      const mult = skinMultipliers[skin];
      console.log(`      ${skin} (${mult}x): ${count} (${percent.toFixed(1)}%)`);
    }
    
    const status = rtp >= 65 && rtp <= 75 ? '✅ OK' : rtp < 65 ? '⚠️ BAIXO' : '⚠️ ALTO';
    console.log(`\n   Status: ${status}`);
    
    results.push({
      name: tier.name,
      price: tier.price_brl,
      rtp: rtp.toFixed(2),
      avgReturn: avgReturn.toFixed(2),
      status
    });
    
    console.log('\n' + '='.repeat(44));
  }
  
  console.log('\n\n📈 RESUMO GERAL:\n');
  for (const result of results) {
    console.log(`${result.status} ${result.name.padEnd(15)} R$ ${result.price.toFixed(2).padStart(5)} → RTP: ${result.rtp.padStart(6)}%`);
  }
  
  const avgRTP = results.reduce((sum, r) => sum + parseFloat(r.rtp), 0) / results.length;
  console.log(`\n🎯 RTP MÉDIO GERAL: ${avgRTP.toFixed(2)}%`);
  console.log('\n✨ Teste completo!\n');
}

runOfflineTest().catch(console.error);
