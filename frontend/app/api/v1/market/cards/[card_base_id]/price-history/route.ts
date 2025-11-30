// ============================================================================
// MARKETPLACE ANALYTICS - API Routes
// File: frontend/app/api/v1/market/cards/[card_base_id]/price-history/route.ts
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface PriceHistoryPoint {
  date: string;
  avg_price: number;
  min_price: number;
  max_price: number;
  volume: number;
}

/**
 * GET /api/v1/market/cards/:card_base_id/price-history
 * Retorna histórico de preços agregado por dia
 * 
 * Query params:
 * - days: número de dias (default: 30, max: 365)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ card_base_id: string }> }
) {
  try {
    const { card_base_id } = await params;
    const { searchParams } = new URL(request.url);
    const days = Math.min(parseInt(searchParams.get('days') || '30'), 365);

    // Query agregada por dia
    const { data, error } = await supabase.rpc('get_price_history', {
      p_card_base_id: card_base_id,
      p_days: days
    });

    if (error) {
      // Fallback: query manual se função não existir
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data: salesData, error: salesError } = await supabase
        .from('market_sales_history')
        .select('price_brl, sold_at')
        .eq('card_base_id', card_base_id)
        .gte('sold_at', startDate.toISOString())
        .order('sold_at', { ascending: true });

      if (salesError) throw salesError;

      // Agrupar por dia manualmente
      const grouped = new Map<string, number[]>();
      
      salesData?.forEach((sale) => {
        const date = new Date(sale.sold_at).toISOString().split('T')[0];
        if (!grouped.has(date)) {
          grouped.set(date, []);
        }
        grouped.get(date)!.push(sale.price_brl);
      });

      const history: PriceHistoryPoint[] = Array.from(grouped.entries()).map(([date, prices]) => ({
        date,
        avg_price: parseFloat((prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2)),
        min_price: Math.min(...prices),
        max_price: Math.max(...prices),
        volume: prices.length
      }));

      return NextResponse.json({ ok: true, data: history });
    }

    return NextResponse.json({ ok: true, data });
  } catch (err: any) {
    console.error('[price-history] Error:', err);
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    );
  }
}
