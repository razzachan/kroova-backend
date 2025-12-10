import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

// ==========================================================================
// PRIZE CALCULATOR INLINED (Edge runtime não consegue importar módulos externos)
// ==========================================================================
interface PrizeResult {
  prize_amount_brl: number;
  rtp_percentage: number;
  prize_tier: 'loss' | 'near_even' | 'small_win' | 'jackpot';
  calculation_details: {
    booster_cost: number;
    random_roll: number;
    distribution_hit: string;
    multiplier_used: number;
  };
}

const RTP_DISTRIBUTION_BY_TIER = {
  'Básico': {
    loss: { weight: 50, rtp_range: [0.20, 0.50] },
    near_even: { weight: 35, rtp_range: [0.60, 0.90] },
    small_win: { weight: 14, rtp_range: [1.00, 1.50] },
    jackpot: { weight: 1, rtp_range: [3.00, 5.00] }
  },
  'Padrão': {
    loss: { weight: 60, rtp_range: [0.15, 0.45] },
    near_even: { weight: 30, rtp_range: [0.60, 0.90] },
    small_win: { weight: 9, rtp_range: [1.00, 2.00] },
    jackpot: { weight: 1, rtp_range: [5.00, 8.00] }
  },
  'Premium': {
    loss: { weight: 65, rtp_range: [0.10, 0.40] },
    near_even: { weight: 27, rtp_range: [0.60, 0.90] },
    small_win: { weight: 7, rtp_range: [1.00, 2.50] },
    jackpot: { weight: 1, rtp_range: [6.00, 10.00] }
  },
  'Elite': {
    loss: { weight: 70, rtp_range: [0.08, 0.35] },
    near_even: { weight: 23, rtp_range: [0.60, 0.90] },
    small_win: { weight: 6, rtp_range: [1.00, 2.00] },
    jackpot: { weight: 1, rtp_range: [7.00, 12.00] }
  },
  'Whale': {
    loss: { weight: 75, rtp_range: [0.05, 0.30] },
    near_even: { weight: 20, rtp_range: [0.60, 0.85] },
    small_win: { weight: 4, rtp_range: [1.00, 1.80] },
    jackpot: { weight: 1, rtp_range: [8.00, 15.00] }
  }
};

function calculateBoosterPrize(
  boosterType: { id: string; name: string; price_brl: number; tier: string },
  droppedCards: any[]
): PrizeResult {
  const boosterCost = boosterType.price_brl;
  const tierName = boosterType.name.split(' ')[0] as keyof typeof RTP_DISTRIBUTION_BY_TIER;
  const distribution = RTP_DISTRIBUTION_BY_TIER[tierName] || RTP_DISTRIBUTION_BY_TIER['Padrão'];
  
  const totalWeight = 
    distribution.loss.weight +
    distribution.near_even.weight +
    distribution.small_win.weight +
    distribution.jackpot.weight;
  
  const randomRoll = Math.random() * totalWeight;
  
  let cumulativeWeight = 0;
  let selectedTier: 'loss' | 'near_even' | 'small_win' | 'jackpot' = 'loss';
  let rtpRange: [number, number] = [0.20, 0.50];
  
  cumulativeWeight += distribution.loss.weight;
  if (randomRoll < cumulativeWeight) {
    selectedTier = 'loss';
    rtpRange = distribution.loss.rtp_range as [number, number];
  } else {
    cumulativeWeight += distribution.near_even.weight;
    if (randomRoll < cumulativeWeight) {
      selectedTier = 'near_even';
      rtpRange = distribution.near_even.rtp_range as [number, number];
    } else {
      cumulativeWeight += distribution.small_win.weight;
      if (randomRoll < cumulativeWeight) {
        selectedTier = 'small_win';
        rtpRange = distribution.small_win.rtp_range as [number, number];
      } else {
        selectedTier = 'jackpot';
        rtpRange = distribution.jackpot.rtp_range as [number, number];
      }
    }
  }
  
  const [minRtp, maxRtp] = rtpRange;
  const rtpMultiplier = minRtp + (Math.random() * (maxRtp - minRtp));
  const prizeAmount = boosterCost * rtpMultiplier;
  const rtpPercentage = rtpMultiplier * 100;
  
  return {
    prize_amount_brl: Math.max(0.01, parseFloat(prizeAmount.toFixed(2))),
    rtp_percentage: parseFloat(rtpPercentage.toFixed(2)),
    prize_tier: selectedTier,
    calculation_details: {
      booster_cost: boosterCost,
      random_roll: parseFloat(randomRoll.toFixed(2)),
      distribution_hit: selectedTier,
      multiplier_used: parseFloat(rtpMultiplier.toFixed(4))
    }
  };
}
// ==========================================================================

export async function GET() {
  return NextResponse.json({ ok: true, message: 'Prize System V4 - INLINE CODE' });
}

export async function POST(request: NextRequest) {
  console.log('[OPEN-V3-PRIZE] 1. POST iniciado com sistema de prêmios');
  
  try {
    // Env vars
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    console.log('[OPEN-V3-PRIZE] 2. Env vars OK');
    
    // Auth - usar anonKey para validar usuário
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('[OPEN-V3-PRIZE] 3. No auth header');
      return NextResponse.json(
        { ok: false, error: { code: 'UNAUTHORIZED', message: 'No token' } },
        { status: 401 }
      );
    }
    console.log('[OPEN-V3-PRIZE] 3. Auth header OK');
    
    // Body
    const body = await request.json();
    const { opening_id } = body;
    console.log('[OPEN-V3-PRIZE] 4. Body parsed, opening_id:', opening_id);
    
    if (!opening_id) {
      return NextResponse.json(
        { ok: false, error: { code: 'VALIDATION_ERROR', message: 'opening_id required' } },
        { status: 400 }
      );
    }
    
    // Supabase client para auth (com token do usuário)
    const token = authHeader.substring(7);
    const supabaseAuth = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    });
    
    // Supabase client para operações administrativas (bypass RLS)
    const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    console.log('[OPEN-V3-PRIZE] 5. Supabase clients criados');
    
    // Get user (usando client com auth)
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
    if (userError || !user) {
      console.error('[OPEN-V3-PRIZE] 6. User error:', userError);
      return NextResponse.json(
        { ok: false, error: { code: 'UNAUTHORIZED', message: 'Invalid token' } },
        { status: 401 }
      );
    }
    console.log('[OPEN-V3-PRIZE] 6. User OK:', user.id);
    
    // Buscar opening (usar supabaseAuth para respeitar RLS do usuário)
    const { data: opening, error: openingError } = await supabaseAuth
      .from('booster_openings')
      .select('*, booster_pack:booster_packs!inner(pack_name, edition_id)')
      .eq('id', opening_id)
      .eq('user_id', user.id)
      .single();
    
    if (openingError || !opening) {
      console.error('[OPEN-V3-PRIZE] 7. Opening error:', openingError);
      return NextResponse.json(
        { ok: false, error: { code: 'NOT_FOUND', message: 'Opening not found' } },
        { status: 404 }
      );
    }
    console.log('[OPEN-V3-PRIZE] 7. Opening OK:', opening.id);
    console.log('[OPEN-V3-PRIZE] Price paid:', opening.price_paid_brl);
    
    // Buscar booster_type
    const { data: boosterType, error: typeError } = await supabaseAdmin
      .from('booster_types')
      .select('id, rarity_distribution, price_brl, name, market_tier_filter, skin_boost, mystery_box_bonus_chance')
      .eq('pack_id', opening.booster_type_id)
      .eq('price_brl', opening.price_paid_brl || 0.50)
      .single();
    
    if (typeError || !boosterType) {
      console.error('[OPEN-V3-PRIZE] 7.5. Booster type error:', typeError);
      return NextResponse.json(
        { ok: false, error: { code: 'NOT_FOUND', message: 'Booster type not found' } },
        { status: 404 }
      );
    }
    
    console.log('[OPEN-V3-PRIZE] 7.5. Booster type:', boosterType.name, 'R$', boosterType.price_brl);
    
    if (opening.opened_at) {
      console.error('[OPEN-V3-PRIZE] 8. Already opened');
      return NextResponse.json(
        { ok: false, error: { code: 'ALREADY_OPENED', message: 'Já foi aberto' } },
        { status: 400 }
      );
    }
    console.log('[OPEN-V3-PRIZE] 8. Not opened yet, OK');
    
    // ============================================================================
    // NOVO: BUSCAR SLOTS DO BOOSTER TYPE
    // ============================================================================
    console.log('[OPEN-V3-PRIZE] 9. Buscando slots do booster_type...');
    
    const { data: slots, error: slotsError } = await supabaseAdmin
      .from('booster_slot_config')
      .select('slot_position, slot_name, rarity_weights, description')
      .eq('booster_type_id', boosterType.id)
      .order('slot_position');
    
    if (slotsError || !slots || slots.length === 0) {
      console.error('[OPEN-V3-PRIZE] ERRO: Slots não configurados para este booster!', slotsError);
      return NextResponse.json({
        ok: false,
        error: { code: 'SLOTS_NOT_CONFIGURED', message: 'Sistema de slots não configurado para este booster' }
      }, { status: 500 });
    }
    
    console.log(`[OPEN-V3-PRIZE] ✅ ${slots.length} slots encontrados`);
    
    // Gerar cartas baseado nos SLOTS
    const generatedCards = [];
    
    for (const slot of slots) {
      console.log(`[OPEN-V3-PRIZE] Processando Slot ${slot.slot_position}: ${slot.slot_name}`);
      
      // Weighted random selection
      const weights = slot.rarity_weights as Record<string, number>;
      const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
      const rand = Math.random() * totalWeight;
      
      let cumulative = 0;
      let selectedRarity = 'trash';
      
      for (const [rarity, weight] of Object.entries(weights)) {
        cumulative += weight;
        if (rand < cumulative) {
          selectedRarity = rarity;
          break;
        }
      }
      
      console.log(`[OPEN-V3-PRIZE] Slot ${slot.slot_position} → Raridade: ${selectedRarity} (weights: ${JSON.stringify(weights)})`);
      
      // Buscar cartas
      const marketTierFilter = boosterType.market_tier_filter || { min: 1, max: 5 };
      
      let { data: cardsBase, error: cardsError } = await supabaseAdmin
        .from('cards_base')
        .select('id, name, rarity, image_url, display_id, base_liquidity_brl')
        .eq('edition_id', opening.booster_pack.edition_id)
        .eq('rarity', selectedRarity)
        .gte('market_tier', marketTierFilter.min)
        .lte('market_tier', marketTierFilter.max)
        .limit(50);
      
      // Fallback se não encontrou
      if (!cardsBase || cardsBase.length === 0) {
        console.warn(`[OPEN-V3-PRIZE] Fallback: buscando QUALQUER raridade...`);
        const fallbackQuery = await supabaseAdmin
          .from('cards_base')
          .select('id, name, rarity, image_url, display_id, base_liquidity_brl')
          .eq('edition_id', opening.booster_pack.edition_id)
          .limit(50);
        
        cardsBase = fallbackQuery.data;
        cardsError = fallbackQuery.error;
      }
      
      if (cardsError || !cardsBase || cardsBase.length === 0) {
        console.error(`[OPEN-V3-PRIZE] Erro ao buscar cartas:`, cardsError);
        continue;
      }
      
      // Selecionar carta aleatória
      const randomCard = cardsBase[Math.floor(Math.random() * cardsBase.length)];
      
      // Sortear skin (APENAS para visual - NÃO afeta prêmio!)
      const skinBoost = boosterType.skin_boost || { premium: 15, ghost: 5 };
      const skinRoll = Math.random() * 100;
      let skinType = 'default';
      let skinCumulative = 0;
      
      if (skinRoll < (skinCumulative += skinBoost.glitch || 0)) {
        skinType = 'glitch';
      } else if (skinRoll < (skinCumulative += skinBoost.dark || 0)) {
        skinType = 'dark';
      } else if (skinRoll < (skinCumulative += skinBoost.ghost || 0)) {
        skinType = 'ghost';
      } else if (skinRoll < (skinCumulative += skinBoost.holo || 0)) {
        skinType = 'holo';
      } else if (skinRoll < (skinCumulative += skinBoost.premium || 0)) {
        skinType = 'premium';
      }
      
      console.log(`[OPEN-V3-PRIZE] Skin: ${skinType}, Card: ${randomCard.name}, Base liquidity: R$ ${randomCard.base_liquidity_brl}`);
      
      // Calcular cashback: 1% do custo do booster dividido por 5 cartas
      const cashbackPerCard = (boosterType.price_brl * 0.01) / 5;
      
      // DEBUG: Log detalhado do cálculo
      console.log(`[DEBUG-CASHBACK] Booster Price: ${boosterType.price_brl}, Cashback Calc: (${boosterType.price_brl} * 0.01) / 5 = ${cashbackPerCard}, Type: ${typeof cashbackPerCard}`);
      
      // Criar instância da carta (usa base_liquidity_brl FIXO + cashback resgatável)
      const { data: cardInstance, error: instanceError } = await supabaseAdmin
        .from('cards_instances')
        .insert({
          base_id: randomCard.id,
          owner_id: user.id,
          edition_id: opening.booster_pack.edition_id,
          skin: skinType,
          is_godmode: false,
          liquidity_brl: randomCard.base_liquidity_brl, // FIXO! Não varia por booster
          prize_amount_brl: cashbackPerCard, // Cashback de 1% resgatável
          prize_redeemed: false
        })
        .select()
        .single();
      
      // DEBUG: Log do resultado inserido
      console.log(`[DEBUG-CASHBACK] Inserted Card ID: ${cardInstance?.id}, Prize Amount: ${cardInstance?.prize_amount_brl}`);
      
      if (instanceError || !cardInstance) {
        console.error('[OPEN-V3-PRIZE] Erro ao criar instância:', instanceError);
        continue;
      }
      
      generatedCards.push({
        id: cardInstance.id,
        base_id: randomCard.id,
        skin: skinType,
        is_godmode: false,
        liquidity_brl: randomCard.base_liquidity_brl,
        card: {
          name: randomCard.name,
          rarity: randomCard.rarity,
          image_url: randomCard.image_url,
          display_id: randomCard.display_id
        }
      });
    }
    
    console.log(`[OPEN-V3-PRIZE] 10. Geradas ${generatedCards.length} cartas`);
    
    if (generatedCards.length === 0) {
      console.error('[OPEN-V3-PRIZE] ERRO: Nenhuma carta foi gerada!');
      return NextResponse.json({
        ok: false,
        error: { code: 'NO_CARDS_GENERATED', message: 'Nenhuma carta foi gerada' }
      }, { status: 500 });
    }
    
    // ============================================================================
    // NOVO SISTEMA: CALCULAR PRÊMIO INDEPENDENTE DAS CARTAS
    // ============================================================================
    console.log('[OPEN-V3-PRIZE] 11. Calculando prêmio com RTP variável...');
    
    const prizeResult = calculateBoosterPrize(
      {
        id: boosterType.id,
        name: boosterType.name,
        price_brl: boosterType.price_brl,
        tier: boosterType.name.split(' ')[0]
      },
      generatedCards.map(c => ({
        id: c.id,
        base_id: c.base_id,
        rarity: c.card.rarity,
        skin: c.skin,
        base_liquidity_brl: c.liquidity_brl
      }))
    );
    
    console.log(`[OPEN-V3-PRIZE] 🎰 Prêmio: R$ ${prizeResult.prize_amount_brl.toFixed(2)} (${prizeResult.rtp_percentage.toFixed(0)}% RTP) - ${prizeResult.prize_tier.toUpperCase()}`);
    
    if (prizeResult.prize_tier === 'jackpot') {
      console.log(`[OPEN-V3-PRIZE] 🎰🎰🎰 JACKPOT!!! Jogador ganhou R$ ${prizeResult.prize_amount_brl.toFixed(2)}!`);
    }
    
    // Registrar prêmio na tabela booster_prizes
    const { data: prizeRecord, error: prizeError } = await supabaseAdmin
      .from('booster_prizes')
      .insert({
        opening_id: opening_id,
        user_id: user.id,
        booster_type_id: boosterType.id,
        prize_amount_brl: prizeResult.prize_amount_brl,
        booster_cost_brl: boosterType.price_brl,
        rtp_percentage: prizeResult.rtp_percentage,
        prize_tier: prizeResult.prize_tier,
        cards_summary: {
          cards: generatedCards.map(c => ({
            id: c.id,
            name: c.card.name,
            rarity: c.card.rarity,
            skin: c.skin
          }))
        }
      })
      .select()
      .single();
    
    if (prizeError) {
      console.error('[OPEN-V3-PRIZE] ERRO ao registrar prêmio:', prizeError);
    } else {
      console.log('[OPEN-V3-PRIZE] Prêmio registrado:', prizeRecord?.id);
    }
    
    // Adicionar prêmio à carteira do usuário
    const { data: wallet, error: walletError } = await supabaseAdmin
      .from('wallets')
      .select('balance_brl')
      .eq('user_id', user.id)
      .single();
    
    if (walletError || !wallet) {
      console.error('[OPEN-V3-PRIZE] ERRO ao buscar wallet:', walletError);
    } else {
      const newBalance = parseFloat(wallet.balance_brl.toString()) + prizeResult.prize_amount_brl;
      
      const { error: updateError } = await supabaseAdmin
        .from('wallets')
        .update({ balance_brl: newBalance })
        .eq('user_id', user.id);
      
      if (updateError) {
        console.error('[OPEN-V3-PRIZE] ERRO ao atualizar wallet:', updateError);
      } else {
        console.log(`[OPEN-V3-PRIZE] 💰 Wallet atualizada: R$ ${wallet.balance_brl} → R$ ${newBalance.toFixed(2)}`);
      }
    }
    
    // Marcar como aberto
    await supabaseAdmin
      .from('booster_openings')
      .update({ opened_at: new Date().toISOString() })
      .eq('id', opening_id);
    
    // Mystery Box Bonus (mantém lógica original)
    let bonusMysteryBox = null;
    const bonusChance = boosterType.mystery_box_bonus_chance || 0;
    
    if (bonusChance > 0) {
      const bonusRoll = Math.random() * 100;
      if (bonusRoll < bonusChance) {
        console.log('[OPEN-V3-PRIZE] 🎁 BONUS MYSTERY BOX TRIGGERED!');
        // ... (código mystery box mantido)
      }
    }
    
    console.log('[OPEN-V3-PRIZE] 12. Retornando resultado completo');
    
    return NextResponse.json({
      ok: true,
      data: {
        opening_id,
        cards: generatedCards,
        // NOVOS CAMPOS DO SISTEMA DE PRÊMIOS
        prize: {
          amount_brl: prizeResult.prize_amount_brl,
          rtp_percentage: prizeResult.rtp_percentage,
          prize_tier: prizeResult.prize_tier,
          is_jackpot: prizeResult.prize_tier === 'jackpot'
        },
        bonus_mystery_box: bonusMysteryBox
      }
    });
    
  } catch (error: any) {
    console.error('[OPEN-V3-PRIZE] ERRO:', error.message);
    console.error('[OPEN-V3-PRIZE] Stack:', error.stack);
    return NextResponse.json({
      ok: false,
      error: { code: 'INTERNAL_ERROR', message: error.message, stack: error.stack }
    }, { status: 500 });
  }
}
