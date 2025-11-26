import { z } from "zod";

export const createListingSchema = z.object({
  card_instance_id: z.string().uuid("ID de carta inválido"),
  price_brl: z.number().positive().optional(),
  price_crypto: z.number().positive().optional(),
});

export const listMarketSchema = z.object({
  rarity_min: z.string().optional(),
  rarity_max: z.string().optional(),
  price_min: z.number().optional(),
  price_max: z.number().optional(),
  archetype: z.string().optional(),
  edition_id: z.string().optional(),
  order_by: z.enum(["price", "rarity", "created_at"]).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export type CreateListingInput = z.infer<typeof createListingSchema>;
export type ListMarketInput = z.infer<typeof listMarketSchema>;
