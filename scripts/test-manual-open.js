// Script para testar abertura manual de booster via API
import 'dotenv/config';

const FRONTEND_URL = 'https://frontend-o5c2jp0f8-razzachans-projects.vercel.app';
const OPENING_ID = '7b801ec1-12e2-4c26-b829-f7b6ee1035d2';

async function testOpen() {
  // Pegar token de autenticação do .env (se existir)
  const token = process.env.TEST_USER_TOKEN || process.env.SUPABASE_USER_TOKEN;
  
  if (!token) {
    console.error('\n❌ Token não encontrado no .env\n');
    console.log('Adicione TEST_USER_TOKEN= ou SUPABASE_USER_TOKEN= no .env');
    console.log('Ou faça login no frontend e copie o token do localStorage\n');
    return;
  }

  console.log('\n🔓 Testando abertura do booster...\n');
  console.log('Opening ID:', OPENING_ID);
  console.log('Token:', token.substring(0, 20) + '...\n');

  try {
    const response = await fetch(`${FRONTEND_URL}/api/v1/boosters/open`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ opening_id: OPENING_ID })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Erro na abertura:');
      console.error('Status:', response.status);
      console.error('Response:', JSON.stringify(data, null, 2));
      return;
    }

    console.log('✅ Booster aberto com sucesso!\n');
    console.log('Cartas geradas:', data.data.cards.length);
    console.log('\nDetalhes:\n');
    data.data.cards.forEach((card, i) => {
      console.log(`${i+1}. ${card.card.name} (${card.card.rarity})`);
      console.log(`   Skin: ${card.skin}`);
      console.log(`   Godmode: ${card.is_godmode ? 'SIM ✨' : 'não'}`);
      console.log(`   Liquidez: R$ ${card.liquidity_brl.toFixed(2)}`);
      console.log('');
    });

  } catch (error) {
    console.error('\n❌ Erro de rede:', error.message);
  }
}

testOpen().catch(console.error);
