import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * GET /api/v1/wallet/full
 * 
 * Endpoint agregado para página /wallet:
 * - wallet (saldo)
 * - transactions (histórico)
 * 
 * ANTES: 2 requests (~800-1500ms)
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

    const [walletRes, transactionsRes] = await Promise.all([
      supabase.from('wallets').select('*').eq('user_id', user.id).single(),
      supabase
        .from('transaction_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100)
    ]);

    if (walletRes.error) {
      console.error('Erro ao buscar wallet:', walletRes.error);
      return NextResponse.json({ error: 'Erro ao buscar wallet' }, { status: 500 });
    }

    return NextResponse.json({
      wallet: walletRes.data || { balance_brl: 0 },
      transactions: transactionsRes.data || []
    });

  } catch (error) {
    console.error('Erro no endpoint /wallet/full:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
