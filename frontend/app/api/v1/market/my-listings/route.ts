// ============================================================================
// MY LISTINGS - API Route
// File: frontend/app/api/v1/market/my-listings/route.ts
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/v1/market/my-listings
 * Retorna minhas listagens com filtros e earnings
 * 
 * Query params:
 * - status: 'active' | 'sold' | 'cancelled' (default: 'active')
 * - limit: número (default: 20)
 * - offset: número (default: 0)
 * 
 * Headers:
 * - Authorization: Bearer <token>
 */
export async function GET(request: NextRequest) {
  try {
    // Auth
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { ok: false, error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { ok: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Query params
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'active';
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Fetch listings
    const { data: listings, error: listingsError } = await supabase
      .from('market_listings')
      .select(`
        id,
        price_brl,
        status,
        created_at,
        updated_at,
        buyer_id,
        cards_instances!inner(
          id,
          cards_base!inner(id, name, rarity, image_url)
        )
      `)
      .eq('seller_id', user.id)
      .eq('status', status)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (listingsError) throw listingsError;

    // Calcular earnings (se status = sold)
    let earnings = null;
    if (status === 'sold') {
      // Mês atual
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: monthSales } = await supabase
        .from('market_sales_history')
        .select('price_brl, marketplace_fee_brl, seller_net_brl')
        .eq('seller_id', user.id)
        .gte('sold_at', startOfMonth.toISOString());

      if (monthSales && monthSales.length > 0) {
        const grossRevenue = monthSales.reduce((sum, s) => sum + s.price_brl, 0);
        const totalFees = monthSales.reduce((sum, s) => sum + s.marketplace_fee_brl, 0);
        const netRevenue = monthSales.reduce((sum, s) => sum + s.seller_net_brl, 0);

        earnings = {
          total_sales_month: monthSales.length,
          gross_revenue_brl: parseFloat(grossRevenue.toFixed(2)),
          total_fees_brl: parseFloat(totalFees.toFixed(2)),
          net_revenue_brl: parseFloat(netRevenue.toFixed(2))
        };
      }
    }

    // Formatar resposta
    const formattedListings = listings?.map((listing: any) => ({
      id: listing.id,
      price_brl: listing.price_brl,
      status: listing.status,
      listed_at: listing.created_at,
      updated_at: listing.updated_at,
      card: {
        instance_id: listing.cards_instances.id,
        base_id: listing.cards_instances.cards_base.id,
        name: listing.cards_instances.cards_base.name,
        rarity: listing.cards_instances.cards_base.rarity,
        image_url: listing.cards_instances.cards_base.image_url
      }
    }));

    return NextResponse.json({
      ok: true,
      data: {
        listings: formattedListings,
        earnings,
        pagination: {
          limit,
          offset,
          total: listings?.length || 0
        }
      }
    });
  } catch (err: any) {
    console.error('[my-listings] Error:', err);
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    );
  }
}
