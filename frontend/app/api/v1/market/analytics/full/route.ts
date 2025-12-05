import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * GET /api/v1/market/analytics/full
 * 
 * Endpoint agregado para página /marketplace/analytics:
 * - analytics gerais
 * - trending cards
 * 
 * ANTES: 2 requests (~1-2s)
 * DEPOIS: 1 request (~300-500ms)
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '24h';

    const token = authHeader.substring(7);
    const supabase = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Converter período para formato SQL
    const periodMap: Record<string, string> = {
      '24h': '24 hours',
      '7d': '7 days',
      '30d': '30 days'
    };
    const sqlPeriod = periodMap[period] || '24 hours';

    const [analyticsRes, trendingRes] = await Promise.all([
      supabase.rpc('get_market_analytics', { time_period: sqlPeriod }),
      supabase.rpc('get_trending_cards', { 
        time_period: sqlPeriod,
        result_limit: 10 
      })
    ]);

    if (analyticsRes.error) {
      console.error('Erro ao buscar analytics:', analyticsRes.error);
    }

    if (trendingRes.error) {
      console.error('Erro ao buscar trending:', trendingRes.error);
    }

    return NextResponse.json({
      analytics: analyticsRes.data || {},
      trending: trendingRes.data || []
    });

  } catch (error) {
    console.error('Erro no endpoint /market/analytics/full:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
