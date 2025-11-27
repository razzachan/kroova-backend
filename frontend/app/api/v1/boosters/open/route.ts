import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceKey = process.env.SUPABASE_SERVICE_KEY!;

// Algoritmo de distribuição de raridades (refs: KROOVA_BOOSTER_ALGORITHM.md)
function selectRarity(distribution: any): string {
  const rand = Math.random() * 100;
  let cumulative = 0;

  const rarities = ['trash', 'meme', 'viral', 'legendary', 'godmode'];
  for (const rarity of rarities) {
    cumulative += distribution[rarity] || 0;
    if (rand < cumulative) {
      return rarity;
    }
  }
  
  return 'trash'; // fallback
}

// Selecionar skin aleatória (weighted)
function selectSkin(): string {
  const skins = [
    { name: 'default', weight: 50 },
    { name: 'neon', weight: 25 },
    { name: 'glitch', weight: 15 },
    { name: 'ghost', weight: 10 }
  ];

  const totalWeight = skins.reduce((sum, s) => sum + s.weight, 0);
  const rand = Math.random() * totalWeight;
  let cumulative = 0;

  for (const skin of skins) {
    cumulative += skin.weight;
    if (rand < cumulative) {
      return skin.name;
    }
  }

  return 'default';
}

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

    const supabaseAdmin = createClient(supabaseUrl, serviceKey);

    const body = await request.json();
    const { opening_id } = body;

    if (!opening_id) {
      return NextResponse.json(
        { ok: false, error: { code: 'VALIDATION_ERROR', message: 'opening_id is required' } },
        { status: 400 }
      );
    }

    // 1. Obter user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json(
        { ok: false, error: { code: 'UNAUTHORIZED', message: 'Invalid token' } },
        { status: 401 }
      );
    }

    // 2. Buscar opening
    const { data: opening, error: openingError } = await supabaseAdmin
      .from('booster_openings')
      .select('*, booster_type:booster_types(*)')
      .eq('id', opening_id)
      .eq('user_id', user.id)
      .single();

    if (openingError || !opening) {
      return NextResponse.json(
        { ok: false, error: { code: 'NOT_FOUND', message: 'Opening not found' } },
        { status: 404 }
      );
    }

    if (opening.opened_at) {
      return NextResponse.json(
        { ok: false, error: { code: 'ALREADY_OPENED', message: 'Booster já foi aberto' } },
        { status: 400 }
      );
    }

    // 3. Gerar cartas baseado no algoritmo
    const boosterType = opening.booster_type;
    const cardsPerBooster = boosterType.cards_per_booster || 5;
    const distribution = boosterType.rarity_distribution;

    const generatedCards: any[] = [];

    for (let i = 0; i < cardsPerBooster; i++) {
      const rarity = selectRarity(distribution);
      const skin = selectSkin();

      // Buscar card aleatória dessa raridade
      const { data: cards } = await supabaseAdmin
        .from('cards_base')
        .select('id, name, rarity, image_url, display_id')
        .eq('rarity', rarity)
        .eq('edition_id', boosterType.edition_id);

      if (!cards || cards.length === 0) {
        continue; // Skip se não tiver cartas dessa raridade
      }

      const randomCard = cards[Math.floor(Math.random() * cards.length)];

      // Criar instância da carta
      const { data: cardInstance, error: instanceError } = await supabaseAdmin
        .from('cards_instances')
        .insert({
          base_id: randomCard.id,
          owner_id: user.id,
          skin
        })
        .select('id, base_id, skin, cards_base!inner(name, rarity, image_url, display_id)')
        .single();

      if (!instanceError && cardInstance) {
        generatedCards.push({
          id: cardInstance.id,
          base_id: cardInstance.base_id,
          skin: cardInstance.skin,
          card: cardInstance.cards_base
        });
      }
    }

    // 4. Atualizar opening com cartas geradas
    await supabaseAdmin
      .from('booster_openings')
      .update({
        cards_received: generatedCards.map(c => c.id),
        opened_at: new Date().toISOString()
      })
      .eq('id', opening_id);

    return NextResponse.json({
      ok: true,
      data: {
        opening_id,
        cards: generatedCards
      }
    });

  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
