import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_KEY!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, anonKey);
const supabaseAdmin = createClient(supabaseUrl, serviceKey);

const MARKET_FEE = 0.04; // 4%

// POST /api/v1/market/listings/:listing_id/buy - Buy card
export async function POST(
  request: NextRequest,
  { params }: { params: { listing_id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { ok: false, error: { code: 'UNAUTHORIZED', message: 'Token não fornecido' } },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { ok: false, error: { code: 'UNAUTHORIZED', message: 'Token inválido' } },
        { status: 401 }
      );
    }

    const listingId = params.listing_id;

    // Buscar listing com validações
    const { data: listing, error: listingError } = await supabaseAdmin
      .from('market_listings')
      .select(`
        *,
        cards_instances(owner_id)
      `)
      .eq('id', listingId)
      .single();

    if (listingError || !listing) {
      return NextResponse.json(
        { ok: false, error: { code: 'LISTING_NOT_FOUND', message: 'Anúncio não encontrado' } },
        { status: 404 }
      );
    }

    if (listing.status !== 'active') {
      return NextResponse.json(
        { ok: false, error: { code: 'LISTING_NOT_ACTIVE', message: 'Anúncio não está mais disponível' } },
        { status: 400 }
      );
    }

    if (listing.seller_id === user.id) {
      return NextResponse.json(
        { ok: false, error: { code: 'CANNOT_BUY_OWN_LISTING', message: 'Você não pode comprar sua própria carta' } },
        { status: 400 }
      );
    }

    const price = listing.price_brl || 0;
    const fee = Math.floor(price * MARKET_FEE * 100) / 100;
    const sellerAmount = price - fee;

    // Buscar wallets
    const { data: buyerWallet } = await supabaseAdmin
      .from('wallets')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const { data: sellerWallet } = await supabaseAdmin
      .from('wallets')
      .select('*')
      .eq('user_id', listing.seller_id)
      .single();

    if (!buyerWallet || !sellerWallet) {
      return NextResponse.json(
        { ok: false, error: { code: 'WALLET_NOT_FOUND', message: 'Carteira não encontrada' } },
        { status: 500 }
      );
    }

    if (buyerWallet.balance_brl < price) {
      return NextResponse.json(
        { ok: false, error: { code: 'INSUFFICIENT_FUNDS', message: `Saldo insuficiente. Você tem R$ ${buyerWallet.balance_brl.toFixed(2)}, precisa R$ ${price.toFixed(2)}` } },
        { status: 400 }
      );
    }

    // Transferir carta
    const { error: cardUpdateError } = await supabaseAdmin
      .from('cards_instances')
      .update({ owner_id: user.id })
      .eq('id', listing.card_instance_id);

    if (cardUpdateError) {
      return NextResponse.json(
        { ok: false, error: { code: 'CARD_TRANSFER_FAILED', message: 'Erro ao transferir carta' } },
        { status: 500 }
      );
    }

    // Atualizar wallets
    await supabaseAdmin
      .from('wallets')
      .update({ balance_brl: buyerWallet.balance_brl - price })
      .eq('user_id', user.id);

    await supabaseAdmin
      .from('wallets')
      .update({ balance_brl: sellerWallet.balance_brl + sellerAmount })
      .eq('user_id', listing.seller_id);

    // Marcar listing como sold
    await supabaseAdmin
      .from('market_listings')
      .update({
        status: 'sold',
        buyer_id: user.id,
        sold_at: new Date().toISOString(),
      })
      .eq('id', listingId);

    // Registrar transações
    await supabaseAdmin.from('transactions').insert([
      {
        user_id: user.id,
        type: 'market_buy',
        amount_brl: -price,
        status: 'completed',
        metadata: { listing_id: listingId, card_instance_id: listing.card_instance_id },
      },
      {
        user_id: listing.seller_id,
        type: 'market_sell',
        amount_brl: sellerAmount,
        fee_brl: fee,
        status: 'completed',
        metadata: { listing_id: listingId, buyer_id: user.id, card_instance_id: listing.card_instance_id },
      },
    ]);

    return NextResponse.json({
      ok: true,
      data: {
        purchased: true,
        price_paid: price,
        fee,
        seller_received: sellerAmount,
        card_instance_id: listing.card_instance_id,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
