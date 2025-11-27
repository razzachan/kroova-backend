import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const supabase = createClient(supabaseUrl, anonKey);

    const { data: user, error } = await supabase
      .from('users')
      .select('balance_brl')
      .eq('id', userId)
      .single();

    if (error) {
      return NextResponse.json(
        { ok: false, error: { code: 'USER_NOT_FOUND', message: error.message } },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      ok: true, 
      data: { 
        user_id: userId,
        balance_brl: user.balance_brl || 0 
      } 
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
