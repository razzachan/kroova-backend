'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { unwrap } from '@/lib/unwrap';

interface BoosterType {
  id: string;
  name: string;
  price_brl: number;
  rarity_distribution: Record<string, number>;
  cards_per_booster: number;
  edition_id: string;
}

interface Card {
  id: string;
  base_id: string;
  skin: string;
  card: {
    name: string;
    rarity: string;
    image_url: string;
    display_id: string;
  };
}

export default function BoostersPage() {
  const router = useRouter();
  const [boosters, setBoosters] = useState<BoosterType[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [opening, setOpening] = useState<string | null>(null);
  const [revealedCards, setRevealedCards] = useState<Card[]>([]);
  const [showCards, setShowCards] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [boostersRes, walletRes] = await Promise.all([
        api.get('/boosters'),
        api.get('/wallet')
      ]);

      setBoosters(unwrap(boostersRes.data));
      setBalance(unwrap(walletRes.data).balance_brl);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handlePurchase(boosterId: string) {
    setPurchasing(boosterId);
    try {
      const res = await api.post('/boosters/purchase', {
        booster_type_id: boosterId
      });

      const data = unwrap(res.data);
      setBalance(data.new_balance);

      // Abre automaticamente
      await handleOpen(data.opening_id);
    } catch (error: any) {
      const errorMsg = error.response?.data?.error?.message || 'Erro ao comprar booster';
      alert(errorMsg);
    } finally {
      setPurchasing(null);
    }
  }

  async function handleOpen(openingId: string) {
    setOpening(openingId);
    setShowCards(false);

    try {
      const res = await api.post('/boosters/open', { opening_id: openingId });
      const data = unwrap(res.data);

      // Animação: espera 2s antes de revelar
      setTimeout(() => {
        setRevealedCards(data.cards);
        setShowCards(true);
        setOpening(null);
      }, 2000);
    } catch (error) {
      console.error('Erro ao abrir booster:', error);
      setOpening(null);
    }
  }

  function getRarityColor(rarity: string) {
    const colors: Record<string, string> = {
      trash: 'text-gray-400',
      meme: 'text-blue-400',
      viral: 'text-purple-400',
      legendary: 'text-yellow-400',
      godmode: 'text-red-400'
    };
    return colors[rarity] || 'text-gray-400';
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Boosters</h1>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Boosters</h1>
          <div className="text-2xl">
            💰 <span className="text-green-400">R$ {balance.toFixed(2)}</span>
          </div>
        </div>

        {/* Grid de Boosters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {boosters.map((booster) => (
            <div
              key={booster.id}
              className="bg-gray-800 rounded-lg p-6 border-2 border-gray-700 hover:border-blue-500 transition"
            >
              <h3 className="text-2xl font-bold mb-2">{booster.name}</h3>
              <p className="text-gray-400 mb-4">
                {booster.cards_per_booster} cartas • {booster.edition_id}
              </p>

              <div className="mb-4">
                <p className="text-sm text-gray-400 mb-2">Distribuição de Raridades:</p>
                <div className="space-y-1 text-sm">
                  {Object.entries(booster.rarity_distribution).map(([rarity, percent]) => (
                    <div key={rarity} className="flex justify-between">
                      <span className={getRarityColor(rarity)}>{rarity}</span>
                      <span>{percent}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handlePurchase(booster.id)}
                disabled={purchasing === booster.id || opening !== null || balance < booster.price_brl}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded transition"
              >
                {purchasing === booster.id
                  ? 'Comprando...'
                  : balance < booster.price_brl
                  ? 'Saldo Insuficiente'
                  : `Comprar - R$ ${booster.price_brl.toFixed(2)}`}
              </button>
            </div>
          ))}
        </div>

        {/* Animação de Abertura */}
        {opening && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
            <div className="text-center">
              <div className="text-6xl mb-4 animate-bounce">📦</div>
              <p className="text-2xl">Abrindo booster...</p>
            </div>
          </div>
        )}

        {/* Cartas Reveladas */}
        {showCards && revealedCards.length > 0 && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-8">
            <div className="max-w-6xl w-full">
              <h2 className="text-3xl font-bold text-center mb-8">✨ Suas Novas Cartas! ✨</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                {revealedCards.map((card) => (
                  <div
                    key={card.id}
                    className="bg-gray-800 rounded-lg p-4 border-2 border-gray-700 hover:scale-105 transition"
                  >
                    <div className="aspect-[2/3] bg-gray-700 rounded mb-2 flex items-center justify-center">
                      <span className="text-4xl">🎴</span>
                    </div>
                    <h4 className={`font-bold ${getRarityColor(card.card.rarity)}`}>
                      {card.card.name}
                    </h4>
                    <p className="text-xs text-gray-400">{card.skin}</p>
                    <p className="text-xs text-gray-500">{card.card.display_id}</p>
                  </div>
                ))}
              </div>
              <div className="text-center space-x-4">
                <button
                  onClick={() => setShowCards(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded"
                >
                  Fechar
                </button>
                <button
                  onClick={() => router.push('/inventory')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded"
                >
                  Ver Inventário
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
