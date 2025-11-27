import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, anonKey);

    // Buscar boosters com edition config
    const { data: boosters, error } = await supabase
      .from('booster_types')
      .select(`
        *,
        edition:edition_configs!inner(
          base_liquidity,
          skin_multipliers,
          godmode_multiplier,
          rtp_target,
          jackpot_hard_cap
        )
      `)
      .order('price_brl', { ascending: true });

    if (error) {
      return NextResponse.json(
        { ok: false, error: { code: 'DATABASE_ERROR', message: error.message } },
        { status: 500 }
      );
    }

    // Calcular resgate_maximo para cada booster
    const boostersWithMaxResgate = boosters?.map(booster => {
      const edition = booster.edition;
      if (!edition) return booster;

      // Épica × Dark × Godmode × Price Multiplier
      const maxBaseLiquidity = Math.max(...Object.values(edition.base_liquidity as Record<string, number>));
      const maxSkinMultiplier = Math.max(...Object.values(edition.skin_multipliers as Record<string, number>));
      const priceMultiplier = booster.price_multiplier || 1.0;
      const godmodeMultiplier = edition.godmode_multiplier || 10;

      const resgateMaximo = maxBaseLiquidity * maxSkinMultiplier * priceMultiplier * godmodeMultiplier;

      return {
        ...booster,
        resgate_maximo: Math.round(resgateMaximo * 100) / 100,
        rtp_target: edition.rtp_target,
        hard_cap: edition.jackpot_hard_cap
      };
    });

    return NextResponse.json({ ok: true, data: boostersWithMaxResgate });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
