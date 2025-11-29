import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * GET /api/v1/boosters/pity?edition_id=ED01
 * Retorna informações de pity para uma edição específica
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const editionId = searchParams.get('edition_id');

    if (!editionId) {
      return NextResponse.json(
        { ok: false, error: { code: 'VALIDATION_ERROR', message: 'edition_id is required' } },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, anonKey);

    // Buscar configuração da edição
    const { data: edition, error: editionError } = await supabase
      .from('edition_configs')
      .select('*')
      .eq('id', editionId)
      .single();

    if (editionError || !edition) {
      return NextResponse.json(
        { ok: false, error: { code: 'NOT_FOUND', message: `Edition ${editionId} not found` } },
        { status: 404 }
      );
    }

    // Buscar informações de pity do usuário (se autenticado)
    const authHeader = request.headers.get('authorization');
    let userPity = null;

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const userSupabase = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: `Bearer ${token}` } }
      });

      const { data: { user } } = await userSupabase.auth.getUser();
      
      if (user) {
        const { data: pityData } = await supabase
          .from('user_stats_pity')
          .select('*')
          .eq('user_id', user.id)
          .eq('edition_id', editionId)
          .single();

        if (pityData) {
          userPity = {
            attempts_since_last_godmode: pityData.attempts_since_last_godmode,
            current_probability_boost: calculatePityBoost(pityData.attempts_since_last_godmode),
            next_threshold: getNextThreshold(pityData.attempts_since_last_godmode)
          };
        }
      }
    }

    // Configuração padrão de pity baseada em KROOVA_PITY_SYSTEM.md
    const pityConfig = {
      godmode_base_pct: edition.godmode_probability || 0.01, // Default 1%
      pity_cap_multiplier: 2.0,
      thresholds: [
        { min: 0, max: 49, boost: 0 },
        { min: 50, max: 99, boost: 0.10 },
        { min: 100, max: 149, boost: 0.25 },
        { min: 150, max: 199, boost: 0.45 },
        { min: 200, max: 249, boost: 0.70 },
        { min: 250, max: 999999, boost: 1.00 }
      ]
    };

    return NextResponse.json({
      ok: true,
      data: {
        edition_id: editionId,
        pity_config: pityConfig,
        user_pity: userPity
      }
    });

  } catch (error: any) {
    console.error('[PITY] Error:', error);
    return NextResponse.json(
      { ok: false, error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}

/**
 * Calcula o boost de probabilidade baseado no número de tentativas
 */
function calculatePityBoost(attempts: number): number {
  if (attempts < 50) return 0;
  if (attempts < 100) return 0.10;
  if (attempts < 150) return 0.25;
  if (attempts < 200) return 0.45;
  if (attempts < 250) return 0.70;
  return 1.00; // Cap at 2x base probability
}

/**
 * Retorna o próximo threshold que o usuário vai atingir
 */
function getNextThreshold(attempts: number): { at: number; boost: number } | null {
  if (attempts < 50) return { at: 50, boost: 0.10 };
  if (attempts < 100) return { at: 100, boost: 0.25 };
  if (attempts < 150) return { at: 150, boost: 0.45 };
  if (attempts < 200) return { at: 200, boost: 0.70 };
  if (attempts < 250) return { at: 250, boost: 1.00 };
  return null; // Already at max
}
