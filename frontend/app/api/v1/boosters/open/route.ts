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
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    console.log('[OPEN-V2] 2. Env vars OK');
    
    // Auth - usar anonKey para validar usuário
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
    
    // Supabase client para auth (com token do usuário)
    const token = authHeader.substring(7);
    const supabaseAuth = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    });
    
    // Supabase client para operações administrativas (bypass RLS)
    const supabaseAdmin = createClient(supabaseUrl, serviceKey);
    console.log('[OPEN-V2] 5. Supabase clients criados');
    
    // Get user (usando client com auth)
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
    if (userError || !user) {
      console.error('[OPEN-V2] 6. User error:', userError);
      return NextResponse.json(
        { ok: false, error: { code: 'UNAUTHORIZED', message: 'Invalid token' } },
        { status: 401 }
      );
    }
    console.log('[OPEN-V2] 6. User OK:', user.id);
    
    // Buscar opening (usar supabaseAuth para respeitar RLS do usuário)
    const { data: opening, error: openingError } = await supabaseAuth
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
    console.log('[OPEN-V2] Booster type ID (pack_id):', opening.booster_type_id);
    console.log('[OPEN-V2] Price paid:', opening.price_paid_brl);
    console.log('[OPEN-V2] Edition ID:', opening.booster_pack.edition_id);
    console.log('[OPEN-V2] Pack name:', opening.booster_pack.pack_name);
    
    // Buscar booster_type para pegar rarity_distribution correta por tier
    // Usa pack_id E price_brl para identificar o tier exato
    const { data: boosterType, error: typeError } = await supabaseAdmin
      .from('booster_types')
      .select('rarity_distribution, price_brl, name, market_tier_filter, skin_boost, value_adjustment, mystery_box_bonus_chance')
      .eq('pack_id', opening.booster_type_id)
      .eq('price_brl', opening.price_paid_brl || 0.50) // Fallback pra registros antigos
      .single();
    
    if (typeError || !boosterType) {
      console.error('[OPEN-V2] 7.5. Booster type error:', typeError);
      return NextResponse.json(
        { ok: false, error: { code: 'NOT_FOUND', message: 'Booster type not found' } },
        { status: 404 }
      );
    }
    
    console.log('[OPEN-V2] 7.5. Booster type:', boosterType.name, 'R$', boosterType.price_brl);
    console.log('[OPEN-V2] 7.5. Rarity distribution:', boosterType.rarity_distribution);
    
    // Pegar price_multiplier do booster_type
    const { data: boosterTypeMultiplier } = await supabaseAdmin
      .from('booster_types')
      .select('price_multiplier')
      .eq('pack_id', opening.booster_type_id)
      .eq('price_brl', opening.price_paid_brl || 0.50)
      .single();
    
    const priceMultiplier = boosterTypeMultiplier?.price_multiplier || 1;
    console.log('[OPEN-V2] 7.6. Price multiplier:', priceMultiplier, '(tier', opening.price_paid_brl, ')');
    
    if (opening.opened_at) {
      console.error('[OPEN-V2] 8. Already opened');
      return NextResponse.json(
        { ok: false, error: { code: 'ALREADY_OPENED', message: 'Já foi aberto' } },
        { status: 400 }
      );
    }
    console.log('[OPEN-V2] 8. Not opened yet, OK');
    
    // Usar distribuição de raridade do booster_type (varia por tier!)
    const rarityDist = boosterType.rarity_distribution || {
      trash: 50.0,
      meme: 30.0,
      viral: 15.0,
      legendary: 4.0,
      godmode: 1.0
    };
    
    console.log('[OPEN-V2] 9. Gerando 5 cartas com distribuição do tier');
    console.log('[OPEN-V2] Raridades disponíveis:', Object.keys(rarityDist));
    
    // Array para coletar logs de debug
    const debugLogs: string[] = [];
    
    // Gerar 5 cartas baseado na distribuição de raridade
    const generatedCards = [];
    
    for (let i = 0; i < 5; i++) {
      debugLogs.push(`=== Carta ${i + 1} ===`);
      
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
      
      debugLogs.push(`Raridade selecionada: ${selectedRarity}`);
      
      console.log(`[OPEN-V2] Carta ${i + 1}: raridade ${selectedRarity}`);
      
      // Buscar cartas respeitando market_tier_filter do booster
      const marketTierFilter = boosterType.market_tier_filter || { min: 1, max: 5 };
      console.log(`[OPEN-V2] Buscando cartas ${selectedRarity} da edição ${opening.booster_pack.edition_id}, market_tier ${marketTierFilter.min}-${marketTierFilter.max}`);
      
      let { data: cardsBase, error: cardsError } = await supabaseAdmin
        .from('cards_base')
        .select('id, name, rarity, image_url, display_id, base_liquidity_brl, market_tier')
        .eq('edition_id', opening.booster_pack.edition_id)
        .eq('rarity', selectedRarity)
        .gte('market_tier', marketTierFilter.min)
        .lte('market_tier', marketTierFilter.max)
        .limit(50);
      
      debugLogs.push(`Query resultado: ${cardsBase?.length || 0} cartas (tier ${marketTierFilter.min}-${marketTierFilter.max}), erro: ${cardsError ? JSON.stringify(cardsError) : 'null'}`);
      console.log(`[OPEN-V2] Query result: found ${cardsBase?.length || 0} cards, error:`, cardsError);
      
      // Se não encontrou com a raridade específica, pega qualquer carta
      if (!cardsBase || cardsBase.length === 0) {
        debugLogs.push(`FALLBACK: Nenhuma carta ${selectedRarity} encontrada`);
        console.warn(`[OPEN-V2] Nenhuma carta ${selectedRarity} encontrada, buscando QUALQUER raridade...`);
        const fallbackQuery = await supabaseAdmin
          .from('cards_base')
          .select('id, name, rarity, image_url, display_id, base_liquidity_brl, market_tier')
          .eq('edition_id', opening.booster_pack.edition_id)
          .limit(50);
        
        cardsBase = fallbackQuery.data;
        cardsError = fallbackQuery.error;
      }
      
      if (cardsError) {
        debugLogs.push(`ERRO na query: ${JSON.stringify(cardsError)}`);
        console.error(`[OPEN-V2] Erro ao buscar cartas:`, cardsError);
        continue;
      }
      
      if (!cardsBase || cardsBase.length === 0) {
        debugLogs.push(`ERRO: Nenhuma carta encontrada na edição!`);
        console.error(`[OPEN-V2] NENHUMA CARTA ENCONTRADA NA EDIÇÃO!`);
        continue;
      }
      
      debugLogs.push(`Sucesso: ${cardsBase.length} cartas encontradas`);
      console.log(`[OPEN-V2] Encontradas ${cardsBase.length} cartas (raridade: ${cardsBase[0].rarity})`);
      
      // Selecionar carta aleatória
      const randomCard = cardsBase[Math.floor(Math.random() * cardsBase.length)];
      debugLogs.push(`Carta selecionada: ${randomCard.name} (${randomCard.id})`);
      
      // Calcular liquidez base
      const baseLiquidity = randomCard.base_liquidity_brl || 0.01;
      
      // Sortear skin baseado em skin_boost do tier
      const skinBoost = boosterType.skin_boost || {
        premium: 15,
        ghost: 5,
        holo: 0,
        dark: 0,
        glitch: 0
      };
      
      const skinRoll = Math.random() * 100;
      let skinType = 'default';
      let skinMultiplier = 1.0;
      
      // Calcular probabilidades cumulativas para skins
      let skinCumulative = 0;
      
      // Glitch (ultra raro, 6x)
      skinCumulative += skinBoost.glitch || 0;
      if (skinRoll < skinCumulative) {
        skinType = 'glitch';
        skinMultiplier = 6.0;
      }
      // Dark (muito raro, 4x)
      else if (skinRoll < (skinCumulative += skinBoost.dark || 0)) {
        skinType = 'dark';
        skinMultiplier = 4.0;
      }
      // Ghost (raro, 3x)
      else if (skinRoll < (skinCumulative += skinBoost.ghost || 0)) {
        skinType = 'ghost';
        skinMultiplier = 3.0;
      }
      // Holo (incomum, 2.5x)
      else if (skinRoll < (skinCumulative += skinBoost.holo || 0)) {
        skinType = 'holo';
        skinMultiplier = 2.5;
      }
      // Premium (comum, 1.5x)
      else if (skinRoll < (skinCumulative += skinBoost.premium || 0)) {
        skinType = 'premium';
        skinMultiplier = 1.5;
      }
      // Default (resto, 1x)
      
      // Liquidez final = base × skin APENAS (marketplace integrity)
      // Aplicar value_adjustment do booster tier
      const valueAdjustment = boosterType.value_adjustment || 1.0;
      const calculatedLiquidity = baseLiquidity * skinMultiplier * valueAdjustment;
      // Garantir mínimo de R$ 0.01 para evitar cartas com R$ 0.00
      const finalLiquidity = Math.max(0.01, calculatedLiquidity);
      
      debugLogs.push(`Skin: ${skinType} (${skinMultiplier}x), Tier adj: ${valueAdjustment}x, Liquidez: R$ ${baseLiquidity.toFixed(4)} × ${skinMultiplier}x × ${valueAdjustment}x = R$ ${calculatedLiquidity.toFixed(4)} → R$ ${finalLiquidity.toFixed(2)} (min)`);
      console.log(`[OPEN-V2] Skin: ${skinType}, Value adj: ${valueAdjustment}x, Liquidez: R$ ${baseLiquidity.toFixed(4)} × ${skinMultiplier}x × ${valueAdjustment}x = R$ ${calculatedLiquidity.toFixed(4)} → R$ ${finalLiquidity.toFixed(2)}`);
      
      // Criar instância da carta (usar supabaseAdmin para bypass RLS)
      const { data: cardInstance, error: instanceError } = await supabaseAdmin
        .from('cards_instances')
        .insert({
          base_id: randomCard.id,
          owner_id: user.id,
          edition_id: opening.booster_pack.edition_id,
          skin: skinType,
          is_godmode: false,
          liquidity_brl: finalLiquidity
        })
        .select()
        .single();
      
      if (instanceError || !cardInstance) {
        debugLogs.push(`ERRO ao criar instância: ${JSON.stringify(instanceError)}`);
        console.error('[OPEN-V2] Erro ao criar instância:', instanceError);
        continue;
      }
      
      debugLogs.push(`Instância criada: ${cardInstance.id}`);
      
      generatedCards.push({
        id: cardInstance.id,
        base_id: randomCard.id,
        skin: skinType,
        is_godmode: false,
        liquidity_brl: finalLiquidity,
        card: {
          name: randomCard.name,
          rarity: randomCard.rarity,
          image_url: randomCard.image_url,
          display_id: randomCard.display_id
        }
      });
    }
    
    console.log(`[OPEN-V2] 10. Geradas ${generatedCards.length} cartas`);
    
    if (generatedCards.length === 0) {
      console.error('[OPEN-V2] ERRO: Nenhuma carta foi gerada!');
      return NextResponse.json({
        ok: false,
        error: { 
          code: 'NO_CARDS_GENERATED', 
          message: 'Nenhuma carta foi gerada',
          debugLogs // Retornar logs para debug
        }
      }, { status: 500 });
    }
    
    // Marcar como aberto (usar supabaseAdmin)
    await supabaseAdmin
      .from('booster_openings')
      .update({ opened_at: new Date().toISOString() })
      .eq('id', opening_id);
    
    // ============================================================================
    // MYSTERY BOX BONUS SYSTEM
    // ============================================================================
    console.log('[OPEN-V2] 10.5. Verificando bônus Mystery Box...');
    
    let bonusMysteryBox = null;
    const bonusChance = boosterType.mystery_box_bonus_chance || 0;
    
    if (bonusChance > 0) {
      const bonusRoll = Math.random() * 100;
      console.log(`[OPEN-V2] Bonus roll: ${bonusRoll.toFixed(2)}% (chance: ${bonusChance}%)`);
      
      if (bonusRoll < bonusChance) {
        console.log('[OPEN-V2] 🎁 BONUS MYSTERY BOX TRIGGERED!');
        
        // Mapear tier do booster para tier da Mystery Box
        const tierMap: Record<number, string> = {
          0.50: 'bronze',
          1.00: 'silver',
          2.00: 'gold',
          5.00: 'platinum',
          10.00: 'diamond'
        };
        
        const mysteryBoxTier = tierMap[opening.price_paid_brl] || 'bronze';
        
        // Buscar Mystery Box Type correspondente
        const { data: mysteryBoxType, error: boxTypeError } = await supabaseAdmin
          .from('mystery_box_types')
          .select('box_id, tier, name')
          .eq('tier', mysteryBoxTier)
          .single();
        
        if (boxTypeError || !mysteryBoxType) {
          console.error('[OPEN-V2] Erro ao buscar Mystery Box Type:', boxTypeError);
        } else {
          // Criar instância da Mystery Box
          const { data: mysteryInstance, error: instanceError } = await supabaseAdmin
            .from('mystery_box_instances')
            .insert({
              box_id: mysteryBoxType.box_id,
              user_id: user.id,
              source_type: 'booster_bonus',
              status: 'pending',
              metadata: {
                booster_opening_id: opening_id,
                bonus_chance_used: bonusChance
              }
            })
            .select()
            .single();
          
          if (instanceError || !mysteryInstance) {
            console.error('[OPEN-V2] Erro ao criar Mystery Box instance:', instanceError);
          } else {
            console.log('[OPEN-V2] Mystery Box instance criada:', mysteryInstance.instance_id);
            
            // Registrar drop no tracking
            await supabaseAdmin
              .from('mystery_box_bonus_drops')
              .insert({
                user_id: user.id,
                opening_id: opening_id,
                instance_id: mysteryInstance.instance_id,
                booster_tier_price: opening.price_paid_brl,
                mystery_box_tier: mysteryBoxTier,
                bonus_chance_used: bonusChance
              });
            
            bonusMysteryBox = {
              instance_id: mysteryInstance.instance_id,
              tier: mysteryBoxTier,
              name: mysteryBoxType.name
            };
            
            console.log('[OPEN-V2] Bonus Mystery Box registrada no tracking');
          }
        }
      } else {
        console.log('[OPEN-V2] Bonus não caiu (roll muito alto)');
      }
    }
    
    console.log('[OPEN-V2] 11. Retornando', generatedCards.length, 'cartas');
    console.log('[OPEN-V2] Primeira carta:', generatedCards[0]);
    
    return NextResponse.json({
      ok: true,
      data: {
        opening_id,
        cards: generatedCards,
        bonus_mystery_box: bonusMysteryBox // Novo campo
        // Pity system será implementado futuramente
        // Por ora, apenas retorna as cartas geradas
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
