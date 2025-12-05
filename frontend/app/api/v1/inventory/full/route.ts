import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceKey = process.env.SUPABASE_SERVICE_KEY!;

interface CardInstance {
  id: string;
  base_id: string;
  owner_id: string;
  skin: string;
  is_godmode: boolean;
  liquidity_brl: number;
  minted_at: string;
  cards_base?: {
    id: string;
    name: string;
    rarity: string;
    display_id: string;
    image_url?: string;
    description?: string;
  };
}

/**
 * GET /api/v1/inventory/full
 * Retorna inventário completo + listings ativos + contagem de recycles hoje
 * Tudo em uma chamada otimizada
 */
export async function GET(request: NextRequest) {
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

    // Query paralela: inventário + listings + transações
    const [inventoryResult, listingsResult, transactionsResult] = await Promise.all([
      // 1. Inventário (usando admin para bypass RLS se necessário)
      supabaseAdmin
        .from('cards_instances')
        .select(`
          id,
          base_id,
          owner_id,
          skin,
          is_godmode,
          liquidity_brl,
          minted_at,
          cards_base:base_id (
            id,
            name,
            rarity,
            display_id,
            image_url,
            description
          )
        `)
        .eq('owner_id', user.id)
        .order('minted_at', { ascending: false }),

      // 2. Listings ativos
      supabaseAdmin
        .from('marketplace_listings')
        .select('card_instance_id, price_brl, created_at')
        .eq('seller_id', user.id)
        .eq('status', 'active'),

      // 3. Transações de reciclagem (últimas 100)
      supabaseAdmin
        .from('transactions')
        .select('created_at, type, amount_brl')
        .eq('user_id', user.id)
        .eq('type', 'recycle')
        .order('created_at', { ascending: false })
        .limit(100)
    ]);

    if (inventoryResult.error) {
      console.error('❌ Erro ao buscar inventário:', inventoryResult.error);
      return NextResponse.json(
        { error: 'Erro ao buscar inventário' },
        { status: 500 }
      );
    }

    // Contar reciclagens de hoje
    const today = new Date().setHours(0, 0, 0, 0);
    const recyclesToday = (transactionsResult.data || []).filter((tx: any) => {
      const txDate = new Date(tx.created_at).setHours(0, 0, 0, 0);
      return txDate === today;
    }).length;

    // IDs de cartas listadas
    const listedCardIds = (listingsResult.data || []).map((l: any) => l.card_instance_id);

    return NextResponse.json({
      cards: inventoryResult.data || [],
      listed_card_ids: listedCardIds,
      recycles_today: recyclesToday,
      total_cards: inventoryResult.data?.length || 0,
      total_listed: listedCardIds.length
    });

  } catch (error) {
    console.error('❌ Erro em /api/v1/inventory/full:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
