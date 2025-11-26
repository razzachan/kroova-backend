'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { unwrap } from '@/lib/unwrap';

interface Wallet {
  balance_brl: number;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  created_at: string;
}

export default function WalletPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadWalletData();
    }
  }, [user]);

  const loadWalletData = async () => {
    try {
      const [walletRes, transactionsRes] = await Promise.all([
        api.get('/wallet'),
        api.get('/wallet/transactions')
      ]);
      const wallet = unwrap<Wallet>(walletRes);
      const txData = unwrap<{ transactions?: Transaction[] }>(transactionsRes);
      setWallet(wallet || null);
      setTransactions(txData.transactions || []);
    } catch (error) {
      console.error('Erro ao carregar wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <a href="/dashboard" className="text-2xl font-bold text-white">🃏 Krouva</a>
          <div className="flex items-center gap-4">
            <a href="/dashboard" className="text-gray-300 hover:text-white">Dashboard</a>
            <a href="/marketplace" className="text-gray-300 hover:text-white">Marketplace</a>
            <a href="/boosters" className="text-gray-300 hover:text-white">Boosters</a>
            <a href="/wallet" className="text-blue-400 font-semibold">Wallet</a>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-6">💰 Wallet</h1>

        {loading ? (
          <div className="text-center text-gray-400 py-12">Carregando...</div>
        ) : (
          <>
            <div className="bg-gray-800 rounded-lg p-8 mb-8">
              <div className="text-center">
                <p className="text-gray-400 mb-2">Saldo Disponível</p>
                <p className="text-5xl font-bold text-green-400">
                  R$ {wallet?.balance_brl || 0}
                </p>
              </div>
              <div className="flex gap-4 mt-6 justify-center">
                <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition">
                  Depositar
                </button>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition">
                  Sacar
                </button>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Transações Recentes</h2>
              {transactions.length === 0 ? (
                <p className="text-gray-400 text-center py-8">Nenhuma transação ainda</p>
              ) : (
                <div className="space-y-3">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="bg-gray-700 rounded-lg p-4 flex justify-between items-center">
                      <div>
                        <p className="text-white font-semibold">{tx.description}</p>
                        <p className="text-gray-400 text-sm">{new Date(tx.created_at).toLocaleString('pt-BR')}</p>
                      </div>
                      <span className={`text-xl font-bold ${tx.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                        {tx.type === 'credit' ? '+' : '-'}R$ {tx.amount}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
