 'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { cardAudio, triggerHaptic } from '@/lib/cardAudio';

export interface RevealedCard {
  id: string;
  name: string;
  rarity: string;
  image_url: string;
  skin?: string;
  liquidity_brl?: number;
  is_godmode?: boolean;
}

export function OpeningSession({
  cards,
  onCheckpoint,
  onReveal,
}: {
  cards: RevealedCard[];
  onCheckpoint?: (best: RevealedCard[]) => void;
  onReveal?: (card: RevealedCard, index: number) => void;
}) {
  const [revealed, setRevealed] = useState<boolean[]>(() => cards.map(() => false));
  const [burstAt, setBurstAt] = useState<Record<number, number>>({});
  const burstTimeouts = useRef<Record<number, number>>({});

  useEffect(() => {
    const timers: number[] = [];
    cards.forEach((_, i) => {
      const t = window.setTimeout(() => {
        setRevealed(prev => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
        // SFX + Haptic synchronized with flip
        const c = cards[i];
        cardAudio.playCardSound(c.rarity, !!c.is_godmode);
        triggerHaptic(c.rarity, !!c.is_godmode);
        // Particles burst
        setBurstAt(prev => ({ ...prev, [i]: Date.now() }));
        if (burstTimeouts.current[i]) window.clearTimeout(burstTimeouts.current[i]);
        burstTimeouts.current[i] = window.setTimeout(() => {
          setBurstAt(prev => { const n = { ...prev }; delete n[i]; return n; });
        }, 800);
        // External callback if provided
        onReveal?.(c, i);
      }, i * 500);
      timers.push(t);
    });
    return () => timers.forEach(t => clearTimeout(t));
  }, [cards]);

  const top3 = useMemo(() => {
    return [...cards]
      .sort((a, b) => (b.liquidity_brl || 0) - (a.liquidity_brl || 0))
      .slice(0, 3);
  }, [cards]);

  useEffect(() => {
    if (onCheckpoint) {
      const allRevealed = revealed.every(Boolean);
      if (allRevealed) onCheckpoint(top3);
    }
  }, [revealed, top3, onCheckpoint]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {cards.map((card, i) => (
        <CardFlip key={card.id || i} revealed={revealed[i]}>
          <div className="relative">
            <img
              src={card.image_url}
              alt={card.name}
              className="w-full h-auto rounded-lg shadow-lg"
            />
            {/* Godmode badge */}
            {card.is_godmode && (
              <div className="absolute top-2 right-2 bg-pink-600 text-white px-2 py-1 rounded text-xs font-bold">✨ GODMODE</div>
            )}
            {/* Near-miss animation: legendary but not godmode */}
            {!card.is_godmode && card.rarity === 'legendary' && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="animate-pulseSlow w-full h-full ring-2 ring-yellow-400 rounded-lg" />
              </div>
            )}
            {/* Particle burst on reveal */}
            {burstAt[i] && <ParticleBurst rarity={card.is_godmode ? 'epica' : card.rarity} />}
          </div>
          <div className="mt-2 text-xs text-gray-400">
            <span className="font-semibold">{card.name}</span>
          </div>
        </CardFlip>
      ))}
    </div>
  );
}

function CardFlip({ revealed, children }: { revealed: boolean; children: React.ReactNode }) {
  return (
    <div className="relative perspective">
      <div className={`preserve-3d transition-transform duration-500 ${revealed ? 'rotate-y-0' : 'rotate-y-180'}`}>
        <div className="backface-hidden">
          {/* Front: placeholder back */}
          <div className="w-full h-48 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white">
            <span className="text-lg font-bold">KROOVA PACK</span>
          </div>
        </div>
        <div className="backface-hidden rotate-y-180">
          {/* Back: actual card */}
          {children}
        </div>
      </div>
      <style jsx>{`
        .perspective { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .rotate-y-0 { transform: rotateY(0deg); }
        .backface-hidden { backface-visibility: hidden; }
        .animate-pulseSlow { animation: pulseSlow 1.6s ease-in-out infinite; }
        @keyframes pulseSlow {
          0% { opacity: 0.2; }
          50% { opacity: 0.6; }
          100% { opacity: 0.2; }
        }
      `}</style>
    </div>
  );
}

function ParticleBurst({ rarity }: { rarity: string }) {
  const colors: Record<string, string[]> = {
    trash: ['#9CA3AF'],
    meme: ['#60A5FA', '#93C5FD'],
    viral: ['#A78BFA', '#C4B5FD'],
    legendary: ['#FBBF24', '#FCD34D'],
    epica: ['#EC4899', '#8B5CF6', '#22D3EE'],
  };
  const palette = colors[rarity] || colors.trash;
  const dots = Array.from({ length: 20 });
  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible">
      {dots.map((_, i) => {
        const angle = (i / dots.length) * Math.PI * 2;
        const distance = 40 + (i % 5) * 8;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        const color = palette[i % palette.length];
        const delay = (i % 5) * 20;
        return (
          <span
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full animate-burst"
            style={{ left: '50%', top: '50%', backgroundColor: color, transform: `translate(-50%, -50%) translate(${x}px, ${y}px)` as any, animationDelay: `${delay}ms` }}
          />
        );
      })}
      <style jsx>{`
        @keyframes burst {
          0% { opacity: 0; transform: scale(0.5); }
          20% { opacity: 1; }
          100% { opacity: 0; transform: scale(1); }
        }
        .animate-burst { animation: burst 0.6s ease-out forwards; }
      `}</style>
    </div>
  );
}
