import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceKey = process.env.SUPABASE_SERVICE_KEY!;

// =====================================================
// 3-LAYER SYSTEM: RARIDADE × SKIN × GODMODE × PRICE
// =====================================================

// Layer 1: Selecionar RARIDADE (base)
function selectRarity(distribution: any): string {
  const rand = Math.random() * 100;
  let cumulative = 0;

  const rarities = ['trash', 'meme', 'viral', 'legendary', 'epica'];
  for (const rarity of rarities) {
    cumulative += distribution[rarity] || 0;
    if (rand < cumulative) {
      return rarity;
    }
  }
  
  return 'trash'; // fallback
}

// Layer 2: Selecionar SKIN (visual variant)
function selectSkin(skinMultipliers: any): string {
  // Probabilidades fixas (refs: KROOVA_BOOSTER_PACK_FINAL_SPEC.md)
  const skins = [
    { name: 'default', weight: 50.0 },
    { name: 'neon', weight: 25.0 },
    { name: 'glow', weight: 15.0 },
    { name: 'glitch', weight: 7.0 },
    { name: 'ghost', weight: 2.0 },
    { name: 'holo', weight: 0.8 },
    { name: 'dark', weight: 0.2 }
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

// Layer 3: Verificar GODMODE STATUS (1% probability)
function shouldBeGodmode(canAwardGodmode: boolean, forcedGodmode: boolean = false): boolean {
  if (forcedGodmode) return true;
  if (!canAwardGodmode) return false;
  return Math.random() < 0.01; // 1%
}

// Calcular liquidez final: base × skin × price × godmode
function calculateLiquidity(
  baseLiquidity: number,
  skinMultiplier: number,
  priceMultiplier: number,
  isGodmode: boolean,
  godmodeMultiplier: number = 10
): number {
  let liquidity = baseLiquidity * skinMultiplier * priceMultiplier;
  if (isGodmode) {
    liquidity *= godmodeMultiplier;
  }
  return Math.round(liquidity * 100) / 100; // 2 decimals
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

    // 3. Buscar edition config
    const boosterType = opening.booster_type;
    const editionId = boosterType.edition_id || 'ED01';

    const { data: editionConfig, error: editionError } = await supabaseAdmin
      .from('edition_configs')
      .select('base_liquidity, skin_multipliers, godmode_multiplier, godmode_probability')
      .eq('id', editionId)
      .single();

    if (editionError || !editionConfig) {
      return NextResponse.json(
        { ok: false, error: { code: 'CONFIG_ERROR', message: 'Edition config not found' } },
        { status: 500 }
      );
    }

    // 4. Verificar hard cap (pode dar godmode?)
    const { data: canAwardData } = await supabaseAdmin.rpc('check_edition_hard_cap', {
      p_edition_id: editionId
    });
    const canAwardGodmode = canAwardData ?? true;

    // 5. Incrementar pity counter
    const { data: pityData } = await supabaseAdmin.rpc('increment_pity_counter', {
      p_user_id: user.id,
      p_edition_id: editionId
    });
    const pityCounter = pityData ?? 0;

    // 6. Processar guaranteed_cards (force specific rarities)
    const guaranteedCards = boosterType.guaranteed_cards || [];
    const forcedRarities: string[] = [];
    let forcedGodmode = false;

    for (const guarantee of guaranteedCards) {
      for (let i = 0; i < (guarantee.count || 1); i++) {
        forcedRarities.push(guarantee.rarity);
      }
      if (guarantee.force_godmode) {
        forcedGodmode = true;
      }
    }

    // Pity system: 100 boosters = forçar godmode
    if (pityCounter >= 100) {
      forcedGodmode = true;
      // Reset counter
      await supabaseAdmin.rpc('reset_pity_counter', {
        p_user_id: user.id,
        p_edition_id: editionId
      });
    }

    // 7. Gerar cartas (3-layer system)
    const cardsPerBooster = boosterType.cards_per_booster || 5;
    const distribution = boosterType.rarity_distribution;
    const baseLiquidity = editionConfig.base_liquidity;
    const skinMultipliers = editionConfig.skin_multipliers;
    const priceMultiplier = boosterType.price_multiplier || 1.0;
    const godmodeMultiplier = editionConfig.godmode_multiplier || 10;

    const generatedCards: any[] = [];
    const selectedRarities: string[] = [];

    // Primeiro: aplicar guaranteed cards
    for (const forcedRarity of forcedRarities) {
      selectedRarities.push(forcedRarity);
    }

    // Depois: completar com raridades aleatórias
    for (let i = selectedRarities.length; i < cardsPerBooster; i++) {
      const rarity = selectRarity(distribution);
      selectedRarities.push(rarity);
    }

    // Shuffle para não deixar guaranteed sempre no início
    selectedRarities.sort(() => Math.random() - 0.5);

    // Gerar instâncias
    let godmodeAwarded = false;
    for (let i = 0; i < selectedRarities.length; i++) {
      const rarity = selectedRarities[i];
      const skin = selectSkin(skinMultipliers);

      // Decidir se é godmode (apenas 1 por booster)
      const isGodmode = !godmodeAwarded && shouldBeGodmode(canAwardGodmode, forcedGodmode && i === 0);
      if (isGodmode) godmodeAwarded = true;

      // Buscar card aleatória dessa raridade
      const { data: cards } = await supabaseAdmin
        .from('cards_base')
        .select('id, name, rarity, image_url, display_id')
        .eq('rarity', rarity)
        .eq('edition_id', editionId);

      if (!cards || cards.length === 0) {
        continue; // Skip se não tiver cartas dessa raridade
      }

      const randomCard = cards[Math.floor(Math.random() * cards.length)];

      // Calcular liquidez final (3-layer)
      const baseLiquidityValue = baseLiquidity[rarity] || 0.01;
      const skinMultiplier = skinMultipliers[skin] || 1.0;
      const liquidityBrl = calculateLiquidity(
        baseLiquidityValue,
        skinMultiplier,
        priceMultiplier,
        isGodmode,
        godmodeMultiplier
      );

      // Criar instância da carta
      const { data: cardInstance, error: instanceError } = await supabaseAdmin
        .from('cards_instances')
        .insert({
          base_id: randomCard.id,
          owner_id: user.id,
          edition_id: editionId,
          skin,
          is_godmode: isGodmode,
          liquidity_brl: liquidityBrl
        })
        .select('id, base_id, skin, is_godmode, liquidity_brl, cards_base!inner(name, rarity, image_url, display_id)')
        .single();

      if (!instanceError && cardInstance) {
        generatedCards.push({
          id: cardInstance.id,
          base_id: cardInstance.base_id,
          skin: cardInstance.skin,
          is_godmode: cardInstance.is_godmode,
          liquidity_brl: cardInstance.liquidity_brl,
          card: cardInstance.cards_base
        });
      }
    }

    // 8. Atualizar opening com cartas geradas
    await supabaseAdmin
      .from('booster_openings')
      .update({
        cards_received: generatedCards.map(c => c.id),
        opened_at: new Date().toISOString()
      })
      .eq('id', opening_id);

    // 9. Atualizar edition metrics (jackpot payout se teve godmode)
    if (godmodeAwarded) {
      const totalJackpot = generatedCards
        .filter(c => c.is_godmode)
        .reduce((sum, c) => sum + (c.liquidity_brl || 0), 0);

      await supabaseAdmin
        .from('edition_configs')
        .update({
          total_jackpots_paid: supabaseAdmin.rpc('increment', { x: totalJackpot })
        })
        .eq('id', editionId);
    }

    return NextResponse.json({
      ok: true,
      data: {
        opening_id,
        cards: generatedCards,
        pity_counter: pityCounter,
        godmode_awarded: godmodeAwarded
      }
    });

  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
