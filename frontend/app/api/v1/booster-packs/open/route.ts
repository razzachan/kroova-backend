import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * POST /api/v1/booster-packs/open
 * Abre um booster pack e retorna 5 cartas
 * 
 * Body: { pack_id: string, user_id: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pack_id, user_id } = body;

    // Validação
    if (!pack_id || typeof pack_id !== 'string') {
      return NextResponse.json(
        { ok: false, error: { code: 'INVALID_PACK_ID', message: 'pack_id é obrigatório' } },
        { status: 400 }
      );
    }

    if (!user_id || typeof user_id !== 'string') {
      return NextResponse.json(
        { ok: false, error: { code: 'INVALID_USER_ID', message: 'user_id é obrigatório' } },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Chama função PostgreSQL open_booster_pack_with_pity (novo sistema)
    const { data, error } = await supabase.rpc('open_booster_pack_with_pity', {
      p_pack_id: pack_id,
      p_user_id: user_id,
      p_pack_tier: 'standard', // pode ser parametrizado depois
    });

    if (error) {
      console.error('[POST /booster-packs/open] RPC error:', error);
      
      // Erros específicos da função
      if (error.message.includes('não encontrado')) {
        return NextResponse.json(
          { ok: false, error: { code: 'PACK_NOT_FOUND', message: error.message } },
          { status: 404 }
        );
      }
      
      if (error.message.includes('Saldo insuficiente')) {
        return NextResponse.json(
          { ok: false, error: { code: 'INSUFFICIENT_BALANCE', message: error.message } },
          { status: 402 }
        );
      }

      if (error.message.includes('Carteira não encontrada')) {
        return NextResponse.json(
          { ok: false, error: { code: 'WALLET_NOT_FOUND', message: error.message } },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { ok: false, error: { code: 'DATABASE_ERROR', message: error.message } },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { ok: false, error: { code: 'NO_CARDS_GENERATED', message: 'Nenhuma carta foi gerada' } },
        { status: 500 }
      );
    }

    // Formata resposta com as 5 cartas (agora com is_pity_reward)
    const cards = data.map((card: any) => ({
      card_base_id: card.card_base_id,
      name: card.card_name,
      rarity: card.rarity,
      treatment: card.treatment,
      treatment_multiplier: parseFloat(card.treatment_multiplier),
      base_value_brl: parseFloat(card.fixed_liquidity_brl),
      effective_value_brl: parseFloat(card.effective_value_brl),
      image_url: card.image_url,
      is_special: card.treatment !== 'normal',
      is_pity_reward: card.is_pity_reward || false, // ✨ NOVO: flag do backend
    }));

    // Calcula valores totais
    const total_base_value = cards.reduce((sum: number, c: any) => sum + c.base_value_brl, 0);
    const total_effective_value = cards.reduce((sum: number, c: any) => sum + c.effective_value_brl, 0);
    const special_cards_count = cards.filter((c: any) => c.is_special).length;

    // Identifica melhor carta (maior valor efetivo)
    const best_card = cards.reduce((best: any, current: any) => 
      current.effective_value_brl > best.effective_value_brl ? current : best
    );

    // Detecta se teve pity trigger (qualquer carta com flag)
    const pity_triggered = cards.some((c: any) => c.is_pity_reward);
    const pity_card = pity_triggered ? cards.find((c: any) => c.is_pity_reward) : null;

    return NextResponse.json({
      ok: true,
      data: {
        pack_id,
        user_id,
        cards,
        pity_triggered, // ✨ NOVO: informa se teve trigger
        pity_type: pity_card ? (pity_card.rarity === 'godmode' ? 'godmode' : 'legendary') : null, // ✨ NOVO: tipo do trigger
        summary: {
          total_cards: 5,
          special_cards_count,
          total_base_value_brl: Math.round(total_base_value * 100) / 100,
          total_effective_value_brl: Math.round(total_effective_value * 100) / 100,
          best_card: {
            name: best_card.name,
            rarity: best_card.rarity,
            treatment: best_card.treatment,
            value_brl: best_card.effective_value_brl,
          },
          rarity_breakdown: {
            trash: cards.filter((c: any) => c.rarity === 'trash').length,
            meme: cards.filter((c: any) => c.rarity === 'meme').length,
            viral: cards.filter((c: any) => c.rarity === 'viral').length,
            legendary: cards.filter((c: any) => c.rarity === 'legendary').length,
            godmode: cards.filter((c: any) => c.rarity === 'godmode').length,
          },
        },
        opened_at: new Date().toISOString(),
      }
    });

  } catch (error: any) {
    console.error('[POST /booster-packs/open] Internal error:', error);
    return NextResponse.json(
      { ok: false, error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
