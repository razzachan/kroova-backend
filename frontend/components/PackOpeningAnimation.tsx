'use client';

import { useEffect, useState, useRef } from 'react';
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
  const packRef = useRef<HTMLDivElement>(null);
  const promptRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);

  // Smooth bounce using Web Animations API (hardware accelerated, 0 reflows)
  useEffect(() => {
    if (stage !== 'idle' || !promptRef.current) return;

    const animation = promptRef.current.animate(
      [
        { transform: 'translateX(-50%) translateY(0) translateZ(0)' },
        { transform: 'translateX(-50%) translateY(-12px) translateZ(0)' },
        { transform: 'translateX(-50%) translateY(0) translateZ(0)' }
      ],
      {
        duration: 2000,
        iterations: Infinity,
        easing: 'ease-in-out'
      }
    );

    return () => animation.cancel();
  }, [stage]);

  useEffect(() => {
    if (!clicked) return;

    // Shake animation using Web Animations API
    setStage('shaking');
    
    if (packRef.current) {
      packRef.current.animate(
        [
          { transform: 'translate3d(0, 0, 0) rotate(0deg)' },
          { transform: 'translate3d(-10px, -5px, 0) rotate(-2deg)' },
          { transform: 'translate3d(10px, 5px, 0) rotate(2deg)' },
          { transform: 'translate3d(-10px, 5px, 0) rotate(-1deg)' },
          { transform: 'translate3d(10px, -5px, 0) rotate(1deg)' },
          { transform: 'translate3d(-8px, -8px, 0) rotate(-2deg)' },
          { transform: 'translate3d(8px, 8px, 0) rotate(2deg)' },
          { transform: 'translate3d(-8px, 5px, 0) rotate(-1deg)' },
          { transform: 'translate3d(8px, -5px, 0) rotate(1deg)' },
          { transform: 'translate3d(-5px, -5px, 0) rotate(-1deg)' },
          { transform: 'translate3d(0, 0, 0) rotate(0deg)' }
        ],
        {
          duration: 600,
          easing: 'ease-in-out'
        }
      );
    }

    const shakeTimer = setTimeout(() => {
      setStage('exploding');
      cardAudio.playPackOpen();
      
      // Explosion animation
      if (packRef.current) {
        packRef.current.animate(
          [
            { transform: 'scale(1) translateZ(0)', opacity: 1 },
            { transform: 'scale(1.3) translateZ(0)', opacity: 0.8 },
            { transform: 'scale(2) translateZ(0)', opacity: 0 }
          ],
          {
            duration: 600,
            easing: 'ease-out',
            fill: 'forwards'
          }
        );
      }
      
      // Animate particles with Web Animations API
      if (particlesRef.current) {
        const particles = particlesRef.current.querySelectorAll('.particle');
        particles.forEach((particle, i) => {
          const angle = (i / particles.length) * Math.PI * 2;
          const distance = 150 + Math.random() * 100;
          const tx = Math.cos(angle) * distance;
          const ty = Math.sin(angle) * distance;
          
          (particle as HTMLElement).animate(
            [
              { transform: 'translate(0, 0) scale(0)', opacity: 0 },
              { transform: `translate(${tx}px, ${ty}px) scale(1)`, opacity: 1, offset: 0.5 },
              { transform: `translate(${tx * 1.5}px, ${ty * 1.5}px) scale(0.5)`, opacity: 0 }
            ],
            {
              duration: 1000,
              easing: 'ease-out'
            }
          );
        });
      }
    }, 600);

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
      {/* Background particles - 20 for robust effect */}
      <div ref={particlesRef} className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="particle absolute w-2 h-2 bg-yellow-400 rounded-full"
            style={{
              left: '50%',
              top: '50%',
              willChange: 'transform, opacity',
              transform: 'translateZ(0)',
            }}
          />
        ))}
      </div>

      {/* Pack */}
      <div
        ref={packRef}
        className="relative cursor-pointer"
        onClick={handleClick}
        style={{
          width: '400px',
          height: '580px',
          maxWidth: '90vw',
          maxHeight: '80vh',
          willChange: 'transform, opacity',
          transform: 'translateZ(0)',
        }}
      >
        {/* Glow effect */}
        {stage === 'idle' && (
          <div className="absolute inset-0 rounded-lg" style={{
            background: 'radial-gradient(circle, rgba(251, 191, 36, 0.3) 0%, transparent 70%)',
            animation: 'pulse 2s ease-in-out infinite',
          }} />
        )}

        {/* Pack image */}
        <img
          src={packImageUrl}
          alt="Booster Pack"
          className="w-full h-full object-contain drop-shadow-2xl"
          style={{
            willChange: 'transform',
            transform: 'translateZ(0)',
          }}
        />

        {/* Click prompt */}
        {stage === 'idle' && (
          <div 
            ref={promptRef}
            className="absolute bottom-8 left-1/2 text-white text-xl font-bold pointer-events-none"
            style={{
              transform: 'translateX(-50%) translateZ(0)',
              willChange: 'transform',
            }}
          >
            👆 Clique para abrir
          </div>
        )}

        {/* Explosion flash */}
        {stage === 'exploding' && (
          <div className="absolute inset-0 bg-white rounded-lg" style={{
            animation: 'flash 0.4s ease-out'
          }} />
        )}
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        
        @keyframes flash {
          0% { opacity: 0; }
          50% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
