import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; // Usar anon key que já funciona

/**
 * GET /api/v1/booster-packs?edition=ED01
 * Lista os packs disponíveis para uma edição
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const edition = searchParams.get('edition') || 'ED01';

    console.log('[GET /booster-packs] Starting...');
    console.log('[GET /booster-packs] supabaseUrl:', supabaseUrl);
    console.log('[GET /booster-packs] supabaseKey exists:', !!supabaseKey);
    console.log('[GET /booster-packs] edition:', edition);

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Busca packs com estatísticas
    const { data: packs, error } = await supabase
      .from('v_pack_stats')
      .select('*')
      .eq('edition_id', edition)
      .eq('is_active', true)
      .order('pack_id', { ascending: true });

    console.log('[GET /booster-packs] Query result:', { packs: packs?.length, error });

    if (error) {
      console.error('[GET /booster-packs] Database error:', error);
      return NextResponse.json(
        { ok: false, error: { code: 'DATABASE_ERROR', message: error.message, details: error } },
        { status: 500 }
      );
    }

    if (!packs || packs.length === 0) {
      return NextResponse.json(
        { ok: false, error: { code: 'NO_PACKS_FOUND', message: `Nenhum pack ativo encontrado para edição ${edition}` } },
        { status: 404 }
      );
    }

    // Formata resposta
    const formattedPacks = packs.map(pack => ({
      pack_id: pack.pack_id,
      pack_name: pack.pack_name,
      theme: pack.theme,
      edition_id: pack.edition_id,
      price_brl: parseFloat(pack.price_brl),
      total_cards: pack.total_cards,
      exclusive_cards: pack.exclusive_cards,
      shared_cards: pack.shared_cards,
      rarity_distribution: {
        trash: pack.trash_count,
        meme: pack.meme_count,
        viral: pack.viral_count,
        legendary: pack.legendary_count,
        godmode: pack.godmode_count,
      },
      avg_liquidity_brl: parseFloat(pack.avg_liquidity),
      expected_value_per_booster: parseFloat(pack.avg_liquidity) * 5,
      rtp_percent: Math.round((parseFloat(pack.avg_liquidity) * 5 / parseFloat(pack.price_brl)) * 10000) / 100,
    }));

    return NextResponse.json({
      ok: true,
      data: {
        edition_id: edition,
        packs: formattedPacks,
        total_packs: formattedPacks.length,
      }
    });

  } catch (error: any) {
    console.error('[GET /booster-packs] Internal error:', error);
    return NextResponse.json(
      { ok: false, error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
