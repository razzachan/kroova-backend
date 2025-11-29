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
   * Recicla múltiplas cartas e ganha 1 booster grátis
   * Requer 25 cartas para conversão (economicamente viável)
   */
  async recycleBulk(userId: string, instanceIds: string[]) {
    const REQUIRED_CARDS = 25;
    
    if (instanceIds.length !== REQUIRED_CARDS) {
      throw new Error(`É necessário reciclar exatamente ${REQUIRED_CARDS} cartas`);
    }

    // Verifica ownership de todas as cartas
    const { data: cards, error } = await supabaseAdmin
      .from("cards_instances")
      .select(`
        *,
        cards_base (*),
        user_inventory!inner (user_id)
      `)
      .in("id", instanceIds)
      .eq("user_inventory.user_id", userId);

    if (error || !cards || cards.length !== REQUIRED_CARDS) {
      throw new Error("Cartas não encontradas ou você não é o dono de todas");
    }

    // Calcula valor total reciclado (para métricas)
    let totalValue = 0;
    for (const card of cards) {
      const cardBase = card.cards_base as Record<string, unknown>;
      const baseValue = (cardBase.base_liquidity_brl as number) || 0;
      const editionId = (cardBase.edition_id as string) || 'ED01';
      const skin = (card.skin as string) || 'default';
      const adjusted = computeAdjustedLiquidity(baseValue, skin, editionId);
      totalValue += adjusted;
    }

    // Remove todas as cartas do inventário
    await supabaseAdmin
      .from("user_inventory")
      .delete()
      .in("card_instance_id", instanceIds)
      .eq("user_id", userId);

    // Marca cartas como recicladas
    await supabaseAdmin
      .from("cards_instances")
      .update({ owner_id: null })
      .in("id", instanceIds);

    // Busca o booster mais barato (Micro)
    const { data: boosterType, error: boosterError } = await supabaseAdmin
      .from("booster_types")
      .select("*")
      .order("price_brl", { ascending: true })
      .limit(1)
      .single();

    if (boosterError || !boosterType) {
      throw new Error("Tipo de booster não encontrado");
    }

    // Cria 1 booster grátis (não fechado)
    const { data: opening, error: openingError } = await supabaseAdmin
      .from("booster_openings")
      .insert({
        user_id: userId,
        booster_type_id: boosterType.id,
        cards_obtained: [],
        opened_at: null,
      })
      .select()
      .single();

    if (openingError || !opening) {
      throw new Error("Erro ao criar booster: " + openingError?.message);
    }

    // Registra reciclagem em lote
    await supabaseAdmin.from("recycle_history").insert({
      user_id: userId,
      card_instance_id: instanceIds[0], // Referência ao primeiro
      value_brl: 0, // Não credita BRL, dá booster
      metadata: { 
        bulk_recycle: true,
        cards_recycled: instanceIds.length,
        total_value: totalValue,
        reward_booster_id: opening.id
      },
    });

    // Registra transação
    await supabaseAdmin.from("transactions").insert({
      user_id: userId,
      type: "recycle_bulk",
      amount_brl: 0, // Não é BRL, é booster
      status: "confirmed",
      metadata: { 
        cards_recycled: REQUIRED_CARDS,
        booster_id: opening.id,
        total_value_recycled: totalValue
      },
    });

    // Métricas
    import('../../observability/metrics.js').then(m => {
      m.domainMetrics.recycleConversion(totalValue);
    }).catch(()=>{});

    return {
      recycled: true,
      cards_recycled: REQUIRED_CARDS,
      reward: {
        type: 'booster',
        booster_id: opening.id,
        booster_name: boosterType.name
      },
      total_value_recycled: totalValue,
    };
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
