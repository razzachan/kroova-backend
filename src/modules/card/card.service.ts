import { supabase, supabaseAdmin } from "../../config/supabase.js";
import { enqueueMint } from "../nft/nft.queue.js";
import { computeAdjustedLiquidity } from '../skin/skin.economy.util.js';

export class CardService {
  /**
   * Busca detalhes de uma carta específica
   */
  async getCard(userId: string, instanceId: string) {
    const { data: card, error } = await supabaseAdmin
      .from("cards_instances")
      .select(
        `
        *,
        cards_base (*),
        user_inventory!inner (user_id)
      `,
      )
      .eq("id", instanceId)
      .eq("user_inventory.user_id", userId)
      .single();

    if (error || !card) {
      throw new Error("Carta não encontrada");
    }

    return card;
  }

  /**
   * Recicla carta e retorna liquidez base
   */
  async recycle(userId: string, instanceId: string) {
    // Busca carta e verifica ownership
    const { data: card, error } = await supabaseAdmin
      .from("cards_instances")
      .select(
        `
        *,
        cards_base (*),
        user_inventory!inner (user_id)
      `,
      )
      .eq("id", instanceId)
      .eq("user_inventory.user_id", userId)
      .single();

    if (error || !card) {
      throw new Error("Carta não encontrada ou você não é o dono");
    }

    // Busca usuário para verificar CPF (necessário para receber BRL)
    const { data: user } = await supabaseAdmin.from("users").select("cpf").eq("id", userId).single();

    const cardBase = card.cards_base as Record<string, unknown>;
    let liquidityValue = (cardBase.base_liquidity_brl as number) || 0;
    // Aplica multiplicador de skin (feature flag futura; por enquanto sempre ativo para cálculo interno sem mudar exibição)
    const editionId = (cardBase.edition_id as string) || 'ED01';
    const skin = (card.skin as string) || 'default';
    const adjusted = computeAdjustedLiquidity(liquidityValue, skin, editionId);
    liquidityValue = adjusted;

    // Se valor > 0 e não tem CPF, bloqueia (exceto em dev quando habilitado)
    if (liquidityValue > 0 && !user?.cpf) {
      if (process.env.KROOVA_DEV_ALLOW_RECYCLE_NO_CPF === '1') {
        // allow in dev
      } else {
        throw new Error("CPF é obrigatório para reciclar cartas com valor em BRL");
      }
    }

    // Remove carta do inventário
    await supabaseAdmin
      .from("user_inventory")
      .delete()
      .eq("card_instance_id", instanceId)
      .eq("user_id", userId);

    // Marca carta como reciclada
    await supabaseAdmin.from("cards_instances").update({ owner_id: null }).eq("id", instanceId);

    // Registra reciclagem
    await supabaseAdmin.from("recycle_history").insert({
      user_id: userId,
      card_instance_id: instanceId,
      value_brl: liquidityValue,
      metadata: { skin, edition_id: editionId },
    });

    // Credita valor na wallet
    const { data: wallet } = await supabaseAdmin
      .from("wallets")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (wallet) {
      await supabaseAdmin
        .from("wallets")
        .update({ balance_brl: wallet.balance_brl + liquidityValue })
        .eq("user_id", userId);
    }

    // Registra transação
    await supabaseAdmin.from("transactions").insert({
      user_id: userId,
      type: "recycle",
      amount_brl: liquidityValue,
      status: "confirmed",
      metadata: { card_instance_id: instanceId },
    });

    // Métricas de reciclagem
    import('../../observability/metrics.js').then(m => m.domainMetrics.recycleConversion(liquidityValue)).catch(()=>{});

    return {
      recycled: true,
      value_received: liquidityValue,
      currency: "brl",
    };
  }

  /**
   * Solicita mint NFT on-chain (cria job na fila)
   */
  async mintNft(userId: string, instanceId: string, options: { chain: string; priority: 'normal' | 'high' }) {
    // Busca carta e verifica ownership
    const { data: card, error } = await supabase
      .from("cards_instances")
      .select(
        `
        *,
        cards_base (*),
        user_inventory!inner (user_id)
      `,
      )
      .eq("id", instanceId)
      .eq("user_inventory.user_id", userId)
      .single();

    if (error || !card) {
      throw new Error("Carta não encontrada ou você não é o dono");
    }

    if (card.hash_onchain) {
      throw new Error("Esta carta já foi mintada");
    }
    await supabase.from("cards_instances").update({ mint_pending: true }).eq("id", instanceId);
    await enqueueMint({ userId, instanceId, chain: options.chain, priority: options.priority });
    return { mint_requested: true, instance_id: instanceId, chain: options.chain, status: "queued" };
  }

  /**
   * Lista cartas base de uma edição com filtros opcionais
   */
  static async listEditionCards(editionId: string, filters: { rarity?: string; archetype?: string }) {
    let query = supabase.from("cards_base").select("display_id,name,rarity,archetype,base_liquidity_brl,edition_id,metadata").eq("edition_id", editionId);
    if (filters.rarity) {
      query = query.eq("rarity", filters.rarity);
    }
    if (filters.archetype) {
      query = query.ilike("archetype", filters.archetype);
    }
    const { data, error } = await query.order("display_id", { ascending: true });
    return { data, error };
  }
}
