// ============================================================================
// MY LISTINGS PAGE
// Gerenciar minhas vendas ativas, vendidas e canceladas
// /marketplace/my-listings
// ============================================================================

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TextGlitch from '@/components/Effects/TextGlitch';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Listing {
  id: string;
  price_brl: number;
  status: string;
  listed_at: string;
  updated_at: string;
  card: {
    instance_id: string;
    base_id: string;
    name: string;
    rarity: string;
    image_url?: string;
  };
}

interface Earnings {
  total_sales_month: number;
  gross_revenue_brl: number;
  total_fees_brl: number;
  net_revenue_brl: number;
}

export default function MyListingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<'active' | 'sold' | 'cancelled'>('active');
  const [listings, setListings] = useState<Listing[]>([]);
  const [earnings, setEarnings] = useState<Earnings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadListings();
    }
  }, [user, tab]);

  const loadListings = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/market/my-listings?status=${tab}`);
      setListings(response.data.data.listings || []);
      
      if (tab === 'sold') {
        setEarnings(response.data.data.earnings);
      }
    } catch (error: any) {
      console.error('Error loading listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (listingId: string) => {
    if (!confirm('Cancelar esta venda?')) return;

    try {
      await api.delete(`/market/listings/${listingId}`);
      alert('Venda cancelada!');
      loadListings();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao cancelar');
    }
  };

  const getRarityColor = (rarity: string) => {
    const colors: Record<string, string> = {
      legendary: 'from-yellow-500 to-orange-500',
      viral: 'from-cyan-500 to-blue-500',
      meme: 'from-pink-500 to-purple-500',
      trash: 'from-gray-500 to-gray-600'
    };
    return colors[rarity] || 'from-gray-500 to-gray-600';
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-[#00F0FF] text-2xl">
          <TextGlitch>CARREGANDO...</TextGlitch>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push('/marketplace')}
          className="mb-6 flex items-center gap-2 text-gray-400 hover:text-[#00F0FF] transition-colors"
        >
          <span>←</span> Voltar ao Marketplace
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <TextGlitch>💼 MINHAS VENDAS</TextGlitch>
          </h1>
          <p className="text-gray-400">Gerencie suas listagens e acompanhe seus ganhos</p>
        </div>

        {/* Earnings Dashboard (só aparece em "sold") */}
        {tab === 'sold' && earnings && (
          <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-lg p-6 border border-gray-800">
              <p className="text-xs text-gray-400 mb-2 uppercase">Vendas Este Mês</p>
              <p className="text-3xl font-bold text-white">{earnings.total_sales_month}</p>
            </div>
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-lg p-6 border border-gray-800">
              <p className="text-xs text-gray-400 mb-2 uppercase">Receita Bruta</p>
              <p className="text-3xl font-bold text-[#00F0FF]">R$ {earnings.gross_revenue_brl.toFixed(2)}</p>
            </div>
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-lg p-6 border border-gray-800">
              <p className="text-xs text-gray-400 mb-2 uppercase">Taxas</p>
              <p className="text-3xl font-bold text-red-400">- R$ {earnings.total_fees_brl.toFixed(2)}</p>
            </div>
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-lg p-6 border border-[#00F0FF]
                          shadow-[0_0_20px_rgba(0,240,255,0.3)]">
              <p className="text-xs text-gray-400 mb-2 uppercase">Receita Líquida</p>
              <p className="text-3xl font-bold text-[#00F0FF]">R$ {earnings.net_revenue_brl.toFixed(2)}</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'active', label: 'Ativas', emoji: '🟢' },
            { key: 'sold', label: 'Vendidas', emoji: '✅' },
            { key: 'cancelled', label: 'Canceladas', emoji: '❌' }
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as any)}
              className={`px-6 py-3 rounded-lg transition-all font-bold ${
                tab === t.key
                  ? 'bg-[#00F0FF] text-black shadow-[0_0_20px_rgba(0,240,255,0.5)]'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>

        {/* Listings */}
        {loading ? (
          <div className="text-center text-gray-400 py-12">Carregando...</div>
        ) : listings.length === 0 ? (
          <div className="bg-gray-900/30 rounded-lg border border-gray-800 p-12 text-center">
            <p className="text-gray-500 text-lg">
              Nenhuma {tab === 'active' ? 'venda ativa' : tab === 'sold' ? 'venda concluída' : 'venda cancelada'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="bg-gradient-to-r from-gray-900 to-black rounded-lg p-4 border border-gray-800
                         hover:border-[#00F0FF] transition-all flex items-center gap-4"
              >
                {/* Card Image */}
                <div className="w-20 h-28 rounded overflow-hidden flex-shrink-0 relative">
                  <div className={`absolute inset-0 bg-gradient-to-br ${getRarityColor(listing.card.rarity)} opacity-20`}></div>
                  {listing.card.image_url ? (
                    <img 
                      src={listing.card.image_url} 
                      alt={listing.card.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                      🎴
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-white mb-1">{listing.card.name}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs px-2 py-0.5 rounded bg-gradient-to-r ${getRarityColor(listing.card.rarity)} text-white`}>
                      {listing.card.rarity.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">
                    {tab === 'active' && `Listada ${formatDistanceToNow(new Date(listing.listed_at), { addSuffix: true, locale: ptBR })}`}
                    {tab === 'sold' && `Vendida ${formatDistanceToNow(new Date(listing.updated_at), { addSuffix: true, locale: ptBR })}`}
                    {tab === 'cancelled' && `Cancelada ${formatDistanceToNow(new Date(listing.updated_at), { addSuffix: true, locale: ptBR })}`}
                  </p>
                </div>

                {/* Price */}
                <div className="text-right">
                  <p className="text-3xl font-bold text-[#00F0FF]">R$ {listing.price_brl.toFixed(2)}</p>
                  {tab === 'sold' && (
                    <p className="text-sm text-gray-400">
                      Líquido: R$ {(listing.price_brl * 0.96).toFixed(2)}
                    </p>
                  )}
                </div>

                {/* Actions */}
                {tab === 'active' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCancel(listing.id)}
                      className="px-4 py-2 bg-red-900/50 hover:bg-red-900 border border-red-800
                               rounded text-sm text-white transition-all"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
