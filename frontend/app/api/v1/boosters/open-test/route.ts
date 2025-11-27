import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_KEY!;

// ENDPOINT DE TESTE - NÃO USAR EM PRODUÇÃO
// Permite abrir booster sem auth, apenas com user_id + booster_id

function selectRarity(distribution: any): string {
  const rand = Math.random() * 100;
  let cumulative = 0;
  const rarities = ['trash', 'meme', 'viral', 'legendary', 'epica'];
  for (const rarity of rarities) {
    cumulative += distribution[rarity] || 0;
    if (rand < cumulative) return rarity;
  }
  return 'trash';
}

function selectSkin(): string {
  const skins = [
    { name: 'default', weight: 50.0 },
    { name: 'neon', weight: 25.0 },
    { name: 'glow', weight: 15.0 },
    { name: 'glitch', weight: 7.0 },
    { name: 'ghost', weight: 2.0 },
    { name: 'holo', weight: 0.8 },
    { name: 'dark', weight: 0.2 }
  ];
  
  const rand = Math.random() * 100;
  let cumulative = 0;
  for (const skin of skins) {
    cumulative += skin.weight;
    if (rand < cumulative) return skin.name;
  }
  return 'default';
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, serviceKey);
    const body = await request.json();
    const { user_id, booster_id } = body;

    if (!user_id || !booster_id) {
      return NextResponse.json(
        { ok: false, error: { code: 'VALIDATION_ERROR', message: 'user_id and booster_id required' } },
        { status: 400 }
      );
    }

    // 1. Verificar saldo
    const { data: user } = await supabase.from('users').select('balance_brl').eq('id', user_id).single();
    
    // 2. Buscar booster
    const { data: booster } = await supabase
      .from('booster_types')
      .select('*, edition:edition_configs!edition_id(*)')
      .eq('id', booster_id)
      .single();

    if (!booster) {
      return NextResponse.json(
        { ok: false, error: { code: 'NOT_FOUND', message: 'Booster not found' } },
        { status: 404 }
      );
    }

    if (user.balance_brl < booster.price_brl) {
      return NextResponse.json(
        { ok: false, error: { code: 'INSUFFICIENT_BALANCE', message: `Saldo insuficiente. Você tem R$ ${user.balance_brl}, precisa de R$ ${booster.price_brl}` } },
        { status: 400 }
      );
    }

    // 3. Buscar pity counter
    const { data: pityData } = await supabase
      .from('user_pity_counter')
      .select('counter')
      .eq('user_id', user_id)
      .eq('edition_id', booster.edition_id)
      .single();

    const pityCounter = pityData?.counter || 0;
    const forceGodmode = pityCounter >= 100;

    // 4. Verificar hard cap
    let canAwardGodmode = true;
    if (forceGodmode || Math.random() < (booster.edition.godmode_probability || 0.01)) {
      const { data: capCheck } = await supabase.rpc('check_edition_hard_cap', {
        p_edition_id: booster.edition_id
      });
      canAwardGodmode = capCheck;
    }

    // 5. Gerar cards
    const cards = [];
    let totalLiquidity = 0;

    for (let i = 0; i < booster.cards_per_booster; i++) {
      const raridade = selectRarity(booster.rarity_distribution);
      const skin = selectSkin();
      const isGodmode = (i === 0 && forceGodmode && canAwardGodmode) || 
                        (!forceGodmode && canAwardGodmode && Math.random() < (booster.edition.godmode_probability || 0.01));

      // Buscar card base aleatório dessa raridade
      const { data: cardBase } = await supabase
        .from('cards_base')
        .select('*')
        .eq('raridade', raridade)
        .eq('edition_id', booster.edition_id);

      if (!cardBase || cardBase.length === 0) continue;

      const randomCard = cardBase[Math.floor(Math.random() * cardBase.length)];

      // Calcular liquidez: base × skin × price × godmode
      const baseLiquidity = booster.edition.base_liquidity[raridade] || 0.01;
      const skinMultiplier = booster.edition.skin_multipliers[skin] || 1.0;
      const priceMultiplier = booster.price_multiplier || 1.0;
      const godmodeMultiplier = isGodmode ? (booster.edition.godmode_multiplier || 10) : 1;

      const liquidity_brl = baseLiquidity * skinMultiplier * priceMultiplier * godmodeMultiplier;
      totalLiquidity += liquidity_brl;

      cards.push({
        id: randomCard.id,
        name: randomCard.name,
        raridade,
        skin,
        is_godmode: isGodmode,
        liquidity_brl: Math.round(liquidity_brl * 100) / 100
      });
    }

    // 6. Atualizar pity
    if (cards.some(c => c.is_godmode)) {
      await supabase.rpc('reset_pity_counter', { p_user_id: user_id, p_edition_id: booster.edition_id });
    } else {
      await supabase.rpc('increment_pity_counter', { p_user_id: user_id, p_edition_id: booster.edition_id });
    }

    // 7. Debitar saldo
    await supabase
      .from('users')
      .update({ balance_brl: user.balance_brl - booster.price_brl })
      .eq('id', user_id);

    // 8. Retornar resultado
    return NextResponse.json({
      ok: true,
      data: {
        cards,
        total_liquidity_brl: Math.round(totalLiquidity * 100) / 100,
        pity_reset: cards.some(c => c.is_godmode),
        rtp_percent: Math.round((totalLiquidity / booster.price_brl) * 10000) / 100
      }
    });

  } catch (error: any) {
    console.error('Error in /boosters/open-test:', error);
    return NextResponse.json(
      { ok: false, error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
