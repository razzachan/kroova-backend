'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { unwrap } from '@/lib/unwrap';

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
      alert('Digite um preço válido');
      return;
    }

    try {
      await api.post('/market/listings', {
        card_instance_id: cardInstanceId,
        price_brl: price
      });
      alert('Carta listada no marketplace! 🎉');
      setSellingCard(null);
      setSalePrice('');
      loadInventory();
    } catch (error: any) {
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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <a href="/dashboard" className="text-2xl font-bold text-white">🃏 Krouva</a>
          <div className="flex items-center gap-4">
            <a href="/dashboard" className="text-gray-300 hover:text-white">Dashboard</a>
            <a href="/marketplace" className="text-gray-300 hover:text-white">Marketplace</a>
            <a href="/boosters" className="text-gray-300 hover:text-white">Boosters</a>
            <a href="/inventory" className="text-blue-400 font-semibold">Inventário</a>
            <a href="/wallet" className="text-gray-300 hover:text-white">Wallet</a>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-6">🃏 Meu Inventário</h1>

        {loading ? (
          <div className="text-center text-gray-400 py-12">Carregando cartas...</div>
        ) : inventory.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-12 text-center">
            <p className="text-gray-400 text-lg mb-4">Você ainda não tem cartas</p>
            <p className="text-gray-500 mb-6">Compre boosters para começar sua coleção!</p>
            <a href="/boosters" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition inline-block">
              Comprar Boosters
            </a>
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
                <div key={card.id} className="bg-gray-800 rounded-lg p-4 border-2 border-gray-700 hover:border-blue-500 transition">
                  {/* Card Image */}
                  <div className="aspect-[2/3] bg-gray-700 rounded-lg mb-4 overflow-hidden relative">
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
                      <div className="space-y-2 mt-4">
                        <input
                          type="number"
                          value={salePrice}
                          onChange={(e) => setSalePrice(e.target.value)}
                          placeholder="Preço (R$)"
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                          min="0.01"
                          step="0.01"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSell(card.id)}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition text-sm font-semibold"
                          >
                            Confirmar
                          </button>
                          <button
                            onClick={() => {
                              setSellingCard(null);
                              setSalePrice('');
                            }}
                            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg transition text-sm"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSellingCard(card.id)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition font-semibold mt-4"
                      >
                        Vender no Marketplace
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
