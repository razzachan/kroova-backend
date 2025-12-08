import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { getRecyclePoints, getAffordableBoosters } from '@/lib/recycleConstants';

export const runtime = 'edge';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceKey = process.env.SUPABASE_SERVICE_KEY!;

/**
 * POST /api/v1/cards/recycle-for-points
 * Recycle cards for points (cards are destroyed)
 * 
 * Body: { card_instance_ids: string[] }
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
    const { card_instance_ids } = body;

    if (!Array.isArray(card_instance_ids) || card_instance_ids.length === 0) {
      return NextResponse.json(
        { error: 'card_instance_ids deve ser um array não vazio' },
        { status: 400 }
      );
    }

    console.log(`[RECYCLE-POINTS] Usuário ${user.id} reciclando ${card_instance_ids.length} cartas`);

    // 1. Buscar cartas e validar propriedade
    const { data: cards, error: cardsError } = await supabaseAdmin
      .from('cards_instances')
      .select(`
        id,
        owner_id,
        cards_base:base_id(name, rarity)
      `)
      .in('id', card_instance_ids);

    if (cardsError || !cards || cards.length === 0) {
      return NextResponse.json(
        { error: 'Cartas não encontradas' },
        { status: 404 }
      );
    }

    // 2. Validar que todas as cartas pertencem ao usuário
    const invalidCards = cards.filter(c => c.owner_id !== user.id);
    if (invalidCards.length > 0) {
      return NextResponse.json(
        { error: 'Você não é dono de todas as cartas selecionadas' },
        { status: 403 }
      );
    }

    // 3. Calcular pontos totais
    let totalPoints = 0;
    const recycleDetails: Array<{
      card_id: string;
      rarity: string;
      points: number;
    }> = [];

    for (const card of cards) {
      const rarity = (card as any).cards_base?.rarity || 'trash';
      const points = getRecyclePoints(rarity);
      totalPoints += points;
      
      recycleDetails.push({
        card_id: card.id,
        rarity,
        points
      });
    }

    console.log(`[RECYCLE-POINTS] Total de pontos: ${totalPoints}`);

    // 4. Buscar ou criar recycle_progress
    const { data: progress, error: progressError } = await supabaseAdmin
      .from('recycle_progress')
      .select('*')
      .eq('user_id', user.id)
      .single();

    let currentPoints = 0;
    let lifetimePoints = 0;
    let lifetimeCardsRecycled = 0;

    if (progress) {
      currentPoints = progress.total_points || 0;
      lifetimePoints = progress.lifetime_points || 0;
      lifetimeCardsRecycled = progress.lifetime_cards_recycled || 0;
    }

    const newTotalPoints = currentPoints + totalPoints;
    const newLifetimePoints = lifetimePoints + totalPoints;
    const newLifetimeCardsRecycled = lifetimeCardsRecycled + cards.length;

    // 5. Atualizar ou criar recycle_progress
    if (progress) {
      const { error: updateError } = await supabaseAdmin
        .from('recycle_progress')
        .update({
          total_points: newTotalPoints,
          lifetime_points: newLifetimePoints,
          lifetime_cards_recycled: newLifetimeCardsRecycled,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('[RECYCLE-POINTS] Erro ao atualizar progresso:', updateError);
        return NextResponse.json(
          { error: 'Erro ao atualizar progresso' },
          { status: 500 }
        );
      }
    } else {
      const { error: insertError } = await supabaseAdmin
        .from('recycle_progress')
        .insert({
          user_id: user.id,
          total_points: newTotalPoints,
          lifetime_points: newLifetimePoints,
          lifetime_cards_recycled: newLifetimeCardsRecycled
        });

      if (insertError) {
        console.error('[RECYCLE-POINTS] Erro ao criar progresso:', insertError);
        return NextResponse.json(
          { error: 'Erro ao criar progresso' },
          { status: 500 }
        );
      }
    }

    // 6. Registrar histórico de reciclagem
    const historyRecords = recycleDetails.map(detail => ({
      user_id: user.id,
      card_instance_id: detail.card_id,
      rarity: detail.rarity,
      points_earned: detail.points
    }));

    await supabaseAdmin
      .from('recycle_history')
      .insert(historyRecords);

    // 7. DELETAR as cartas do banco (queimar permanentemente)
    const { error: deleteError } = await supabaseAdmin
      .from('cards_instances')
      .delete()
      .in('id', card_instance_ids);

    if (deleteError) {
      console.error('[RECYCLE-POINTS] Erro ao deletar cartas:', deleteError);
      return NextResponse.json(
        { error: 'Erro ao reciclar cartas' },
        { status: 500 }
      );
    }

    // 8. Calcular boosters disponíveis para troca
    const affordableBoosters = getAffordableBoosters(newTotalPoints);

    console.log(`[RECYCLE-POINTS] ✅ ${cards.length} cartas recicladas, ${totalPoints} pontos ganhos`);
    console.log(`[RECYCLE-POINTS] Pontos: ${currentPoints} → ${newTotalPoints}`);

    return NextResponse.json({
      ok: true,
      data: {
        cards_recycled: cards.length,
        points_earned: totalPoints,
        previous_points: currentPoints,
        total_points: newTotalPoints,
        lifetime_points: newLifetimePoints,
        lifetime_cards_recycled: newLifetimeCardsRecycled,
        affordable_boosters: affordableBoosters,
        recycle_details: recycleDetails
      }
    });

  } catch (error) {
    console.error('[RECYCLE-POINTS] Erro:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
