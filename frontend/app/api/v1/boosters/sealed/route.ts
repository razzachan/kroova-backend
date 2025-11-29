import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

/**
 * GET /api/v1/boosters/sealed
 * Lista boosters não abertos (sealed packs) do jogador
 */
export async function GET(request: NextRequest) {
  try {
    // Pega o token JWT do header Authorization
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { ok: false, error: { code: 'UNAUTHORIZED', message: 'Token não fornecido' } },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    // Cria cliente Supabase com o token do usuário
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    // Valida o token e pega o user_id
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { ok: false, error: { code: 'INVALID_TOKEN', message: 'Token inválido' } },
        { status: 401 }
      );
    }

    // Busca boosters não abertos (opened_at = null)
    const { data: sealedPacks, error } = await supabase
      .from('booster_openings')
      .select('id, booster_type_id, purchased_at, booster_types(name, edition_id)')
      .eq('user_id', user.id)
      .is('opened_at', null)
      .order('purchased_at', { ascending: false });

    if (error) {
      console.error('Error fetching sealed packs:', error);
      return NextResponse.json(
        { ok: false, error: { code: 'INTERNAL_ERROR', message: 'Erro ao buscar boosters' } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      data: {
        sealed_packs: sealedPacks || [],
      },
    });
  } catch (error) {
    console.error('Sealed packs endpoint error:', error);
    return NextResponse.json(
      { ok: false, error: { code: 'INTERNAL_ERROR', message: 'Erro interno' } },
      { status: 500 }
    );
  }
}
