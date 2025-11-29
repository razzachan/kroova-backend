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
      const response = await api.get('/inventory');
      const data = unwrap<{ cards: CardInstance[] }>(response);
      setInventory(data.cards || []);
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
      alert('Carta listada no marketplace! 🎉');
      setSellingCard(null);
      setSalePrice('');
      loadInventory();
    } catch (error: any) {
      cardAudio.playErrorBuzz();
      alert(error.response?.data?.message || 'Erro ao listar carta');
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
            <img src="/logo_icon.png" alt="KROUVA" className="w-10 h-10 rounded-lg" style={{ boxShadow: '0 0 20px rgba(0, 240, 255, 0.6), 0 0 40px rgba(255, 0, 109, 0.4)', border: '2px solid rgba(0, 240, 255, 0.3)' }} />
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
        <h1 className="text-3xl font-bold text-white mb-6">
          <TextGlitch delay={300}>🃏 VAULT</TextGlitch>
        </h1>

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
            {inventory.map((card) => {
              const baseCard = card.cards_base;
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
                  rarity={card.is_godmode ? 'godmode' : (baseCard?.rarity as any) || 'trash'}
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
                    ) : (
                      <GlitchButton
                        onClick={() => setSellingCard(card.id)}
                        variant="success"
                        size="md"
                        className="w-full mt-4"
                      >
                        VENDER
                      </GlitchButton>
                    )}
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
