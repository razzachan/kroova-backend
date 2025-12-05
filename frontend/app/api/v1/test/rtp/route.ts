import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = createClient(supabaseUrl, serviceKey);
    const body = await request.json();
    const { tier_price = 10.00, simulations = 100 } = body;

    console.log('[RTP-TEST] Starting test:', { tier_price, simulations });

    // Buscar booster_type
    const { data: boosterType, error: typeError } = await supabaseAdmin
      .from('booster_types')
      .select('*')
      .eq('price_brl', tier_price)
      .eq('edition_id', 'ED01')
      .limit(1)
      .single();

    if (typeError || !boosterType) {
      return NextResponse.json(
        { ok: false, error: 'Tier not found' },
        { status: 404 }
      );
    }

    console.log('[RTP-TEST] Testing tier:', boosterType.name, 'multiplier:', boosterType.price_multiplier);

    const rarityDist = boosterType.rarity_distribution;
    const priceMultiplier = boosterType.price_multiplier;

    let totalSpent = 0;
    let totalReturned = 0;
    const results = [];

    // Simular N boosters
    for (let sim = 0; sim < simulations; sim++) {
      let boosterValue = 0;

      // Simular 5 cartas
      for (let i = 0; i < 5; i++) {
        // Sortear raridade
        const rand = Math.random() * 100;
        let cumulative = 0;
        let selectedRarity = 'meme';

        for (const [rarity, prob] of Object.entries(rarityDist)) {
          cumulative += (prob as number);
          if (rand < cumulative) {
            selectedRarity = rarity;
            break;
          }
        }

        // Buscar cartas dessa raridade
        let cardsBase = (await supabaseAdmin
          .from('cards_base')
          .select('base_liquidity_brl')
          .eq('edition_id', 'ED01')
          .eq('rarity', selectedRarity)
          .limit(50)).data;

        if (!cardsBase || cardsBase.length === 0) {
          // Fallback: qualquer carta
          const fallback = await supabaseAdmin
            .from('cards_base')
            .select('base_liquidity_brl')
            .eq('edition_id', 'ED01')
            .limit(50);
          if (fallback.data) {
            cardsBase = fallback.data;
          }
        }

        if (cardsBase && cardsBase.length > 0) {
          const randomCard = cardsBase[Math.floor(Math.random() * cardsBase.length)];
          const baseLiquidity = randomCard.base_liquidity_brl || 0.01;

          // Sortear skin
          const skinRoll = Math.random();
          let skinMultiplier = 1.0;
          if (skinRoll < 0.05) skinMultiplier = 3.0;
          else if (skinRoll < 0.20) skinMultiplier = 1.5;

          // Calcular valor final
          const cardValue = baseLiquidity * skinMultiplier * priceMultiplier;
          boosterValue += cardValue;
        }
      }

      totalSpent += tier_price;
      totalReturned += boosterValue;
      results.push(boosterValue);
    }

    const rtpPercent = (totalReturned / totalSpent) * 100;
    const avgReturn = totalReturned / simulations;
    const minReturn = Math.min(...results);
    const maxReturn = Math.max(...results);

    return NextResponse.json({
      ok: true,
      data: {
        tier: boosterType.name,
        price: tier_price,
        multiplier: priceMultiplier,
        simulations,
        total_spent: totalSpent.toFixed(2),
        total_returned: totalReturned.toFixed(2),
        rtp_percent: rtpPercent.toFixed(2),
        avg_return: avgReturn.toFixed(2),
        expected_return: (tier_price * 0.70).toFixed(2),
        min_return: minReturn.toFixed(2),
        max_return: maxReturn.toFixed(2),
        status: Math.abs(rtpPercent - 70) < 5 ? 'OK' : 'NEEDS_ADJUSTMENT'
      }
    });

  } catch (error: any) {
    console.error('[RTP-TEST] Error:', error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}
