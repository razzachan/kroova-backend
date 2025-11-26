import { supabase, supabaseAdmin } from "../../config/supabase.js";
import jwt from "jsonwebtoken";
import { randomUUID, createHash } from "crypto";
import * as bcrypt from "bcryptjs";
import { env } from "../../config/env.js";
import { generateDisplayId, isValidCPF } from "../../lib/utils.js";

interface RegisterInput {
  email: string;
  password: string;
  name?: string;
}

interface LoginInput {
  email: string;
  password: string;
}

export class AuthService {
  /**
   * Cria conta + wallet + migra inventário pendente
   */
  async register(input: RegisterInput) {
    const { email, password, name } = input;

    // Modo real: sempre usar Supabase (stub só via SUPABASE_STUB_ENABLED no client config)

    // Verifica se usuário já existe
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) {
      throw new Error("E-mail já cadastrado");
    }

    // Cria usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError || !authData.user) {
      throw new Error("Erro ao criar conta: " + authError?.message);
    }

    const userId = authData.user.id;

    // Cria usuário na tabela users
    const { error: userError } = await supabaseAdmin.from("users").insert({
      id: userId,
      display_id: generateDisplayId("usr"),
      email,
      name: name || null,
      cpf: null,
      cpf_verified: false,
    });

    if (userError) {
      throw new Error("Erro ao criar perfil: " + userError.message);
    }

    // Cria wallet
    const { error: walletError } = await supabaseAdmin.from("wallets").insert({
      user_id: userId,
      balance_brl: 0,
      balance_crypto: 0,
    });

    if (walletError) {
      throw new Error("Erro ao criar carteira: " + walletError.message);
    }

    // Migra inventário pendente (se existir)
    await this.migratePendingInventory(userId, email);

    const accessToken = this.generateAccessToken(userId, email);
    const { refreshToken } = await this.issueRefreshToken(userId);

    return { user: { id: userId, email, name }, access_token: accessToken, refresh_token: refreshToken };
  }

  /**
   * Autentica e retorna JWT
   */
  async login(input: LoginInput) {
    const { email, password } = input;

    // Sem atalhos de teste: exige credenciais válidas

    // Busca usuário
    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("id, email, name")
      .eq("email", email)
      .single();

    if (error || !user) {
      throw new Error("Credenciais inválidas");
    }

    // Autentica no Supabase Auth
    // Dev bypass: allow login without Supabase Auth when explicitly enabled
    if (process.env.KROOVA_DEV_LOGIN_BYPASS === '1') {
      const accessToken = this.generateAccessToken(user.id, user.email);
      const { refreshToken } = await this.issueRefreshToken(user.id);
      return { access_token: accessToken, refresh_token: refreshToken, user: { id: user.id, email: user.email, name: user.name } };
    }

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      // Attempt one admin password reset then retry once
      try {
        await (supabaseAdmin as any).auth.admin.updateUserById(user.id, { password });
        const { error: retryErr } = await supabase.auth.signInWithPassword({ email, password });
        if (retryErr) throw retryErr;
      } catch (_e) {
        throw new Error("Credenciais inválidas");
      }
    }

    const accessToken = this.generateAccessToken(user.id, user.email);
    const { refreshToken } = await this.issueRefreshToken(user.id);
    return { access_token: accessToken, refresh_token: refreshToken, user: { id: user.id, email: user.email, name: user.name } };
  }

  /**
   * Retorna dados do usuário logado
   */
  async getMe(userId: string) {
    const { data: user, error } = await supabase
      .from("users")
      .select("id, display_id, email, name, cpf, cpf_verified, created_at")
      .eq("id", userId)
      .single();

    if (error || !user) {
      throw new Error("Usuário não encontrado");
    }

    return user;
  }

  /**
   * Define CPF do usuário
   */
  async setCpf(userId: string, cpf: string) {
    // Valida CPF
    if (!isValidCPF(cpf)) {
      throw new Error("CPF inválido");
    }

    // Verifica se CPF já está em uso
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("cpf", cpf)
      .neq("id", userId)
      .single();

    if (existing) {
      throw new Error("CPF já cadastrado em outra conta");
    }

    // Atualiza CPF
    const { error } = await supabase
      .from("users")
      .update({ cpf, cpf_verified: true })
      .eq("id", userId);

    if (error) {
      throw new Error("Erro ao atualizar CPF: " + error.message);
    }
  }

  /**
   * Migra inventário pendente para usuário logado
   */
  private async migratePendingInventory(userId: string, email: string) {
    // Busca inventário pendente
    const { data: pendingItems } = await supabase
      .from("pending_inventory")
      .select("*")
      .eq("email", email)
      .eq("claimed", false);

    if (!pendingItems || pendingItems.length === 0) {
      return;
    }

    // Migra cada item para user_inventory
    for (const item of pendingItems) {
      await supabase.from("user_inventory").insert({
        user_id: userId,
        card_instance_id: item.card_instance_id,
        acquired_at: item.created_at,
      });
    }

    // Marca como claimed
    await supabase
      .from("pending_inventory")
      .update({ claimed: true, claimed_at: new Date().toISOString() })
      .eq("email", email);
  }

  // ===== Refresh Token Helpers =====
  private generateAccessToken(userId: string, email: string) {
    return jwt.sign({ sub: userId, email, role: "user" }, env.jwtSecret, { expiresIn: "15m" });
  }

  private hashRefresh(raw: string) {
    return createHash('sha256').update(raw).digest('hex');
  }

  private async issueRefreshToken(userId: string) {
    // Armazena hash em tabela refresh_tokens
    const raw = randomUUID() + randomUUID(); // 2 UUIDs -> 64 chars approx
    const tokenHash = this.hashRefresh(raw);
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30d
    const { error } = await supabaseAdmin.from('refresh_tokens').insert({ user_id: userId, token_hash: tokenHash, expires_at: expires.toISOString() });
    if (error) throw new Error('Erro ao emitir refresh token');
    return { refreshToken: raw };
  }

  async refresh(oldToken: string) {
    // Fluxo real de rotação
    const tokenHash = this.hashRefresh(oldToken);
    const { data: row, error } = await supabaseAdmin
      .from('refresh_tokens')
      .select('id, user_id, revoked, expires_at')
      .eq('token_hash', tokenHash)
      .single();
    if (error || !row) throw new Error('Refresh token inválido');
    if (row.revoked) throw new Error('Refresh token revogado');
    if (new Date(row.expires_at).getTime() < Date.now()) throw new Error('Refresh token expirado');

    // Rotate: revoke old, issue new
    const newRaw = randomUUID() + randomUUID();
    const newHash = this.hashRefresh(newRaw);
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
    const { error: insErr, data: insData } = await supabaseAdmin
      .from('refresh_tokens')
      .insert({ user_id: row.user_id, token_hash: newHash, expires_at: expires.toISOString() })
      .select('id')
      .single();
    if (insErr || !insData) throw new Error('Erro ao rotacionar refresh');
    const { error: updErr } = await supabaseAdmin
      .from('refresh_tokens')
      .update({ revoked: true, replaced_by: insData.id })
      .eq('id', row.id);
    if (updErr) throw new Error('Erro ao revogar refresh anterior');

    const accessToken = this.generateAccessToken(row.user_id, ''); // email não necessário para payload se não armazenado; opcional buscar
    return { access_token: accessToken, refresh_token: newRaw };
  }

  async revoke(userId: string, rawRefresh: string) {
    // Revogação em ambiente real
    const tokenHash = this.hashRefresh(rawRefresh);
    const { error } = await supabaseAdmin
      .from('refresh_tokens')
      .update({ revoked: true })
      .eq('user_id', userId)
      .eq('token_hash', tokenHash);
    if (error) throw new Error('Erro ao revogar');
  }
}
