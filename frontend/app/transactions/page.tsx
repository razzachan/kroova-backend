'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import TextGlitch from '@/components/Effects/TextGlitch';
import GlitchButton from '@/components/UI/GlitchButton';

interface Transaction {
  id: string;
  type: string;
  amount_brl: number;
  details: any;
  created_at: string;
}

type TransactionType = 'all' | 'booster_purchase' | 'sell_to_system' | 'marketplace_sale' | 'marketplace_purchase' | 'recycle';

const typeLabels: Record<string, string> = {
  booster_purchase: '🎁 Compra de Booster',
  sell_to_system: '💰 Venda ao Sistema',
  marketplace_sale: '🏪 Venda no Market',
  marketplace_purchase: '🛒 Compra no Market',
  recycle: '♻️ Reciclagem',
  balance_credit: '➕ Crédito',
  balance_debit: '➖ Débito'
};

const typeColors: Record<string, string> = {
  booster_purchase: 'text-red-400',
  sell_to_system: 'text-green-400',
  marketplace_sale: 'text-green-400',
  marketplace_purchase: 'text-red-400',
  recycle: 'text-cyan-400',
  balance_credit: 'text-green-400',
  balance_debit: 'text-red-400'
};

export default function TransactionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<TransactionType>('all');
  const [totalSpent, setTotalSpent] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);

  useEffect(() => {
    loadTransactions();
  }, [filter]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const params: any = { limit: 50, offset: 0 };
      if (filter !== 'all') {
        params.type = filter;
      }

      const response = await api.get('/users/transactions', { params });
      
      if (response.data.ok) {
        const txs = response.data.data.transactions;
        setTransactions(txs);
        
        // Calculate totals
        let spent = 0;
        let earned = 0;
        txs.forEach((tx: Transaction) => {
          if (tx.amount_brl < 0) {
            spent += Math.abs(tx.amount_brl);
          } else {
            earned += tx.amount_brl;
          }
        });
        setTotalSpent(spent);
        setTotalEarned(earned);
      }
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins}m atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatAmount = (amount: number) => {
    const sign = amount >= 0 ? '+' : '';
    return `${sign}R$ ${amount.toFixed(2)}`;
  };

  const getTransactionDetails = (tx: Transaction) => {
    switch (tx.type) {
      case 'booster_purchase':
        return `Pack: ${tx.details?.pack_name || 'Desconhecido'}`;
      case 'sell_to_system':
        return `${tx.details?.count || 0} cartas vendidas`;
      case 'marketplace_sale':
        return `Venda de carta`;
      case 'marketplace_purchase':
        return `Compra de carta`;
      case 'recycle':
        return `${tx.details?.cards_count || 0} cartas recicladas`;
      default:
        return tx.type;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <button
          onClick={() => router.back()}
          className="mb-4 text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          ← Voltar
        </button>
        
        <TextGlitch className="text-4xl font-bold mb-2">
          Histórico de Transações
        </TextGlitch>
        <p className="text-gray-400">Complete audit trail of all financial operations</p>
      </div>

      {/* Summary Cards */}
      <div className="max-w-6xl mx-auto mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Earned */}
        <div className="bg-gradient-to-br from-green-900/20 to-green-800/10 border border-green-500/30 rounded-lg p-6 backdrop-blur-sm">
          <div className="text-green-400 text-sm mb-2">💰 Total Recebido</div>
          <div className="text-3xl font-bold text-green-400">
            R$ {totalEarned.toFixed(2)}
          </div>
        </div>

        {/* Total Spent */}
        <div className="bg-gradient-to-br from-red-900/20 to-red-800/10 border border-red-500/30 rounded-lg p-6 backdrop-blur-sm">
          <div className="text-red-400 text-sm mb-2">💸 Total Gasto</div>
          <div className="text-3xl font-bold text-red-400">
            R$ {totalSpent.toFixed(2)}
          </div>
        </div>

        {/* Net */}
        <div className="bg-gradient-to-br from-cyan-900/20 to-cyan-800/10 border border-cyan-500/30 rounded-lg p-6 backdrop-blur-sm">
          <div className="text-cyan-400 text-sm mb-2">📊 Balanço</div>
          <div className={`text-3xl font-bold ${
            totalEarned - totalSpent >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {formatAmount(totalEarned - totalSpent)}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-all ${
              filter === 'all'
                ? 'bg-cyan-500 text-black'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter('booster_purchase')}
            className={`px-4 py-2 rounded-lg transition-all ${
              filter === 'booster_purchase'
                ? 'bg-cyan-500 text-black'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            🎁 Boosters
          </button>
          <button
            onClick={() => setFilter('sell_to_system')}
            className={`px-4 py-2 rounded-lg transition-all ${
              filter === 'sell_to_system'
                ? 'bg-cyan-500 text-black'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            💰 Vendas
          </button>
          <button
            onClick={() => setFilter('marketplace_sale')}
            className={`px-4 py-2 rounded-lg transition-all ${
              filter === 'marketplace_sale'
                ? 'bg-cyan-500 text-black'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            🏪 Market
          </button>
          <button
            onClick={() => setFilter('recycle')}
            className={`px-4 py-2 rounded-lg transition-all ${
              filter === 'recycle'
                ? 'bg-cyan-500 text-black'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            ♻️ Reciclagem
          </button>
        </div>
      </div>

      {/* Transactions Timeline */}
      <div className="max-w-6xl mx-auto">
        {loading ? (
          <div className="text-center py-12 text-gray-400">
            <div className="animate-pulse">Carregando transações...</div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-gray-400">Nenhuma transação encontrada</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-700 rounded-lg p-4 backdrop-blur-sm hover:border-cyan-500/50 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">
                        {typeLabels[tx.type]?.split(' ')[0] || '📋'}
                      </span>
                      <div>
                        <div className="font-semibold text-white">
                          {typeLabels[tx.type] || tx.type}
                        </div>
                        <div className="text-sm text-gray-400">
                          {getTransactionDetails(tx)}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(tx.created_at)}
                    </div>
                  </div>
                  
                  <div className={`text-2xl font-bold ${
                    tx.amount_brl >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {formatAmount(tx.amount_brl)}
                  </div>
                </div>

                {/* Details expansion (optional) */}
                {tx.details && Object.keys(tx.details).length > 0 && (
                  <details className="mt-3 text-sm">
                    <summary className="cursor-pointer text-gray-400 hover:text-cyan-400">
                      Ver detalhes
                    </summary>
                    <pre className="mt-2 p-3 bg-black/30 rounded text-xs overflow-auto">
                      {JSON.stringify(tx.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Load More (placeholder) */}
      {transactions.length >= 50 && (
        <div className="max-w-6xl mx-auto mt-8 text-center">
          <GlitchButton onClick={() => {}}>
            Carregar Mais
          </GlitchButton>
        </div>
      )}
    </div>
  );
}
