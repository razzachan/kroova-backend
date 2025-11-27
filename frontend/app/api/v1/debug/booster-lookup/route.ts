import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_KEY!;

export async function GET() {
  try {
    const supabaseAdmin = createClient(supabaseUrl, serviceKey);
    
    const testId = '5f35410d-d762-46fd-a872-e79aaf7e9b31';
    
    // Buscar por ID específico
    const { data: boosterType, error: boosterError } = await supabaseAdmin
      .from('booster_types')
      .select('*')
      .eq('id', testId)
      .single();
    
    // Buscar todos
    const { data: allTypes, error: allError } = await supabaseAdmin
      .from('booster_types')
      .select('id, name, price_brl')
      .limit(5);
    
    return NextResponse.json({
      ok: true,
      testId,
      found: !!boosterType,
      boosterType,
      boosterError: boosterError?.message,
      allTypes,
      allError: allError?.message
    });
  } catch (error: any) {
    return NextResponse.json({
      ok: false,
      error: error.message
    }, { status: 500 });
  }
}
