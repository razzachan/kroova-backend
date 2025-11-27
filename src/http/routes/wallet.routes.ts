import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { ok, fail } from "../response.js";
import { authMiddleware, adminMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { withdrawSchema, depositWebhookSchema } from "../validators/wallet.schema.js";
import { WalletService } from "../../modules/wallet/wallet.service.js";
import { env } from "../../config/env.js";

const walletService = new WalletService();

export async function walletRoutes(app: FastifyInstance) {
  /**
   * GET /wallet
   * Consulta saldos BRL/Cripto
   * Auth: Bearer token required
   */
  app.get(
    "/wallet",
    { preHandler: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!request.user) {
          return reply.code(401).send(fail("UNAUTHORIZED"));
        }

        const wallet = await walletService.getWallet(request.user.sub);

        return reply.send(ok(wallet));
      } catch (error: any) {
        console.error('[wallet] GET /wallet error:', error?.message || error);
        return reply.code(500).send(fail("INTERNAL_ERROR", error?.message));
      }
    },
  );

  /**
   * GET /wallet/transactions
   * Lista transações com paginação
   */
  app.get(
    "/wallet/transactions",
    { preHandler: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!request.user) {
          return reply.code(401).send(fail("UNAUTHORIZED"));
        }

        const query = request.query as {
          page?: number;
          limit?: number;
          type?: string;
        };

        const transactions = await walletService.getTransactions(request.user.sub, query);

        return reply.send(ok(transactions));
      } catch (error) {
        return reply.code(500).send(fail("INTERNAL_ERROR"));
      }
    },
  );

  /**
   * POST /wallet/withdraw
   * Solicita saque (PIX ou Cripto)
   */
  app.post(
    "/wallet/withdraw",
    {
      preHandler: [authMiddleware, validate(withdrawSchema)],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!request.user) {
          return reply.code(401).send(fail("UNAUTHORIZED"));
        }

        const body = request.body as {
          method: "pix" | "crypto";
          amount_brl?: number;
          amount_crypto?: number;
          target: Record<string, unknown>;
        };

        const result = await walletService.withdraw(request.user.sub, body);

        return reply.send(ok(result));
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.includes("CPF")) {
            return reply.code(400).send(fail("NEEDS_CPF", error.message));
          }
          if (error.message.includes("saldo")) {
            return reply.code(400).send(fail("INSUFFICIENT_FUNDS", error.message));
          }
          if (error.message.includes("limite")) {
            return reply.code(400).send(fail("LIMIT_REACHED", error.message));
          }
          return reply.code(400).send(fail("WITHDRAW_FAILED", error.message));
        }
        return reply.code(500).send(fail("INTERNAL_ERROR"));
      }
    },
  );

  /**
   * POST /wallet/deposit/webhook
   * Webhook de confirmação de pagamento
   */
  app.post(
    "/wallet/deposit/webhook",
    {
      preHandler: [adminMiddleware, validate(depositWebhookSchema)],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const body = request.body as {
          payment_id: string;
          amount_brl: number;
          email: string;
          status: string;
          metadata?: Record<string, unknown>;
        };

        const result = await walletService.handleDepositWebhook(body);

        return reply.send(ok(result));
      } catch (error) {
        if (error instanceof Error) {
          return reply.code(400).send(fail("WEBHOOK_FAILED", error.message));
        }
        return reply.code(500).send(fail("INTERNAL_ERROR"));
      }
    },
  );

  /**
   * POST /wallet/deposit/dev
   * Depósito direto para testes locais (não disponível em produção)
   */
  app.post(
    "/wallet/deposit/dev",
    { preHandler: [authMiddleware] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        if (env.nodeEnv === 'production') {
          return reply.code(403).send(fail("FORBIDDEN", "Rota indisponível em produção"));
        }
        if (!request.user) {
          return reply.code(401).send(fail("UNAUTHORIZED"));
        }
        const body = request.body as { amount_brl?: number };
        const amount = Number(body.amount_brl || 0);
        const result = await walletService.depositDev(request.user.sub, amount);
        return reply.send(ok(result));
      } catch (error) {
        if (error instanceof Error) {
          return reply.code(400).send(fail("DEPOSIT_DEV_FAILED", error.message));
        }
        return reply.code(500).send(fail("INTERNAL_ERROR"));
      }
    },
  );
}
