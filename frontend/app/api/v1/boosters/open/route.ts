import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

export async function GET() {
  return NextResponse.json({ ok: true, message: 'GET working' });
}

export async function POST(request: NextRequest) {
  console.log('[OPEN-V2] 1. POST iniciado');
  
  try {
    // Env vars
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    console.log('[OPEN-V2] 2. Env vars OK');
    
    // Auth
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('[OPEN-V2] 3. No auth header');
      return NextResponse.json(
        { ok: false, error: { code: 'UNAUTHORIZED', message: 'No token' } },
        { status: 401 }
      );
    }
    console.log('[OPEN-V2] 3. Auth header OK');
    
    // Body
    const body = await request.json();
    const { opening_id } = body;
    console.log('[OPEN-V2] 4. Body parsed, opening_id:', opening_id);
    
    if (!opening_id) {
      return NextResponse.json(
        { ok: false, error: { code: 'VALIDATION_ERROR', message: 'opening_id required' } },
        { status: 400 }
      );
    }
    
    // Supabase client
    const token = authHeader.substring(7);
    const supabase = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    });
    console.log('[OPEN-V2] 5. Supabase client criado');
    
    // Get user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('[OPEN-V2] 6. User error:', userError);
      return NextResponse.json(
        { ok: false, error: { code: 'UNAUTHORIZED', message: 'Invalid token' } },
        { status: 401 }
      );
    }
    console.log('[OPEN-V2] 6. User OK:', user.id);
    
    // Buscar opening
    const { data: opening, error: openingError } = await supabase
      .from('booster_openings')
      .select('*, booster_pack:booster_packs!inner(pack_name, edition_id)')
      .eq('id', opening_id)
      .eq('user_id', user.id)
      .single();
    
    if (openingError || !opening) {
      console.error('[OPEN-V2] 7. Opening error:', openingError);
      return NextResponse.json(
        { ok: false, error: { code: 'NOT_FOUND', message: 'Opening not found' } },
        { status: 404 }
      );
    }
    console.log('[OPEN-V2] 7. Opening OK:', opening.id);
    
    if (opening.opened_at) {
      console.error('[OPEN-V2] 8. Already opened');
      return NextResponse.json(
        { ok: false, error: { code: 'ALREADY_OPENED', message: 'Já foi aberto' } },
        { status: 400 }
      );
    }
    console.log('[OPEN-V2] 8. Not opened yet, OK');
    
    // Buscar config da edição
    const editionId = opening.booster_pack.edition_id;
    const { data: editionConfig } = await supabase
      .from('edition_configs')
      .select('rarity_distribution')
      .eq('id', editionId)
      .single();
    
    if (!editionConfig) {
      return NextResponse.json(
        { ok: false, error: { code: 'CONFIG_NOT_FOUND', message: 'Edition config not found' } },
        { status: 500 }
      );
    }
    
    console.log('[OPEN-V2] 9. Edition config OK, gerando 5 cartas');
    
    // Gerar 5 cartas baseado na distribuição de raridade
    const generatedCards = [];
    const rarityDist = editionConfig.rarity_distribution;
    
    for (let i = 0; i < 5; i++) {
      // Selecionar raridade baseado na distribuição
      const rand = Math.random() * 100;
      let cumulative = 0;
      let selectedRarity = 'trash';
      
      for (const [rarity, prob] of Object.entries(rarityDist)) {
        cumulative += (prob as number);
        if (rand < cumulative) {
          selectedRarity = rarity;
          break;
        }
      }
      
      console.log(`[OPEN-V2] Carta ${i + 1}: raridade ${selectedRarity}`);
      
      // Buscar cartas daquela raridade DO POOL DESTE PACK
      const { data: poolCards, error: poolError } = await supabase
        .from('pack_card_pools')
        .select('card_base_id, cards_base!inner(id, name, rarity, image_url, display_id)')
        .eq('pack_id', opening.booster_type_id)
        .eq('cards_base.rarity', selectedRarity);
      
      if (poolError || !poolCards || poolCards.length === 0) {
        console.error(`[OPEN-V2] Erro ao buscar pool ${selectedRarity}:`, poolError);
        continue; // Pular esta carta
      }
      
      // Selecionar carta aleatória do pool
      const randomPoolCard = poolCards[Math.floor(Math.random() * poolCards.length)];
      const randomCard: any = randomPoolCard.cards_base;
      
      // Criar instância da carta
      const { data: cardInstance, error: instanceError } = await supabase
        .from('cards_instances')
        .insert({
          base_id: randomCard.id,
          owner_id: user.id,
          edition_id: editionId,
          skin: 'default',
          is_godmode: false,
          liquidity_brl: 0.10
        })
        .select()
        .single();
      
      if (instanceError || !cardInstance) {
        console.error('[OPEN-V2] Erro ao criar instância:', instanceError);
        continue;
      }
      
      generatedCards.push({
        id: cardInstance.id,
        base_id: randomCard.id,
        skin: 'default',
        is_godmode: false,
        liquidity_brl: 0.10,
        card: {
          name: randomCard.name,
          rarity: randomCard.rarity,
          image_url: randomCard.image_url,
          display_id: randomCard.display_id
        }
      });
    }
    
    console.log(`[OPEN-V2] 10. Geradas ${generatedCards.length} cartas`);
    
    // Marcar como aberto
    await supabase
      .from('booster_openings')
      .update({ opened_at: new Date().toISOString() })
      .eq('id', opening_id);
    
    console.log('[OPEN-V2] 11. Retornando cartas reais');
    return NextResponse.json({
      ok: true,
      data: {
        opening_id,
        cards: generatedCards,
        pity_counter: 0,
        godmode_awarded: false
      }
    });
    
  } catch (error: any) {
    console.error('[OPEN-V2] ERRO:', error.message);
    console.error('[OPEN-V2] Stack:', error.stack);
    return NextResponse.json({
      ok: false,
      error: { code: 'INTERNAL_ERROR', message: error.message, stack: error.stack }
    }, { status: 500 });
  }
}
