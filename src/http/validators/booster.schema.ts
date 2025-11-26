import { z } from "zod";

export const purchaseBoosterSchema = z.object({
  booster_type_id: z.string().uuid("ID de booster inválido"),
  quantity: z.number().int().positive().min(1).max(100),
  currency: z.enum(["brl", "crypto"]),
});

export const openBoosterSchema = z.object({
  booster_opening_id: z.string().uuid("ID de abertura inválido"),
});

export type PurchaseBoosterInput = z.infer<typeof purchaseBoosterSchema>;
export type OpenBoosterInput = z.infer<typeof openBoosterSchema>;
