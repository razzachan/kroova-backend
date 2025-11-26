import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { ok, fail } from "../response.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createListingSchema, listMarketSchema } from "../validators/market.schema.js";
import { MarketService } from "../../modules/market/market.service.js";

const marketService = new MarketService();

export async function marketRoutes(app: FastifyInstance) {
  /**
   * GET /market/listings
   * Lista cartas à venda
   */
  app.get(
    "/market/listings",
    { preHandler: validate(listMarketSchema, "query") },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const query = request.query as {
          rarity_min?: string;
          rarity_max?: string;
          price_min?: number;
          price_max?: number;
          archetype?: string;
          edition_id?: string;
          order_by?: string;
          page?: number;
          limit?: number;
        };

        const listings = await marketService.listListings(query);

        return reply.send(ok(listings));
      } catch (error) {
        return reply.code(500).send(fail("INTERNAL_ERROR"));
      }
    },
  );

  /**
   * POST /market/listings
   * Cria anúncio de carta
   */
  app.post(
    "/market/listings",
    {
      preHandler: [authMiddleware, validate(createListingSchema)],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!request.user) {
          return reply.code(401).send(fail("UNAUTHORIZED"));
        }

        const body = request.body as {
          card_instance_id: string;
          price_brl?: number;
          price_crypto?: number;
        };

        const result = await marketService.createListing(request.user.sub, body);

        return reply.send(ok(result));
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.includes("CPF")) {
            return reply.code(400).send(fail("NEEDS_CPF", error.message));
          }
          return reply.code(400).send(fail("LISTING_FAILED", error.message));
        }
        return reply.code(500).send(fail("INTERNAL_ERROR"));
      }
    },
  );

  /**
   * DELETE /market/listings/:listing_id
   * Cancela anúncio
   */
  app.delete(
    "/market/listings/:listing_id",
    { preHandler: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!request.user) {
          return reply.code(401).send(fail("UNAUTHORIZED"));
        }

        const { listing_id } = request.params as { listing_id: string };

        await marketService.cancelListing(request.user.sub, listing_id);

        return reply.send(ok({ success: true }));
      } catch (error) {
        if (error instanceof Error) {
          return reply.code(400).send(fail("CANCEL_FAILED", error.message));
        }
        return reply.code(500).send(fail("INTERNAL_ERROR"));
      }
    },
  );

  /**
   * POST /market/listings/:listing_id/buy
   * Compra carta
   */
  app.post(
    "/market/listings/:listing_id/buy",
    { preHandler: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!request.user) {
          return reply.code(401).send(fail("UNAUTHORIZED"));
        }

        const { listing_id } = request.params as { listing_id: string };

        const result = await marketService.buyListing(request.user.sub, listing_id);

        return reply.send(ok(result));
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.includes("saldo")) {
            return reply.code(400).send(fail("INSUFFICIENT_FUNDS", error.message));
          }
          return reply.code(400).send(fail("BUY_FAILED", error.message));
        }
        return reply.code(500).send(fail("INTERNAL_ERROR"));
      }
    },
  );
}
