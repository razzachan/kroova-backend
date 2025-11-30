// ============================================================================
// CARD STATS - API Route
// File: frontend/app/api/v1/market/cards/[card_base_id]/stats/route.ts
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/v1/market/cards/:card_base_id/stats
 * Retorna estatísticas da carta: floor, last sale, volume, etc
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ card_base_id: string }> }
) {
  try {
    const { card_base_id } = await params;

    // Query da materialized view (rápido)
    const { data: stats, error: statsError } = await supabase
      .from('mv_card_stats')
      .select('*')
      .eq('card_base_id', card_base_id)
      .single();

    if (statsError && statsError.code !== 'PGRST116') {
      throw statsError;
    }

    // Se view não existir, calcular manualmente
    if (!stats) {
      // Floor price (menor listing ativo)
      const { data: floorData } = await supabase
        .from('market_listings')
        .select('price_brl, cards_instances!inner(base_id)')
        .eq('cards_instances.base_id', card_base_id)
        .eq('status', 'active')
        .order('price_brl', { ascending: true })
        .limit(1)
        .single();

      // Last sale
      const { data: lastSale } = await supabase
        .from('market_sales_history')
        .select('price_brl, sold_at')
        .eq('card_base_id', card_base_id)
        .order('sold_at', { ascending: false })
        .limit(1)
        .single();

      // Total sales
      const { count: totalSales } = await supabase
        .from('market_sales_history')
        .select('*', { count: 'exact', head: true })
        .eq('card_base_id', card_base_id);

      // Avg price
      const { data: avgData } = await supabase
        .from('market_sales_history')
        .select('price_brl')
        .eq('card_base_id', card_base_id);

      const avgPrice = avgData && avgData.length > 0
        ? avgData.reduce((sum, s) => sum + s.price_brl, 0) / avgData.length
        : 0;

      // Volume 24h
      const yesterday = new Date();
      yesterday.setHours(yesterday.getHours() - 24);

      const { count: volume24h } = await supabase
        .from('market_sales_history')
        .select('*', { count: 'exact', head: true })
        .eq('card_base_id', card_base_id)
        .gte('sold_at', yesterday.toISOString());

      return NextResponse.json({
        ok: true,
        data: {
          card_base_id,
          floor_price: floorData?.price_brl || null,
          last_sale_price: lastSale?.price_brl || null,
          last_sale_date: lastSale?.sold_at || null,
          total_sales: totalSales || 0,
          avg_price: parseFloat(avgPrice.toFixed(2)),
          volume_24h: volume24h || 0
        }
      });
    }

    return NextResponse.json({ ok: true, data: stats });
  } catch (err: any) {
    console.error('[card-stats] Error:', err);
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    );
  }
}
