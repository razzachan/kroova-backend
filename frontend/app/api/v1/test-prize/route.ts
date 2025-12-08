import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    
    console.log('[TEST-PRIZE] Testando insert direto...');
    
    // Insert teste simples
    const { data, error } = await supabaseAdmin
      .from('booster_prizes')
      .insert({
        opening_id: '00000000-0000-0000-0000-000000000000',
        user_id: '018c41c1-cef4-70f4-a386-14f10eee7bbd',
        booster_type_id: 'a0f7a317-2dd4-4e0d-9d36-656c10bc93be',
        prize_amount_brl: 1.50,
        booster_cost_brl: 0.50,
        rtp_percentage: 300.00,
        prize_tier: 'jackpot',
        cards_summary: { test: true }
      })
      .select()
      .single();
    
    if (error) {
      console.error('[TEST-PRIZE] ERRO:', error);
      return NextResponse.json({
        ok: false,
        error: {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        }
      }, { status: 500 });
    }
    
    console.log('[TEST-PRIZE] Sucesso! ID:', data.id);
    
    return NextResponse.json({
      ok: true,
      message: 'Prize registered successfully!',
      prize_id: data.id,
      prize: data
    });
    
  } catch (err: any) {
    console.error('[TEST-PRIZE] Exception:', err);
    return NextResponse.json({
      ok: false,
      error: err.message,
      stack: err.stack
    }, { status: 500 });
  }
}
