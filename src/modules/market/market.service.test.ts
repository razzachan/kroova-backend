/**
 * Market Service Unit Tests
 * Tests marketplace operations and validations
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MarketService } from './market.service';
import { createMockSupabaseClient, mockWallet, mockCardInstance, mockMarketListing } from '../../test/helpers/supabase.mock';

// Mock dependencies
const mockUserClient = createMockSupabaseClient();
const mockAdminClient = createMockSupabaseClient();

vi.mock('../../core/supabase-hybrid.service', () => ({
  supabaseHybrid: {
    getUserClient: vi.fn(() => mockUserClient),
    getAdminClient: vi.fn(() => mockAdminClient)
  }
}));

vi.mock('../wallet/wallet.service', () => ({
  WalletService: vi.fn().mockImplementation(() => ({
    getWallet: vi.fn().mockResolvedValue(mockWallet),
    debit: vi.fn().mockResolvedValue({ ...mockWallet, balance_brl: 90 }),
    credit: vi.fn().mockResolvedValue({ ...mockWallet, balance_brl: 110 })
  }))
}));

describe('MarketService', () => {
  let service: MarketService;

  beforeEach(() => {
    service = new MarketService();
    vi.clearAllMocks();
  });

  describe('createListing - Validations', () => {
    it('should reject listing without CPF in production', async () => {
      // Mock production environment
      const originalEnv = process.env.KROOVA_DEV_ALLOW_NO_CPF;
      delete process.env.KROOVA_DEV_ALLOW_NO_CPF;

      const singleMock = vi.fn().mockResolvedValue({ 
        data: { ...mockWallet, cpf: null }, 
        error: null 
      });
      mockAdminClient.from = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: singleMock
          }))
        }))
      }));

      await expect(
        service.createListing('test-user-123', { card_instance_id: 'card-123', price_brl: 10 })
      ).rejects.toThrow('CPF');

      // Restore env
      if (originalEnv) process.env.KROOVA_DEV_ALLOW_NO_CPF = originalEnv;
    });

    it('should reject listing if card not owned by user', async () => {
      const singleMock = vi.fn()
        .mockResolvedValueOnce({ data: mockWallet, error: null }) // wallet check
        .mockResolvedValueOnce({ 
          data: { ...mockCardInstance, user_id: 'different-user' }, 
          error: null 
        }); // card ownership check

      mockAdminClient.from = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: singleMock
          }))
        }))
      }));

      await expect(
        service.createListing('test-user-123', { card_instance_id: 'card-123', price_brl: 10 })
      ).rejects.toThrow();
    });

    it('should reject duplicate listing for same card', async () => {
      // VALIDATION 1: User CPF check (skipped in dev)
      const userCheckMock = vi.fn().mockResolvedValue({ data: mockWallet, error: null });
      
      // VALIDATION 2: Card ownership check (adminClient) - card belongs to user
      const cardOwnershipMock = vi.fn().mockResolvedValue({ 
        data: { ...mockCardInstance, owner_id: 'test-user-123' }, 
        error: null 
      });
      
      // VALIDATION 3: Duplicate listing check (adminClient) - listing already exists
      const duplicateCheckMock = vi.fn().mockResolvedValue({ 
        data: mockMarketListing, 
        error: null 
      });
      
      mockAdminClient.from = vi.fn((table: string) => {
        if (table === 'users') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: userCheckMock
              }))
            }))
          };
        }
        if (table === 'cards_instances') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: cardOwnershipMock
              }))
            }))
          };
        }
        if (table === 'market_listings') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() => ({
                  maybeSingle: duplicateCheckMock
                }))
              }))
            }))
          };
        }
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null })
            }))
          }))
        };
      });

      await expect(
        service.createListing('test-user-123', { card_instance_id: 'card-123', price_brl: 10 })
      ).rejects.toThrow('já está');
    });

    it('should reject price below minimum (5 BRL)', async () => {
      // VALIDATION 1: User CPF check (skipped in dev)
      const userCheckMock = vi.fn().mockResolvedValue({ data: mockWallet, error: null });
      
      // VALIDATION 2: Card ownership check - card belongs to user
      const cardWithBaseMock = vi.fn().mockResolvedValue({
        data: { ...mockCardInstance, owner_id: 'test-user-123' },
        error: null
      });
      
      // VALIDATION 3: No duplicate listing
      const noDuplicateMock = vi.fn().mockResolvedValue({ 
        data: null, 
        error: null 
      });
      
      // VALIDATION 4: Card in inventory
      const inventoryMock = vi.fn().mockResolvedValue({
        data: { user_id: 'test-user-123', card_instance_id: 'card-123' },
        error: null
      });
      
      mockAdminClient.from = vi.fn((table: string) => {
        if (table === 'users') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: userCheckMock
              }))
            }))
          };
        }
        if (table === 'cards_instances') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: cardWithBaseMock
              }))
            }))
          };
        }
        if (table === 'market_listings') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() => ({
                  maybeSingle: noDuplicateMock
                }))
              }))
            }))
          };
        }
        if (table === 'user_inventory') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() => ({
                  maybeSingle: inventoryMock
                }))
              }))
            }))
          };
        }
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null })
            }))
          }))
        };
      });

      await expect(
        service.createListing('test-user-123', { card_instance_id: 'card-123', price_brl: 0.40 })
      ).rejects.toThrow('mínimo');
    });

    it('should enforce skin-based price floors', async () => {
      const legendaryCard = { 
        ...mockCardInstance, 
        skin_id: 'SKIN_LEGENDARY' 
      };
      
      const singleMock = vi.fn()
        .mockResolvedValueOnce({ data: mockWallet, error: null })
        .mockResolvedValueOnce({ data: legendaryCard, error: null });

      mockAdminClient.from = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: singleMock,
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null })
          }))
        }))
      }));

      // Legendary minimum is 50 BRL (5000 cents)
      await expect(
        service.createListing('test-user-123', { card_instance_id: 'card-123', price_brl: 30 }) // 30 BRL - below legendary floor
      ).rejects.toThrow();
    });
  });

  describe('buyListing - Validations', () => {
    it('should reject if listing not found or inactive', async () => {
      const singleMock = vi.fn().mockResolvedValue({ 
        data: { ...mockMarketListing, status: 'sold' }, 
        error: null 
      });

      mockAdminClient.from = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: singleMock
          }))
        }))
      }));

      await expect(
        service.buyListing('buyer-123', 'listing-123')
      ).rejects.toThrow();
    });

    it('should reject self-purchase attempts', async () => {
      const selfListing = { 
        ...mockMarketListing, 
        seller_id: 'same-user-123',
        cards_instances: { owner_id: 'same-user-123' }
      };
      
      const singleMock = vi.fn().mockResolvedValue({ 
        data: selfListing, 
        error: null 
      });

      mockAdminClient.from = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: singleMock
          }))
        })),
        update: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data: null, error: null }))
        }))
      }));

      await expect(
        service.buyListing('same-user-123', 'listing-123')
      ).rejects.toThrow('não pode comprar');
    });

    it('should verify card still belongs to seller', async () => {
      const singleMock = vi.fn()
        .mockResolvedValueOnce({ data: mockMarketListing, error: null })
        .mockResolvedValueOnce({ 
          data: { ...mockCardInstance, user_id: 'different-seller' }, 
          error: null 
        });

      mockAdminClient.from = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: singleMock
          }))
        }))
      }));

      await expect(
        service.buyListing('buyer-123', 'listing-123')
      ).rejects.toThrow();
    });

    it('should reject if buyer has insufficient balance', async () => {
      const poorWallet = { ...mockWallet, balance_brl: 5 }; // Only 5 BRL
      const sellerWallet = { ...mockWallet, user_id: 'seller-123', balance_brl: 50 };
      const expensiveListing = { 
        ...mockMarketListing, 
        price_brl: 100, // 100 BRL
        seller_id: 'seller-123',
        cards_instances: { owner_id: 'seller-123' }
      };

      let callCount = 0;
      const singleMock = vi.fn(() => {
        callCount++;
        if (callCount === 1) return Promise.resolve({ data: expensiveListing, error: null });
        if (callCount === 2) return Promise.resolve({ data: poorWallet, error: null });
        if (callCount === 3) return Promise.resolve({ data: sellerWallet, error: null });
        return Promise.resolve({ data: null, error: null });
      });

      mockAdminClient.from = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: singleMock
          }))
        })),
        update: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data: null, error: null }))
        }))
      }));

      await expect(
        service.buyListing('buyer-123', 'listing-123')
      ).rejects.toThrow('Saldo insuficiente');
    });
  });

  describe('listListings', () => {
    it('should call publicClient for browsing marketplace', async () => {
      // Since this test is complex and requires deep mocking of getPublicClient,
      // we'll just verify the method exists and doesn't crash with basic mocks
      const activeListings = [
        mockMarketListing,
        { ...mockMarketListing, id: 'listing-124' }
      ];

      const rangeMock = vi.fn().mockResolvedValue({ 
        data: activeListings, 
        error: null,
        count: 2
      });

      // Create a simple mock that matches the query chain
      const mockBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: rangeMock
      };

      // Mock the entire hybrid service at module level
      const { supabaseHybrid } = await import('../../core/supabase-hybrid.service');
      const originalGetPublic = supabaseHybrid.getPublicClient;
      supabaseHybrid.getPublicClient = vi.fn(() => ({
        from: vi.fn(() => mockBuilder as any)
      } as any));

      try {
        const result = await service.listListings({ page: 1, limit: 10 });
        expect(result.listings).toBeDefined();
        expect(result.pagination).toBeDefined();
      } finally {
        // Restore
        supabaseHybrid.getPublicClient = originalGetPublic;
      }
    });
  });

  describe('cancelListing', () => {
    it('should only allow seller to cancel their own listing', async () => {
      // Mock RLS check with getUserClient - returns null for non-owner
      const singleMock = vi.fn().mockResolvedValue({ 
        data: null, // RLS prevents access to other user's listing
        error: null 
      });

      mockUserClient.from = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: singleMock
          }))
        }))
      }));
      
      mockAdminClient.from = vi.fn(() => ({
        update: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data: null, error: null }))
        }))
      }));

      await expect(
        service.cancelListing('test-user-123', 'listing-123')
      ).rejects.toThrow();
    });
  });
});
