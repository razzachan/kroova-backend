import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * POST /api/v1/mystery-box/purchase
 * Compra uma Mystery Box (debita saldo, cria instância pendente)
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
    const { box_tier } = body; // 'bronze', 'silver', 'gold', 'platinum', 'diamond'

    if (!box_tier) {
      return NextResponse.json(
        { error: 'box_tier é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar tipo de Mystery Box
    const { data: boxType, error: boxError } = await supabase
      .from('mystery_box_types')
      .select('*')
      .eq('tier', box_tier)
      .eq('is_active', true)
      .single();

    if (boxError || !boxType) {
      console.error('❌ Box type não encontrado:', boxError);
      return NextResponse.json(
        { error: 'Tipo de Mystery Box não encontrado' },
        { status: 404 }
      );
    }

    // Verificar saldo do usuário (CORREÇÃO: campo é 'id' não 'user_id')
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('balance_brl')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      console.error('❌ Usuário não encontrado:', userError);
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    if (userData.balance_brl < boxType.price_brl) {
      return NextResponse.json(
        { error: 'Saldo insuficiente', required: boxType.price_brl, current: userData.balance_brl },
        { status: 400 }
      );
    }

    // Debitar saldo
    const { error: debitError } = await supabase
      .from('users')
      .update({ balance_brl: userData.balance_brl - boxType.price_brl })
      .eq('id', user.id);

    if (debitError) {
      console.error('❌ Erro ao debitar saldo:', debitError);
      return NextResponse.json(
        { error: 'Erro ao processar pagamento' },
        { status: 500 }
      );
    }

    // Criar instância de Mystery Box
    const { data: instance, error: instanceError } = await supabase
      .from('mystery_box_instances')
      .insert({
        box_id: boxType.box_id,
        user_id: user.id,
        status: 'pending'
      })
      .select('instance_id, box_id, purchased_at')
      .single();

    if (instanceError || !instance) {
      console.error('❌ Erro ao criar instância:', instanceError);
      
      // Rollback: devolver saldo (CORREÇÃO: campo é 'id' não 'user_id')
      await supabase
        .from('users')
        .update({ balance_brl: userData.balance_brl })
        .eq('id', user.id);

      return NextResponse.json(
        { error: 'Erro ao criar Mystery Box' },
        { status: 500 }
      );
    }

    console.log(`✅ Mystery Box comprada: ${boxType.name} por ${user.email}`);

    return NextResponse.json({
      success: true,
      instance_id: instance.instance_id,
      box_type: boxType.name,
      box_tier: boxType.tier,
      price_paid: boxType.price_brl,
      purchased_at: instance.purchased_at,
      new_balance: userData.balance_brl - boxType.price_brl
    });

  } catch (error) {
    console.error('❌ Erro em /api/v1/mystery-box/purchase:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
