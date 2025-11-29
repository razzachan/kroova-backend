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
  }, [user]);

  const loadListings = async () => {
    try {
      const response = await api.get('/market/listings');
      const data = unwrap<{ listings: MarketListing[] }>(response);
      setListings(data?.listings || []);
    } catch (error) {
      console.error('Erro ao carregar marketplace:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async (listingId: string, price: number) => {
    if (!confirm(`Comprar esta carta por R$ ${price}?`)) return;
    
    try {
      await api.post(`/market/listings/${listingId}/buy`);
      cardAudio.playSuccessChime();
      alert('Carta comprada com sucesso! 🎉');
      loadListings();
    } catch (error: any) {
      cardAudio.playErrorBuzz();
      alert(error.response?.data?.message || 'Erro ao comprar carta. Verifique seu saldo.');
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
      <nav className="bg-black/40 backdrop-blur-md border-b border-[#00F0FF]/30">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <a href="/dashboard" className="flex items-center gap-3">
            <img src="/logo_icon.png" alt="KROUVA" className="w-10 h-10 rounded-lg" style={{ boxShadow: '0 0 20px rgba(0, 240, 255, 0.6), 0 0 40px rgba(255, 0, 109, 0.4)', border: '2px solid rgba(0, 240, 255, 0.3)' }} />
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
        ) : listings.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-12 text-center">
            <p className="text-gray-400 text-lg mb-4">Nenhuma carta disponível no momento</p>
            <p className="text-gray-500">Seja o primeiro a listar uma carta!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map((listing) => {
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
                  <div className="aspect-square bg-gradient-to-br from-gray-700/50 to-gray-900/50 rounded-lg mb-4 flex flex-col items-center justify-center p-4 relative">
                    <span className="text-6xl mb-2">🃏</span>
                    {card && (
                      <>
                        <div className="absolute top-2 right-2 bg-gray-900/80 px-2 py-1 rounded text-xs text-yellow-400">
                          ⚡{card.energy_cost}
                        </div>
                        {card.attack !== null && card.defense !== null && (
                          <div className="absolute bottom-2 left-2 right-2 flex justify-between text-xs">
                            <span className="bg-red-900/80 px-2 py-1 rounded text-white">⚔️ {card.attack}</span>
                            <span className="bg-blue-900/80 px-2 py-1 rounded text-white">🛡️ {card.defense}</span>
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
      </main>
    </div>
  );
}
