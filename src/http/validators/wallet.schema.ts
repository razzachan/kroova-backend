import { z } from "zod";

export const withdrawSchema = z.object({
  method: z.enum(["pix", "crypto"], {
    required_error: "Método deve ser 'pix' ou 'crypto'",
  }),
  amount_brl: z.number().positive().optional(),
  amount_crypto: z.number().positive().optional(),
  target: z.object({
    pix_key: z.string().optional(),
    wallet_address: z.string().optional(),
    chain: z.string().optional(),
  }),
});

export const depositWebhookSchema = z.object({
  payment_id: z.string(),
  amount_brl: z.number().positive(),
  email: z.string().email(),
  status: z.enum(["success", "failed", "pending"]),
  metadata: z.record(z.unknown()).optional(),
});

export type WithdrawInput = z.infer<typeof withdrawSchema>;
export type DepositWebhookInput = z.infer<typeof depositWebhookSchema>;
