// ============================================================================
// FLOOR PRICE CARD - Component
// Card de floor price por raridade
// ============================================================================

'use client';

interface FloorPriceCardProps {
  rarity: string;
  price: number | null;
  change24h?: number;
}

export function FloorPriceCard({ rarity, price, change24h }: FloorPriceCardProps) {
  const getRarityConfig = (rarity: string) => {
    const configs: Record<string, { emoji: string; color: string; label: string }> = {
      legendary: { emoji: '👑', color: 'from-yellow-500 to-orange-500', label: 'Legendary' },
      viral: { emoji: '⚡', color: 'from-cyan-500 to-blue-500', label: 'Viral' },
      meme: { emoji: '😂', color: 'from-pink-500 to-purple-500', label: 'Meme' },
      trash: { emoji: '💩', color: 'from-gray-500 to-gray-600', label: 'Trash' }
    };
    return configs[rarity] || configs.trash;
  };

  const config = getRarityConfig(rarity);

  return (
    <div className="relative bg-gradient-to-br from-gray-900 to-black rounded-lg p-4 border border-gray-800
                  hover:border-[#00F0FF] transition-all duration-300 hover:scale-105
                  hover:shadow-[0_0_20px_rgba(0,240,255,0.2)]">
      {/* Emoji */}
      <div className="text-3xl mb-2">{config.emoji}</div>

      {/* Label */}
      <p className={`text-sm font-bold mb-1 bg-gradient-to-r ${config.color} bg-clip-text text-transparent`}>
        {config.label}
      </p>

      {/* Price */}
      {price !== null ? (
        <>
          <p className="text-2xl font-bold text-white mb-1">
            R$ {price.toFixed(2)}
          </p>
          
          {/* Change 24h */}
          {change24h !== undefined && (
            <div className={`
              inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded
              ${change24h >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}
            `}>
              {change24h >= 0 ? '▲' : '▼'} {Math.abs(change24h).toFixed(1)}%
            </div>
          )}
        </>
      ) : (
        <p className="text-gray-500 text-sm">Sem ofertas</p>
      )}

      {/* Glow effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.color} opacity-0 hover:opacity-10 
                    transition-opacity duration-300 rounded-lg pointer-events-none`}></div>
    </div>
  );
}
