// ============================================================================
// MARKET ANALYTICS - API Route
// File: frontend/app/api/v1/market/analytics/route.ts
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/v1/market/analytics
 * Dashboard geral: volume, total sales, avg price, floor prices
 * 
 * Query params:
 * - period: '24h' | '7d' | '30d' (default: '24h')
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '24h';

    // Mapear período
    const hoursMap: Record<string, number> = {
      '24h': 24,
      '7d': 168,
      '30d': 720
    };
    const hours = hoursMap[period] || 24;

    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - hours);

    // 1. Volume e vendas
    const { data: salesData, error: salesError } = await supabase
      .from('market_sales_history')
      .select('price_brl, rarity')
      .gte('sold_at', cutoffDate.toISOString());

    if (salesError) throw salesError;

    const totalSales = salesData?.length || 0;
    const totalVolume = salesData?.reduce((sum, s) => sum + s.price_brl, 0) || 0;
    const avgPrice = totalSales > 0 ? totalVolume / totalSales : 0;

    // 2. Sales by rarity
    const salesByRarity: Record<string, number> = {};
    salesData?.forEach((sale: any) => {
      salesByRarity[sale.rarity] = (salesByRarity[sale.rarity] || 0) + 1;
    });

    // 3. Floor prices por raridade
    const rarities = ['legendary', 'viral', 'meme', 'trash'];
    const floorPrices: Record<string, number | null> = {};

    for (const rarity of rarities) {
      const { data: floorData } = await supabase
        .from('market_listings')
        .select('price_brl, cards_instances!inner(base_id, cards_base!inner(rarity))')
        .eq('status', 'active')
        .eq('cards_instances.cards_base.rarity', rarity)
        .order('price_brl', { ascending: true })
        .limit(1)
        .single();

      floorPrices[rarity] = floorData?.price_brl || null;
    }

    // 4. Comparação com período anterior
    const prevCutoffDate = new Date(cutoffDate);
    prevCutoffDate.setHours(prevCutoffDate.getHours() - hours);

    const { data: prevSalesData } = await supabase
      .from('market_sales_history')
      .select('price_brl')
      .gte('sold_at', prevCutoffDate.toISOString())
      .lt('sold_at', cutoffDate.toISOString());

    const prevTotalSales = prevSalesData?.length || 0;
    const prevTotalVolume = prevSalesData?.reduce((sum, s) => sum + s.price_brl, 0) || 0;

    const salesChange = prevTotalSales > 0
      ? (((totalSales - prevTotalSales) / prevTotalSales) * 100)
      : 0;
    const volumeChange = prevTotalVolume > 0
      ? (((totalVolume - prevTotalVolume) / prevTotalVolume) * 100)
      : 0;

    return NextResponse.json({
      ok: true,
      data: {
        period,
        overview: {
          total_volume_brl: parseFloat(totalVolume.toFixed(2)),
          total_sales: totalSales,
          avg_price_brl: parseFloat(avgPrice.toFixed(2)),
          volume_change_pct: parseFloat(volumeChange.toFixed(2)),
          sales_change_pct: parseFloat(salesChange.toFixed(2))
        },
        sales_by_rarity: salesByRarity,
        floor_prices: floorPrices
      }
    });
  } catch (err: any) {
    console.error('[analytics] Error:', err);
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    );
  }
}
