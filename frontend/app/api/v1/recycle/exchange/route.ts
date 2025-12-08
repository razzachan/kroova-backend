import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { getBoosterPointsCost } from '@/lib/recycleConstants';

export const runtime = 'edge';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceKey = process.env.SUPABASE_SERVICE_KEY!;

/**
 * POST /api/v1/recycle/exchange
 * Exchange recycle points for a booster
 * 
 * Body: { booster_tier: 'Básico' | 'Padrão' | 'Premium' | 'Elite' | 'Whale' }
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { booster_tier } = body;

    if (!booster_tier) {
      return NextResponse.json(
        { error: 'booster_tier é obrigatório' },
        { status: 400 }
      );
    }

    const pointsCost = getBoosterPointsCost(booster_tier);
    if (!pointsCost) {
      return NextResponse.json(
        { error: 'Tier de booster inválido' },
        { status: 400 }
      );
    }

    console.log(`[RECYCLE-EXCHANGE] Usuário ${user.id} trocando ${pointsCost} pontos por booster ${booster_tier}`);

    // 1. Buscar progresso de reciclagem
    const { data: progress, error: progressError } = await supabaseAdmin
      .from('recycle_progress')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (progressError || !progress) {
      return NextResponse.json(
        { error: 'Você ainda não possui pontos de reciclagem' },
        { status: 404 }
      );
    }

    const currentPoints = progress.total_points || 0;

    // 2. Validar saldo de pontos
    if (currentPoints < pointsCost) {
      return NextResponse.json(
        { 
          error: `Pontos insuficientes. Você tem ${currentPoints}, precisa de ${pointsCost}`,
          current_points: currentPoints,
          required_points: pointsCost
        },
        { status: 400 }
      );
    }

    // 3. Buscar booster_type
    const { data: boosterType, error: boosterError } = await supabaseAdmin
      .from('booster_types')
      .select('*')
      .eq('name', booster_tier)
      .eq('is_active', true)
      .single();

    if (boosterError || !boosterType) {
      return NextResponse.json(
        { error: `Booster ${booster_tier} não encontrado ou não está ativo` },
        { status: 404 }
      );
    }

    // 4. Debitar pontos
    const newPoints = currentPoints - pointsCost;
    
    const { error: updateError } = await supabaseAdmin
      .from('recycle_progress')
      .update({
        total_points: newPoints,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('[RECYCLE-EXCHANGE] Erro ao debitar pontos:', updateError);
      return NextResponse.json(
        { error: 'Erro ao processar troca' },
        { status: 500 }
      );
    }

    // 5. Criar booster_opening (booster grátis obtido por pontos)
    const { data: opening, error: openingError } = await supabaseAdmin
      .from('booster_openings')
      .insert({
        user_id: user.id,
        booster_pack_id: boosterType.id,
        status: 'pending',
        source: 'recycle_exchange' // Marcar origem
      })
      .select()
      .single();

    if (openingError || !opening) {
      console.error('[RECYCLE-EXCHANGE] Erro ao criar booster:', openingError);
      
      // Reverter pontos
      await supabaseAdmin
        .from('recycle_progress')
        .update({
          total_points: currentPoints,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);
      
      return NextResponse.json(
        { error: 'Erro ao criar booster' },
        { status: 500 }
      );
    }

    // 6. Registrar histórico de troca
    await supabaseAdmin
      .from('points_exchange_history')
      .insert({
        user_id: user.id,
        booster_type_id: boosterType.id,
        booster_tier: booster_tier,
        points_spent: pointsCost,
        booster_opening_id: opening.id
      });

    console.log(`[RECYCLE-EXCHANGE] ✅ Troca realizada: ${pointsCost} pontos → 1 ${booster_tier}`);
    console.log(`[RECYCLE-EXCHANGE] Pontos: ${currentPoints} → ${newPoints}`);

    return NextResponse.json({
      ok: true,
      data: {
        booster_tier: booster_tier,
        points_spent: pointsCost,
        previous_points: currentPoints,
        remaining_points: newPoints,
        booster_opening_id: opening.id,
        message: `Você trocou ${pointsCost} pontos por 1 booster ${booster_tier}!`
      }
    });

  } catch (error) {
    console.error('[RECYCLE-EXCHANGE] Erro:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
