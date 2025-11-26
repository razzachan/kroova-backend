import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  name: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

export const setCpfSchema = z.object({
  cpf: z
    .string()
    .length(11, "CPF deve ter 11 dígitos")
    .regex(/^\d+$/, "CPF deve conter apenas números"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type SetCpfInput = z.infer<typeof setCpfSchema>;
