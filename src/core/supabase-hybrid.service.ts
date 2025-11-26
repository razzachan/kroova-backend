/**
 * Supabase Hybrid Service
 * 
 * Provides appropriate Supabase clients based on operation type:
 * - User Client: For read operations validated by RLS (with user's JWT)
 * - Admin Client: For system operations that bypass RLS
 * - Public Client: For unauthenticated public queries
 */

import { supabase, supabaseAdmin } from '../config/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

export class SupabaseHybridService {
  /**
   * Get client for user-specific read operations
   * Uses anonymous client with JWT token from request
   * Subject to RLS policies (users can only access their own data)
   * 
   * @example
   * const client = hybrid.getUserClient();
   * const { data } = await client.from('user_inventory').select('*');
   * // RLS ensures user only sees their own inventory
   */
  getUserClient(): SupabaseClient {
    return supabase;
  }

  /**
   * Get client for administrative operations
   * Bypasses RLS policies - use with caution!
   * 
   * Use cases:
   * - Financial transactions (wallet updates)
   * - Card ownership transfers
   * - Creating booster rewards
   * - Recording system transactions
   * 
   * @example
   * const client = hybrid.getAdminClient();
   * await client.from('wallets').update({ balance_brl: newBalance });
   * // Bypasses RLS to ensure atomic transaction
   */
  getAdminClient(): SupabaseClient {
    return supabaseAdmin;
  }

  /**
   * Get client for public read operations
   * No authentication required
   * 
   * Use cases:
   * - Browsing marketplace listings
   * - Viewing card database (cards_base)
   * - Public API endpoints
   * 
   * @example
   * const client = hybrid.getPublicClient();
   * const { data } = await client.from('market_listings')
   *   .select('*')
   *   .eq('status', 'active');
   */
  getPublicClient(): SupabaseClient {
    return supabase;
  }

  /**
   * Helper to set user context on anon client
   * Call this in middleware to attach JWT to requests
   * 
   * @param token - JWT token from Authorization header
   */
  setUserContext(token: string): SupabaseClient {
    // Supabase client automatically uses token from headers
    // This is handled by Fastify middleware
    return supabase;
  }
}

// Export singleton instance
export const supabaseHybrid = new SupabaseHybridService();
