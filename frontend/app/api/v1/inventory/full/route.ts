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
  prize_amount_brl?: number;
  prize_redeemed?: boolean;
  prize_redeemed_at?: string;
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
    
    // 1. INVENTÁRIO COM PAGINAÇÃO (buscar TODAS as cartas, não apenas 1000)
    let allCards: CardInstance[] = [];
    let page = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabaseAdmin
        .from('cards_instances')
        .select(`
          id,
          base_id,
          owner_id,
          skin,
          is_godmode,
          liquidity_brl,
          minted_at,
          prize_amount_brl,
          prize_redeemed,
          prize_redeemed_at,
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
        .order('minted_at', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (error) {
        console.error('❌ Erro ao buscar inventário (página ' + page + '):', error);
        return NextResponse.json(
          { error: 'Erro ao buscar inventário' },
          { status: 500 }
        );
      }

      if (data) {
        allCards = allCards.concat(data as any); // Supabase retorna formato correto
        hasMore = data.length === pageSize; // Se retornou menos que pageSize, acabou
        page++;
      } else {
        hasMore = false;
      }
    }

    console.log(`✅ Inventário carregado: ${allCards.length} cartas (${page} páginas)`);

    // 2 e 3. Listings e transações em paralelo
    const [listingsResult, transactionsResult] = await Promise.all([
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

    // Contar reciclagens de hoje
    const today = new Date().setHours(0, 0, 0, 0);
    const recyclesToday = (transactionsResult.data || []).filter((tx: any) => {
      const txDate = new Date(tx.created_at).setHours(0, 0, 0, 0);
      return txDate === today;
    }).length;

    // IDs de cartas listadas
    const listedCardIds = (listingsResult.data || []).map((l: any) => l.card_instance_id);

    return NextResponse.json({
      cards: allCards,
      listed_card_ids: listedCardIds,
      recycles_today: recyclesToday,
      total_cards: allCards.length,
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
