import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { ok, fail } from "../response.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { purchaseBoosterSchema, openBoosterSchema } from "../validators/booster.schema.js";
import { rateLimit } from "../middlewares/rate-limit.middleware.js";
import { BoosterService } from "../../modules/booster/booster.service.js";
import { domainMetrics } from "../../observability/metrics.js";

const boosterService = new BoosterService();

export async function boosterRoutes(app: FastifyInstance) {
  /**
   * GET /boosters
   * Lista tipos de booster disponíveis
   */
  app.get("/boosters", async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const boosters = await boosterService.listBoosterTypes();

      return reply.send(ok(boosters));
    } catch (error) {
      return reply.code(500).send(fail("INTERNAL_ERROR"));
    }
  });

  /**
   * POST /boosters/purchase
   * Compra boosters com saldo interno
   */
  app.post(
    "/boosters/purchase",
    { preHandler: [authMiddleware, rateLimit({ limit: 15, windowMs: 300000 }), validate(purchaseBoosterSchema)] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!request.user) {
          return reply.code(401).send(fail("UNAUTHORIZED"));
        }

        const body = request.body as {
          booster_type_id: string;
          quantity: number;
          currency: "brl" | "crypto";
        };

        const result = await boosterService.purchase(request.user.sub, body);
        // Métricas e revenue são registradas dentro do serviço; evitar dupla contagem aqui

        return reply.send(ok(result));
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.includes("saldo")) {
            return reply.code(400).send(fail("INSUFFICIENT_FUNDS", error.message));
          }
          return reply.code(400).send(fail("PURCHASE_FAILED", error.message));
        }
        return reply.code(500).send(fail("INTERNAL_ERROR"));
      }
    },
  );

  /**
   * POST /boosters/open
   * Abre booster e gera cartas
   */
  app.post(
    "/boosters/open",
    { preHandler: [authMiddleware, rateLimit({ limit: 30, windowMs: 300000 }), validate(openBoosterSchema)] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!request.user) {
          return reply.code(401).send(fail("UNAUTHORIZED"));
        }

        const { booster_opening_id } = request.body as {
          booster_opening_id: string;
        };

        const result = await boosterService.open(request.user.sub, booster_opening_id);
        domainMetrics.boosterOpen();

        return reply.send(ok(result));
      } catch (error) {
        if (error instanceof Error) {
          return reply.code(400).send(fail("OPEN_FAILED", error.message));
        }
        return reply.code(500).send(fail("INTERNAL_ERROR"));
      }
    },
  );

  /**
   * GET /boosters/pity
   * Retorna contador de pity do usuário para uma edição
   */
  app.get(
    "/boosters/pity",
    { preHandler: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!request.user) {
          return reply.code(401).send(fail("UNAUTHORIZED"));
        }

        const query = request.query as { edition_id?: string };
        const editionId = query.edition_id || 'ED01';

        const pityCount = await boosterService.getPityCounter(request.user.sub, editionId);

        return reply.send(ok({ pity_count: pityCount, max: 180, edition_id: editionId }));
      } catch (error) {
        return reply.code(500).send(fail("INTERNAL_ERROR"));
      }
    },
  );

  /**
   * GET /inventory
   * Lista cartas do jogador
   */
  app.get(
    "/inventory",
    { preHandler: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!request.user) {
          return reply.code(401).send(fail("UNAUTHORIZED"));
        }

        const query = request.query as {
          rarity?: string;
          edition_id?: string;
          search?: string;
          page?: number;
          limit?: number;
        };

        const inventory = await boosterService.getInventory(request.user.sub, query);

        return reply.send(ok(inventory));
      } catch (error) {
        return reply.code(500).send(fail("INTERNAL_ERROR"));
      }
    },
  );
}
