import type { FastifyRequest, FastifyReply } from "fastify";
import type { ZodSchema } from "zod";
import { fail } from "../response.js";

/**
 * 🛡️ Middleware de Validação com Zod
 * Valida body, query ou params do request
 */
export function validate(schema: ZodSchema, source: "body" | "query" | "params" = "body") {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = request[source];
      schema.parse(data);
    } catch (error: unknown) {
      if (error && typeof error === "object" && "errors" in error) {
        const zodError = error as { errors: Array<{ message: string }> };
        return reply.code(400).send(fail("INVALID_INPUT", zodError.errors[0]?.message));
      }
      return reply.code(400).send(fail("INVALID_INPUT"));
    }
  };
}
