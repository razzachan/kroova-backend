 'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { cardAudio, triggerHaptic } from '@/lib/cardAudio';
import { EffectFrame, resolveEffectFromSkinOrRarity } from '@/components/card-effects/EffectFrame';
import { CardFrame, resolveFrameFromSkinOrMeta } from '@/components/card-frames/Frame';

export interface RevealedCard {
  id: string;
  name: string;
  rarity: string;
  image_url: string;
  skin?: string;
  liquidity_brl?: number;
  is_godmode?: boolean;
  effect?: string;
  frame?: string;
}

export function OpeningSession({
  cards,
  onCheckpoint,
  onReveal,
  mode = 'interactive',
}: {
  cards: RevealedCard[];
  onCheckpoint?: (best: RevealedCard[]) => void;
  onReveal?: (card: RevealedCard, index: number) => void;
  mode?: 'interactive' | 'auto';
}) {
  const [revealed, setRevealed] = useState<boolean[]>(() => cards.map(() => false));
  const [burstAt, setBurstAt] = useState<Record<number, number>>({});
  const [shakeAt, setShakeAt] = useState<Record<number, boolean>>({});
  const [showCards, setShowCards] = useState(false);
  const burstTimeouts = useRef<Record<number, number>>({});

  // Entrada dramática: cartas aparecem com delay
  useEffect(() => {
    // Play pack rip sound on mount
    cardAudio.playPackOpen();
    const t = setTimeout(() => setShowCards(true), 300);
    return () => clearTimeout(t);
  }, []);

  // Auto mode: reveal sequentially with timers
  useEffect(() => {
    if (mode !== 'auto') return;
    const timers: number[] = [];
    cards.forEach((_, i) => {
      const t = window.setTimeout(() => {
        revealIndex(i);
      }, i * 500);
      timers.push(t);
    });
    return () => timers.forEach(t => clearTimeout(t));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards, mode]);

  function revealIndex(i: number) {
    setRevealed(prev => {
      if (prev[i]) return prev;
      const next = [...prev];
      next[i] = true;
      return next;
    });
    const c = cards[i];
    cardAudio.playCardSound(c.rarity, !!c.is_godmode);
    triggerHaptic(c.rarity, !!c.is_godmode);
    setBurstAt(prev => ({ ...prev, [i]: Date.now() }));
    
    // Shake effect for legendary/godmode
    if (c.is_godmode || c.rarity === 'legendary' || c.rarity === 'epica') {
      setShakeAt(prev => ({ ...prev, [i]: true }));
      setTimeout(() => {
        setShakeAt(prev => ({ ...prev, [i]: false }));
      }, 500);
    }
    
    if (burstTimeouts.current[i]) window.clearTimeout(burstTimeouts.current[i]);
    burstTimeouts.current[i] = window.setTimeout(() => {
      setBurstAt(prev => { const n = { ...prev }; delete n[i]; return n; });
    }, 1200);
    onReveal?.(c, i);
  }

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
    <div className="relative">
      {/* Explosion flash */}
      {!showCards && (
        <div className="absolute inset-0 bg-gradient-radial from-yellow-400/30 via-transparent to-transparent animate-pulse" />
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {cards.map((card, i) => {
          // Fan layout positions (arc effect)
          const totalCards = cards.length;
          const offset = i - (totalCards - 1) / 2;
          const arcY = Math.abs(offset) * 8; // Vertical curve
          const rotation = offset * 3; // Slight rotation
          const delay = i * 80; // Stagger appearance
          
          return (
            <div 
              key={card.id || i} 
              className="flex flex-col"
              style={{
                opacity: showCards ? 1 : 0,
                transform: showCards 
                  ? `translateY(0) rotate(0deg)` 
                  : `translateY(-100px) rotate(${rotation}deg)`,
                transition: `all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}ms`,
              }}
            >
              <CardFlip 
                revealed={revealed[i]} 
                onClick={() => revealIndex(i)} 
                rarity={card.rarity}
                shake={shakeAt[i]}
                index={i}
                totalCards={totalCards}
              >
                <div className="relative w-full h-full rounded-lg shadow-md ring-2 ring-gray-700 overflow-hidden">
              <img
                src={card.image_url}
                alt={card.name}
                className="w-full h-full object-cover"
              />
              {/* Holographic shimmer overlay */}
              {revealed[i] && (card.rarity === 'legendary' || card.rarity === 'epica' || card.is_godmode) && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/20 to-transparent animate-shimmer" 
                    style={{
                      backgroundSize: '200% 200%',
                      mixBlendMode: 'overlay'
                    }}
                  />
                </div>
              )}
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
              {/* Ray burst for legendary/godmode */}
              {burstAt[i] && (card.is_godmode || card.rarity === 'legendary' || card.rarity === 'epica') && (
                <RayBurst active={true} />
              )}
              {/* God Rays for legendary/godmode */}
              {burstAt[i] && (card.is_godmode || card.rarity === 'legendary' || card.rarity === 'epica') && (
                <GodRays intensity={card.is_godmode ? 'epic' : 'legendary'} />
              )}
            </div>
          </CardFlip>
          {revealed[i] && (
            <div className="mt-2 text-xs text-gray-300 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{card.name}</span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-gray-800 border border-gray-700">R$ {(card.liquidity_brl || 0).toFixed(2)}</span>
              </div>
              <div className="text-[11px] text-gray-500">{card.skin || 'default'} • {card.rarity}</div>
            </div>
          )}
        </div>
      );
    })}
    </div>
  </div>
  );
}

function CardFlip({ revealed, children, onClick, rarity, shake, index, totalCards }: { 
  revealed: boolean; 
  children: React.ReactNode; 
  onClick?: () => void; 
  rarity?: string;
  shake?: boolean;
  index?: number;
  totalCards?: number;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (revealed) return; // Only parallax on unrevealed cards
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setParallax({ x: -x * 15, y: y * 15 }); // Increased tilt
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setParallax({ x: 0, y: 0 });
  };

  // Rarity glow colors (Hearthstone-style) - INTENSIFIED
  const rarityGlows: Record<string, string> = {
    trash: 'none',
    meme: '0 0 30px #60A5FA, 0 0 60px #60A5FA, 0 0 90px #3B82F6',
    viral: '0 0 40px #A78BFA, 0 0 80px #A78BFA, 0 0 120px #8B5CF6',
    legendary: '0 0 50px #FBBF24, 0 0 100px #FBBF24, 0 0 150px #F59E0B',
    epica: '0 0 60px #EC4899, 0 0 120px #EC4899, 0 0 180px #F472B6',
  };

  const glow = !revealed && isHovered && rarity ? rarityGlows[rarity] || 'none' : 'none';
  const pulseGlow = !revealed && !isHovered && rarity && ['legendary', 'epica'].includes(rarity);

  return (
    <div 
      className={`relative cursor-pointer group ${pulseGlow ? 'animate-pulse-glow' : ''} ${shake ? 'animate-shake' : ''}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Flip container with 3:4 aspect ratio */}
      <div 
        className="relative w-full" 
        style={{ 
          perspective: '1000px', 
          aspectRatio: '3/4',
          transform: isHovered && !revealed 
            ? `translateY(-12px) scale(1.08) perspective(1200px) rotateX(${parallax.y}deg) rotateY(${parallax.x}deg)` 
            : 'none',
          boxShadow: glow !== 'none' ? glow : '0 4px 8px rgba(0,0,0,0.2)',
          transition: 'all 0.15s ease-out',
          filter: isHovered && !revealed ? 'brightness(1.15)' : 'none'
        }}
      >
        <div 
          className="relative w-full h-full"
          style={{ 
            transformStyle: 'preserve-3d',
            transform: revealed ? 'rotateY(180deg)' : 'rotateY(0deg)',
            willChange: 'transform',
            transition: 'transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
            WebkitBackfaceVisibility: 'hidden',
            backfaceVisibility: 'hidden'
          }}
        >
          {/* Front: pack back (before reveal) */}
          <div 
            className="absolute inset-0"
            style={{ 
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'translateZ(1px)'
            }}
          >
            <img
              src="/pack-back-ed01.png"
              alt="KROOVA PACK"
              className="w-full h-full object-cover rounded-lg"
              loading="eager"
            />
          </div>
          {/* Back: revealed card face */}
          <div 
            className="absolute inset-0"
            style={{ 
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg) translateZ(1px)'
            }}
          >
            {children}
          </div>
        </div>
      </div>
      <style jsx>{`
        .animate-pulseSlow { animation: pulseSlow 1.6s ease-in-out infinite; }
        @keyframes pulseSlow {
          0% { opacity: 0.2; }
          50% { opacity: 0.6; }
          100% { opacity: 0.2; }
        }
        .animate-pulse-glow {
          animation: pulse-glow 1.5s ease-in-out infinite;
        }
        @keyframes pulse-glow {
          0%, 100% { 
            box-shadow: 0 0 15px rgba(251, 191, 36, 0.4);
            filter: brightness(1);
          }
          50% { 
            box-shadow: 0 0 40px rgba(251, 191, 36, 0.8), 0 0 80px rgba(251, 191, 36, 0.4);
            filter: brightness(1.2);
          }
        }
        .animate-shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97);
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px) rotate(-1deg); }
          20%, 40%, 60%, 80% { transform: translateX(4px) rotate(1deg); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-shimmer {
          animation: shimmer 2.5s linear infinite;
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}

function ParticleBurst({ rarity }: { rarity: string }) {
  const colors: Record<string, string[]> = {
    trash: ['#9CA3AF', '#6B7280'],
    meme: ['#60A5FA', '#93C5FD', '#3B82F6'],
    viral: ['#A78BFA', '#C4B5FD', '#8B5CF6'],
    legendary: ['#FBBF24', '#FCD34D', '#F59E0B', '#FDE047'],
    epica: ['#EC4899', '#8B5CF6', '#22D3EE', '#F472B6', '#A78BFA'],
  };
  const palette = colors[rarity] || colors.trash;
  const particleCount = ['legendary', 'epica'].includes(rarity) ? 40 : 25;
  const dots = Array.from({ length: particleCount });
  
  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible" style={{ zIndex: 100 }}>
      {/* Core explosion flash */}
      <div className="absolute inset-0 bg-gradient-radial from-white via-transparent to-transparent opacity-80 animate-flash" />
      
      {/* Particles */}
      {dots.map((_, i) => {
        const angle = (i / dots.length) * Math.PI * 2;
        const distance = 50 + (i % 6) * 15;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        const color = palette[i % palette.length];
        const delay = (i % 6) * 25;
        const size = ['legendary', 'epica'].includes(rarity) ? 2.5 : 2;
        return (
          <span
            key={i}
            className="absolute rounded-full animate-burst"
            style={{ 
              left: '50%', 
              top: '50%', 
              width: `${size}px`,
              height: `${size}px`,
              backgroundColor: color, 
              transform: `translate(-50%, -50%)`,
              animationDelay: `${delay}ms`,
              boxShadow: `0 0 ${size * 3}px ${color}`,
              '--burst-x': `${x}px`,
              '--burst-y': `${y}px`
            } as any}
          />
        );
      })}
      
      <style jsx>{`
        @keyframes burst {
          0% { 
            opacity: 0; 
            transform: translate(-50%, -50%) scale(0.3);
          }
          20% { 
            opacity: 1; 
          }
          100% { 
            opacity: 0; 
            transform: translate(calc(-50% + var(--burst-x)), calc(-50% + var(--burst-y))) scale(1.8);
          }
        }
        .animate-burst { 
          animation: burst 1s cubic-bezier(0.33, 1, 0.68, 1) forwards; 
        }
        @keyframes flash {
          0% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 0.8; transform: scale(1.5); }
          100% { opacity: 0; transform: scale(2); }
        }
        .animate-flash {
          animation: flash 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}

function RayBurst({ active }: { active: boolean }) {
  if (!active) return null;
  
  const rayCount = 20;
  const rays = Array.from({ length: rayCount });
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 99 }}>
      {/* Center glow */}
      <div className="absolute top-1/2 left-1/2 w-32 h-32 -translate-x-1/2 -translate-y-1/2 bg-gradient-radial from-yellow-300/60 via-yellow-400/30 to-transparent rounded-full animate-expand" />
      
      {/* Rays */}
      {rays.map((_, i) => {
        const rotation = i * (360 / rayCount);
        const delay = i * 20;
        return (
          <div
            key={i}
            className="absolute top-1/2 left-1/2 origin-top animate-ray"
            style={{
              width: '3px',
              height: '150%',
              background: 'linear-gradient(to bottom, rgba(251, 191, 36, 0.9), rgba(251, 191, 36, 0.6) 40%, transparent 70%)',
              transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
              animationDelay: `${delay}ms`,
              boxShadow: '0 0 8px rgba(251, 191, 36, 0.6)'
            }}
          />
        );
      })}
      
      <style jsx>{`
        @keyframes ray {
          0% { 
            opacity: 0; 
            height: 0%; 
            filter: blur(4px);
          }
          40% { 
            opacity: 1; 
            height: 150%; 
            filter: blur(0px);
          }
          100% { 
            opacity: 0; 
            height: 150%; 
            filter: blur(2px);
          }
        }
        .animate-ray { 
          animation: ray 1s ease-out forwards; 
        }
        @keyframes expand {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
        }
        .animate-expand {
          animation: expand 0.8s ease-out;
        }
      `}</style>
    </div>
  );
}

// God Rays component
function GodRays({ intensity }: { intensity: 'legendary' | 'epic' }) {
  const rayCount = intensity === 'epic' ? 12 : 8;
  const color = intensity === 'epic' ? 'rgba(220, 38, 127, 0.4)' : 'rgba(251, 191, 36, 0.3)';
  
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: rayCount }).map((_, i) => {
        const angle = (360 / rayCount) * i;
        return (
          <div
            key={i}
            className="absolute left-1/2 top-1/2 origin-bottom animate-godRay"
            style={{
              width: '4px',
              height: '200%',
              background: `linear-gradient(to top, ${color} 0%, transparent 100%)`,
              transform: `translate(-50%, -100%) rotate(${angle}deg)`,
              animationDelay: `${i * 50}ms`,
            }}
          />
        );
      })}
      <style jsx>{`
        @keyframes godRay {
          0% {
            opacity: 0;
            transform: translate(-50%, -100%) rotate(var(--angle)) scaleY(0);
          }
          20% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -100%) rotate(var(--angle)) scaleY(1.2);
          }
        }
        .animate-godRay {
          animation: godRay 1.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
