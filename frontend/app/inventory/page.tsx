'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface CardBase {
  id: string;
  name: string;
  rarity: string;
  card_type: string;
  energy_cost: number;
  attack: number | null;
  defense: number | null;
  ability_text: string;
}

interface CardInstance {
  id: string;
  card_base_id: string;
  mint_number: number;
  total_minted: number;
  condition: string;
  card_base?: CardBase;
}

interface InventoryItem {
  id: string;
  card_instance_id: string;
  acquired_at: string;
  card_instance?: CardInstance;
}

export default function InventoryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
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
      setInventory(response.data.inventory || []);
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
        price: price
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
            {inventory.map((item) => {
              const card = item.card_instance?.card_base;
              const instance = item.card_instance;
              const rarityColors: Record<string, string> = {
                common: 'text-gray-400',
                rare: 'text-blue-400',
                epic: 'text-purple-400',
                legendary: 'text-yellow-400'
              };
              
              return (
                <div key={item.id} className="bg-gray-800 rounded-lg p-4">
                  <div className="aspect-square bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg mb-4 flex flex-col items-center justify-center p-4 relative">
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
                    <h3 className="text-white font-bold truncate">{card?.name || 'Carta'}</h3>
                    <div className="flex items-center justify-between text-sm">
                      <span className={`font-semibold capitalize ${rarityColors[card?.rarity || 'common']}`}>
                        {card?.rarity || 'common'}
                      </span>
                      <span className="text-gray-500">
                        #{instance?.mint_number}/{instance?.total_minted}
                      </span>
                    </div>
                    <p className="text-gray-400 text-xs truncate">{card?.ability_text}</p>
                    <p className="text-gray-500 text-xs">Adquirida: {new Date(item.acquired_at).toLocaleDateString('pt-BR')}</p>
                    
                    {sellingCard === item.card_instance_id ? (
                      <div className="space-y-2">
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
                            onClick={() => handleSell(item.card_instance_id)}
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
                        onClick={() => setSellingCard(item.card_instance_id)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition font-semibold"
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
