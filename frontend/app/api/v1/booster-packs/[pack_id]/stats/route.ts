import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * GET /api/v1/booster-packs/[pack_id]/stats
 * Retorna estatísticas detalhadas de um pack específico
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pack_id: string }> }
) {
  try {
    const { pack_id } = await params;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Busca stats do pack
    const { data: packStats, error: statsError } = await supabase
      .from('v_pack_stats')
      .select('*')
      .eq('pack_id', pack_id)
      .single();

    if (statsError || !packStats) {
      return NextResponse.json(
        { ok: false, error: { code: 'PACK_NOT_FOUND', message: `Pack ${pack_id} não encontrado` } },
        { status: 404 }
      );
    }

    // Busca detalhes do pack
    const { data: packDetails, error: detailsError } = await supabase
      .from('booster_packs')
      .select('*')
      .eq('pack_id', pack_id)
      .single();

    if (detailsError || !packDetails) {
      return NextResponse.json(
        { ok: false, error: { code: 'PACK_NOT_FOUND', message: `Detalhes do pack ${pack_id} não encontrados` } },
        { status: 404 }
      );
    }

    // Busca distribuição de rarities nas cartas do pool
    const { data: rarityDistribution, error: rarityError } = await supabase
      .from('pack_card_pools')
      .select(`
        card_base_id,
        is_exclusive,
        cards_base (
          rarity,
          fixed_liquidity_brl
        )
      `)
      .eq('pack_id', pack_id);

    if (rarityError) {
      console.error('[GET /booster-packs/stats] Rarity query error:', rarityError);
    }

    // Calcula probabilidades reais baseadas no pool
    const totalCards = rarityDistribution?.length || 0;
    const rarityCount = rarityDistribution?.reduce((acc: any, card: any) => {
      const rarity = card.cards_base?.rarity;
      if (rarity) {
        acc[rarity] = (acc[rarity] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const rarityProbabilities = Object.entries(rarityCount || {}).reduce((acc: any, [rarity, count]) => {
      acc[rarity] = Math.round((count as number / totalCards) * 10000) / 100;
      return acc;
    }, {});

    // Formata resposta
    return NextResponse.json({
      ok: true,
      data: {
        pack_id: packDetails.pack_id,
        pack_name: packDetails.pack_name,
        theme: packDetails.theme,
        description: packDetails.description,
        edition_id: packDetails.edition_id,
        price_brl: parseFloat(packDetails.price_brl),
        is_active: packDetails.is_active,
        release_date: packDetails.release_date,
        metadata: packDetails.metadata,
        
        statistics: {
          total_cards: packStats.total_cards,
          exclusive_cards: packStats.exclusive_cards,
          shared_cards: packStats.shared_cards,
          
          rarity_counts: {
            trash: packStats.trash_count,
            meme: packStats.meme_count,
            viral: packStats.viral_count,
            legendary: packStats.legendary_count,
            godmode: packStats.godmode_count,
          },
          
          rarity_probabilities: rarityProbabilities,
          
          avg_liquidity_brl: parseFloat(packStats.avg_liquidity),
          expected_value_per_card: parseFloat(packStats.avg_liquidity),
          expected_value_per_booster: parseFloat(packStats.avg_liquidity) * 5,
          rtp_percent: Math.round((parseFloat(packStats.avg_liquidity) * 5 / parseFloat(packStats.price_brl)) * 10000) / 100,
          margin_percent: Math.round((1 - (parseFloat(packStats.avg_liquidity) * 5 / parseFloat(packStats.price_brl))) * 10000) / 100,
        },
        
        treatment_probabilities: {
          normal: 95.0,
          neon: 4.0,
          holographic: 0.8,
          dark: 0.15,
          glitch: 0.04,
          cosmic: 0.008,
          prismatic: 0.001,
          singularity: 0.0002,
          divine: 0.00005,
          kroova_prime: 0.00001,
        },
        
        treatment_multipliers: {
          normal: 1.0,
          neon: 1.5,
          holographic: 2.0,
          dark: 3.0,
          glitch: 5.0,
          cosmic: 10.0,
          prismatic: 20.0,
          singularity: 50.0,
          divine: 100.0,
          kroova_prime: 500.0,
        },
      }
    });

  } catch (error: any) {
    console.error('[GET /booster-packs/stats] Internal error:', error);
    return NextResponse.json(
      { ok: false, error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
