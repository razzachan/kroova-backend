import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * GET /api/v1/market/cards/[card_base_id]/full
 * 
 * Endpoint agregado para página /marketplace/[card_base_id]:
 * - card (dados base)
 * - stats (estatísticas)
 * - price_history (histórico de preços)
 * - recent_sales (vendas recentes)
 * - listings (anúncios ativos desta carta)
 * 
 * ANTES: 5 requests (~2.5-5s)
 * DEPOIS: 1 request (~500-800ms)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ card_base_id: string }> }
) {
  try {
    const { card_base_id } = await params;
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30', 10);

    const token = authHeader.substring(7);
    const supabase = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const [cardRes, statsRes, historyRes, salesRes, listingsRes] = await Promise.all([
      // 1. Dados base da carta
      supabase
        .from('cards')
        .select('*')
        .eq('card_base_id', card_base_id)
        .single(),

      // 2. Estatísticas de mercado
      supabase.rpc('get_card_market_stats', { target_card_id: card_base_id }),

      // 3. Histórico de preços
      supabase.rpc('get_price_history', { 
        target_card_id: card_base_id,
        days_back: days 
      }),

      // 4. Vendas recentes
      supabase.rpc('get_recent_sales', { 
        target_card_id: card_base_id,
        sale_limit: 10 
      }),

      // 5. Listings ativos desta carta
      supabase
        .from('market_listings')
        .select(`
          listing_id,
          card_instance_id,
          seller_id,
          price_brl,
          status,
          listed_at,
          card_base_id,
          cards (
            card_base_id,
            name,
            image_url,
            rarity,
            tier,
            edition,
            card_number
          )
        `)
        .eq('card_base_id', card_base_id)
        .eq('status', 'active')
        .order('price_brl', { ascending: true })
    ]);

    if (cardRes.error) {
      console.error('Erro ao buscar carta:', cardRes.error);
      return NextResponse.json({ error: 'Carta não encontrada' }, { status: 404 });
    }

    return NextResponse.json({
      card: cardRes.data,
      stats: statsRes.data || {},
      price_history: historyRes.data || [],
      recent_sales: salesRes.data || [],
      listings: listingsRes.data || []
    });

  } catch (error) {
    console.error('Erro no endpoint /market/cards/[id]/full:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
