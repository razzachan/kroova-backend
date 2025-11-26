import type { FastifyRequest, FastifyReply } from "fastify";
import { fail } from "../response.js";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { supabase } from "../../config/supabase.js";

interface JwtPayload {
  sub: string; // user_id
  email: string;
  role?: string;
}

declare module "fastify" {
  interface FastifyRequest {
    user?: JwtPayload;
  }
}

/**
 * 🔐 Middleware de Autenticação JWT
 * Valida Bearer token do Supabase e adiciona user ao request
 */
export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return reply.code(401).send(fail("UNAUTHORIZED", "Token não fornecido"));
    }

    const token = authHeader.substring(7);

    // Valida JWT do Supabase usando getUser (valida e retorna user data)
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return reply.code(401).send(fail("INVALID_TOKEN", "Token inválido"));
    }

    // Adiciona user ao request com shape compatível
    request.user = {
      sub: data.user.id,
      email: data.user.email || '',
      role: data.user.role || 'authenticated'
    };
  } catch (error) {
    return reply.code(401).send(fail("INVALID_TOKEN", "Token inválido"));
  }
}

/**
 * 🛠️ Middleware Admin
 * Verifica se usuário tem role admin
 */
export async function adminMiddleware(request: FastifyRequest, reply: FastifyReply) {
  if (!request.user) {
    return reply.code(401).send(fail("UNAUTHORIZED"));
  }

  if (request.user.role !== "admin" && request.user.role !== "system") {
    return reply.code(403).send(fail("FORBIDDEN", "Acesso restrito a administradores"));
  }
}
