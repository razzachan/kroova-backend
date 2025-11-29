'use client';

import { useEffect, useState } from 'react';
import { cardAudio } from '@/lib/cardAudio';

export interface CardsFlightAnimationProps {
  cardCount: number;
  onFlightComplete: () => void;
  packImageUrl?: string;
}

export function CardsFlightAnimation({ 
  cardCount,
  onFlightComplete,
  packImageUrl = '/pack-back-ed01.png'
}: CardsFlightAnimationProps) {
  const [showExplosion, setShowExplosion] = useState(true);
  const [showCards, setShowCards] = useState(false);

  useEffect(() => {
    // 🔊 Play card materialize sound
    cardAudio.playCardMaterialize();

    // Show explosion burst
    const explosionTimer = setTimeout(() => {
      setShowExplosion(false);
      setShowCards(true);
    }, 300);

    // Animation complete after cards fly out
    const completeTimer = setTimeout(() => {
      onFlightComplete();
    }, 1000);

    return () => {
      clearTimeout(explosionTimer);
      clearTimeout(completeTimer);
    };
  }, [cardCount, onFlightComplete]);

  return (
    <div className="fixed inset-0 z-40 pointer-events-none overflow-hidden"
      style={{
        backgroundImage: 'url(/backgrounds/portal-burst.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Explosion flash */}
      {showExplosion && (
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at center, rgba(255,255,255,0.8) 0%, rgba(138, 43, 226, 0.4) 30%, transparent 60%)',
            animation: 'explosionFlash 300ms ease-out',
          }}
        />
      )}

      {/* Cards flying out */}
      {showCards && Array.from({ length: cardCount }).map((_, i) => {
        const angle = (360 / cardCount) * i;
        const distance = 600;
        const finalX = Math.cos((angle * Math.PI) / 180) * distance;
        const finalY = Math.sin((angle * Math.PI) / 180) * distance;

        return (
          <div
            key={i}
            className="absolute top-1/2 left-1/2"
            style={{
              width: '160px',
              height: '230px',
              animation: `cardBurst 800ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards`,
              animationDelay: `${i * 30}ms`,
              '--final-x': `${finalX}px`,
              '--final-y': `${finalY}px`,
              '--rotation': `${angle + 720}deg`,
            } as any}
          >
            <img 
              src={packImageUrl}
              alt="Card"
              className="w-full h-full object-cover rounded-lg shadow-2xl"
              style={{
                filter: 'brightness(1.3) drop-shadow(0 0 20px rgba(138, 43, 226, 0.8))',
              }}
            />
          </div>
        );
      })}

      <style jsx>{`
        @keyframes explosionFlash {
          0% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(1.5); }
        }

        @keyframes cardBurst {
          0% {
            transform: translate(-50%, -50%) scale(0.3) rotate(0deg);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          100% {
            transform: translate(
              calc(-50% + var(--final-x)), 
              calc(-50% + var(--final-y))
            ) scale(0.5) rotate(var(--rotation));
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
