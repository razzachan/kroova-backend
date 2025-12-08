import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceKey = process.env.SUPABASE_SERVICE_KEY!;

/**
 * POST /api/v1/cards/redeem-prize
 * Redeem cashback from a card (keeps card in inventory)
 * 
 * Body: { card_instance_id: string }
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
    const { card_instance_id } = body;

    if (!card_instance_id) {
      return NextResponse.json(
        { error: 'card_instance_id é obrigatório' },
        { status: 400 }
      );
    }

    // 1. Buscar carta e validar
    const { data: card, error: cardError } = await supabaseAdmin
      .from('cards_instances')
      .select('id, owner_id, prize_amount_brl, prize_redeemed, cards_base:base_id(name, rarity)')
      .eq('id', card_instance_id)
      .single();

    if (cardError || !card) {
      return NextResponse.json(
        { error: 'Carta não encontrada' },
        { status: 404 }
      );
    }

    // 2. Validar propriedade
    if (card.owner_id !== user.id) {
      return NextResponse.json(
        { error: 'Esta carta não pertence a você' },
        { status: 403 }
      );
    }

    // 3. Validar se já foi resgatado
    if (card.prize_redeemed) {
      return NextResponse.json(
        { error: 'Cashback já foi resgatado desta carta' },
        { status: 400 }
      );
    }

    // 4. Validar valor
    if (!card.prize_amount_brl || card.prize_amount_brl <= 0) {
      return NextResponse.json(
        { error: 'Esta carta não possui cashback disponível' },
        { status: 400 }
      );
    }

    const cashbackAmount = parseFloat(card.prize_amount_brl.toString());

    console.log(`[REDEEM-PRIZE] Usuário ${user.id} resgatando R$ ${cashbackAmount.toFixed(4)} da carta ${card_instance_id}`);

    // 5. Buscar wallet
    const { data: wallet, error: walletError } = await supabaseAdmin
      .from('wallets')
      .select('balance_brl')
      .eq('user_id', user.id)
      .single();

    if (walletError || !wallet) {
      return NextResponse.json(
        { error: 'Wallet não encontrada' },
        { status: 404 }
      );
    }

    const currentBalance = parseFloat(wallet.balance_brl.toString());
    const newBalance = currentBalance + cashbackAmount;

    // 6. Transação: Atualizar carta + wallet
    const { error: updateCardError } = await supabaseAdmin
      .from('cards_instances')
      .update({
        prize_redeemed: true,
        prize_redeemed_at: new Date().toISOString()
      })
      .eq('id', card_instance_id);

    if (updateCardError) {
      console.error('[REDEEM-PRIZE] Erro ao atualizar carta:', updateCardError);
      return NextResponse.json(
        { error: 'Erro ao processar resgate' },
        { status: 500 }
      );
    }

    const { error: updateWalletError } = await supabaseAdmin
      .from('wallets')
      .update({ balance_brl: newBalance })
      .eq('user_id', user.id);

    if (updateWalletError) {
      console.error('[REDEEM-PRIZE] Erro ao atualizar wallet:', updateWalletError);
      // Reverter carta
      await supabaseAdmin
        .from('cards_instances')
        .update({
          prize_redeemed: false,
          prize_redeemed_at: null
        })
        .eq('id', card_instance_id);
      
      return NextResponse.json(
        { error: 'Erro ao atualizar carteira' },
        { status: 500 }
      );
    }

    // 7. Registrar transação
    await supabaseAdmin
      .from('transactions')
      .insert({
        user_id: user.id,
        type: 'cashback_redeem',
        amount_brl: cashbackAmount,
        description: `Cashback resgatado da carta ${(card as any).cards_base?.name || card_instance_id}`
      });

    console.log(`[REDEEM-PRIZE] ✅ Cashback resgatado: R$ ${currentBalance.toFixed(2)} → R$ ${newBalance.toFixed(2)}`);

    return NextResponse.json({
      ok: true,
      data: {
        cashback_amount: cashbackAmount,
        old_balance: currentBalance,
        new_balance: newBalance,
        card_id: card_instance_id
      }
    });

  } catch (error) {
    console.error('[REDEEM-PRIZE] Erro:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
