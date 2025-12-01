'use client';

import { useParams, useRouter } from 'next/navigation';
import { useMarketplaceListing, useCardStats, usePriceHistory } from '@/hooks/useMarketplace';
import { useBuyListing } from '@/hooks/useMarketplace';
import { PriceChart } from '@/components/Marketplace/PriceChart';
import { useState } from 'react';

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const listingId = params.id as string;
  
  const { listing, loading, error } = useMarketplaceListing(listingId);
  const { stats: cardStats } = useCardStats(listing?.card_base_id || '');
  const { history } = usePriceHistory(listing?.card_base_id || '', 30);
  const { buyListing, loading: buying } = useBuyListing();
  
  const [showBuyConfirm, setShowBuyConfirm] = useState(false);

  const handleBuy = async () => {
    try {
      await buyListing(listingId);
      
      // Success toast
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[#00F0FF] to-[#FF006D] text-white px-8 py-4 rounded-lg font-bold z-[200] animate-pulse';
      toast.textContent = '🎉 Compra realizada com sucesso!';
      document.body.appendChild(toast);
      setTimeout(() => {
        toast.remove();
        router.push('/marketplace');
      }, 2000);
    } catch (err: any) {
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-8 py-4 rounded-lg font-bold z-[200]';
      toast.textContent = `❌ ${err.message}`;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-700 rounded w-1/4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="aspect-[2/3] bg-gray-700 rounded-xl"></div>
              <div className="space-y-4">
                <div className="h-12 bg-gray-700 rounded"></div>
                <div className="h-64 bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-500/20 border-2 border-red-500 rounded-xl p-8 text-center">
            <p className="text-red-300 text-xl mb-4">❌ {error || 'Card não encontrado'}</p>
            <button
              onClick={() => router.push('/marketplace')}
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition"
            >
              Voltar ao Marketplace
            </button>
          </div>
        </div>
      </div>
    );
  }

  const rarityColors = {
    godmode: 'from-[#FFC700] to-[#FFD700]',
    legendary: 'from-[#FF006D] to-[#FF1493]',
    viral: 'from-[#A855F7] to-[#C084FC]',
    rare: 'from-[#00F0FF] to-[#60EFFF]',
    meme: 'from-gray-400 to-gray-600',
    trash: 'from-gray-600 to-gray-800',
  };

  const rarity = (listing.rarity as keyof typeof rarityColors) || 'trash';

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push('/marketplace')}
          className="mb-6 text-gray-400 hover:text-[#00F0FF] transition flex items-center gap-2"
        >
          ← Voltar ao Marketplace
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Card Image */}
          <div className="relative">
            <div className={`bg-gradient-to-r ${rarityColors[rarity]} p-1 rounded-2xl`}>
              <div className="bg-black rounded-xl overflow-hidden">
                <img
                  src={`/cards/${listing.card_base_id}.png`}
                  alt={listing.card_name}
                  className="w-full aspect-[2/3] object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder-card.png';
                  }}
                />
              </div>
            </div>

            {/* Stats */}
            {cardStats && (
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="bg-black/60 backdrop-blur-md border-2 border-gray-700 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Floor Price</p>
                  <p className="text-[#00F0FF] font-bold text-xl">
                    {cardStats.floor_price ? `R$ ${cardStats.floor_price.toFixed(2)}` : 'N/A'}
                  </p>
                </div>
                <div className="bg-black/60 backdrop-blur-md border-2 border-gray-700 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Avg Price</p>
                  <p className="text-white font-bold text-xl">
                    {cardStats.avg_price ? `R$ ${cardStats.avg_price.toFixed(2)}` : 'N/A'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Listing Info */}
          <div className="space-y-6">
            {/* Card Name & Price */}
            <div className="bg-black/60 backdrop-blur-md border-2 border-gray-700 rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    {listing.card_name}
                  </h1>
                  <div className={`inline-block px-4 py-2 rounded-full text-sm font-bold uppercase bg-gradient-to-r ${rarityColors[rarity]} text-white`}>
                    {listing.rarity}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-sm mb-1">Preço</p>
                  <p className="text-[#00F0FF] font-bold text-4xl">
                    R$ {listing.price_brl.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Seller Info */}
              {listing.seller_name && (
                <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                  <div>
                    <p className="text-gray-400 text-sm">Vendedor</p>
                    <p className="text-white font-semibold">{listing.seller_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-sm">Listado em</p>
                    <p className="text-white">{new Date(listing.listed_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
              )}

              {/* Views */}
              <div className="mt-4 flex items-center gap-4 text-sm text-gray-400">
                <span>👁️ {listing.views_count} visualizações</span>
              </div>

              {/* Buy Button */}
              <button
                onClick={() => setShowBuyConfirm(true)}
                className="w-full mt-6 py-4 bg-gradient-to-r from-[#00F0FF] to-[#FF006D] text-white font-bold text-lg rounded-lg hover:opacity-90 transition uppercase tracking-wider"
              >
                Comprar Agora
              </button>
            </div>

            {/* Price History Chart */}
            {history && history.length > 0 && (
              <PriceChart data={history} />
            )}
          </div>
        </div>
      </div>

      {/* Buy Confirmation Modal */}
      {showBuyConfirm && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-sm"
             onClick={() => setShowBuyConfirm(false)}>
          <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-[#00F0FF] rounded-2xl p-8 max-w-md mx-4 relative"
               onClick={(e) => e.stopPropagation()}>
            <div className="absolute inset-0 bg-gradient-to-r from-[#00F0FF]/10 to-[#FF006D]/10 animate-pulse rounded-2xl" />
            
            <div className="relative">
              <h2 className="text-2xl font-bold text-[#00F0FF] mb-4">
                Confirmar Compra
              </h2>
              
              <div className="space-y-4 mb-6">
                <div className="bg-black/50 rounded-lg p-4">
                  <p className="text-white font-semibold mb-2">{listing.card_name}</p>
                  <p className="text-gray-400 text-sm">Rarity: <span className="text-white">{listing.rarity}</span></p>
                  <p className="text-gray-400 text-sm">Seller: <span className="text-white">{listing.seller_name}</span></p>
                </div>

                <div className="bg-black/50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Preço:</span>
                    <span className="text-white font-bold">R$ {listing.price_brl.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Taxa (5%):</span>
                    <span className="text-white">R$ {(listing.price_brl * 0.05).toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-700 pt-2 flex justify-between">
                    <span className="text-[#00F0FF] font-bold">Total:</span>
                    <span className="text-[#00F0FF] font-bold text-xl">R$ {listing.price_brl.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowBuyConfirm(false)}
                  disabled={buying}
                  className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleBuy}
                  disabled={buying}
                  className="flex-1 py-3 bg-gradient-to-r from-[#00F0FF] to-[#FF006D] text-white font-bold rounded-lg hover:opacity-90 transition disabled:opacity-50 uppercase tracking-wider"
                >
                  {buying ? 'Comprando...' : 'Confirmar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
