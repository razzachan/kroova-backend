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

    // Busca booster_types (não pack_stats) para ter todas as tiers
    const { data: boosters, error } = await supabase
      .from('booster_types')
      .select(`
        id,
        name,
        edition_id,
        pack_id,
        price_brl,
        cards_per_booster,
        rarity_distribution,
        booster_packs!inner(pack_name, theme, is_active)
      `)
      .eq('edition_id', edition)
      .eq('booster_packs.is_active', true)
      .order('pack_id', { ascending: true })
      .order('price_brl', { ascending: true });

    console.log('[GET /booster-packs] Query result:', { boosters: boosters?.length, error });

    if (error) {
      console.error('[GET /booster-packs] Database error:', error);
      return NextResponse.json(
        { ok: false, error: { code: 'DATABASE_ERROR', message: error.message, details: error } },
        { status: 500 }
      );
    }

    if (!boosters || boosters.length === 0) {
      return NextResponse.json(
        { ok: false, error: { code: 'NO_PACKS_FOUND', message: `Nenhum pack ativo encontrado para edição ${edition}` } },
        { status: 404 }
      );
    }

    // Formata resposta
    const formattedPacks = boosters.map(booster => ({
      id: booster.id,
      pack_id: booster.pack_id,
      pack_name: (booster.booster_packs as any)?.pack_name || booster.name,
      theme: (booster.booster_packs as any)?.theme,
      name: booster.name,
      edition_id: booster.edition_id,
      price_brl: parseFloat(booster.price_brl as any),
      cards_per_booster: booster.cards_per_booster || 5,
      rarity_distribution: booster.rarity_distribution
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
