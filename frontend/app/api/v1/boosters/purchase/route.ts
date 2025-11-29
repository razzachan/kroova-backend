import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

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
    const { booster_type_id, quantity = 1 } = body;

    if (!booster_type_id) {
      return NextResponse.json(
        { ok: false, error: { code: 'VALIDATION_ERROR', message: 'booster_type_id is required' } },
        { status: 400 }
      );
    }

    if (quantity < 1 || quantity > 10) {
      return NextResponse.json(
        { ok: false, error: { code: 'VALIDATION_ERROR', message: 'quantity must be between 1 and 10' } },
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

    // 4. Debitar wallet (total = preço * quantidade)
    const totalPrice = boosterType.price_brl * quantity;
    
    const { error: debitError } = await supabaseAdmin
      .from('wallets')
      .update({ 
        balance_brl: wallet.balance_brl - totalPrice,
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
        amount_brl: -totalPrice,
        description: `Compra: ${quantity}x ${boosterType.name}`,
        metadata: { booster_type_id, quantity }
      });

    // 6. Criar booster_openings (um para cada booster comprado)
    const openingsToInsert = Array.from({ length: quantity }, () => ({
      user_id: user.id,
      booster_type_id,
      cards_obtained: [],
      purchased_at: new Date().toISOString()
    }));

    const { data: openings, error: openingError } = await supabaseAdmin
      .from('booster_openings')
      .insert(openingsToInsert)
      .select();

    if (openingError || !openings) {
      return NextResponse.json(
        { ok: false, error: { code: 'DATABASE_ERROR', message: openingError?.message || 'Failed to create openings' } },
        { status: 500 }
      );
    }

    // Forçar opened_at = NULL para todos
    await supabaseAdmin
      .from('booster_openings')
      .update({ opened_at: null })
      .in('id', openings.map(o => o.id));

    return NextResponse.json({ 
      ok: true, 
      data: {
        boosters: openings.map(o => ({ id: o.id })),
        total_paid: totalPrice,
        booster_type: boosterType,
        new_balance: wallet.balance_brl - totalPrice
      }
    });

  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
