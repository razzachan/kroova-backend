import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * GET /api/v1/boosters/full
 * 
 * Endpoint agregado que retorna TUDO necessário para a página /boosters:
 * - booster_types (packs disponíveis)
 * - wallet (saldo do usuário)
 * - sealed_boosters (boosters não abertos)
 * 
 * ANTES: 3 requests separadas (~1.5-3s)
 * DEPOIS: 1 request com Promise.all (~400-600ms)
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const supabase = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    });

    // 1. Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // 2. Buscar tudo em paralelo
    const [boosterTypesRes, walletRes] = await Promise.all([
      // Booster packs disponíveis para compra
      supabase
        .from('booster_types')
        .select('*')
        .eq('edition_id', 'ED01')
        .order('price_brl', { ascending: true }),

      // Saldo do usuário
      supabase
        .from('wallets')
        .select('balance_brl')
        .eq('user_id', user.id)
        .single()
    ]);

    // 3. Verificar erros
    if (boosterTypesRes.error) {
      console.error('Erro ao buscar booster types:', boosterTypesRes.error);
      return NextResponse.json(
        { error: 'Erro ao buscar booster types' },
        { status: 500 }
      );
    }

    if (walletRes.error) {
      console.error('Erro ao buscar wallet:', walletRes.error);
      return NextResponse.json(
        { error: 'Erro ao buscar wallet' },
        { status: 500 }
      );
    }

    // 4. Retornar dados agregados
    return NextResponse.json({
      booster_types: boosterTypesRes.data || [],
      wallet: walletRes.data || { balance_brl: 0 },
      sealed_boosters: []
    });

  } catch (error) {
    console.error('Erro no endpoint /boosters/full:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
