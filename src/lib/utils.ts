/**
 * Gera um display_id único (ex: usr_a921fe, crd_9ae233)
 */
export function generateDisplayId(prefix: string): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = prefix + "_";
  for (let i = 0; i < 6; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

/**
 * Valida formato de CPF (básico)
 */
export function isValidCPF(cpf: string): boolean {
  // Remove caracteres não numéricos
  const cleaned = cpf.replace(/\D/g, "");

  // Verifica se tem 11 dígitos
  if (cleaned.length !== 11) return false;

  // Verifica se todos os dígitos são iguais (CPF inválido)
  if (/^(\d)\1{10}$/.test(cleaned)) return false;

  // Validação básica - pode ser expandida com algoritmo completo
  return true;
}

/**
 * Calcula taxa sobre um valor
 */
export function calculateFee(amount: number, feePercentage: number = 0.04): number {
  return amount * feePercentage;
}

/**
 * Formata valor BRL
 */
export function formatBRL(value: number): string {
  return `R$ ${value.toFixed(2).replace(".", ",")}`;
}
