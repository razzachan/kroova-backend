import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  const supabase = createClient(supabaseUrl, anonKey);
  
  // Testar leitura de cards_base
  const { data, error } = await supabase
    .from('cards_base')
    .select('id, name, rarity, edition_id')
    .eq('edition_id', 'ED01')
    .limit(10);
  
  return NextResponse.json({
    ok: !error,
    count: data?.length || 0,
    cards: data,
    error: error
  });
}
