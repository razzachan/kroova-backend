'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { unwrap } from '@/lib/unwrap';
import GlitchButton from '@/components/UI/GlitchButton';
import TextGlitch from '@/components/Effects/TextGlitch';
import HolographicCard from '@/components/UI/HolographicCard';
import { cardAudio } from '@/lib/cardAudio';
import { TrendingCards } from '@/components/Marketplace/TrendingCards';
import { FloorPriceCard } from '@/components/Marketplace/FloorPriceCard';
import { MarketFilters } from '@/components/Marketplace/MarketFilters';

interface CardBase {
  id: string;
  name: string;
  rarity: string;
  card_type: string;
  energy_cost: number;
  attack: number | null;
  defense: number | null;
  ability_text: string;
  flavor_text: string;
  artist: string;
  image_url?: string;
}

interface CardInstance {
  id: string;
  card_base_id: string;
  mint_number: number;
  total_minted: number;
  condition: string;
  card_base?: CardBase;
}

interface MarketListing {
  id: string;
  card_instance_id: string;
  seller_id: string;
  price?: number;
  price_brl?: number;
  status: string;
  created_at: string;
  card_instance?: CardInstance;
  cards_instances?: CardInstance;
}

export default function MarketplacePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [listings, setListings] = useState<MarketListing[]>([]);
  const [filteredListings, setFilteredListings] = useState<MarketListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [trendingCards, setTrendingCards] = useState<any[]>([]);
  const [floorPrices, setFloorPrices] = useState<Record<string, number | null>>({});
  const [filters, setFilters] = useState<any>({});

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadMarketData();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [listings, filters]);

  const loadMarketData = async () => {
    try {
      // 1. Listings
      const response = await api.get('/market/listings');
      const data = unwrap<{ listings: MarketListing[] }>(response);
      setListings(data?.listings || []);

      // 2. Trending cards
      try {
        const trendingResponse = await api.get('/market/trending?period=24h&limit=6');
        setTrendingCards(trendingResponse.data.data || []);
      } catch (err) {
        console.error('Error loading trending:', err);
      }

      // 3. Analytics (floor prices)
      try {
        const analyticsResponse = await api.get('/market/analytics?period=24h');
        setFloorPrices(analyticsResponse.data.data.floor_prices || {});
      } catch (err) {
        console.error('Error loading analytics:', err);
      }
    } catch (error) {
      console.error('Erro ao carregar marketplace:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...listings];

    // Filtrar por raridade
    if (filters.rarity) {
      filtered = filtered.filter((l) => {
        const ci = l.card_instance || l.cards_instances;
        return ci?.card_base?.rarity === filters.rarity;
      });
    }

    // Filtrar por preço
    if (filters.minPrice) {
      filtered = filtered.filter((l) => (l.price_brl || l.price || 0) >= filters.minPrice);
    }
    if (filters.maxPrice) {
      filtered = filtered.filter((l) => (l.price_brl || l.price || 0) <= filters.maxPrice);
    }

    // Ordenar
    const sortBy = filters.sortBy || 'date_desc';
    if (sortBy === 'price_asc') {
      filtered.sort((a, b) => (a.price_brl || a.price || 0) - (b.price_brl || b.price || 0));
    } else if (sortBy === 'price_desc') {
      filtered.sort((a, b) => (b.price_brl || b.price || 0) - (a.price_brl || a.price || 0));
    } else if (sortBy === 'date_desc') {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    setFilteredListings(filtered);
  };

  const handleBuy = async (listingId: string, price: number) => {
    if (!confirm(`Comprar esta carta por R$ ${price}?`)) return;
    
    try {
      await api.post(`/market/listings/${listingId}/buy`);
      cardAudio.playSuccessChime();
      alert('Carta comprada com sucesso! 🎉');
      loadMarketData();
    } catch (error: any) {
      cardAudio.playErrorBuzz();
      alert(error.response?.data?.message || 'Erro ao comprar carta. Verifique seu saldo.');
    }
  };

  const handleCardClick = (cardId: string) => {
    router.push(`/marketplace/${cardId}`);
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
      <nav className="bg-black/40 backdrop-blur-md border-b border-[#00F0FF]/30">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <a href="/dashboard" className="flex items-center gap-3">
            <img src="/logo_icon_transparent.png" alt="KROUVA" className="w-10 h-10 rounded-lg object-contain" style={{ boxShadow: '0 0 20px rgba(0, 240, 255, 0.6), 0 0 40px rgba(255, 0, 109, 0.4)', border: '2px solid rgba(0, 240, 255, 0.3)' }} />
            <span className="text-2xl font-bold text-white tracking-wider" style={{ fontFamily: 'var(--font-geist-mono), monospace', letterSpacing: '0.1em' }}>KROUVA</span>
          </a>
          <div className="flex items-center gap-4">
            <a href="/dashboard" className="text-gray-300 hover:text-[#00F0FF] transition">Dashboard</a>
            <a href="/marketplace" className="text-[#00F0FF] font-semibold">Marketplace</a>
            <a href="/boosters" className="text-gray-300 hover:text-[#00F0FF] transition">Boosters</a>
            <a href="/wallet" className="text-gray-300 hover:text-[#00F0FF] transition">Wallet</a>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-6">
          <TextGlitch delay={300}>🛒 TRADING HUB</TextGlitch>
        </h1>

        {loading ? (
          <div className="text-center text-gray-400 py-12">Carregando cartas...</div>
        ) : (
          <>
            {/* Trending Cards */}
            {trendingCards.length > 0 && (
              <TrendingCards 
                cards={trendingCards} 
                period="24h"
                onCardClick={handleCardClick}
              />
            )}

            {/* Floor Prices */}
            {Object.keys(floorPrices).length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span>💎</span> FLOOR PRICES
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(floorPrices).map(([rarity, price]) => (
                    <FloorPriceCard key={rarity} rarity={rarity} price={price} />
                  ))}
                </div>
              </div>
            )}

            {/* Filtros */}
            <div className="mb-6">
              <MarketFilters onFilterChange={setFilters} initialFilters={filters} />
            </div>

            {/* Results Count */}
            <div className="mb-4 text-gray-400">
              Mostrando {filteredListings.length} {filteredListings.length === 1 ? 'carta' : 'cartas'}
            </div>

            {filteredListings.length === 0 ? (
              <div className="bg-gray-800 rounded-lg p-12 text-center">
                <p className="text-gray-400 text-lg mb-4">Nenhuma carta encontrada</p>
                <p className="text-gray-500">Tente ajustar os filtros</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredListings.map((listing) => {
              const ci = listing.card_instance || listing.cards_instances;
              const card = ci?.card_base;
              const rarityColors: Record<string, string> = {
                common: 'text-gray-400',
                rare: 'text-blue-400',
                epic: 'text-purple-400',
                legendary: 'text-yellow-400'
              };
              
              return (
                <HolographicCard 
                  key={listing.id} 
                  rarity={(card?.rarity as any) || 'common'}
                  className="p-4"
                >
                  {/* Card Image */}
                  <div className="aspect-[2/3] bg-gray-700/50 rounded-lg mb-4 overflow-hidden relative">
                    {card?.image_url ? (
                      <img 
                        src={card.image_url} 
                        alt={card.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-6xl">🎴</span>
                      </div>
                    )}
                    {card && (
                      <>
                        <div className="absolute top-2 right-2 bg-gray-900/90 px-2 py-1 rounded text-xs text-yellow-400 backdrop-blur-sm">
                          ⚡{card.energy_cost}
                        </div>
                        {card.attack !== null && card.defense !== null && (
                          <div className="absolute bottom-2 left-2 right-2 flex justify-between text-xs gap-2">
                            <span className="bg-red-900/90 px-2 py-1 rounded text-white backdrop-blur-sm">⚔️ {card.attack}</span>
                            <span className="bg-blue-900/90 px-2 py-1 rounded text-white backdrop-blur-sm">🛡️ {card.defense}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-white font-bold truncate">{card?.name || 'Carta Desconhecida'}</h3>
                    <div className="flex items-center justify-between text-sm">
                      <span className={`font-semibold capitalize ${rarityColors[card?.rarity || 'common']}`}>
                        {card?.rarity || 'common'}
                      </span>
                      <span className="text-gray-500">
                        #{ci?.mint_number}/{ci?.total_minted}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-[#00F0FF]">R$ {listing.price_brl || listing.price}</p>
                    <GlitchButton 
                      onClick={() => handleBuy(listing.id, listing.price_brl || listing.price || 0)}
                      variant="success"
                      size="md"
                      className="w-full"
                    >
                      COMPRAR
                    </GlitchButton>
                  </div>
                </HolographicCard>
              );
                })}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
