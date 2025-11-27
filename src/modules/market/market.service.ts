import { supabase, supabaseAdmin } from "../../config/supabase.js";
import { calculateFee } from "../../lib/utils.js";
import { enforcePriceFloor } from '../skin/skin.economy.util.js';
import { supabaseHybrid } from "../../core/supabase-hybrid.service.js";
import { Logger } from "../../core/logger.service.js";

interface CreateListingInput {
  card_instance_id: string;
  price_brl?: number;
  price_crypto?: number;
}

export class MarketService {
  private readonly MARKET_FEE = 0.04; // 4%

  /**
   * Lista anúncios ativos do marketplace
   * Uses public client - anyone can browse marketplace
   */
  async listListings(query: {
    rarity_min?: string;
    rarity_max?: string;
    price_min?: number;
    price_max?: number;
    archetype?: string;
    edition_id?: string;
    order_by?: string;
    page?: number;
    limit?: number;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const offset = (page - 1) * limit;

    let queryBuilder = supabaseHybrid.getPublicClient()
      .from("market_listings")
      .select(
        `
        *,
        card_instance:cards_instances (
          *,
          card_base:cards_base (*)
        ),
        seller:users!seller_id (id, display_id, name)
      `,
        { count: "exact" },
      )
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Filtros
    if (query.price_min !== undefined) {
      queryBuilder = queryBuilder.gte("price_brl", query.price_min);
    }

    if (query.price_max !== undefined) {
      queryBuilder = queryBuilder.lte("price_brl", query.price_max);
    }

    if (query.order_by === "price") {
      queryBuilder = queryBuilder.order("price_brl", { ascending: true });
    }

    const { data: listings, error, count } = await queryBuilder;

    if (error) {
      throw new Error("Erro ao buscar anúncios: " + error.message);
    }

    return {
      listings,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  }

  /**
   * Cria anúncio de carta
   * Enhanced with business validations
   */
  async createListing(userId: string, input: CreateListingInput) {
    const { card_instance_id, price_brl, price_crypto } = input;
    const adminClient = supabaseHybrid.getAdminClient();

    // ========================================
    // VALIDATION 1: CPF requirement (production only)
    // ========================================
    if (process.env.KROOVA_DEV_ALLOW_NO_CPF !== '1') {
      const { data: user } = await adminClient
        .from("users")
        .select("cpf")
        .eq("id", userId)
        .single();
        
      if (!user?.cpf) {
        throw new Error("CPF é obrigatório para vender no marketplace");
      }
    }

    // ========================================
    // VALIDATION 2: Card ownership
    // ========================================
    const { data: cardInstance, error: cardError } = await adminClient
      .from("cards_instances")
      .select("owner_id, skin, cards_base(id, edition_id, base_liquidity_brl)")
      .eq("id", card_instance_id)
      .single();

    if (cardError || !cardInstance) {
      throw new Error("Carta não encontrada");
    }

    if (cardInstance.owner_id !== userId) {
      throw new Error("Você não possui esta carta");
    }

    // ========================================
    // VALIDATION 3: Check if card is already listed
    // ========================================
    const { data: existingListing } = await adminClient
      .from("market_listings")
      .select("id")
      .eq("card_instance_id", card_instance_id)
      .eq("status", "active")
      .maybeSingle();

    if (existingListing) {
      throw new Error("Esta carta já está anunciada");
    }

    // ========================================
    // VALIDATION 4: Check if card is in user's inventory
    // ========================================
    const { data: inventory, error: invError } = await adminClient
      .from("user_inventory")
      .select("*")
      .eq("user_id", userId)
      .eq("card_instance_id", card_instance_id)
      .maybeSingle();

    if (invError || !inventory) {
      throw new Error("Carta não encontrada no inventário");
    }

    // ========================================
    // VALIDATION 5: Price validation
    // ========================================
    if (!price_brl && !price_crypto) {
      throw new Error("Informe ao menos um preço (BRL ou cripto)");
    }

    // Minimum price validation (R$ 0.50)
    if (price_brl && price_brl < 0.50) {
      throw new Error("Preço mínimo é R$ 0.50");
    }

    // ========================================
    // VALIDATION 6: Skin-based price floor
    // ========================================
    const base = (cardInstance as any).cards_base;
    const baseLiquidity = (base?.base_liquidity_brl as number) || 0;
    const editionId = (base?.edition_id as string) || 'ED01';
    const skin = (cardInstance as any).skin || 'default';
    
    if (price_brl) {
      const floorCheck = enforcePriceFloor(price_brl, baseLiquidity, skin, editionId);
      if (!floorCheck.ok) {
        import('../../observability/metrics.js').then(m => m.domainMetrics.marketFloorRejected()).catch(()=>{});
        throw new Error(`Preço abaixo do piso (R$ ${floorCheck.floor.toFixed(2)}) para skin ${skin}`);
      }
    }

    // ========================================
    // CREATE LISTING (admin client - system operation)
    // ========================================
    const { data: listing, error: listingError } = await adminClient
      .from("market_listings")
      .insert({
        seller_id: userId,
        card_instance_id,
        price_brl: price_brl || 0,
        price_crypto: price_crypto || 0,
        status: "active",
      })
      .select()
      .single();

    if (listingError || !listing) {
      throw new Error("Erro ao criar anúncio: " + listingError?.message);
    }

    Logger.market('createListing', userId, {
      listingId: listing.id,
      cardInstanceId: card_instance_id,
      priceBrl: price_brl || 0,
      priceCrypto: price_crypto || 0
    });

    // Métrica de criação de anúncio
    import('../../observability/metrics.js').then(m => m.domainMetrics.marketListingCreated()).catch(()=>{});

    return listing;
  }

  /**
   * Cancela anúncio
   * Uses user client for query (RLS), admin for update
   */
  async cancelListing(userId: string, listingId: string) {
    // Busca anúncio (user client - RLS validates ownership)
    const { data: listing, error } = await supabaseHybrid.getUserClient()
      .from("market_listings")
      .select("*")
      .eq("id", listingId)
      .eq("seller_id", userId)
      .eq("status", "active")
      .single();

    if (error || !listing) {
      throw new Error("Anúncio não encontrado ou você não é o vendedor");
    }

    // Cancela (admin client - system operation)
    await supabaseHybrid.getAdminClient()
      .from("market_listings")
      .update({ status: "cancelled" })
      .eq("id", listingId);

    Logger.market('cancelListing', userId, {
      listingId: listingId,
      priceBrl: listing.price_brl,
      priceCrypto: listing.price_crypto
    });

    return { cancelled: true };
  }

  /**
   * Compra carta do marketplace
   * Enhanced with comprehensive validations
   */
  async buyListing(userId: string, listingId: string) {
    const adminClient = supabaseHybrid.getAdminClient();
    
    // ========================================
    // VALIDATION 1: Listing exists and is active
    // ========================================
    const { data: listing, error: listingError } = await adminClient
      .from("market_listings")
      .select(`
        *,
        cards_instances(owner_id)
      `)
      .eq("id", listingId)
      .single();

    if (listingError || !listing) {
      throw new Error("Anúncio não encontrado");
    }

    if (listing.status !== "active") {
      throw new Error("Anúncio não está mais disponível");
    }

    // ========================================
    // VALIDATION 2: Cannot buy your own listing
    // ========================================
    if (listing.seller_id === userId) {
      throw new Error("Você não pode comprar sua própria carta");
    }

    // ========================================
    // VALIDATION 3: Verify card still belongs to seller
    // ========================================
    const cardOwner = (listing as any).cards_instances?.owner_id;
    if (cardOwner !== listing.seller_id) {
      throw new Error("Vendedor não possui mais esta carta");
    }

    const price = listing.price_brl || 0;
    const fee = calculateFee(price, this.MARKET_FEE);
    const sellerAmount = price - fee;

    // ========================================
    // VALIDATION 4: Fetch wallets
    // ========================================
    const { data: buyerWallet } = await adminClient
      .from("wallets")
      .select("*")
      .eq("user_id", userId)
      .single();

    const { data: sellerWallet } = await adminClient
      .from("wallets")
      .select("*")
      .eq("user_id", listing.seller_id)
      .single();

    if (!buyerWallet) {
      throw new Error("Carteira do comprador não encontrada");
    }
    
    if (!sellerWallet) {
      throw new Error("Carteira do vendedor não encontrada");
    }

    // ========================================
    // VALIDATION 5: Sufficient balance
    // ========================================
    if (buyerWallet.balance_brl < price) {
      throw new Error(`Saldo insuficiente. Necessário: R$ ${price.toFixed(2)}, Disponível: R$ ${buyerWallet.balance_brl.toFixed(2)}`);
    }

    // ========================================
    // EXECUTE TRANSACTION (admin client - atomic financial operation)
    // ========================================
    
    // Debit buyer
    await adminClient
      .from("wallets")
      .update({ balance_brl: buyerWallet.balance_brl - price })
      .eq("user_id", userId);

    // Credit seller (minus fee)
    await adminClient
      .from("wallets")
      .update({ balance_brl: sellerWallet.balance_brl + sellerAmount })
      .eq("user_id", listing.seller_id);

    // Transfer card ownership in inventory
    await adminClient
      .from("user_inventory")
      .update({ user_id: userId })
      .eq("card_instance_id", listing.card_instance_id);

    // Transfer card ownership in instances
    await adminClient
      .from("cards_instances")
      .update({ owner_id: userId })
      .eq("id", listing.card_instance_id);

    // Mark listing as sold
    await adminClient
      .from("market_listings")
      .update({
        status: "sold",
        buyer_id: userId,
        sold_at: new Date().toISOString(),
      })
      .eq("id", listingId);

    // Record transactions for both parties
    await adminClient.from("transactions").insert([
      {
        user_id: userId,
        type: "market_buy",
        amount_brl: -price,
        status: "completed",
        metadata: { listing_id: listingId, card_instance_id: listing.card_instance_id },
      },
      {
        user_id: listing.seller_id,
        type: "market_sell",
        amount_brl: sellerAmount,
        fee_brl: fee,
        status: "completed",
        metadata: { listing_id: listingId, buyer_id: userId, card_instance_id: listing.card_instance_id },
      },
    ]);

    // Métricas de trade marketplace
    import('../../observability/metrics.js').then(m => m.domainMetrics.marketTrade(price, fee)).catch(()=>{});

    Logger.market('buyListing', userId, {
      listingId: listingId,
      sellerId: listing.seller_id,
      pricePaid: price,
      fee: fee,
      cardInstanceId: listing.card_instance_id
    });

    return {
      purchased: true,
      price_paid: price,
      fee,
      seller_received: sellerAmount,
      card_instance_id: listing.card_instance_id,
    };
  }
}
