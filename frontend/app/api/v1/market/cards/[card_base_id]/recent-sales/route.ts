// ============================================================================
// RECENT SALES - API Route
// File: frontend/app/api/v1/market/cards/[card_base_id]/recent-sales/route.ts
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/v1/market/cards/:card_base_id/recent-sales
 * Retorna últimas vendas da carta com informações do vendedor
 * 
 * Query params:
 * - limit: número de vendas (default: 10, max: 50)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ card_base_id: string }> }
) {
  try {
    const { card_base_id } = await params;
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);

    const { data, error } = await supabase
      .from('market_sales_history')
      .select(`
        id,
        price_brl,
        sold_at,
        seller:users!seller_id(id, name, email),
        buyer:users!buyer_id(id, name)
      `)
      .eq('card_base_id', card_base_id)
      .order('sold_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    // Formatar resposta
    const sales = data?.map((sale: any) => ({
      id: sale.id,
      price_brl: sale.price_brl,
      sold_at: sale.sold_at,
      seller: {
        id: sale.seller.id,
        name: sale.seller.name,
        username: sale.seller.email?.split('@')[0] || 'anonymous'
      },
      buyer: {
        id: sale.buyer.id,
        name: sale.buyer.name
      }
    }));

    return NextResponse.json({ ok: true, data: sales });
  } catch (err: any) {
    console.error('[recent-sales] Error:', err);
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    );
  }
}
