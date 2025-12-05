/**
 * Script de teste de RTP (Return to Player) dos boosters
 * Simula 100 aberturas de cada tier e calcula RTP médio
 */

const https = require('https');

const SUPABASE_URL = 'mmcytphoeyxeylvaqjgr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tY3l0cGhvZXl4ZXlsdmFxamdyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDExNDIyMCwiZXhwIjoyMDc5NjkwMjIwfQ.mPKc2a3A4kL1LUzX9BjTsaCz3OGAWLGIBYV0TSa20Fw';

// Fazer requisição HTTP
function request(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: SUPABASE_URL,
      path: path,
      method: method,
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// Simular abertura de 1 booster
async function simulateBoosterOpen(tier) {
  const { price_brl, price_multiplier, rarity_distribution } = tier;
  
  // Simular 5 cartas
  const cards = [];
  let totalValue = 0;
  
  for (let i = 0; i < 5; i++) {
    // Sortear raridade baseado na distribuição
    const rand = Math.random() * 100;
    let cumulative = 0;
    let selectedRarity = 'meme';
    
    for (const [rarity, prob] of Object.entries(rarity_distribution)) {
      cumulative += prob;
      if (rand < cumulative) {
        selectedRarity = rarity;
        break;
      }
    }
    
    // Valores base por raridade (MÉDIAS REAIS do banco ED01)
    // NOTA: Esses valores serão AUMENTADOS pela migration (legendary tier 5 × 3.5x, etc)
    const rarityBaseValues = {
      meme: 0.0473,      // tier 1: 0.03, tier 3: 0.10
      trash: 0.0086,     // tier 1: 0.01, tier 2: 0.01
      viral: 0.1470,     // tier 1: 0.09, tier 4: 0.40
      epica: 0.10,       // não tem no banco ainda
      legendary: 0.4450, // tier 1: 0.30, tier 5: 1.80
      godmode: 1.40      // tier 5: 9.80
    };
    
    const baseLiquidity = rarityBaseValues[selectedRarity] || 0.01;
    
    // Sortear skin baseado em skin_boost do tier
    const skinBoost = tier.skin_boost || {
      premium: 15,
      ghost: 5,
      holo: 0,
      dark: 0,
      glitch: 0
    };
    
    const skinRoll = Math.random() * 100;
    let skinMultiplier = 1.0;
    let skinType = 'default';
    
    let cumulative = 0;
    if (skinRoll < (cumulative += skinBoost.glitch || 0)) {
      skinMultiplier = 6.0;
      skinType = 'glitch';
    } else if (skinRoll < (cumulative += skinBoost.dark || 0)) {
      skinMultiplier = 4.0;
      skinType = 'dark';
    } else if (skinRoll < (cumulative += skinBoost.ghost || 0)) {
      skinMultiplier = 3.0;
      skinType = 'ghost';
    } else if (skinRoll < (cumulative += skinBoost.holo || 0)) {
      skinMultiplier = 2.5;
      skinType = 'holo';
    } else if (skinRoll < (cumulative += skinBoost.premium || 0)) {
      skinMultiplier = 1.5;
      skinType = 'premium';
    }
    
    // REMOVIDO price_multiplier - todas cartas têm valor base fixo
    // (fix do bug de marketplace onde mesma carta tinha preços diferentes)
    const finalValue = baseLiquidity * skinMultiplier;
    
    cards.push({
      rarity: selectedRarity,
      baseValue: baseLiquidity,
      skinMultiplier,
      skinType,
      finalValue
    });
    
    totalValue += finalValue;
  }
  
  return { cards, totalValue };
}

// Testar RTP de um tier
async function testTierRTP(tierName, tierData, simulations = 100) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`TESTANDO: ${tierName} (R$ ${tierData.price_brl.toFixed(2)})`);
  console.log(`Multiplicador: ${tierData.price_multiplier}x`);
  console.log(`Distribuição de raridade:`, tierData.rarity_distribution);
  console.log(`${'='.repeat(60)}\n`);
  
  let totalSpent = 0;
  let totalReturned = 0;
  const results = [];
  
  for (let i = 0; i < simulations; i++) {
    const { totalValue } = await simulateBoosterOpen(tierData);
    totalSpent += tierData.price_brl;
    totalReturned += totalValue;
    results.push(totalValue);
  }
  
  const rtpPercent = (totalReturned / totalSpent) * 100;
  const avgReturn = totalReturned / simulations;
  const minReturn = Math.min(...results);
  const maxReturn = Math.max(...results);
  
  console.log(`📊 RESULTADOS (${simulations} simulações):`);
  console.log(`   Gasto total: R$ ${totalSpent.toFixed(2)}`);
  console.log(`   Retorno total: R$ ${totalReturned.toFixed(2)}`);
  console.log(`   RTP médio: ${rtpPercent.toFixed(2)}%`);
  console.log(`   Retorno médio/booster: R$ ${avgReturn.toFixed(2)} (esperado: R$ ${(tierData.price_brl * 0.70).toFixed(2)})`);
  console.log(`   Min/Max: R$ ${minReturn.toFixed(2)} / R$ ${maxReturn.toFixed(2)}`);
  
  return { rtpPercent, avgReturn, totalSpent, totalReturned };
}

// Executar testes
async function main() {
  console.log('\n🎰 TESTE DE RTP - KROOVA BOOSTERS\n');
  
  // Buscar booster_types do banco
  const tiers = await request('/rest/v1/booster_types?select=*&edition_id=eq.ED01&order=price_brl.asc');
  
  if (!Array.isArray(tiers) || tiers.length === 0) {
    console.error('❌ Erro ao buscar tiers do banco');
    return;
  }
  
  // Agrupar por preço (pegar primeiro de cada preço)
  const uniqueTiers = {};
  for (const tier of tiers) {
    if (!uniqueTiers[tier.price_brl]) {
      uniqueTiers[tier.price_brl] = tier;
    }
  }
  
  const allResults = [];
  
  // Testar cada tier
  for (const [price, tierData] of Object.entries(uniqueTiers)) {
    const result = await testTierRTP(tierData.name, tierData, 100);
    allResults.push({ tier: tierData.name, price: tierData.price_brl, ...result });
  }
  
  // Sumário final
  console.log('\n' + '='.repeat(60));
  console.log('📈 SUMÁRIO GERAL');
  console.log('='.repeat(60));
  
  for (const result of allResults) {
    const status = Math.abs(result.rtpPercent - 70) < 5 ? '✅' : '⚠️';
    console.log(`${status} ${result.tier.padEnd(20)} RTP: ${result.rtpPercent.toFixed(2)}%`);
  }
  
  const overallRTP = (allResults.reduce((sum, r) => sum + r.totalReturned, 0) / 
                      allResults.reduce((sum, r) => sum + r.totalSpent, 0)) * 100;
  
  console.log(`\n🎯 RTP GERAL: ${overallRTP.toFixed(2)}% (esperado: ~70%)`);
  console.log('='.repeat(60) + '\n');
}

main().catch(console.error);
