// ============================================================================
// CARD DETAIL PAGE
// Página detalhada de uma carta com gráficos, stats e histórico
// /marketplace/[card_base_id]
// ============================================================================

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import GlitchButton from '@/components/UI/GlitchButton';
import TextGlitch from '@/components/Effects/TextGlitch';
import { PriceChart } from '@/components/Marketplace/PriceChart';
import { SalesHistory } from '@/components/Marketplace/SalesHistory';
import { api } from '@/lib/api';

interface CardStats {
  card_base_id: string;
  floor_price: number | null;
  last_sale_price: number | null;
  last_sale_date: string | null;
  total_sales: number;
  avg_price: number;
  volume_24h: number;
}

interface CardBase {
  id: string;
  name: string;
  description: string;
  rarity: string;
  image_url?: string;
  archetype?: string;
}

interface Listing {
  id: string;
  price_brl: number;
  seller_id: string;
  seller: {
    id: string;
    name: string;
    username: string;
  };
  created_at: string;
}

export default function CardDetailPage({ params }: { params: { card_base_id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [card, setCard] = useState<CardBase | null>(null);
  const [stats, setStats] = useState<CardStats | null>(null);
  const [priceHistory, setPriceHistory] = useState<any[]>([]);
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [activeListings, setActiveListings] = useState<Listing[]>([]);
  const [period, setPeriod] = useState(30); // dias

  useEffect(() => {
    loadCardData();
  }, [params.card_base_id, period]);

  const loadCardData = async () => {
    try {
      setLoading(true);

      // 🚀 OTIMIZADO: 1 request em vez de 5 (60-75% mais rápido)
      const response = await api.get(`/market/cards/${params.card_base_id}/full?days=${period}`);
      const data = response.data;

      setCard(data.card);
      setStats(data.stats);
      setPriceHistory(data.price_history || []);
      setRecentSales(data.recent_sales || []);
      setActiveListings(data.listings || []);

    } catch (error: any) {
      console.error('Error loading card:', error);
    } finally {
      setLoading(false);
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

  const handleBuy = async (listingId: string) => {
    if (!confirm('Confirmar compra?')) return;

    try {
      await api.post(`/market/listings/${listingId}/buy`);
      alert('Compra realizada com sucesso!');
      loadCardData(); // Recarregar
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao comprar');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-[#00F0FF] text-2xl">
          <TextGlitch>CARREGANDO...</TextGlitch>
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-xl mb-4">Carta não encontrada</p>
          <GlitchButton onClick={() => router.push('/marketplace')}>
            Voltar ao Marketplace
          </GlitchButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <nav className="bg-black/40 backdrop-blur-md border-b border-[#00F0FF]/30">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <a href="/dashboard" className="flex items-center gap-3">
            <img src="/logo_icon_transparent.png" alt="KROUVA" className="w-10 h-10 rounded-lg object-contain" style={{ boxShadow: '0 0 20px rgba(0, 240, 255, 0.6), 0 0 40px rgba(255, 0, 109, 0.4)', border: '2px solid rgba(0, 240, 255, 0.3)' }} />
            <span className="text-2xl font-bold text-white tracking-wider" style={{ fontFamily: 'var(--font-geist-mono), monospace', letterSpacing: '0.1em' }}>KROUVA</span>
          </a>
          <div className="flex items-center gap-4">
            <a href="/dashboard" className="text-gray-300 hover:text-[#00F0FF] transition">Dashboard</a>
            <a href="/marketplace" className="text-[#00F0FF] font-semibold">Marketplace</a>
            <a href="/marketplace/analytics" className="text-gray-300 hover:text-[#00F0FF] transition">📊 Analytics</a>
            <a href="/marketplace/my-listings" className="text-gray-300 hover:text-[#00F0FF] transition">💼 Minhas Vendas</a>
            <a href="/boosters" className="text-gray-300 hover:text-[#00F0FF] transition">Boosters</a>
            <a href="/wallet" className="text-gray-300 hover:text-[#00F0FF] transition">Wallet</a>
          </div>
        </div>
      </nav>

      <main className="text-white p-6">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => router.push('/marketplace')}
            className="mb-6 flex items-center gap-2 text-gray-400 hover:text-[#00F0FF] transition-colors"
          >
            <span>←</span> Voltar ao Marketplace
          </button>

        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Card Preview */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <div className="aspect-[2/3] bg-gray-900 rounded-lg overflow-hidden border-2 border-gray-800
                            hover:border-[#00F0FF] transition-all duration-300
                            hover:shadow-[0_0_30px_rgba(0,240,255,0.3)]">
                {card.image_url ? (
                  <img 
                    src={card.image_url} 
                    alt={card.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-8xl">
                    🎴
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Card Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div>
              <h1 className="text-4xl font-bold mb-2">
                <TextGlitch>{card.name}</TextGlitch>
              </h1>
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 rounded bg-gradient-to-r ${getRarityColor(card.rarity)} text-white font-bold`}>
                  {card.rarity.toUpperCase()}
                </span>
                {card.archetype && (
                  <span className="px-3 py-1 rounded bg-gray-800 text-gray-300">
                    {card.archetype}
                  </span>
                )}
              </div>
              {card.description && (
                <p className="text-gray-400">{card.description}</p>
              )}
            </div>

            {/* Stats Grid */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
                  <p className="text-xs text-gray-400 mb-1">Floor Price</p>
                  <p className="text-2xl font-bold text-[#00F0FF]">
                    {stats.floor_price !== null ? `R$ ${stats.floor_price.toFixed(3)}` : 'N/A'}
                  </p>
                </div>

                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
                  <p className="text-xs text-gray-400 mb-1">Última Venda</p>
                  <p className="text-2xl font-bold text-[#FF006D]">
                    {stats.last_sale_price !== null ? `R$ ${stats.last_sale_price.toFixed(3)}` : 'N/A'}
                  </p>
                </div>

                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
                  <p className="text-xs text-gray-400 mb-1">Volume 24h</p>
                  <p className="text-2xl font-bold text-white">{stats.volume_24h}</p>
                </div>

                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
                  <p className="text-xs text-gray-400 mb-1">Total Vendas</p>
                  <p className="text-2xl font-bold text-white">{stats.total_sales}</p>
                </div>

                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
                  <p className="text-xs text-gray-400 mb-1">Preço Médio</p>
                  <p className="text-2xl font-bold text-white">R$ {stats.avg_price.toFixed(3)}</p>
                </div>

                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
                  <p className="text-xs text-gray-400 mb-1">Listings Ativos</p>
                  <p className="text-2xl font-bold text-[#FFD600]">{activeListings.length}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Price History Chart */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">
              <TextGlitch>HISTÓRICO DE PREÇOS</TextGlitch>
            </h2>
            <div className="flex gap-2">
              {[7, 30, 90].map((days) => (
                <button
                  key={days}
                  onClick={() => setPeriod(days)}
                  className={`px-4 py-2 rounded transition-all ${
                    period === days
                      ? 'bg-[#00F0FF] text-black font-bold'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {days}d
                </button>
              ))}
            </div>
          </div>
          
          <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
            <PriceChart data={priceHistory} height={350} showVolume />
          </div>
        </div>

        {/* Recent Sales */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">
            <TextGlitch>VENDAS RECENTES</TextGlitch>
          </h2>
          <SalesHistory sales={recentSales} maxHeight={400} />
        </div>

        {/* Active Listings */}
        <div>
          <h2 className="text-2xl font-bold mb-4">
            <TextGlitch>{`LISTINGS ATIVOS (${activeListings.length})`}</TextGlitch>
          </h2>
          
          {activeListings.length === 0 ? (
            <div className="bg-gray-900/30 rounded-lg border border-gray-800 p-8 text-center">
              <p className="text-gray-500">Nenhuma carta disponível para compra no momento</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeListings.map((listing) => (
                <div
                  key={listing.id}
                  className="bg-gray-900/50 rounded-lg p-4 border border-gray-800 hover:border-[#00F0FF]
                           transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-2xl font-bold text-[#00F0FF]">
                        R$ {listing.price_brl.toFixed(3)}
                      </p>
                      <p className="text-sm text-gray-400">
                        Vendedor: @{listing.seller?.username || 'anonymous'}
                      </p>
                    </div>
                  </div>

                  <GlitchButton onClick={() => handleBuy(listing.id)}>
                    COMPRAR AGORA
                  </GlitchButton>
                </div>
              ))}
            </div>
          )}
        </div>
        </div>
      </main>
    </div>
  );
}
