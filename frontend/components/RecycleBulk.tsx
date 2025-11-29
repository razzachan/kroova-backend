'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { unwrap } from '@/lib/unwrap';
import { cardAudio } from '@/lib/cardAudio';

interface Card {
  id: string;
  card?: {
    name: string;
    rarity: string;
    image_url: string;
  };
  cards_instances?: {
    cards_base: {
      name: string;
      rarity: string;
      image_url: string;
    };
  };
}

interface RecycleBulkProps {
  cards: Card[];
  onSuccess?: () => void;
}

export default function RecycleBulk({ cards, onSuccess }: RecycleBulkProps) {
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());
  const [recycling, setRecycling] = useState(false);

  const REQUIRED_CARDS = 25;
  const canRecycle = selectedCards.size === REQUIRED_CARDS;

  const toggleCard = (cardId: string) => {
    const newSelected = new Set(selectedCards);
    if (newSelected.has(cardId)) {
      newSelected.delete(cardId);
    } else {
      if (newSelected.size < REQUIRED_CARDS) {
        newSelected.add(cardId);
      } else {
        cardAudio.playErrorBuzz();
        alert(`Máximo de ${REQUIRED_CARDS} cartas`);
      }
    }
    setSelectedCards(newSelected);
  };

  const handleRecycle = async () => {
    if (!canRecycle) {
      cardAudio.playErrorBuzz();
      alert(`Selecione exatamente ${REQUIRED_CARDS} cartas`);
      return;
    }

    setRecycling(true);
    try {
      const res = await api.post('/cards/recycle-bulk', {
        card_instance_ids: Array.from(selectedCards)
      });

      const data = unwrap(res);
      cardAudio.playSuccessChime();
      alert(
        `🎉 ${data.cards_recycled} cartas recicladas! Você ganhou 1 booster: ${data.reward.booster_name}`
      );
      setSelectedCards(new Set());
      if (onSuccess) onSuccess();
    } catch (error: any) {
      cardAudio.playErrorBuzz();
      alert(error.response?.data?.error?.message || 'Erro ao reciclar cartas');
    } finally {
      setRecycling(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    const colors: Record<string, string> = {
      trash: 'text-gray-400',
      meme: 'text-blue-400',
      viral: 'text-purple-400',
      legendary: 'text-yellow-400',
      godmode: 'text-pink-400'
    };
    return colors[rarity.toLowerCase()] || 'text-gray-400';
  };

  return (
    <div className="bg-black/60 backdrop-blur-md border-2 border-[#A855F7]/40 rounded-lg p-6">
      <div className="mb-4">
        <h3 className="text-2xl font-bold text-white uppercase tracking-wider mb-2">
          RECICLAGEM EM LOTE
        </h3>
        <p className="text-gray-400 text-sm">
          Selecione <span className="text-[#A855F7] font-bold">{REQUIRED_CARDS} cartas</span> para reciclar e ganhar{' '}
          <span className="text-[#FFC700] font-bold">1 booster grátis</span>
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">
            {selectedCards.size} / {REQUIRED_CARDS} cartas selecionadas
          </span>
          <span className={`text-sm font-bold ${canRecycle ? 'text-green-400' : 'text-gray-500'}`}>
            {canRecycle ? '✓ Pronto!' : `Faltam ${REQUIRED_CARDS - selectedCards.size}`}
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              canRecycle ? 'bg-green-500' : 'bg-[#A855F7]'
            }`}
            style={{ width: `${(selectedCards.size / REQUIRED_CARDS) * 100}%` }}
          />
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-5 gap-3 mb-6 max-h-96 overflow-y-auto pr-2">
        {cards.slice(0, 50).map((card) => {
          const cardData = card.card || card.cards_instances?.cards_base;
          const isSelected = selectedCards.has(card.id);

          return (
            <button
              key={card.id}
              onClick={() => toggleCard(card.id)}
              className={`relative rounded-lg overflow-hidden transition-all ${
                isSelected
                  ? 'ring-4 ring-[#A855F7] scale-95'
                  : 'opacity-70 hover:opacity-100 hover:scale-105'
              }`}
              disabled={recycling}
            >
              <img
                src={cardData?.image_url || '/placeholder-card.png'}
                alt={cardData?.name || 'Card'}
                className="w-full h-auto"
              />
              {isSelected && (
                <div className="absolute inset-0 bg-[#A855F7]/30 flex items-center justify-center">
                  <span className="text-4xl">✓</span>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                <p className="text-xs font-bold truncate">{cardData?.name}</p>
                <p className={`text-xs ${getRarityColor(cardData?.rarity || 'trash')}`}>
                  {cardData?.rarity}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => setSelectedCards(new Set())}
          disabled={selectedCards.size === 0 || recycling}
          className="flex-1 px-4 py-3 rounded-lg bg-gray-700 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition"
        >
          LIMPAR SELEÇÃO
        </button>
        <button
          onClick={handleRecycle}
          disabled={!canRecycle || recycling}
          className={`flex-1 px-4 py-3 rounded-lg font-bold uppercase tracking-wider transition ${
            canRecycle && !recycling
              ? 'bg-gradient-to-r from-[#A855F7] to-[#FF006D] text-white hover:scale-105'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          }`}
        >
          {recycling ? 'RECICLANDO...' : `RECICLAR ${REQUIRED_CARDS} CARTAS`}
        </button>
      </div>

      {cards.length < REQUIRED_CARDS && (
        <p className="text-center text-yellow-400 text-sm mt-4">
          ⚠️ Você precisa ter pelo menos {REQUIRED_CARDS} cartas no inventário
        </p>
      )}
    </div>
  );
}
