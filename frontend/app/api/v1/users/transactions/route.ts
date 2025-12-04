import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

/**
 * GET /api/v1/users/transactions
 * 
 * Retorna histórico de transações do usuário
 * 
 * Query params:
 * - type?: string (filtrar por tipo)
 * - limit?: number (padrão: 50)
 * - offset?: number (padrão: 0)
 * 
 * Response:
 * {
 *   ok: boolean,
 *   data?: {
 *     transactions: Transaction[],
 *     total: number
 *   }
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    // Auth
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { ok: false, error: { code: 'UNAUTHORIZED', message: 'No token' } },
        { status: 401 }
      );
    }
    
    const token = authHeader.substring(7);
    const supabase = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    });
    
    // Get user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json(
        { ok: false, error: { code: 'UNAUTHORIZED', message: 'Invalid token' } },
        { status: 401 }
      );
    }
    
    // Query params
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Build query
    let query = supabase
      .from('transaction_history')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (type) {
      query = query.eq('type', type);
    }
    
    const { data: transactions, error: txError, count } = await query;
    
    if (txError) {
      console.error('[TRANSACTIONS] Error:', txError);
      return NextResponse.json(
        { ok: false, error: { code: 'DATABASE_ERROR', message: 'Failed to fetch transactions' } },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      ok: true,
      data: {
        transactions: transactions || [],
        total: count || 0,
        limit,
        offset
      }
    });
    
  } catch (err) {
    console.error('[TRANSACTIONS] Unexpected error:', err);
    return NextResponse.json(
      { ok: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
