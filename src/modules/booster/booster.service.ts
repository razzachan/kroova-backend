import { supabase, supabaseAdmin } from "../../config/supabase.js";
import { randomUUID } from 'crypto';
import { computeJackpotReward } from './jackpot.util.js';
import { getEditionConfig } from '../../config/edition.js';
import { rollRarity } from "./rarity.util.js";
import { domainMetrics } from "../../observability/metrics.js";
import { pityService } from '../pity/pity.service.js';
import { applyPityDistribution } from '../pity/pity.util.js';
import { chooseSkin } from '../skin/skin.util.js';

interface RarityDistribution {
  [rarity: string]: number; // percentage total should ~100
}

interface PurchaseInput {
  booster_type_id: string;
  quantity: number;
  currency: "brl" | "crypto";
}

export class BoosterService {
  /**
   * Lista tipos de booster disponíveis
   */
  async listBoosterTypes() {
    // Sempre consulta tabela real
    const { data: boosters, error } = await supabase
      .from("booster_types")
      .select("*")
      .order("price_brl", { ascending: true });

    if (error) {
      throw new Error("Erro ao buscar boosters: " + error.message);
    }

    return boosters;
  }

  /**
   * Retorna contador de pity do usuário para uma edição
   */
  async getPityCounter(userId: string, editionId: string = 'ED01'): Promise<number> {
    return await pityService.getAttempts(userId, editionId);
  }

  /**
   * Compra boosters com saldo interno
   */
  async purchase(userId: string, input: PurchaseInput) {
    const { booster_type_id, quantity, currency } = input;
    const client = supabase;
    const admin = supabaseAdmin;

    // Busca tipo de booster
    const { data: boosterType, error: boosterError } = await client
      .from("booster_types")
      .select("*")
      .eq("id", booster_type_id)
      .single();

    if (boosterError || !boosterType) {
      throw new Error("Tipo de booster não encontrado");
    }

    // Calcula total
    const totalPrice =
      currency === "brl"
        ? boosterType.price_brl * quantity
        : (boosterType.price_crypto || 0) * quantity;

    // Busca wallet
    const { data: wallet } = await admin
      .from("wallets")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (!wallet) {
      throw new Error("Carteira não encontrada");
    }

    // Verifica saldo
    const currentBalance = currency === "brl" ? wallet.balance_brl : wallet.balance_crypto;

    if (currentBalance < totalPrice) {
      throw new Error("Saldo insuficiente");
    }

    // Debita da wallet
    const newBalance = currentBalance - totalPrice;
    await admin
      .from("wallets")
      .update(currency === "brl" ? { balance_brl: newBalance } : { balance_crypto: newBalance })
      .eq("user_id", userId);

    // Cria registros de booster_openings (fechados)
    const openings = [];
    for (let i = 0; i < quantity; i++) {
      // Schema não possui coluna 'opened'; usamos opened_at nula como indicador de não aberto
      const { data: opening, error: openingError } = await admin
        .from("booster_openings")
        .insert({
          user_id: userId,
          booster_type_id,
          cards_obtained: [],
          opened_at: null, // Booster fechado (não aberto)
          purchased_at: new Date().toISOString(), // Timestamp da compra
        })
        .select()
        .single();

      if (openingError || !opening) {
        throw new Error("Erro ao criar booster: " + openingError?.message);
      }

      openings.push(opening);
    }

    // Registra transação
    await admin.from("transactions").insert({
      user_id: userId,
      type: "booster_purchase",
      amount_brl: currency === "brl" ? -totalPrice : null,
      amount_crypto: currency === "crypto" ? -totalPrice : null,
      status: "completed",
      metadata: { booster_type_id, quantity },
    });

    // Record revenue segmentation
    const { recordBoosterRevenuePurchase } = await import('../../observability/economicRevenue.js');
    if (currency === 'brl') {
      recordBoosterRevenuePurchase(booster_type_id, 'brl', totalPrice);
    } else if (currency === 'crypto') {
      // Converter para BRL usando FX service (MATIC_BRL por default)
      const { convertCryptoToBrl } = await import('../../lib/fx.js');
      const totalBrl = await convertCryptoToBrl('MATIC_BRL', totalPrice);
      recordBoosterRevenuePurchase(booster_type_id, 'crypto', totalBrl);
    }
    domainMetrics.boosterPurchase(totalPrice);
    return {
      boosters: openings,
      total_paid: totalPrice,
      unit_price_brl: currency === 'brl' ? (boosterType.price_brl || null) : null,
      currency,
    };
  }

  /**
   * Abre booster e gera cartas usando algoritmo
   */
  async open(userId: string, boosterOpeningId: string) {
    const client = supabaseAdmin;
    // Busca booster opening
    const { data: opening, error } = await client
      .from("booster_openings")
      .select("*, booster_types(*)")
      .eq("id", boosterOpeningId)
      .eq("user_id", userId)
      .is("opened_at", null)
      .single();

    if (error || !opening) {
      throw new Error("Booster não encontrado ou já aberto");
    }

    // Gera cartas baseado no algoritmo (KROOVA_BOOSTER_ALGORITHM.md)
    const cards = await this.generateCards(opening);

    // Marca booster como aberto
    await client
      .from("booster_openings")
      .update({ opened_at: new Date().toISOString(), cards_obtained: cards.map(c => c.id) })
      .eq("id", boosterOpeningId);

    // Adiciona cartas ao inventário
    for (const card of cards) {
      await client.from("user_inventory").insert({
        user_id: userId,
        card_instance_id: card.id,
      });
    }

    // Verifica e concede recompensa de pity (booster gratuito a cada 50 boosters)
    const boosterType = opening.booster_types as Record<string, unknown>;
    const editionId = boosterType.edition_id as string;
    const pityReward = await pityService.checkAndGrantPityReward(userId, editionId);

    return {
      cards,
      booster_id: boosterOpeningId,
      pity_reward: pityReward.granted ? { 
        message: 'Parabéns! Você ganhou 1 booster gratuito por fidelidade!',
        attempts_reached: pityReward.attempts 
      } : null,
    };
  }

  /**
   * Lista inventário do jogador
   */
  async getInventory(
    userId: string,
    query: {
      rarity?: string;
      edition_id?: string;
      search?: string;
      page?: number;
      limit?: number;
    },
  ) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const offset = (page - 1) * limit;

    const queryBuilder = supabaseAdmin
      .from("user_inventory")
      .select(
        `
        *,
        cards_instances (
          *,
          cards_base (*)
        )
      `,
        { count: "exact" },
      )
      .eq("user_id", userId)
      .order("acquired_at", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: inventory, error, count } = await queryBuilder;

    if (error) {
      throw new Error("Erro ao buscar inventário: " + error.message);
    }

    return {
      cards: inventory,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  }

  /**
   * Lista boosters não abertos (sealed packs) do usuário
   */
  async getSealedPacks(userId: string) {
    const { data: sealedPacks, error } = await supabaseAdmin
      .from("booster_openings")
      .select(
        `
        *,
        booster_types (
          id,
          name,
          price_brl,
          cards_per_booster,
          edition_id
        )
      `,
      )
      .eq("user_id", userId)
      .is("opened_at", null)
      .order("purchased_at", { ascending: false });

    if (error) {
      throw new Error("Erro ao buscar boosters fechados: " + error.message);
    }

    return {
      sealed_packs: sealedPacks || [],
      count: sealedPacks?.length || 0,
    };
  }

  /**
   * Gera cartas conforme algoritmo de raridade
   * TODO: Implementar lógica completa do KROOVA_BOOSTER_ALGORITHM.md
   */
  private async generateCards(opening: Record<string, unknown>) {
    const client = supabaseAdmin;
    const boosterType = opening.booster_types as Record<string, unknown>;
    const editionId = boosterType.edition_id as string;
    const editionCfg = getEditionConfig(editionId);
    const cardsPerBooster = (boosterType.cards_per_booster as number) || editionCfg?.cardsPerBooster || 5;
    const rarityDistribution = (boosterType.rarity_distribution as RarityDistribution) || editionCfg?.rarityDistribution || { trash: 60, meme: 25, viral: 10, legendary: 4, godmode: 1 };
    const boosterPriceBrl = (boosterType.price_brl as number) || editionCfg?.boosterPriceBrl || 0.5;
    const plannedJackpotRtpPct = (boosterType.planned_jackpot_rtp_pct as number) || editionCfg?.plannedJackpotRtpPct || 0.054; // 5.4%

    // Carrega cache de bases por raridade para diminuir round-trips
    const rarities = Object.keys(rarityDistribution);
    const basePools: Record<string, any[]> = {};
    for (const r of rarities) {
      const { data: list } = await client
        .from("cards_base")
        .select("id, rarity, base_liquidity_brl, metadata")
        .eq("rarity", r)
        .eq("edition_id", editionId)
        .limit(200); // limite razoável
      basePools[r] = list || [];
    }

    // Seleção de skin ponderada por pesos definidos na edição
    const rollSkin = (): string => chooseSkin(editionCfg);

    const instances: any[] = [];
    const jackpots: { instance_id: string; prize_original: number; prize_scaled: number; factor: number }[] = [];
    const usedBaseIds = new Set<string>();
    let godmodeOccurred = false;

    // Aplica pity (fase2) se habilitado
    const attempts = await pityService.getAttempts(opening.user_id as string, editionId);
    const pityApplied = editionCfg ? applyPityDistribution(rarityDistribution, attempts, editionCfg) : { dist: rarityDistribution, boostedGodmodePct: rarityDistribution['godmode'] };
    const finalDist = pityApplied.dist;

    // Prepara mapas de pesos esperados para skins para cálculo de desvio
    const skinWeightsTotal = (editionCfg?.skins || []).reduce((a, s) => a + s.weight, 0) || 0;
    const expectedSkinPct: Record<string, number> = {};
    if (editionCfg?.skins) {
      for (const s of editionCfg.skins) {
        expectedSkinPct[s.name] = (s.weight / skinWeightsTotal) * 100;
      }
    }

    for (let i = 0; i < cardsPerBooster; i++) {
      const chosenRarity = rollRarity(finalDist);
      const pool = basePools[chosenRarity] || [];
      if (pool.length === 0) {
        continue; // sem cartas daquela raridade
      }
      // Escolhe base sem repetir dentro do mesmo booster
      let baseCandidate: any | undefined;
      const poolTries = Math.min(pool.length, 5);
      for (let a = 0; a < poolTries; a++) {
        const pick = pool[Math.floor(Math.random() * pool.length)];
        if (!usedBaseIds.has(pick.id)) {
          baseCandidate = pick;
          break;
        }
      }
      if (!baseCandidate) {
        baseCandidate = pool[Math.floor(Math.random() * pool.length)]; // aceita repetição se necessário
      }
      usedBaseIds.add(baseCandidate.id);

      // Cria instância (schema real usa base_id, owner_id, skin)
      const skinChosen = rollSkin();
      const { data: instance } = await client
        .from("cards_instances")
        .insert({
          base_id: baseCandidate.id,
          owner_id: opening.user_id as string,
          skin: skinChosen,
        })
        .select()
        .single();

      if (instance) {
        instances.push(instance);
        // Passar porcentagem esperada original da raridade para monitor de desvio (sem pity) para consistência estatística
        const expectedRarityPct = rarityDistribution[baseCandidate.rarity] || 0;
        domainMetrics.cardRarity(baseCandidate.rarity, expectedRarityPct);
        domainMetrics.skin(skinChosen, expectedSkinPct[skinChosen]);
        if (baseCandidate.rarity === 'godmode') {
          // Jackpot logic
          const jackpot = await this.applyJackpotReward(opening.user_id as string, boosterPriceBrl, cardsPerBooster, finalDist as RarityDistribution, plannedJackpotRtpPct);
          domainMetrics.jackpotHit(jackpot.scaledPrize);
          jackpots.push({ instance_id: instance.id, prize_original: jackpot.originalPrize, prize_scaled: jackpot.scaledPrize, factor: jackpot.scaleFactor });
          godmodeOccurred = true;
        }
      }
    }
    (opening as any).jackpots = jackpots;
    // Phase1 pity tracking (after booster processed)
    await pityService.trackBoosterOpen(opening.user_id as string, editionId, godmodeOccurred);
    return instances;
  }

  private async applyJackpotReward(userId: string, boosterPriceBrl: number, cardsPerBooster: number, rarityDistribution: RarityDistribution, plannedJackpotRtpPct: number) {
    const client = supabaseAdmin;
    const result = computeJackpotReward({
      boosterPriceBrl,
      cardsPerBooster,
      godmodePct: rarityDistribution['godmode'] || 0,
      plannedJackpotRtpPct,
    });
    const { data: wallet } = await client.from('wallets').select('*').eq('user_id', userId).single();
    if (wallet) {
      const newBalance = (wallet.balance_brl || 0) + result.scaledPrize;
      await client.from('wallets').update({ balance_brl: newBalance }).eq('user_id', userId);
      await client.from('transactions').insert({
        user_id: userId,
        type: 'jackpot_reward',
        amount_brl: result.scaledPrize,
        status: 'completed',
        metadata: { original_prize: result.originalPrize, scaled_prize: result.scaledPrize, scale_factor: result.scaleFactor }
      });
    }
    return result;
  }
}
