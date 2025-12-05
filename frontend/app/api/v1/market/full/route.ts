import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * GET /api/v1/market/full
 * 
 * Endpoint agregado para página /marketplace:
 * - listings (anúncios ativos)
 * - trending (cartas em alta)
 * - analytics (floor prices)
 * 
 * ANTES: 3 requests (~1.5-3s)
 * DEPOIS: 1 request (~400-600ms)
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const supabase = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Query para listings ativos
    const listingsQuery = supabase
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
          card_number,
          card_instance_id
        )
      `)
      .eq('status', 'active')
      .order('listed_at', { ascending: false });

    // Query para trending (últimas 24h)
    const trendingQuery = supabase.rpc('get_trending_cards', { 
      time_period: '24 hours',
      result_limit: 6 
    });

    // Query para floor prices (últimas 24h)
    const analyticsQuery = supabase.rpc('get_floor_prices', { 
      time_period: '24 hours' 
    });

    const [listingsRes, trendingRes, analyticsRes] = await Promise.allSettled([
      listingsQuery,
      trendingQuery,
      analyticsQuery
    ]);

    return NextResponse.json({
      listings: listingsRes.status === 'fulfilled' ? (listingsRes.value.data || []) : [],
      trending: trendingRes.status === 'fulfilled' ? (trendingRes.value.data || []) : [],
      floor_prices: analyticsRes.status === 'fulfilled' ? (analyticsRes.value.data || {}) : {}
    });

  } catch (error) {
    console.error('Erro no endpoint /market/full:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
