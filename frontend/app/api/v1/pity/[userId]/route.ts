import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { ok: false, error: { code: 'UNAUTHORIZED', message: 'No token provided' } },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const supabase = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    });

    // Verificar autenticação
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json(
        { ok: false, error: { code: 'UNAUTHORIZED', message: 'Invalid token' } },
        { status: 401 }
      );
    }

    // Apenas o próprio user pode ver seu pity counter
    if (user.id !== params.userId) {
      return NextResponse.json(
        { ok: false, error: { code: 'FORBIDDEN', message: 'Cannot view other user pity counter' } },
        { status: 403 }
      );
    }

    const editionId = request.nextUrl.searchParams.get('edition_id') || 'ED01';

    // Buscar pity counter
    const { data: pityData, error: pityError } = await supabase
      .from('user_pity_counter')
      .select('counter, last_reset_at, updated_at')
      .eq('user_id', params.userId)
      .eq('edition_id', editionId)
      .single();

    if (pityError) {
      // Se não existe, retornar 0
      return NextResponse.json({
        ok: true,
        data: {
          user_id: params.userId,
          edition_id: editionId,
          counter: 0,
          last_reset_at: null,
          updated_at: null
        }
      });
    }

    return NextResponse.json({
      ok: true,
      data: {
        user_id: params.userId,
        edition_id: editionId,
        counter: pityData.counter,
        last_reset_at: pityData.last_reset_at,
        updated_at: pityData.updated_at,
        remaining: 100 - pityData.counter
      }
    });

  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
