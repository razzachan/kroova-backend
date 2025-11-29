import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !anonKey) {
  console.error('Missing Supabase config');
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { ok: false, error: { code: 'UNAUTHORIZED', message: 'No token provided' } },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    // Usa anon key + user token -> RLS valida automaticamente
    const supabase = createClient(supabaseUrl, anonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });

    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { ok: false, error: { code: 'DATABASE_ERROR', message: error.message } },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { ok: false, error: { code: 'NOT_FOUND', message: 'Wallet not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, data });
  } catch (error: any) {
    console.error('Wallet API error:', error);
    
    return NextResponse.json(
      { ok: false, error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
