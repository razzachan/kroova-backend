import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * POST /api/v1/cards/recycle-bulk
 * Recicla 25 cartas e ganha 1 booster grátis aleatório
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { ok: false, error: { code: 'UNAUTHORIZED', message: 'Token não fornecido' } },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    });

    // Valida token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json(
        { ok: false, error: { code: 'INVALID_TOKEN', message: 'Token inválido' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { card_instance_ids } = body;

    // Validação
    if (!Array.isArray(card_instance_ids) || card_instance_ids.length !== 25) {
      return NextResponse.json(
        { ok: false, error: { code: 'VALIDATION_ERROR', message: 'Você precisa selecionar exatamente 25 cartas' } },
        { status: 400 }
      );
    }

    // Verifica se o usuário possui todas as cartas
    const { data: cards, error: cardsError } = await supabase
      .from('cards_instances')
      .select('id, user_id')
      .in('id', card_instance_ids);

    if (cardsError) {
      return NextResponse.json(
        { ok: false, error: { code: 'DATABASE_ERROR', message: cardsError.message } },
        { status: 500 }
      );
    }

    // Verifica propriedade
    const notOwned = cards?.filter(c => c.user_id !== user.id) || [];
    if (notOwned.length > 0) {
      return NextResponse.json(
        { ok: false, error: { code: 'FORBIDDEN', message: 'Você não possui todas essas cartas' } },
        { status: 403 }
      );
    }

    if (cards?.length !== 25) {
      return NextResponse.json(
        { ok: false, error: { code: 'NOT_FOUND', message: 'Algumas cartas não foram encontradas' } },
        { status: 404 }
      );
    }

    // Deleta as cartas (reciclagem)
    const { error: deleteError } = await supabase
      .from('cards_instances')
      .delete()
      .in('id', card_instance_ids);

    if (deleteError) {
      return NextResponse.json(
        { ok: false, error: { code: 'DATABASE_ERROR', message: deleteError.message } },
        { status: 500 }
      );
    }

    // Busca um booster pack aleatório ativo
    const { data: packs, error: packsError } = await supabase
      .from('booster_packs')
      .select('pack_id, pack_name, edition_id')
      .eq('is_active', true)
      .eq('edition_id', 'ED01');

    if (packsError || !packs || packs.length === 0) {
      return NextResponse.json(
        { ok: false, error: { code: 'NO_PACKS', message: 'Nenhum pack disponível para recompensa' } },
        { status: 500 }
      );
    }

    // Escolhe pack aleatório
    const randomPack = packs[Math.floor(Math.random() * packs.length)];

    // Cria booster_opening (booster grátis)
    const { data: opening, error: openingError } = await supabase
      .from('booster_openings')
      .insert({
        user_id: user.id,
        booster_type_id: randomPack.pack_id,
        cards_obtained: [],
        purchased_at: new Date().toISOString()
      })
      .select()
      .single();

    if (openingError) {
      return NextResponse.json(
        { ok: false, error: { code: 'DATABASE_ERROR', message: openingError.message } },
        { status: 500 }
      );
    }

    // Registra transação de reciclagem
    await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        type: 'recycle_bulk',
        amount_brl: 0,
        description: `Reciclagem: 25 cartas → 1 ${randomPack.pack_name}`,
        metadata: { 
          recycled_cards: card_instance_ids.length,
          reward_pack_id: randomPack.pack_id
        }
      });

    return NextResponse.json({
      ok: true,
      data: {
        cards_recycled: 25,
        reward: {
          opening_id: opening.id,
          booster_name: randomPack.pack_name,
          booster_type_id: randomPack.pack_id
        }
      }
    });

  } catch (error: any) {
    console.error('[RECYCLE-BULK] Error:', error);
    return NextResponse.json(
      { ok: false, error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
