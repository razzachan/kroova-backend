import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceKey = process.env.SUPABASE_SERVICE_KEY!;

/**
 * GET /api/v1/recycle/progress
 * Get user's recycle progress (total points, cards recycled, etc)
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
    const supabaseAdmin = createClient(supabaseUrl, serviceKey);

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    // Buscar progresso de reciclagem
    const { data: progress, error: progressError } = await supabaseAdmin
      .from('recycle_progress')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Se não existe, retornar valores zerados
    if (progressError || !progress) {
      return NextResponse.json({
        user_id: user.id,
        total_points: 0,
        lifetime_cards_recycled: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }

    return NextResponse.json({
      user_id: progress.user_id,
      total_points: progress.total_points || 0,
      lifetime_cards_recycled: progress.lifetime_cards_recycled || 0,
      created_at: progress.created_at,
      updated_at: progress.updated_at
    });

  } catch (error: any) {
    console.error('[RECYCLE-PROGRESS] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar progresso de reciclagem' },
      { status: 500 }
    );
  }
}
