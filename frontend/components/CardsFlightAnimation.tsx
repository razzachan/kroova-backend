'use client';

import { useEffect, useState } from 'react';

export interface CardsFlightAnimationProps {
  cardCount: number;
  onFlightComplete: () => void;
}

export function CardsFlightAnimation({ 
  cardCount,
  onFlightComplete 
}: CardsFlightAnimationProps) {
  const [cards, setCards] = useState<number[]>([]);

  useEffect(() => {
    // Generate card indices
    setCards(Array.from({ length: cardCount }, (_, i) => i));

    // Animation complete after all cards land
    const timer = setTimeout(() => {
      onFlightComplete();
    }, 700 + cardCount * 80);

    return () => clearTimeout(timer);
  }, [cardCount, onFlightComplete]);

  return (
    <div className="fixed inset-0 z-40 pointer-events-none overflow-hidden">
      {cards.map((i) => {
        // Calculate arc positions
        const totalCards = cardCount;
        const offset = i - (totalCards - 1) / 2;
        const arcHeight = Math.abs(offset) * 30;
        const finalX = offset * 180; // Horizontal spacing
        const finalY = arcHeight; // Arc curve
        const rotation = offset * 8; // Rotation angle
        const delay = i * 80; // Stagger effect (faster)

        return (
          <div
            key={i}
            className="absolute top-1/2 left-1/2 animate-card-flight"
            style={{
              width: '140px',
              height: '202px',
              '--delay': `${delay}ms`,
              '--final-x': `${finalX}px`,
              '--final-y': `${finalY}px`,
              '--rotation': `${rotation}deg`,
              animationDelay: `${delay}ms`,
              willChange: 'transform, opacity',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            } as any}
          >
            <div className="w-full h-full relative">
              {/* Card back (glowing) */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-yellow-600 via-yellow-500 to-yellow-700 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-lg" />
                <div className="absolute inset-2 border-2 border-yellow-300/50 rounded-lg" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-6xl animate-spin-slow">✨</div>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      <style jsx>{`
        @keyframes card-flight {
          0% {
            transform: translate(-50%, -50%) translateY(-200px) scale(0.5) translateZ(0);
            opacity: 0;
          }
          100% {
            transform: translate(
              calc(-50% + var(--final-x)), 
              calc(-50% + var(--final-y))
            ) rotate(var(--rotation)) scale(1) translateZ(0);
            opacity: 1;
          }
        }
        .animate-card-flight {
          animation: card-flight 600ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
}
