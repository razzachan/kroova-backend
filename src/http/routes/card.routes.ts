import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { ok, fail } from "../response.js";
import { cacheGet, cacheSet, CACHE_KEYS } from "../../lib/cache.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { mintNftSchema } from "../validators/card.schema.js";
import { CardService } from "../../modules/card/card.service.js";

const cardService = new CardService();

export async function cardRoutes(app: FastifyInstance) {
  /**
   * GET /cards/ed01
   * Lista cartas base da edição ED01 com filtros opcionais
   * Query params: rarity, archetype (opcionais)
   */
  app.get(
    "/cards/ed01",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { rarity, archetype } = request.query as { rarity?: string; archetype?: string };
        const filters: Record<string, string> = {};
        if (rarity) filters.rarity = rarity;
        if (archetype) filters.archetype = archetype;
        // Cache only when no filters
        if (!rarity && !archetype) {
          const cached = await cacheGet(CACHE_KEYS.ED01_CARDS);
            if (cached) {
              return reply.send(ok(JSON.parse(cached)));
            }
        }
        const { data, error } = await CardService.listEditionCards("ED01", filters);
        if (error) {
          return reply.code(400).send(fail("LIST_FAILED", error.message));
        }
        const payload = { edition: "ED01", total: data?.length || 0, cards: data };
        if (!rarity && !archetype) {
          await cacheSet(CACHE_KEYS.ED01_CARDS, JSON.stringify(payload), 600);
        }
        return reply.send(ok(payload));
      } catch (err) {
        return reply.code(500).send(fail("INTERNAL_ERROR"));
      }
    },
  );
  /**
   * GET /cards/:instance_id
   * Detalhes de uma carta específica
   */
  app.get(
    "/cards/:instance_id",
    { preHandler: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!request.user) {
          return reply.code(401).send(fail("UNAUTHORIZED"));
        }

        const { instance_id } = request.params as { instance_id: string };

        const card = await cardService.getCard(request.user.sub, instance_id);

        return reply.send(ok(card));
      } catch (error) {
        if (error instanceof Error) {
          return reply.code(404).send(fail("CARD_NOT_FOUND", error.message));
        }
        return reply.code(500).send(fail("INTERNAL_ERROR"));
      }
    },
  );

  /**
   * POST /cards/:instance_id/recycle
   * Recicla carta e retorna liquidez base
   */
  app.post(
    "/cards/:instance_id/recycle",
    { preHandler: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!request.user) {
          return reply.code(401).send(fail("UNAUTHORIZED"));
        }

        const { instance_id } = request.params as { instance_id: string };

        const result = await cardService.recycle(request.user.sub, instance_id);

        return reply.send(ok(result));
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.includes("CPF")) {
            return reply.code(400).send(fail("NEEDS_CPF", error.message));
          }
          return reply.code(400).send(fail("RECYCLE_FAILED", error.message));
        }
        return reply.code(500).send(fail("INTERNAL_ERROR"));
      }
    },
  );

  /**
   * POST /cards/:instance_id/mint
   * Solicita mint NFT on-chain
   */
  app.post(
    "/cards/:instance_id/mint",
    {
      preHandler: [authMiddleware, validate(mintNftSchema)],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!request.user) {
          return reply.code(401).send(fail("UNAUTHORIZED"));
        }

        const { instance_id } = request.params as { instance_id: string };
        const body = request.body as {
          chain: "polygon";
          priority: "normal" | "high";
        };

        const result = await cardService.mintNft(request.user.sub, instance_id, body);

        return reply.send(ok(result));
      } catch (error) {
        if (error instanceof Error) {
          return reply.code(400).send(fail("MINT_FAILED", error.message));
        }
        return reply.code(500).send(fail("INTERNAL_ERROR"));
      }
    },
  );
}
