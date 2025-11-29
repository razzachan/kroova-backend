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

  /**
   * Verifica se usuário atingiu threshold e concede booster grátis
   * Retorna true se recompensa foi concedida
   */
  async checkAndGrantPityReward(userId: string, editionId: string): Promise<{ granted: boolean; attempts: number }> {
    const { getEditionConfig } = await import('../../config/edition.js');
    const editionCfg = getEditionConfig(editionId);
    
    if (!editionCfg?.pityEnabled || !editionCfg?.pityThresholds || editionCfg.pityThresholds.length === 0) {
      return { granted: false, attempts: 0 };
    }

    const attempts = await this.getAttempts(userId, editionId);
    const threshold = editionCfg.pityThresholds[0]; // Primeiro threshold (50)

    // Se atingiu threshold, concede booster grátis
    if (attempts >= threshold) {
      try {
        // Busca booster mais barato da edição
        const { data: cheapestBooster } = await supabaseAdmin
          .from('booster_types')
          .select('*')
          .eq('edition_id', editionId)
          .order('price_brl', { ascending: true })
          .limit(1)
          .single();

        if (cheapestBooster) {
          // Determina quantidade de boosters (padrão 3)
          const quantity = editionCfg.pityRewardQuantity || 3;
          
          // Cria múltiplos boosters gratuitos (não abertos)
          const boostersToInsert = Array(quantity).fill(null).map(() => ({
            user_id: userId,
            booster_type_id: cheapestBooster.id,
            cards_obtained: [],
            opened_at: null,
          }));
          
          await supabaseAdmin.from('booster_openings').insert(boostersToInsert);

          // Registra transação de recompensa
          await supabaseAdmin.from('transactions').insert({
            user_id: userId,
            type: 'pity_reward',
            amount_brl: 0, // Grátis
            status: 'completed',
            metadata: { 
              booster_type_id: cheapestBooster.id, 
              attempts_reached: attempts,
              threshold: threshold,
              reward_type: 'free_booster',
              quantity: quantity
            }
          });

          // Reseta contador
          await supabaseAdmin
            .from('user_stats_pity')
            .upsert({
              user_id: userId,
              edition_id: editionId,
              attempts_since_last_godmode: 0,
              updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id,edition_id' });

          return { granted: true, attempts: attempts };
        }
      } catch (error) {
        console.error('Erro ao conceder pity reward:', error);
      }
    }

    return { granted: false, attempts };
  }
}

export const pityService = new PityService();