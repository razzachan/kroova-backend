'use client';

import { ReactNode, useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

/**
 * KROOVA Holographic Card Wrapper
 * 
 * Transforms any card into a 3D holographic entity with:
 * - Parallax tilt effect (mouse tracking)
 * - Glitch animation on hover
 * - Breathing glow animation
 * - Holographic shine overlay
 * - Depth shadow layers
 * - Audio feedback ready
 * 
 * Usage:
 * <HolographicCard rarity="legendary">
 *   <YourCardContent />
 * </HolographicCard>
 */

interface HolographicCardProps {
  children: ReactNode;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary' | 'godmode';
  className?: string;
  onClick?: () => void;
  isRevealing?: boolean;
  disabled?: boolean;
}

const RARITY_COLORS = {
  common: {
    border: 'border-gray-500',
    glow: 'shadow-[0_0_20px_rgba(156,163,175,0.3)]',
    hoverGlow: 'hover:shadow-[0_0_40px_rgba(156,163,175,0.6)]',
    shine: 'from-gray-400/20 to-gray-600/20',
  },
  rare: {
    border: 'border-[#00F0FF]',
    glow: 'shadow-[0_0_20px_rgba(0,240,255,0.4)]',
    hoverGlow: 'hover:shadow-[0_0_40px_rgba(0,240,255,0.7)]',
    shine: 'from-[#00F0FF]/20 to-[#00F0FF]/40',
  },
  epic: {
    border: 'border-[#8B5CF6]',
    glow: 'shadow-[0_0_20px_rgba(139,92,246,0.4)]',
    hoverGlow: 'hover:shadow-[0_0_40px_rgba(139,92,246,0.7)]',
    shine: 'from-[#8B5CF6]/20 to-[#8B5CF6]/40',
  },
  legendary: {
    border: 'border-[#FF006D]',
    glow: 'shadow-[0_0_30px_rgba(255,0,109,0.5)]',
    hoverGlow: 'hover:shadow-[0_0_50px_rgba(255,0,109,0.8)]',
    shine: 'from-[#FF006D]/30 to-[#FFC700]/30',
  },
  godmode: {
    border: 'border-[#FFC700]',
    glow: 'shadow-[0_0_40px_rgba(255,199,0,0.6)]',
    hoverGlow: 'hover:shadow-[0_0_60px_rgba(255,199,0,0.9)]',
    shine: 'from-[#FFC700]/40 to-[#FF006D]/40',
  },
};

export default function HolographicCard({
  children,
  rarity = 'common',
  className,
  onClick,
  isRevealing = false,
  disabled = false,
}: HolographicCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [glitchOffset, setGlitchOffset] = useState({ x: 0, y: 0 });

  // Normalize rarity to valid values to prevent crashes
  const validRarity = (['common', 'rare', 'epic', 'legendary', 'godmode'].includes(rarity)) 
    ? rarity 
    : 'common';
  
  const colors = RARITY_COLORS[validRarity];

  // Mouse tracking for parallax tilt
  useEffect(() => {
    if (!isHovered || disabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!cardRef.current) return;

      const card = cardRef.current;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Calculate rotation (-15 to +15 degrees)
      const rotateY = ((x - centerX) / centerX) * 15;
      const rotateX = ((centerY - y) / centerY) * 15;

      setRotation({ x: rotateX, y: rotateY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isHovered, disabled]);

  // Glitch effect on hover
  useEffect(() => {
    if (!isHovered || disabled) return;

    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        setGlitchOffset({
          x: (Math.random() - 0.5) * 4,
          y: (Math.random() - 0.5) * 4,
        });
        setTimeout(() => setGlitchOffset({ x: 0, y: 0 }), 50);
      }
    }, 200);

    return () => clearInterval(glitchInterval);
  }, [isHovered, disabled]);

  // Reset on mouse leave
  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotation({ x: 0, y: 0 });
    setGlitchOffset({ x: 0, y: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => !disabled && setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={disabled ? undefined : onClick}
      className={cn(
        'relative cursor-pointer transition-all duration-300',
        'transform-gpu',
        disabled && 'cursor-not-allowed opacity-50',
        className
      )}
      style={{
        transform: `
          perspective(1000px)
          rotateX(${rotation.x}deg)
          rotateY(${rotation.y}deg)
          translateX(${glitchOffset.x}px)
          translateY(${glitchOffset.y}px)
          ${isHovered ? 'translateZ(20px) scale(1.05)' : 'translateZ(0) scale(1)'}
        `,
        transformStyle: 'preserve-3d',
        willChange: 'transform',
      }}
    >
      {/* Depth shadow layers */}
      <div
        className="absolute inset-0 rounded-lg opacity-50 blur-xl"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${
            rarity === 'godmode' ? '#FFC700' :
            rarity === 'legendary' ? '#FF006D' :
            rarity === 'epic' ? '#8B5CF6' :
            rarity === 'rare' ? '#00F0FF' : '#6B7280'
          }, transparent)`,
          transform: 'translateZ(-20px)',
        }}
      />

      {/* Container transparente - apenas para estrutura */}
      <div
        className="relative"
        style={{
          transform: 'translateZ(0)',
        }}
      >
        {/* Holographic shine overlay */}
        <div
          className={cn(
            'absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-300 rounded-lg',
            isHovered && 'opacity-100'
          )}
          style={{
            background: `linear-gradient(135deg, ${
              rarity === 'godmode' ? 'rgba(255,199,0,0.4), rgba(255,0,109,0.4)' :
              rarity === 'legendary' ? 'rgba(255,0,109,0.3), rgba(255,199,0,0.3)' :
              rarity === 'epic' ? 'rgba(139,92,246,0.2), rgba(139,92,246,0.4)' :
              rarity === 'rare' ? 'rgba(0,240,255,0.2), rgba(0,240,255,0.4)' :
              'rgba(156,163,175,0.2), rgba(156,163,175,0.4)'
            })`,
            transform: `translateX(${rotation.y * 2}px) translateY(${rotation.x * 2}px)`,
            mixBlendMode: 'screen',
          }}
        />

        {/* Scan lines */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent 0px, rgba(255,255,255,0.03) 1px, transparent 2px, transparent 4px)',
          }}
        />

        {/* Breathing glow animation */}
        <div
          className={cn(
            'absolute inset-0 pointer-events-none opacity-30',
            'transition-opacity duration-1000',
            isHovered && 'animate-pulse'
          )}
          style={{
            background: `radial-gradient(circle at center, ${
              rarity === 'godmode' ? 'rgba(255,199,0,0.3)' :
              rarity === 'legendary' ? 'rgba(255,0,109,0.3)' :
              rarity === 'epic' ? 'rgba(139,92,246,0.2)' :
              rarity === 'rare' ? 'rgba(0,240,255,0.2)' : 'rgba(156,163,175,0.1)'
            }, transparent 70%)`,
          }}
        />

        {/* Corner accents */}
        {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((corner) => (
          <div
            key={corner}
            className={cn(
              'absolute w-4 h-4 opacity-50 transition-opacity',
              isHovered && 'opacity-100',
              corner.includes('top') ? 'top-0' : 'bottom-0',
              corner.includes('left') ? 'left-0' : 'right-0'
            )}
            style={{
              borderTop: corner.includes('top') ? '2px solid currentColor' : 'none',
              borderBottom: corner.includes('bottom') ? '2px solid currentColor' : 'none',
              borderLeft: corner.includes('left') ? '2px solid currentColor' : 'none',
              borderRight: corner.includes('right') ? '2px solid currentColor' : 'none',
              color: rarity === 'godmode' ? '#FFC700' :
                     rarity === 'legendary' ? '#FF006D' :
                     rarity === 'epic' ? '#8B5CF6' :
                     rarity === 'rare' ? '#00F0FF' : '#6B7280',
            }}
          />
        ))}

        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>

        {/* Glitch chromatic aberration effect */}
        {isHovered && glitchOffset.x !== 0 && (
          <>
            <div
              className="absolute inset-0 pointer-events-none mix-blend-screen opacity-30"
              style={{
                transform: 'translateX(-2px)',
                filter: 'hue-rotate(90deg)',
              }}
            />
            <div
              className="absolute inset-0 pointer-events-none mix-blend-screen opacity-30"
              style={{
                transform: 'translateX(2px)',
                filter: 'hue-rotate(-90deg)',
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}
