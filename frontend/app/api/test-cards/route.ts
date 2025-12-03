import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  const supabase = createClient(supabaseUrl, anonKey);
  
  // Testar query EXATA do booster opening
  const tests = [];
  
  // Teste 1: Query geral
  const test1 = await supabase
    .from('cards_base')
    .select('id, name, rarity, image_url, display_id')
    .eq('edition_id', 'ED01')
    .limit(10);
  
  tests.push({
    name: 'Query geral',
    count: test1.data?.length || 0,
    error: test1.error
  });
  
  // Teste 2: Query com rarity=trash
  const test2 = await supabase
    .from('cards_base')
    .select('id, name, rarity, image_url, display_id')
    .eq('edition_id', 'ED01')
    .eq('rarity', 'trash')
    .limit(50);
  
  tests.push({
    name: 'Query rarity=trash',
    count: test2.data?.length || 0,
    error: test2.error,
    sample: test2.data?.[0]
  });
  
  // Teste 3: Query com rarity=meme
  const test3 = await supabase
    .from('cards_base')
    .select('id, name, rarity, image_url, display_id')
    .eq('edition_id', 'ED01')
    .eq('rarity', 'meme')
    .limit(50);
  
  tests.push({
    name: 'Query rarity=meme',
    count: test3.data?.length || 0,
    error: test3.error,
    sample: test3.data?.[0]
  });
  
  // Teste 4: Query com rarity=viral
  const test4 = await supabase
    .from('cards_base')
    .select('id, name, rarity, image_url, display_id')
    .eq('edition_id', 'ED01')
    .eq('rarity', 'viral')
    .limit(50);
  
  tests.push({
    name: 'Query rarity=viral',
    count: test4.data?.length || 0,
    error: test4.error,
    sample: test4.data?.[0]
  });
  
  return NextResponse.json({
    ok: true,
    tests
  });
}
