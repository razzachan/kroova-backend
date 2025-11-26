import { supabase, supabaseAdmin } from '../../config/supabase.js';

interface PityRecord {
  user_id: string;
  edition_id: string;
  attempts_since_last_godmode: number;
  updated_at?: string;
}

class PityService {
  private memory: Map<string, number> = new Map();

  private key(userId: string, editionId: string) {
    return `${userId}:${editionId}`;
  }

  async getAttempts(userId: string, editionId: string): Promise<number> {
    if (process.env.NODE_ENV === 'test') {
      return this.memory.get(this.key(userId, editionId)) || 0;
    }
    try {
      const { data, error } = await supabase.from('user_stats_pity')
        .select('attempts_since_last_godmode')
        .eq('user_id', userId)
        .eq('edition_id', editionId)
        .single();
      if (error || !data) return 0;
      return data.attempts_since_last_godmode || 0;
    } catch {
      return 0; // fallback se tabela não existir ainda
    }
  }

  async trackBoosterOpen(userId: string, editionId: string, godmodeOccurred: boolean): Promise<number> {
    if (process.env.NODE_ENV === 'test') {
      const k = this.key(userId, editionId);
      if (godmodeOccurred) {
        this.memory.set(k, 0);
        return 0;
      }
      const current = this.memory.get(k) || 0;
      const next = current + 1;
      this.memory.set(k, next);
      return next;
    }
    // Produção (tolerante à ausência de tabela na fase inicial)
    try {
      const current = await this.getAttempts(userId, editionId);
      const next = godmodeOccurred ? 0 : current + 1;
      const record: PityRecord = {
        user_id: userId,
        edition_id: editionId,
        attempts_since_last_godmode: next,
        updated_at: new Date().toISOString(),
      };
      // UPSERT (se não existir cria, senão atualiza)
      await supabaseAdmin
        .from('user_stats_pity')
        .upsert(record, { onConflict: 'user_id,edition_id' });
      return next;
    } catch {
      return 0;
    }
  }
}

export const pityService = new PityService();