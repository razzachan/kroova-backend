import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

/**
 * GET /api/v1/cards/recycle-count
 * Retorna quantas reciclagens o usuário fez hoje
 */
export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { ok: false, error: { code: 'UNAUTHORIZED', message: 'Token não fornecido' } },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    const supabaseAuth = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    });
    
    const supabaseAdmin = createClient(supabaseUrl, serviceKey);

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json(
        { ok: false, error: { code: 'INVALID_TOKEN', message: 'Token inválido' } },
        { status: 401 }
      );
    }

    // Buscar reciclagens de hoje
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data: todayRecycles, error: recyclesError } = await supabaseAdmin
      .from('transactions')
      .select('id', { count: 'exact', head: false })
      .eq('user_id', user.id)
      .eq('type', 'recycle_bulk')
      .gte('created_at', today.toISOString());

    if (recyclesError) {
      return NextResponse.json(
        { ok: false, error: { code: 'DATABASE_ERROR', message: recyclesError.message } },
        { status: 500 }
      );
    }

    const recycleCount = todayRecycles?.length || 0;
    const maxRecycles = 3;

    return NextResponse.json({
      ok: true,
      data: {
        recycles_today: recycleCount,
        max_recycles: maxRecycles,
        remaining: Math.max(0, maxRecycles - recycleCount)
      }
    });

  } catch (error: any) {
    console.error('[RECYCLE-COUNT] Error:', error);
    return NextResponse.json(
      { ok: false, error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
