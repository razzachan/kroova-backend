import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * GET /api/v1/mystery-box
 * Retorna tipos de Mystery Box disponíveis + saldo do usuário (tudo em uma chamada)
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

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    // Query paralela: boxes + saldo
    const [boxesResult, userResult] = await Promise.all([
      supabase
        .from('mystery_box_types')
        .select('*')
        .eq('is_active', true)
        .order('price_brl'),
      supabase
        .from('users')
        .select('balance_brl')
        .eq('id', user.id)
        .single()
    ]);

    if (boxesResult.error) {
      console.error('❌ Erro ao buscar boxes:', boxesResult.error);
      return NextResponse.json(
        { error: 'Erro ao buscar tipos de Mystery Box' },
        { status: 500 }
      );
    }

    // Remover duplicatas por tier (pega o primeiro de cada)
    const uniqueBoxes = boxesResult.data?.filter((box, index, self) => 
      index === self.findIndex((b) => b.tier === box.tier)
    ) || [];

    return NextResponse.json({
      boxes: uniqueBoxes,
      balance: userResult.data?.balance_brl || 0,
      user_id: user.id
    });

  } catch (error) {
    console.error('❌ Erro em /api/v1/mystery-box:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
