'use client';

import { useEffect, useState } from 'react';
import { cardAudio } from '@/lib/cardAudio';

export interface PackOpeningAnimationProps {
  packImageUrl?: string;
  onOpenComplete: () => void;
}

export function PackOpeningAnimation({ 
  packImageUrl = '/pack-back-ed01.png',
  onOpenComplete 
}: PackOpeningAnimationProps) {
  const [stage, setStage] = useState<'idle' | 'shaking' | 'exploding' | 'complete'>('idle');
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    if (!clicked) return;

    // Shake animation
    setStage('shaking');
    const shakeTimer = setTimeout(() => {
      setStage('exploding');
      cardAudio.playPackOpen();
    }, 600);

    // Explosion complete
    const explodeTimer = setTimeout(() => {
      setStage('complete');
      onOpenComplete();
    }, 1200);

    return () => {
      clearTimeout(shakeTimer);
      clearTimeout(explodeTimer);
    };
  }, [clicked, onOpenComplete]);

  const handleClick = () => {
    if (stage === 'idle') {
      setClicked(true);
    }
  };

  if (stage === 'complete') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
      {/* Background particles */}
      {stage !== 'idle' && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-yellow-400 rounded-full animate-sparkle"
              style={{
                left: `${50 + (Math.random() - 0.5) * 100}%`,
                top: `${50 + (Math.random() - 0.5) * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Pack */}
      <div
        className={`relative cursor-pointer transition-all duration-300 ${
          stage === 'idle' ? 'hover:scale-105' : ''
        } ${stage === 'shaking' ? 'animate-shake-intense' : ''} ${
          stage === 'exploding' ? 'animate-explode' : ''
        }`}
        onClick={handleClick}
        style={{
          width: '400px',
          height: '580px',
          maxWidth: '90vw',
          maxHeight: '80vh',
        }}
      >
        {/* Glow effect */}
        {stage === 'idle' && (
          <div className="absolute inset-0 bg-gradient-radial from-yellow-400/30 via-transparent to-transparent animate-pulse-slow rounded-lg" />
        )}

        {/* Pack image */}
        <img
          src={packImageUrl}
          alt="Booster Pack"
          className="w-full h-full object-contain drop-shadow-2xl"
          style={{
            filter: stage === 'exploding' ? 'brightness(2) blur(8px)' : 'none',
          }}
        />

        {/* Click prompt */}
        {stage === 'idle' && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white text-xl font-bold animate-bounce">
            👆 Clique para abrir
          </div>
        )}

        {/* Explosion flash */}
        {stage === 'exploding' && (
          <div className="absolute inset-0 bg-white animate-flash rounded-lg" />
        )}
      </div>

      <style jsx>{`
        @keyframes shake-intense {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          10% { transform: translate(-10px, -5px) rotate(-2deg); }
          20% { transform: translate(10px, 5px) rotate(2deg); }
          30% { transform: translate(-10px, 5px) rotate(-1deg); }
          40% { transform: translate(10px, -5px) rotate(1deg); }
          50% { transform: translate(-8px, -8px) rotate(-2deg); }
          60% { transform: translate(8px, 8px) rotate(2deg); }
          70% { transform: translate(-8px, 5px) rotate(-1deg); }
          80% { transform: translate(8px, -5px) rotate(1deg); }
          90% { transform: translate(-5px, -5px) rotate(-1deg); }
        }
        .animate-shake-intense {
          animation: shake-intense 0.6s ease-in-out;
        }

        @keyframes explode {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.3);
            opacity: 0.8;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        .animate-explode {
          animation: explode 0.6s ease-out forwards;
        }

        @keyframes flash {
          0% { opacity: 0; }
          50% { opacity: 1; }
          100% { opacity: 0; }
        }
        .animate-flash {
          animation: flash 0.4s ease-out;
        }

        @keyframes sparkle {
          0% {
            transform: translate(0, 0) scale(0);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translate(var(--tx), var(--ty)) scale(1);
            opacity: 0;
          }
        }
        .animate-sparkle {
          animation: sparkle 1s ease-out forwards;
          --tx: calc((random() - 0.5) * 400px);
          --ty: calc((random() - 0.5) * 400px);
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
