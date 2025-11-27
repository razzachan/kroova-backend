import { supabase, supabaseAdmin } from "../../config/supabase.js";
import { calculateFee } from "../../lib/utils.js";
import { supabaseHybrid } from "../../core/supabase-hybrid.service.js";
import { Logger } from "../../core/logger.service.js";

interface WithdrawInput {
  method: "pix" | "crypto";
  amount_brl?: number;
  amount_crypto?: number;
  target: Record<string, unknown>;
}

interface DepositWebhookInput {
  payment_id: string;
  amount_brl: number;
  email: string;
  status: string;
  metadata?: Record<string, unknown>;
}

export class WalletService {
  private readonly WITHDRAW_FEE = 0.04; // 4%
  private readonly DAILY_LIMIT = 1500;
  private readonly WEEKLY_LIMIT = 7500;
  private readonly MONTHLY_LIMIT = 30000;

  /**
   * Consulta saldos BRL/Cripto
   * Uses admin client to bypass RLS (wallet queries need direct access)
   */
  async getWallet(userId: string) {
    const { data: wallet, error } = await supabaseHybrid.getAdminClient()
      .from("wallets")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error || !wallet) {
      throw new Error("Carteira não encontrada");
    }

    return wallet;
  }

  /**
   * Lista transações com paginação
   * Uses admin client for direct access
   */
  async getTransactions(userId: string, query: { page?: number; limit?: number; type?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const offset = (page - 1) * limit;

    let queryBuilder = supabaseHybrid.getAdminClient()
      .from("transactions")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (query.type) {
      queryBuilder = queryBuilder.eq("type", query.type);
    }

    const { data: transactions, error, count } = await queryBuilder;

    if (error) {
      throw new Error("Erro ao buscar transações: " + error.message);
    }

    return {
      transactions,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  }

  /**
   * Solicita saque (PIX ou Cripto)
   * Uses admin client for financial operations to ensure atomicity
   */
  async withdraw(userId: string, input: WithdrawInput) {
    const { method, amount_brl, amount_crypto, target } = input;

    // Busca usuário e wallet (admin for validation)
    const { data: user } = await supabaseHybrid.getAdminClient()
      .from("users")
      .select("cpf")
      .eq("id", userId)
      .single();

    const { data: wallet } = await supabaseHybrid.getAdminClient()
      .from("wallets")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (!wallet) {
      throw new Error("Carteira não encontrada");
    }

    // Validações específicas por método
    if (method === "pix") {
      if (!user?.cpf) {
        throw new Error("CPF é obrigatório para saques via PIX");
      }

      if (!amount_brl || amount_brl <= 0) {
        throw new Error("Valor inválido");
      }

      // Verifica saldo
      if (wallet.balance_brl < amount_brl) {
        throw new Error("Saldo insuficiente");
      }

      // Verifica limites
      await this.checkWithdrawLimits(userId, amount_brl);

      // Calcula taxa
      const fee = calculateFee(amount_brl, this.WITHDRAW_FEE);
      const netAmount = amount_brl - fee;

      // Cria transação de saque (admin client - bypasses RLS)
      const { error } = await supabaseHybrid.getAdminClient()
        .from("transactions")
        .insert({
          user_id: userId,
          type: "withdraw_pix",
          amount_brl: -amount_brl,
          fee_brl: fee,
          status: "pending",
          metadata: { target, net_amount: netAmount },
        });

      if (error) {
        throw new Error("Erro ao criar saque: " + error.message);
      }

      // Debita da wallet (admin client - financial operation)
      await supabaseHybrid.getAdminClient()
        .from("wallets")
        .update({ balance_brl: wallet.balance_brl - amount_brl })
        .eq("user_id", userId);

      return {
        method: "pix",
        amount: amount_brl,
        fee,
        net_amount: netAmount,
        status: "pending",
      };
    } else {
      // Crypto
      if (!amount_crypto || amount_crypto <= 0) {
        throw new Error("Valor inválido");
      }

      if (wallet.balance_crypto < amount_crypto) {
        throw new Error("Saldo insuficiente");
      }

      const fee = calculateFee(amount_crypto, this.WITHDRAW_FEE);
      const netAmount = amount_crypto - fee;

      const { error } = await supabaseHybrid.getAdminClient()
        .from("transactions")
        .insert({
          user_id: userId,
          type: "withdraw_crypto",
          amount_crypto: -amount_crypto,
          fee_crypto: fee,
          status: "pending",
          metadata: { target, net_amount: netAmount },
        });

      if (error) {
        throw new Error("Erro ao criar saque: " + error.message);
      }

      Logger.wallet('withdraw_crypto', userId, amount_crypto, {
        fee: fee,
        netAmount: netAmount,
        target: target,
        operation: 'debit_crypto'
      });

      await supabaseHybrid.getAdminClient()
        .from("wallets")
        .update({ balance_crypto: wallet.balance_crypto - amount_crypto })
        .eq("user_id", userId);

      return {
        method: "crypto",
        amount: amount_crypto,
        fee,
        net_amount: netAmount,
        status: "pending",
      };
    }
  }

  /**
   * Webhook de depósito
   * Uses admin client - system operation from payment provider
   */
  async handleDepositWebhook(input: DepositWebhookInput) {
    const { payment_id, amount_brl, email, status } = input;

    if (status !== "success") {
      return { success: false, message: "Pagamento não confirmado" };
    }

    // Busca usuário pelo email (admin client)
    const { data: user } = await supabaseHybrid.getAdminClient()
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (!user) {
      // Cria inventário pendente (guest purchase)
      return { success: true, pending: true };
    }

    // Credita na wallet (admin client - financial operation)
    const { data: wallet } = await supabaseHybrid.getAdminClient()
      .from("wallets")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!wallet) {
      throw new Error("Carteira não encontrada");
    }

    await supabaseHybrid.getAdminClient()
      .from("wallets")
      .update({ balance_brl: wallet.balance_brl + amount_brl })
      .eq("user_id", user.id);

    // Cria transação (admin client)
    await supabaseHybrid.getAdminClient()
      .from("transactions")
      .insert({
        user_id: user.id,
        type: "deposit",
        amount_brl,
        status: "completed",
        metadata: { payment_id },
      });

    return { success: true };
  }

  /**
   * Depósito direto (dev only) para agilizar testes locais sem Stripe
   * Uses admin client - system operation
   */
  async depositDev(userId: string, amount_brl: number) {
    if (amount_brl <= 0) throw new Error('Valor inválido');
    
    const adminClient = supabaseHybrid.getAdminClient();
    let { data: wallet } = await adminClient
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (!wallet) {
      // Create wallet if it doesn't exist
      const { data: newWallet, error: createErr } = await adminClient
        .from('wallets')
        .insert({ user_id: userId, balance_brl: 0, balance_crypto: 0 })
        .select()
        .single();
      if (createErr || !newWallet) throw new Error('Erro ao criar carteira: ' + createErr?.message);
      wallet = newWallet;
    }
    
    const newBalance = wallet.balance_brl + amount_brl;
    const { error: updErr } = await adminClient
      .from('wallets')
      .update({ balance_brl: newBalance })
      .eq('user_id', userId);
    if (updErr) throw new Error('Erro ao atualizar saldo: ' + updErr.message);
    
    const { error: txErr } = await adminClient
      .from('transactions')
      .insert({
        user_id: userId,
        type: 'deposit',
        amount_brl: amount_brl,
        status: 'confirmed',
        metadata: { source: 'dev' }
      });
    if (txErr) throw new Error('Erro ao registrar transação: ' + txErr.message);
    
    Logger.wallet('depositDev', userId, amount_brl, {
      newBalance: newBalance,
      operation: 'credit_dev'
    });
    
    return { success: true, balance_brl: newBalance };
  }

  /**
   * Verifica limites de saque
   * Uses user client - user's own transaction history
   */
  private async checkWithdrawLimits(userId: string, amount: number) {
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Soma saques recentes (user client with RLS)
    const { data: recentWithdraws } = await supabaseHybrid.getUserClient()
      .from("transactions")
      .select("amount_brl, created_at")
      .eq("user_id", userId)
      .in("type", ["withdraw_pix", "withdraw_crypto"])
      .gte("created_at", monthAgo.toISOString());

    if (!recentWithdraws) return;

    let dailyTotal = 0;
    let weeklyTotal = 0;
    let monthlyTotal = 0;

    for (const tx of recentWithdraws) {
      const txDate = new Date(tx.created_at);
      const txAmount = Math.abs(tx.amount_brl || 0);

      if (txDate >= dayAgo) dailyTotal += txAmount;
      if (txDate >= weekAgo) weeklyTotal += txAmount;
      monthlyTotal += txAmount;
    }

    if (dailyTotal + amount > this.DAILY_LIMIT) {
      throw new Error("Limite diário de saque excedido");
    }

    if (weeklyTotal + amount > this.WEEKLY_LIMIT) {
      throw new Error("Limite semanal de saque excedido");
    }

    if (monthlyTotal + amount > this.MONTHLY_LIMIT) {
      throw new Error("Limite mensal de saque excedido");
    }
  }
}
