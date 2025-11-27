import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mmcytphoeyxeylvaqjgr.supabase.co';
// Usando ANON key com admin mode via autoRefreshToken
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tY3l0cGhvZXl4ZXlsdmFxamdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxMTQyMjAsImV4cCI6MjA3OTY5MDIyMH0.i1bcSAGL_J-vxc6gxwXZZxfn7GJl8puL5eYwe9UkZAs';

const supabase = createClient(supabaseUrl, anonKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const akromaUserId = '15f2efb3-f1e6-4146-b35c-41d93f32d569';
const systemSellerId = 'a64f7677-97a4-4b3f-8d06-4faf4ec7dc18';

async function main() {
  // 1. Busca base cards
  const { data: cards, error: cardsErr } = await supabase
    .from('cards_base')
    .select('id, name, base_liquidity_brl')
    .in('name', ['Pixel Glitch', 'Meme Totem', 'Trend Catalyst', 'Crown Signal']);

  if (cardsErr || !cards) {
    console.error('Error fetching cards:', cardsErr);
    return;
  }

  console.log(`Found ${cards.length} base cards`);

  // 2. Remove listings antigas
  await supabase.from('market_listings').delete().eq('seller_id', systemSellerId);
  
  // 3. Remove cartas antigas do seller
  await supabase.from('cards_instances').delete().eq('owner_id', systemSellerId);
  
  console.log('Cleared old marketplace data');

  // 4. Adiciona 3 cartas para akroma (inventário pessoal)
  const akromaCards = cards.slice(0, 3).map(c => ({
    base_id: c.id,
    owner_id: akromaUserId,
    skin: ['default', 'neon', 'glitch'][Math.floor(Math.random() * 3)]
  }));

  const { error: akromaError } = await supabase
    .from('cards_instances')
    .insert(akromaCards);

  if (akromaError) {
    console.error('Error adding akroma cards:', akromaError);
  } else {
    console.log(`Added ${akromaCards.length} cards to akroma's inventory`);
  }

  // 5. Cria 6 cartas para marketplace
  const marketCards = cards.flatMap(c => [
    { base_id: c.id, owner_id: systemSellerId, skin: 'default' },
    { base_id: c.id, owner_id: systemSellerId, skin: ['neon', 'glitch', 'ghost'][Math.floor(Math.random() * 3)] }
  ]).slice(0, 6);

  const { data: newCards, error: cardsError } = await supabase
    .from('cards_instances')
    .insert(marketCards)
    .select();

  if (cardsError) {
    console.error('Error creating market cards:', cardsError);
    return;
  }

  console.log(`Created ${newCards.length} cards for marketplace`);

  // 6. Cria listings
  const listings = newCards.map(card => {
    const baseCard = cards.find(c => c.id === card.base_id);
    return {
      card_instance_id: card.id,
      seller_id: systemSellerId,
      price_brl: baseCard.base_liquidity_brl * (0.8 + Math.random() * 0.4),
      status: 'active'
    };
  });

  const { error: listingsError } = await supabase
    .from('market_listings')
    .insert(listings);

  if (listingsError) {
    console.error('Error creating listings:', listingsError);
  } else {
    console.log(`Created ${listings.length} marketplace listings`);
  }

  console.log('Done!');
}

main().catch(console.error);
