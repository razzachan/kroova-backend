import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, serviceKey);

const akromaUserId = '15f2efb3-f1e6-4146-b35c-41d93f32d569';
const systemSellerId = 'a64f7677-97a4-4b3f-8d06-4faf4ec7dc18';

export async function POST() {
  try {
    // 1. Busca base cards
    const { data: cards, error: cardsErr } = await supabase
      .from('cards_base')
      .select('id, name, base_liquidity_brl')
      .in('name', ['Pixel Glitch', 'Meme Totem', 'Trend Catalyst', 'Crown Signal']);

    if (cardsErr || !cards) {
      return NextResponse.json({ ok: false, error: cardsErr });
    }

    // 2. Remove listings antigas
    await supabase.from('market_listings').delete().eq('seller_id', systemSellerId);
    
    // 3. Remove cartas antigas do seller
    await supabase.from('cards_instances').delete().eq('owner_id', systemSellerId);

    // 4. Adiciona 3 cartas para akroma
    const akromaCards = cards.slice(0, 3).map(c => ({
      base_id: c.id,
      owner_id: akromaUserId,
      skin: ['default', 'neon', 'glitch'][Math.floor(Math.random() * 3)]
    }));

    await supabase.from('cards_instances').insert(akromaCards);

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
      return NextResponse.json({ ok: false, error: cardsError });
    }

    // 6. Cria listings
    const listings = newCards!.map((card: any) => {
      const baseCard = cards.find(c => c.id === card.base_id)!;
      return {
        card_instance_id: card.id,
        seller_id: systemSellerId,
        price_brl: baseCard.base_liquidity_brl * (0.8 + Math.random() * 0.4),
        status: 'active'
      };
    });

    await supabase.from('market_listings').insert(listings);

    return NextResponse.json({ 
      ok: true, 
      data: { 
        akromaCards: akromaCards.length,
        marketCards: newCards!.length,
        listings: listings.length
      } 
    });

  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
