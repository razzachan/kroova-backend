import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { ok, fail } from '../response.js';
import { CardService } from '../../modules/card/card.service.js';

const cardService = new CardService();

export async function nftRoutes(app: FastifyInstance) {
  // POST /nft/mint { instance_id, chain, priority }
  app.post('/nft/mint', { preHandler: [authMiddleware] }, async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      if (!req.user) return reply.code(401).send(fail('UNAUTHORIZED'));
      const body = req.body as any;
      const instanceId = String(body.instance_id || '').trim();
      const chain = String(body.chain || 'polygon');
      const priority = (body.priority === 'high' ? 'high' : 'normal') as 'normal'|'high';
      if (!instanceId) return reply.code(400).send(fail('INVALID_INSTANCE_ID'));
      const res = await cardService.mintNft(req.user.sub, instanceId, { chain, priority });
      return reply.send(ok(res));
    } catch (e: any) {
      if (e.message.includes('já foi mintada')) return reply.code(400).send(fail('ALREADY_MINTED', e.message));
      if (e.message.includes('não é o dono')) return reply.code(403).send(fail('NOT_OWNER', e.message));
      return reply.code(400).send(fail('MINT_FAILED', e.message));
    }
  });

  // GET /nft/mint-status/:instanceId
  app.get('/nft/mint-status/:instanceId', { preHandler: [authMiddleware] }, async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      if (!req.user) return reply.code(401).send(fail('UNAUTHORIZED'));
      const { instanceId } = req.params as any;
      const { data: instance, error } = await (await import('../../config/supabase.js')).supabase
        .from('cards_instances')
        .select('id,mint_pending,minted_at,hash_onchain,token_uri')
        .eq('id', instanceId)
        .single();
      if (error || !instance) return reply.code(404).send(fail('NOT_FOUND'));
      return reply.send(ok({
        instance_id: instance.id,
        status: instance.minted_at ? 'minted' : (instance.mint_pending ? 'pending' : 'idle'),
        minted_at: instance.minted_at,
        hash_onchain: instance.hash_onchain,
        token_uri: instance.token_uri,
      }));
    } catch (e: any) {
      return reply.code(500).send(fail('INTERNAL_ERROR', e.message));
    }
  });
}