'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface BoosterType {
  id: string;
  name: string;
  price_brl: number;
  card_count: number;
  description: string;
}

export default function BoostersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [boosters, setBoosters] = useState<BoosterType[]>([]);
  const [loading, setLoading] = useState(true);
  const [opening, setOpening] = useState(false);
  const [openedCards, setOpenedCards] = useState<any[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadBoosters();
    }
  }, [user]);

  const loadBoosters = async () => {
    try {
      const response = await api.get('/boosters/types');
      setBoosters(response.data.boosterTypes || []);
    } catch (error) {
      console.error('Erro ao carregar boosters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async (boosterId: string, price: number) => {
    if (!confirm(`Comprar booster por R$ ${price}?`)) return;
    
    setOpening(true);
    try {
      const response = await api.post('/boosters/buy', { booster_type_id: boosterId });
      const cards = response.data.cards || [];
      setOpenedCards(cards);
      
      setTimeout(() => {
        alert(`Parabéns! Você recebeu ${cards.length} cartas! 🎉\nVerifique seu inventário.`);
        setOpening(false);
        setOpenedCards([]);
      }, 3000);
    } catch (error: any) {
      setOpening(false);
      alert(error.response?.data?.message || 'Erro ao comprar booster. Verifique seu saldo.');
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
            <a href="/boosters" className="text-blue-400 font-semibold">Boosters</a>
            <a href="/wallet" className="text-gray-300 hover:text-white">Wallet</a>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-6">📦 Boosters</h1>

        {opening && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
            <div className="text-center">
              <div className="text-8xl mb-4 animate-bounce">📦</div>
              <h2 className="text-3xl font-bold text-white mb-2">Abrindo Booster...</h2>
              <p className="text-gray-400">Suas cartas estão chegando!</p>
              {openedCards.length > 0 && (
                <div className="mt-8 flex gap-4 justify-center">
                  {openedCards.map((card: any, i: number) => (
                    <div key={i} className="animate-pulse">
                      <div className="text-6xl">🃏</div>
                      <p className="text-white text-sm mt-2">{card.rarity}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center text-gray-400 py-12">Carregando boosters...</div>
        ) : boosters.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-12 text-center">
            <p className="text-gray-400 text-lg">Nenhum booster disponível no momento</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boosters.map((booster) => (
              <div key={booster.id} className="bg-gray-800 rounded-lg p-6">
                <div className="text-6xl mb-4 text-center">📦</div>
                <h3 className="text-xl font-bold text-white mb-2">{booster.name}</h3>
                <p className="text-gray-400 mb-4">{booster.description || `${booster.card_count} cartas aleatórias`}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-green-400">R$ {booster.price_brl}</span>
                  <button
                    onClick={() => handleBuy(booster.id, booster.price_brl)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
                  >
                    Comprar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
