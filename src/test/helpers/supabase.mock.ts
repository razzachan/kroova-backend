/**
 * Supabase Mock Helpers
 * Provides mock implementations for Supabase client methods
 */

import { vi } from 'vitest';

export interface MockSupabaseClient {
  from: any;
  auth: {
    getUser: ReturnType<typeof vi.fn>;
  };
}

export function createMockSupabaseClient(): MockSupabaseClient {
  return {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
          maybeSingle: vi.fn(),
          order: vi.fn(() => ({
            range: vi.fn()
          }))
        })),
        in: vi.fn(() => ({
          order: vi.fn()
        })),
        order: vi.fn(() => ({
          range: vi.fn()
        })),
        limit: vi.fn()
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn()
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn()
          }))
        }))
      })),
      delete: vi.fn(() => ({
        eq: vi.fn()
      }))
    })) as any,
    auth: {
      getUser: vi.fn()
    }
  };
}

export const mockWallet = {
  user_id: 'test-user-123',
  balance_brl: 100.00,
  balance_crypto: 0,
  cpf: null,
  pix_key: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

export const mockTransaction = {
  id: 'tx-123',
  user_id: 'test-user-123',
  type: 'credit_dev',
  amount_cents: 10000,
  balance_after_cents: 10000,
  description: 'Test deposit',
  created_at: new Date().toISOString()
};

export const mockCardInstance = {
  id: 'card-123',
  user_id: 'test-user-123',
  card_id: 'CARD_001',
  skin_id: 'SKIN_COMMON',
  status: 'in_inventory',
  obtained_from: 'booster',
  created_at: new Date().toISOString(),
  cards_base: {
    id: 'CARD_001',
    name: 'Test Card',
    rarity: 'common'
  }
};

export const mockMarketListing = {
  id: 'listing-123',
  card_instance_id: 'card-123',
  seller_id: 'test-user-123',
  price_brl: 10,
  price_crypto: 0,
  status: 'active',
  created_at: new Date().toISOString(),
  cards_instances: {
    owner_id: 'test-user-123'
  }
};
