/**
 * 🎯 KROOVA Response Handlers
 * Padrão único de resposta da API
 */

export interface ApiResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: {
    code: string;
    message?: string;
  };
}

export const ok = <T>(data: T): ApiResponse<T> => ({
  ok: true,
  data,
});

export const fail = (code: string, message?: string): ApiResponse => ({
  ok: false,
  error: { code, message },
});
