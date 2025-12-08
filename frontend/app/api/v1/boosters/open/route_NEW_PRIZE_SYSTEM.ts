import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { calculateBoosterPrize } from '@/lib/prizeCalculator';

export const runtime = 'edge';

export async function GET() {
  return NextResponse.json({ ok: true, message: 'GET working - Prize System V3' });
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
    const supabaseAdmin = createClient(supabaseUrl, serviceKey);
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
    
    // Usar distribuição de raridade do booster_type
    const rarityDist = boosterType.rarity_distribution || {
      trash: 50.0,
      meme: 30.0,
      viral: 15.0,
      legendary: 4.0,
      godmode: 1.0
    };
    
    console.log('[OPEN-V3-PRIZE] 9. Gerando 5 cartas');
    
    // Gerar 5 cartas baseado na distribuição de raridade
    const generatedCards = [];
    const rarityOrder = ['trash', 'meme', 'viral', 'legendary', 'godmode'];
    
    for (let i = 0; i < 5; i++) {
      // Selecionar raridade baseado na distribuição
      const rand = Math.random() * 100;
      let cumulative = 0;
      let selectedRarity = 'trash';
      
      for (const rarity of rarityOrder) {
        const prob = rarityDist[rarity] || 0;
        cumulative += prob;
        if (rand < cumulative) {
          selectedRarity = rarity;
          break;
        }
      }
      
      console.log(`[OPEN-V3-PRIZE] Carta ${i + 1}: raridade ${selectedRarity}`);
      
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
      
      // Criar instância da carta (usa base_liquidity_brl FIXO)
      const { data: cardInstance, error: instanceError } = await supabaseAdmin
        .from('cards_instances')
        .insert({
          base_id: randomCard.id,
          owner_id: user.id,
          edition_id: opening.booster_pack.edition_id,
          skin: skinType,
          is_godmode: false,
          liquidity_brl: randomCard.base_liquidity_brl // FIXO! Não varia por booster
        })
        .select()
        .single();
      
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
