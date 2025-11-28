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
   * GET /wallet/deposit/preview?amount_brl=10
   * Preview de crédito líquido considerando repasse para depósitos pequenos
   */
  app.get(
    "/wallet/deposit/preview",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const q = request.query as any;
      const gross = Number(q.amount_brl || 0);
      if (!isFinite(gross) || gross <= 0) {
        return reply.code(400).send(fail("INVALID_AMOUNT", "amount_brl inválido"));
      }
      const threshold = env.smallDepositThresholdBrl || 5;
      const fixedFee = env.smallDepositFixedFeeBrl || 0;
      const fee = gross < threshold ? fixedFee : 0;
      const net = Math.max(0, gross - fee);
      return reply.send(ok({
        amount_brl: gross,
        net_amount_brl: Number(net.toFixed(2)),
        fee_brl: Number(fee.toFixed(2)),
        threshold_brl: threshold,
        fee_applied: gross < threshold
      }));
    }
  );
  /**
   * GET /wallet/health
   * Health check with user info (debug)
   */
  app.get(
    "/wallet/health",
    { preHandler: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      return reply.send(ok({
        authenticated: true,
        user_id: request.user?.sub,
        email: request.user?.email,
        env: {
          hasJwtSecret: !!env.supabaseJwtSecret,
          nodeEnv: env.nodeEnv
        }
      }));
    }
  );

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
        return reply.code(500).send(fail("INTERNAL_ERROR", error?.message || "Unknown error"));
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
