// ============================================================================
// TRENDING CARDS - API Route
// File: frontend/app/api/v1/market/trending/route.ts
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/v1/market/trending
 * Retorna cartas com maior variação de preço em período
 * 
 * Query params:
 * - period: '24h' | '7d' | '30d' (default: '24h')
 * - limit: número de cartas (default: 10, max: 50)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '24h';
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);

    // Mapear período para horas
    const hoursMap: Record<string, number> = {
      '24h': 24,
      '7d': 168,
      '30d': 720
    };
    const hours = hoursMap[period] || 24;

    // Data de corte
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - hours);

    // Query: calcular variação de preço
    const { data, error } = await supabase.rpc('get_trending_cards', {
      p_hours: hours,
      p_limit: limit
    });

    if (error) {
      // Fallback: calcular manualmente
      const { data: salesData, error: salesError } = await supabase
        .from('market_sales_history')
        .select(`
          card_base_id,
          price_brl,
          sold_at,
          cards_base:card_base_id(id, name, rarity, image_url)
        `)
        .gte('sold_at', cutoffDate.toISOString())
        .order('sold_at', { ascending: true });

      if (salesError) throw salesError;

      // Agrupar por carta e calcular variação
      const cardMap = new Map<string, any>();

      salesData?.forEach((sale: any) => {
        const cardId = sale.card_base_id;
        if (!cardMap.has(cardId)) {
          cardMap.set(cardId, {
            card_base_id: cardId,
            name: sale.cards_base?.name,
            rarity: sale.cards_base?.rarity,
            image_url: sale.cards_base?.image_url,
            first_price: sale.price_brl,
            last_price: sale.price_brl,
            volume: 0
          });
        }

        const card = cardMap.get(cardId);
        card.last_price = sale.price_brl;
        card.volume++;
      });

      // Calcular % de mudança e ordenar
      const trending = Array.from(cardMap.values())
        .filter(c => c.volume >= 2) // Mínimo 2 vendas
        .map(c => ({
          ...c,
          price_change_pct: parseFloat(
            (((c.last_price - c.first_price) / c.first_price) * 100).toFixed(2)
          ),
          current_price: c.last_price
        }))
        .sort((a, b) => b.price_change_pct - a.price_change_pct)
        .slice(0, limit);

      return NextResponse.json({ ok: true, data: trending });
    }

    return NextResponse.json({ ok: true, data });
  } catch (err: any) {
    console.error('[trending] Error:', err);
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    );
  }
}
