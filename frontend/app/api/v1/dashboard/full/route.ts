import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * GET /api/v1/dashboard/full
 * 
 * Endpoint agregado para página /dashboard:
 * - wallet (saldo)
 * - inventory (contagem de cartas)
 * - listings (contagem de anúncios ativos)
 * 
 * ANTES: 2-3 requests (~1-2s)
 * DEPOIS: 1 request (~300-500ms)
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

    const [walletRes, inventoryRes, listingsRes] = await Promise.all([
      // 1. Saldo
      supabase
        .from('wallets')
        .select('balance_brl')
        .eq('user_id', user.id)
        .single(),

      // 2. Contagem de cartas
      supabase
        .from('cards')
        .select('card_instance_id', { count: 'exact', head: true })
        .eq('owner_id', user.id)
        .is('listing_id', null),

      // 3. Contagem de anúncios ativos
      supabase
        .from('market_listings')
        .select('listing_id', { count: 'exact', head: true })
        .eq('seller_id', user.id)
        .eq('status', 'active')
    ]);

    return NextResponse.json({
      balance: walletRes.data?.balance_brl || 0,
      cards_count: inventoryRes.count || 0,
      listings_count: listingsRes.count || 0
    });

  } catch (error) {
    console.error('Erro no endpoint /dashboard/full:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
