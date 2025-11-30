// ============================================================================
// TRENDING CARDS - Component
// Seção de cartas em alta com % de valorização
// ============================================================================

'use client';

interface TrendingCard {
  card_base_id: string;
  name: string;
  rarity: string;
  image_url?: string;
  price_change_pct: number;
  current_price: number;
  volume: number;
}

interface TrendingCardsProps {
  cards: TrendingCard[];
  period?: string;
  onCardClick?: (cardId: string) => void;
}

export function TrendingCards({ cards, period = '24h', onCardClick }: TrendingCardsProps) {
  if (!cards || cards.length === 0) {
    return null;
  }

  const getRarityColor = (rarity: string) => {
    const colors: Record<string, string> = {
      legendary: 'from-yellow-500 to-orange-500',
      viral: 'from-cyan-500 to-blue-500',
      meme: 'from-pink-500 to-purple-500',
      trash: 'from-gray-500 to-gray-600'
    };
    return colors[rarity] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className="mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🔥</span>
          <div>
            <h2 className="text-2xl font-bold text-white uppercase tracking-wider">
              TRENDING NOW
            </h2>
            <p className="text-sm text-gray-400">Cartas em alta nas últimas {period}</p>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.slice(0, 6).map((card, index) => (
          <div
            key={card.card_base_id}
            onClick={() => onCardClick?.(card.card_base_id)}
            className="relative bg-gradient-to-br from-gray-900 to-black rounded-lg overflow-hidden
                     border border-gray-800 hover:border-[#00F0FF] transition-all duration-300
                     cursor-pointer group hover:scale-105 hover:shadow-[0_0_30px_rgba(0,240,255,0.3)]"
          >
            {/* Rank Badge */}
            <div className="absolute top-2 left-2 z-10 w-8 h-8 rounded-full bg-gradient-to-br from-[#FF006D] to-[#FFD600]
                          flex items-center justify-center text-white font-bold text-sm shadow-lg">
              #{index + 1}
            </div>

            {/* Change Badge */}
            <div className={`
              absolute top-2 right-2 z-10 px-2 py-1 rounded-full text-xs font-bold
              ${card.price_change_pct >= 0 ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'}
              shadow-lg backdrop-blur-sm
            `}>
              {card.price_change_pct >= 0 ? '▲' : '▼'} {Math.abs(card.price_change_pct).toFixed(1)}%
            </div>

            <div className="flex gap-3 p-3">
              {/* Imagem */}
              <div className="relative w-20 h-28 flex-shrink-0 rounded overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${getRarityColor(card.rarity)} opacity-20`}></div>
                {card.image_url ? (
                  <img 
                    src={card.image_url} 
                    alt={card.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">
                    🎴
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-bold text-sm mb-1 truncate group-hover:text-[#00F0FF] transition-colors">
                  {card.name}
                </h3>
                
                <div className="flex items-center gap-1 mb-2">
                  <span className={`text-xs px-2 py-0.5 rounded bg-gradient-to-r ${getRarityColor(card.rarity)} text-white`}>
                    {card.rarity.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Preço Atual</span>
                    <span className="text-[#00F0FF] font-bold">R$ {card.current_price.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Volume</span>
                    <span className="text-gray-300">{card.volume} vendas</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#00F0FF]/0 to-[#00F0FF]/0 
                          group-hover:from-[#00F0FF]/10 group-hover:to-transparent transition-all duration-300
                          pointer-events-none"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
