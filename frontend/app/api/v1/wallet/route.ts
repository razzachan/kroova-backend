import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY!;
const jwtSecret = process.env.SUPABASE_JWT_SECRET!;

// Validação de env vars
if (!supabaseUrl || !supabaseKey || !jwtSecret) {
  console.error('Missing env vars:', { 
    hasUrl: !!supabaseUrl, 
    hasKey: !!supabaseKey, 
    hasSecret: !!jwtSecret 
  });
}

const supabase = createClient(supabaseUrl, supabaseKey);

function getUserFromToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('No token provided');
  }

  const token = authHeader.substring(7);
  const decoded = jwt.verify(token, jwtSecret, { audience: 'authenticated' }) as any;
  
  return {
    sub: decoded.sub,
    email: decoded.email,
    role: decoded.role,
  };
}

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromToken(request);

    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', user.sub)
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
    
    if (error.message === 'No token provided') {
      return NextResponse.json(
        { ok: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { ok: false, error: { code: 'INTERNAL_ERROR', message: error.message, stack: error.stack } },
      { status: 500 }
    );
  }
}
