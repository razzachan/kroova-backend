import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceKey = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, anonKey);
const supabaseAdmin = createClient(supabaseUrl, serviceKey);

// GET /api/v1/market/listings - List marketplace items
export async function GET(request: NextRequest) {
  try {
    const { data: listings, error, count } = await supabase
      .from('market_listings')
      .select(
        `
        *,
        card_instance:cards_instances (
          *,
          card_base:cards_base (*)
        ),
        seller:users!seller_id (id, display_id, name)
      `,
        { count: 'exact' }
      )
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      return NextResponse.json(
        { ok: false, error: { code: 'DATABASE_ERROR', message: error.message } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      data: {
        listings: listings || [],
        pagination: {
          page: 1,
          limit: 20,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / 20),
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}

// POST /api/v1/market/listings - Create new listing
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { ok: false, error: { code: 'UNAUTHORIZED', message: 'Token não fornecido' } },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { ok: false, error: { code: 'UNAUTHORIZED', message: 'Token inválido' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { card_instance_id, price_brl } = body;

    if (!card_instance_id || !price_brl) {
      return NextResponse.json(
        { ok: false, error: { code: 'INVALID_INPUT', message: 'card_instance_id e price_brl são obrigatórios' } },
        { status: 400 }
      );
    }

    if (price_brl < 0.01) {
      return NextResponse.json(
        { ok: false, error: { code: 'INVALID_PRICE', message: 'Preço mínimo é R$ 0.01' } },
        { status: 400 }
      );
    }

    // Verificar se carta pertence ao usuário
    const { data: cardInstance, error: cardError } = await supabaseAdmin
      .from('cards_instances')
      .select('owner_id')
      .eq('id', card_instance_id)
      .single();

    if (cardError || !cardInstance) {
      return NextResponse.json(
        { ok: false, error: { code: 'CARD_NOT_FOUND', message: 'Carta não encontrada' } },
        { status: 404 }
      );
    }

    if (cardInstance.owner_id !== user.id) {
      return NextResponse.json(
        { ok: false, error: { code: 'CARD_NOT_OWNED', message: 'Você não possui esta carta' } },
        { status: 403 }
      );
    }

    // Verificar se já existe listing ativo para esta carta
    const { data: existingListing } = await supabaseAdmin
      .from('market_listings')
      .select('id')
      .eq('card_instance_id', card_instance_id)
      .eq('status', 'active')
      .single();

    if (existingListing) {
      return NextResponse.json(
        { ok: false, error: { code: 'ALREADY_LISTED', message: 'Esta carta já está listada no marketplace' } },
        { status: 400 }
      );
    }

    // Criar listing
    const { data: listing, error: listingError } = await supabaseAdmin
      .from('market_listings')
      .insert({
        seller_id: user.id,
        card_instance_id,
        price_brl,
        status: 'active',
      })
      .select()
      .single();

    if (listingError || !listing) {
      return NextResponse.json(
        { ok: false, error: { code: 'LISTING_FAILED', message: 'Erro ao criar listing' } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      data: listing,
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
