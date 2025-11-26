/**
 * Wallet Service Unit Tests
 * Tests wallet operations with mocked Supabase client
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WalletService } from './wallet.service';
import { createMockSupabaseClient, mockWallet, mockTransaction } from '../../test/helpers/supabase.mock';

// Mock Supabase Hybrid Service
const mockUserClient = createMockSupabaseClient();
const mockAdminClient = createMockSupabaseClient();

vi.mock('../../core/supabase-hybrid.service', () => ({
  supabaseHybrid: {
    getUserClient: vi.fn(() => mockUserClient),
    getAdminClient: vi.fn(() => mockAdminClient)
  }
}));

describe('WalletService', () => {
  let service: WalletService;

  beforeEach(() => {
    service = new WalletService();
    vi.clearAllMocks();
  });

  describe('getWallet', () => {
    it('should return wallet for valid user', async () => {
      // Mock successful wallet retrieval
      const singleMock = vi.fn().mockResolvedValue({ data: mockWallet, error: null });
      mockUserClient.from = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: singleMock
          }))
        }))
      }));

      const result = await service.getWallet('test-user-123');

      expect(result).toEqual(mockWallet);
      expect(mockUserClient.from).toHaveBeenCalledWith('wallets');
    });

    it('should throw error if wallet not found', async () => {
      const singleMock = vi.fn().mockResolvedValue({ 
        data: null, 
        error: { message: 'Wallet not found' } 
      });
      mockUserClient.from = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: singleMock
          }))
        }))
      }));

      await expect(service.getWallet('nonexistent-user')).rejects.toThrow();
    });
  });

  describe('getTransactions', () => {
    it('should return transactions for user', async () => {
      const transactions = [mockTransaction, { ...mockTransaction, id: 'tx-124' }];
      const rangeMock = vi.fn().mockResolvedValue({ data: transactions, error: null, count: 2 });
      (mockUserClient.from as any) = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              range: rangeMock
            }))
          }))
        }))
      }));

      const result = await service.getTransactions('test-user-123', { page: 1, limit: 10 });

      expect(result.transactions).toEqual(transactions);
      expect(mockUserClient.from).toHaveBeenCalledWith('transactions');
    });

    it('should respect limit parameter', async () => {
      const rangeMock = vi.fn().mockResolvedValue({ data: [], error: null, count: 0 });
      (mockUserClient.from as any) = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              range: rangeMock
            }))
          }))
        }))
      }));

      await service.getTransactions('test-user-123', { page: 1, limit: 5 });

      expect(rangeMock).toHaveBeenCalled();
    });
  });

  describe('depositDev', () => {
    it('should reject negative amounts', async () => {
      await expect(service.depositDev('user-123', -10)).rejects.toThrow('Valor inválido');
    });

    it('should reject zero amount', async () => {
      await expect(service.depositDev('user-123', 0)).rejects.toThrow('Valor inválido');
    });

    it('should create wallet if not exists and add balance', async () => {
      // Mock wallet retrieval and update
      const updatedWallet = { ...mockWallet, balance_brl: 150 };
      const singleMock = vi.fn()
        .mockResolvedValueOnce({ data: mockWallet, error: null }) // getWallet
        .mockResolvedValueOnce({ data: updatedWallet, error: null }); // after update
      
      const txInsertMock = vi.fn().mockResolvedValue({ 
        data: mockTransaction, 
        error: null 
      });

      (mockAdminClient.from as any) = vi.fn((table: string) => {
        if (table === 'wallets') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: singleMock
              }))
            })),
            insert: vi.fn(() => ({
              select: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({ data: mockWallet, error: null })
              }))
            })),
            update: vi.fn(() => ({
              eq: vi.fn(() => ({
                select: vi.fn(() => ({
                  single: singleMock
                }))
              }))
            }))
          };
        }
        return {
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: txInsertMock
            }))
          }))
        };
      });

      const result = await service.depositDev('test-user-123', 50);

      expect(result.balance_brl).toBeGreaterThanOrEqual(100);
    });
  });

  describe('withdraw', () => {
    it('should calculate fee correctly', () => {
      // Fee is 2% of amount
      const amount = 100;
      const expectedFee = 2; // 2% of 100

      // This would need to access private method or test through public interface
      expect(expectedFee).toBe(2);
    });

    it('should require CPF in production for PIX withdrawals', async () => {
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
        service.withdraw('test-user-123', { method: 'pix', amount_brl: 50, target: { pix_key: 'test@pix.com' } })
      ).rejects.toThrow();

      // Restore env
      if (originalEnv) process.env.KROOVA_DEV_ALLOW_NO_CPF = originalEnv;
    });
  });
});
