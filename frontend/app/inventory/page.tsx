'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { unwrap } from '@/lib/unwrap';
import GlitchButton from '@/components/UI/GlitchButton';
import DataStreamInput from '@/components/UI/DataStreamInput';
import TextGlitch from '@/components/Effects/TextGlitch';
import HolographicCard from '@/components/UI/HolographicCard';
import { cardAudio } from '@/lib/cardAudio';
import RecycleBulk from '@/components/RecycleBulk';

interface CardBase {
  id: string;
  name: string;
  rarity: string;
  display_id: string;
  image_url?: string;
  description?: string;
}

interface CardInstance {
  id: string;
  base_id: string;
  owner_id: string;
  skin: string;
  is_godmode: boolean;
  liquidity_brl: number;
  minted_at: string;
  cards_base?: CardBase;
}

export default function InventoryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [inventory, setInventory] = useState<CardInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [sellingCard, setSellingCard] = useState<string | null>(null);
  const [salePrice, setSalePrice] = useState<string>('');
  const [showRecycleBulk, setShowRecycleBulk] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [listedCards, setListedCards] = useState<string[]>([]);
  const [showListedFilter, setShowListedFilter] = useState<'all' | 'owned' | 'listed'>('owned');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadInventory();
    }
  }, [user]);

  const loadInventory = async () => {
    try {
      const [invResponse, listingsResponse] = await Promise.all([
        api.get('/inventory'),
        api.get('/market/my-listings?status=active')
      ]);
      
      const data = unwrap<{ cards: CardInstance[] }>(invResponse);
      const allCards = data.cards || [];
      
      // Pegar IDs das cartas listadas
      const listings = listingsResponse.data?.data?.listings || [];
      const listedIds = listings.map((l: any) => l.card?.instance_id || l.card_instance_id).filter(Boolean);
      
      setListedCards(listedIds);
      setInventory(allCards);
    } catch (error) {
      console.error('Erro ao carregar inventário:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSell = async (cardInstanceId: string) => {
    const price = parseFloat(salePrice);
    if (!price || price <= 0) {
      cardAudio.playErrorBuzz();
      alert('Digite um preço válido');
      return;
    }

    try {
      await api.post('/market/listings', {
        card_instance_id: cardInstanceId,
        price_brl: price
      });
      cardAudio.playSuccessChime();
      setShowSuccessModal(true);
      setSellingCard(null);
      setSalePrice('');
      setTimeout(() => {
        setShowSuccessModal(false);
        loadInventory();
      }, 2000);
    } catch (error: any) {
      cardAudio.playErrorBuzz();
      alert(error.response?.data?.error?.message || 'Erro ao listar carta');
    }
  };

  const handleCancelListing = async (cardInstanceId: string) => {
    if (!confirm('Cancelar venda desta carta?')) return;

    try {
      // Buscar o listing_id desta carta
      const response = await api.get('/market/my-listings?status=active');
      const listings = response.data?.data?.listings || [];
      const listing = listings.find((l: any) => 
        (l.card?.instance_id || l.card_instance_id) === cardInstanceId
      );

      if (!listing) {
        alert('Anúncio não encontrado');
        return;
      }

      await api.delete(`/market/listings/${listing.id}`);
      cardAudio.playSuccessChime();
      alert('Venda cancelada com sucesso!');
      loadInventory();
    } catch (error: any) {
      cardAudio.playErrorBuzz();
      alert(error.response?.data?.message || 'Erro ao cancelar venda');
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
    <div className="min-h-screen">
      <nav className="bg-black/40 backdrop-blur-md border-b border-[#FF006D]/30">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <a href="/dashboard" className="flex items-center gap-3">
            <img src="/logo_icon_transparent.png" alt="KROUVA" className="w-10 h-10 rounded-lg object-contain" style={{ boxShadow: '0 0 20px rgba(0, 240, 255, 0.6), 0 0 40px rgba(255, 0, 109, 0.4)', border: '2px solid rgba(0, 240, 255, 0.3)' }} />
            <span className="text-2xl font-bold text-white tracking-wider" style={{ fontFamily: 'var(--font-geist-mono), monospace', letterSpacing: '0.1em' }}>KROUVA</span>
          </a>
          <div className="flex items-center gap-4">
            <a href="/dashboard" className="text-gray-300 hover:text-[#FF006D] transition">Dashboard</a>
            <a href="/marketplace" className="text-gray-300 hover:text-[#FF006D] transition">Marketplace</a>
            <a href="/boosters" className="text-gray-300 hover:text-[#FF006D] transition">Boosters</a>
            <a href="/inventory" className="text-[#FF006D] font-semibold">Inventário</a>
            <a href="/wallet" className="text-gray-300 hover:text-[#FF006D] transition">Wallet</a>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">
            <TextGlitch delay={300}>🃏 VAULT</TextGlitch>
          </h1>
          
          {/* Filter Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowListedFilter('owned')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                showListedFilter === 'owned'
                  ? 'bg-[#00F0FF] text-black'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              💎 Disponíveis ({inventory.filter(c => !listedCards.includes(c.id)).length})
            </button>
            <button
              onClick={() => setShowListedFilter('listed')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                showListedFilter === 'listed'
                  ? 'bg-[#FF006D] text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              🏪 No Marketplace ({listedCards.length})
            </button>
            <button
              onClick={() => setShowListedFilter('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                showListedFilter === 'all'
                  ? 'bg-[#FFC700] text-black'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              📊 Todas ({inventory.length})
            </button>
          </div>
        </div>

        {/* Recycle Bulk Button */}
        {inventory.length >= 25 && (
          <div className="mb-6">
            <button
              onClick={() => setShowRecycleBulk(!showRecycleBulk)}
              className="w-full px-6 py-4 rounded-lg bg-gradient-to-r from-[#A855F7] to-[#FF006D] text-white font-bold uppercase tracking-wider hover:scale-[1.02] transition flex items-center justify-between"
            >
              <span>♻️ RECICLAR 25 CARTAS E GANHAR 1 BOOSTER</span>
              <span className="text-2xl">{showRecycleBulk ? '▼' : '▶'}</span>
            </button>
          </div>
        )}

        {/* Recycle Bulk Component */}
        {showRecycleBulk && inventory.length >= 25 && (
          <div className="mb-8">
            <RecycleBulk 
              cards={inventory.map(c => ({
                id: c.id,
                card: c.cards_base ? {
                  name: c.cards_base.name,
                  rarity: c.cards_base.rarity,
                  image_url: c.cards_base.image_url || '/placeholder-card.png'
                } : undefined
              }))}
              onSuccess={loadInventory}
            />
          </div>
        )}

        {loading ? (
          <div className="text-center text-gray-400 py-12">Carregando cartas...</div>
        ) : inventory.length === 0 ? (
          <div className="bg-black/40 backdrop-blur-md border-2 border-[#FF006D]/30 rounded-lg p-12 text-center">
            <p className="text-gray-400 text-lg mb-4">Você ainda não tem cartas</p>
            <p className="text-gray-500 mb-6">Compre pacotes de cartas para começar sua coleção!</p>
            <GlitchButton
              onClick={() => window.location.href = '/boosters'}
              variant="primary"
              size="lg"
            >
              COMPRAR PACOTES
            </GlitchButton>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {inventory
              .filter(card => {
                const isListed = listedCards.includes(card.id);
                if (showListedFilter === 'owned') return !isListed;
                if (showListedFilter === 'listed') return isListed;
                return true; // 'all'
              })
              .map((card) => {
              const baseCard = card.cards_base;
              
              // Mapear raridades do banco para o HolographicCard
              const mapRarity = (dbRarity: string): 'common' | 'rare' | 'epic' | 'legendary' | 'godmode' => {
                const mapping: Record<string, 'common' | 'rare' | 'epic' | 'legendary' | 'godmode'> = {
                  'trash': 'common',
                  'meme': 'rare',
                  'viral': 'epic',
                  'legendary': 'legendary',
                  'epica': 'legendary'
                };
                return mapping[dbRarity?.toLowerCase()] || 'common';
              };
              
              const rarityColors: Record<string, string> = {
                trash: 'text-gray-400',
                meme: 'text-blue-400',
                viral: 'text-purple-400',
                legendary: 'text-yellow-400',
                epica: 'text-red-400',
                godmode: 'text-pink-400'
              };
              
              return (
                <HolographicCard 
                  key={card.id} 
                  rarity={card.is_godmode ? 'godmode' : mapRarity(baseCard?.rarity || 'trash')}
                  className="p-4"
                >
                  {/* Card Image */}
                  <div className="aspect-[2/3] bg-gray-700/50 rounded-lg mb-4 overflow-hidden relative">
                    {baseCard?.image_url ? (
                      <img 
                        src={baseCard.image_url} 
                        alt={baseCard.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-6xl">🎴</span>
                      </div>
                    )}
                    {card.is_godmode && (
                      <div className="absolute top-2 right-2 bg-pink-600 text-white px-2 py-1 rounded text-xs font-bold">
                        ✨ GODMODE
                      </div>
                    )}
                  </div>

                  {/* Card Info */}
                  <div className="space-y-2">
                    <h3 className="text-white font-bold truncate">{baseCard?.name || 'Carta'}</h3>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className={`font-semibold capitalize ${rarityColors[baseCard?.rarity || 'trash']}`}>
                        {baseCard?.rarity || 'common'}
                      </span>
                      <span className="text-gray-400 text-xs">{card.skin}</span>
                    </div>

                    <div className="text-xs text-gray-400">
                      <div>ID: {baseCard?.display_id}</div>
                      <div>Liquidez: R$ {card.liquidity_brl?.toFixed(2) || '0.00'}</div>
                    </div>
                    
                    {sellingCard === card.id ? (
                      <div className="space-y-3 mt-4">
                        <DataStreamInput
                          type="number"
                          value={salePrice}
                          onChange={(e) => setSalePrice(e.target.value)}
                          label="Preço (R$)"
                          variant="amber"
                          min="0.01"
                          step="0.01"
                        />
                        <div className="flex gap-2">
                          <GlitchButton
                            onClick={() => handleSell(card.id)}
                            variant="success"
                            size="sm"
                            className="flex-1"
                          >
                            CONFIRMAR
                          </GlitchButton>
                          <GlitchButton
                            onClick={() => {
                              setSellingCard(null);
                              setSalePrice('');
                            }}
                            variant="secondary"
                            size="sm"
                            className="flex-1"
                          >
                            CANCELAR
                          </GlitchButton>
                        </div>
                      </div>
                    ) : listedCards.includes(card.id) ? (
                      <div className="mt-4 space-y-2">
                        <div className="bg-[#FF006D]/20 border border-[#FF006D] rounded-lg p-2 text-center">
                          <p className="text-[#FF006D] text-sm font-bold">🏪 NO MARKETPLACE</p>
                        </div>
                        <GlitchButton
                          onClick={() => handleCancelListing(card.id)}
                          variant="danger"
                          size="md"
                          className="w-full"
                        >
                          ❌ CANCELAR VENDA
                        </GlitchButton>
                      </div>
                    ) : (
                      <GlitchButton
                        onClick={() => setSellingCard(card.id)}
                        variant="success"
                        size="md"
                        className="w-full mt-4"
                      >
                        💰 VENDER
                      </GlitchButton>
                    )}
                  </div>
                </HolographicCard>
              );
            })}
          </div>
        )}
      </main>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-[#00F0FF] rounded-lg p-8 max-w-md mx-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#00F0FF]/10 to-[#FF006D]/10 animate-pulse"></div>
            <div className="relative z-10 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-[#00F0FF] mb-2">
                <TextGlitch delay={0}>LISTADO!</TextGlitch>
              </h2>
              <p className="text-gray-300">
                Sua carta foi listada no marketplace com sucesso!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
