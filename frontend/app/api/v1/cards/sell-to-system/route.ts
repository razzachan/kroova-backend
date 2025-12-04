import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

/**
 * POST /api/v1/cards/sell-to-system
 * 
 * Vende cartas de volta ao sistema pela liquidez mínima garantida
 * 
 * Body:
 * {
 *   card_instance_ids: string[] // Array de IDs das instâncias de cartas
 * }
 * 
 * Response:
 * {
 *   ok: boolean,
 *   data?: {
 *     cards_sold: number,
 *     total_value: number,
 *     new_balance: number
 *   },
 *   error?: { code: string, message: string }
 * }
 */
export async function POST(request: NextRequest) {
  console.log('[SELL-TO-SYSTEM] 🆕 VERSÃO NOVA COM DEBUG LOGS - 1. POST iniciado');
  
  try {
    // Env vars
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    console.log('[SELL-TO-SYSTEM] 2. Env vars OK');
    
    // Auth
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('[SELL-TO-SYSTEM] 3. No auth header');
      return NextResponse.json(
        { ok: false, error: { code: 'UNAUTHORIZED', message: 'No token' } },
        { status: 401 }
      );
    }
    console.log('[SELL-TO-SYSTEM] 3. Auth header OK');
    
    // Body
    const body = await request.json();
    const { card_instance_ids } = body;
    console.log('[SELL-TO-SYSTEM] 4. Body parsed, cards:', card_instance_ids?.length);
    
    if (!card_instance_ids || !Array.isArray(card_instance_ids) || card_instance_ids.length === 0) {
      return NextResponse.json(
        { ok: false, error: { code: 'VALIDATION_ERROR', message: 'card_instance_ids array required' } },
        { status: 400 }
      );
    }
    
    // Supabase clients
    const token = authHeader.substring(7);
    const supabaseAuth = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    });
    const supabaseAdmin = createClient(supabaseUrl, serviceKey);
    console.log('[SELL-TO-SYSTEM] 5. Supabase clients criados');
    
    // Get user
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
    if (userError || !user) {
      console.error('[SELL-TO-SYSTEM] 6. User error:', userError);
      return NextResponse.json(
        { ok: false, error: { code: 'UNAUTHORIZED', message: 'Invalid token' } },
        { status: 401 }
      );
    }
    console.log('[SELL-TO-SYSTEM] 6. User OK:', user.id);
    
    // Buscar cartas e validar ownership
    const { data: cards, error: cardsError } = await supabaseAdmin
      .from('cards_instances')
      .select('id, liquidity_brl, owner_id')
      .in('id', card_instance_ids);
    
    if (cardsError) {
      console.error('[SELL-TO-SYSTEM] 7. Cards error:', cardsError);
      return NextResponse.json(
        { ok: false, error: { code: 'DATABASE_ERROR', message: 'Failed to fetch cards' } },
        { status: 500 }
      );
    }
    
    if (!cards || cards.length === 0) {
      console.error('[SELL-TO-SYSTEM] 7. No cards found');
      return NextResponse.json(
        { ok: false, error: { code: 'NOT_FOUND', message: 'No cards found' } },
        { status: 404 }
      );
    }
    console.log('[SELL-TO-SYSTEM] 7. Found', cards.length, 'cards');
    
    // Validar que todas as cartas pertencem ao usuário
    const invalidCards = cards.filter(c => c.owner_id !== user.id);
    if (invalidCards.length > 0) {
      console.error('[SELL-TO-SYSTEM] 8. Invalid ownership:', invalidCards.length, 'cards');
      return NextResponse.json(
        { ok: false, error: { code: 'FORBIDDEN', message: 'Some cards do not belong to you' } },
        { status: 403 }
      );
    }
    console.log('[SELL-TO-SYSTEM] 8. Ownership validated');
    
    // Calcular valor total
    const totalValue = cards.reduce((sum, card) => sum + (card.liquidity_brl || 0), 0);
    console.log('[SELL-TO-SYSTEM] 9. Total value: R$', totalValue.toFixed(4));
    
    if (totalValue <= 0) {
      return NextResponse.json(
        { ok: false, error: { code: 'INVALID_VALUE', message: 'Cards have no value' } },
        { status: 400 }
      );
    }
    
    // Deletar cartas (usar admin para bypass RLS)
    const { error: deleteError } = await supabaseAdmin
      .from('cards_instances')
      .delete()
      .in('id', card_instance_ids);
    
    if (deleteError) {
      console.error('[SELL-TO-SYSTEM] 10. Delete error:', deleteError);
      return NextResponse.json(
        { ok: false, error: { code: 'DATABASE_ERROR', message: 'Failed to delete cards' } },
        { status: 500 }
      );
    }
    console.log('[SELL-TO-SYSTEM] 10. Cards deleted');
    
    // Creditar saldo ao usuário (usar tabela WALLETS, não USERS)
    const { data: userData, error: updateError } = await supabaseAdmin
      .from('wallets')
      .select('balance_brl')
      .eq('user_id', user.id)
      .single();
    
    if (updateError || !userData) {
      console.error('[SELL-TO-SYSTEM] 11. Wallet balance fetch error:', updateError);
      // Se não conseguir buscar saldo, assume 0
    }
    
    const currentBalance = userData?.balance_brl || 0;
    const newBalance = currentBalance + totalValue;
    
    console.log('[SELL-TO-SYSTEM] 11.5. Balance calculation:', {
      currentBalance,
      totalValue,
      newBalance,
      formula: `${currentBalance} + ${totalValue} = ${newBalance}`
    });
    
    const { error: balanceError } = await supabaseAdmin
      .from('wallets')
      .update({ balance_brl: newBalance })
      .eq('user_id', user.id);
    
    if (balanceError) {
      console.error('[SELL-TO-SYSTEM] 12. Balance update error:', balanceError);
      return NextResponse.json(
        { ok: false, error: { code: 'DATABASE_ERROR', message: 'Failed to update balance' } },
        { status: 500 }
      );
    }
    console.log('[SELL-TO-SYSTEM] 12. Balance updated: R$', currentBalance.toFixed(2), '→ R$', newBalance.toFixed(2));
    
    // Verificar se o update realmente funcionou
    const { data: verifyData } = await supabaseAdmin
      .from('wallets')
      .select('balance_brl')
      .eq('user_id', user.id)
      .single();
    
    console.log('[SELL-TO-SYSTEM] 12.5. Balance verification after update:', {
      expectedBalance: newBalance,
      actualBalance: verifyData?.balance_brl,
      match: verifyData?.balance_brl === newBalance
    });
    
    // NOVO: Registrar transação no histórico
    const { error: transactionError } = await supabaseAdmin
      .from('transaction_history')
      .insert({
        user_id: user.id,
        type: 'sell_to_system',
        amount_brl: totalValue,
        balance_before_brl: currentBalance,
        balance_after_brl: newBalance,
        status: 'completed',
        details: {
          cards_count: cards.length,
          card_ids: card_instance_ids,
          cards_summary: cards.map(c => ({
            id: c.id,
            liquidity: c.liquidity_brl
          }))
        }
      });
    
    if (transactionError) {
      console.warn('[SELL-TO-SYSTEM] 13. Transaction history error (non-critical):', transactionError);
      // Não falha a operação se o histórico não for salvo
    } else {
      console.log('[SELL-TO-SYSTEM] 13. Transaction recorded');
    }
    
    // Sucesso
    return NextResponse.json({
      ok: true,
      data: {
        cards_sold: cards.length,
        total_value: totalValue,
        new_balance: newBalance
      },
      debug: {
        balance_calculation: {
          current: currentBalance,
          added: totalValue,
          result: newBalance,
          formula: `${currentBalance} + ${totalValue} = ${newBalance}`
        },
        verification: {
          expected: newBalance,
          actual: verifyData?.balance_brl,
          match: verifyData?.balance_brl === newBalance
        },
        update_error: balanceError ? String(balanceError) : null
      }
    });
    
  } catch (err) {
    console.error('[SELL-TO-SYSTEM] Unexpected error:', err);
    return NextResponse.json(
      { ok: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
