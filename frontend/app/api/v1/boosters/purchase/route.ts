import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceKey = process.env.SUPABASE_SERVICE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { ok: false, error: { code: 'UNAUTHORIZED', message: 'No token provided' } },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const supabase = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    });

    // Admin client para operações que precisam bypass RLS
    const supabaseAdmin = createClient(supabaseUrl, serviceKey);

    const body = await request.json();
    const { booster_type_id } = body;

    if (!booster_type_id) {
      return NextResponse.json(
        { ok: false, error: { code: 'VALIDATION_ERROR', message: 'booster_type_id is required' } },
        { status: 400 }
      );
    }

    console.log('[PURCHASE] Looking for booster_type_id:', booster_type_id);

    // 1. Buscar booster type
    const { data: boosterType, error: boosterError } = await supabaseAdmin
      .from('booster_types')
      .select('*')
      .eq('id', booster_type_id)
      .single();

    console.log('[PURCHASE] Booster type result:', { boosterType, boosterError });

    if (boosterError || !boosterType) {
      // List all available booster types for debugging
      const { data: allTypes } = await supabaseAdmin
        .from('booster_types')
        .select('id, name')
        .limit(5);
      
      console.log('[PURCHASE] Available booster types:', allTypes);
      
      return NextResponse.json(
        { ok: false, error: { code: 'NOT_FOUND', message: `Booster type not found. ID received: ${booster_type_id}` } },
        { status: 404 }
      );
    }

    // 2. Obter user_id do token
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json(
        { ok: false, error: { code: 'UNAUTHORIZED', message: 'Invalid token' } },
        { status: 401 }
      );
    }

    // 3. Verificar saldo
    const { data: wallet, error: walletError } = await supabaseAdmin
      .from('wallets')
      .select('balance_brl')
      .eq('user_id', user.id)
      .single();

    if (walletError || !wallet) {
      return NextResponse.json(
        { ok: false, error: { code: 'WALLET_ERROR', message: 'Wallet not found' } },
        { status: 404 }
      );
    }

    if (wallet.balance_brl < boosterType.price_brl) {
      return NextResponse.json(
        { ok: false, error: { code: 'INSUFFICIENT_FUNDS', message: 'Saldo insuficiente' } },
        { status: 400 }
      );
    }

    // 4. Debitar wallet
    const { error: debitError } = await supabaseAdmin
      .from('wallets')
      .update({ 
        balance_brl: wallet.balance_brl - boosterType.price_brl,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (debitError) {
      return NextResponse.json(
        { ok: false, error: { code: 'DATABASE_ERROR', message: debitError.message } },
        { status: 500 }
      );
    }

    // 5. Registrar transação
    await supabaseAdmin
      .from('transactions')
      .insert({
        user_id: user.id,
        type: 'booster_purchase',
        amount_brl: -boosterType.price_brl,
        description: `Compra: ${boosterType.name}`,
        metadata: { booster_type_id }
      });

    // 6. Criar booster_opening (não aberto ainda)
    const { data: opening, error: openingError } = await supabaseAdmin
      .from('booster_openings')
      .insert({
        user_id: user.id,
        booster_type_id,
        cards_received: []
      })
      .select()
      .single();

    if (openingError) {
      return NextResponse.json(
        { ok: false, error: { code: 'DATABASE_ERROR', message: openingError.message } },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      ok: true, 
      data: {
        opening_id: opening.id,
        booster_type: boosterType,
        new_balance: wallet.balance_brl - boosterType.price_brl
      }
    });

  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
