import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_KEY!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, anonKey);
const supabaseAdmin = createClient(supabaseUrl, serviceKey);

// DELETE /api/v1/market/listings/:listing_id - Cancel listing
export async function DELETE(
  request: NextRequest,
  { params }: { params: { listing_id: string } }
) {
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

    const listingId = params.listing_id;

    // Verificar se listing existe e pertence ao usuário
    const { data: listing, error: listingError } = await supabaseAdmin
      .from('market_listings')
      .select('*')
      .eq('id', listingId)
      .eq('seller_id', user.id)
      .eq('status', 'active')
      .single();

    if (listingError || !listing) {
      return NextResponse.json(
        { ok: false, error: { code: 'LISTING_NOT_FOUND', message: 'Anúncio não encontrado ou você não é o vendedor' } },
        { status: 404 }
      );
    }

    // Cancelar listing
    const { error: cancelError } = await supabaseAdmin
      .from('market_listings')
      .update({ status: 'cancelled' })
      .eq('id', listingId);

    if (cancelError) {
      return NextResponse.json(
        { ok: false, error: { code: 'CANCEL_FAILED', message: 'Erro ao cancelar anúncio' } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      data: { cancelled: true },
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
