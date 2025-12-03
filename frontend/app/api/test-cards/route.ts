import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  // Pegar token do header (mesmo jeito que o booster opening)
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  
  if (!token) {
    return NextResponse.json({ ok: false, error: 'No token' });
  }
  
  const supabase = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } }
  });
  
  // Verificar usuário
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ ok: false, error: 'Not authenticated' });
  }
  
  // Pegar uma carta trash qualquer
  const { data: card } = await supabase
    .from('cards_base')
    .select('id')
    .eq('edition_id', 'ED01')
    .eq('rarity', 'trash')
    .limit(1)
    .single();
  
  if (!card) {
    return NextResponse.json({ ok: false, error: 'No card found' });
  }
  
  // Tentar inserir em cards_instances (TESTE)
  const { data: instance, error: instanceError } = await supabase
    .from('cards_instances')
    .insert({
      base_id: card.id,
      owner_id: user.id,
      edition_id: 'ED01',
      skin: 'default',
      is_godmode: false,
      liquidity_brl: 0.10
    })
    .select()
    .single();
  
  return NextResponse.json({
    ok: !instanceError,
    user_id: user.id,
    card_id: card.id,
    instance: instance,
    error: instanceError
  });
}
