import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ok, fail } from '../response.js';
import { supabaseAdmin } from '../../config/supabase.js';

export async function jackpotRoutes(app: FastifyInstance) {
  // Public: recent jackpots (anonymized)
  app.get('/jackpots/recent', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const limit = Math.max(1, Math.min(Number((request.query as any)?.limit) || 20, 100));
      const { data, error } = await supabaseAdmin
        .from('transactions')
        .select('user_id, amount_brl, created_at')
        .eq('type', 'jackpot_reward')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) return reply.code(500).send(fail('DB_ERROR'));
      const items = (data || []).map((row: any) => ({
        amount_brl: row.amount_brl,
        created_at: row.created_at,
        user_mask: typeof row.user_id === 'string' ? `u_${row.user_id.slice(0,2)}…${row.user_id.slice(-4)}` : 'u_anon'
      }));
      return reply.send(ok({ items }));
    } catch (e) {
      return reply.code(500).send(fail('INTERNAL_ERROR'));
    }
  });
}
