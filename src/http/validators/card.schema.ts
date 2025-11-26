import { z } from "zod";

export const listInventorySchema = z.object({
  rarity: z.string().optional(),
  edition_id: z.string().optional(),
  search: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export const mintNftSchema = z.object({
  chain: z.enum(["polygon"]).default("polygon"),
  priority: z.enum(["normal", "high"]).default("normal"),
});

export type ListInventoryInput = z.infer<typeof listInventorySchema>;
export type MintNftInput = z.infer<typeof mintNftSchema>;
