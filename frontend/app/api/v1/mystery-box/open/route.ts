import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * POST /api/v1/mystery-box/open
 * Abre uma Mystery Box (chama função SQL, determina prêmio, credita saldo)
 * 
 * Body: { instance_id: string }
 * Returns: { success, prize_tier, prize_multiplier, prize_amount, message, new_balance, is_jackpot }
 */
export async function POST(request: NextRequest) {
  try {
    // Autenticação
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

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    // Extrair body
    const body = await request.json();
    const { instance_id } = body;

    if (!instance_id) {
      return NextResponse.json(
        { error: 'instance_id é obrigatório' },
        { status: 400 }
      );
    }

    // Chamar função SQL para abrir box
    const { data, error } = await supabase
      .rpc('open_mystery_box', {
        p_instance_id: instance_id,
        p_user_id: user.id
      });

    if (error) {
      console.error('❌ Erro ao abrir Mystery Box:', error);
      return NextResponse.json(
        { error: 'Erro ao abrir Mystery Box' },
        { status: 500 }
      );
    }

    const result = data[0];

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    // Buscar saldo atualizado do usuário
    const { data: userData } = await supabase
      .from('users')
      .select('balance_brl')
      .eq('user_id', user.id)
      .single();

    console.log(`✅ Mystery Box aberta: ${result.prize_tier} (${result.prize_multiplier}x) por ${user.email}`);

    return NextResponse.json({
      success: true,
      prize_tier: result.prize_tier,
      prize_multiplier: result.prize_multiplier,
      prize_amount: result.prize_amount,
      message: result.message,
      new_balance: userData?.balance_brl || 0,
      is_jackpot: result.prize_tier === 'jackpot'
    });

  } catch (error) {
    console.error('❌ Erro em /api/v1/mystery-box/open:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
