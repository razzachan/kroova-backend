'use client';

import { ReactNode, useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

/**
 * KROOVA 3D Booster Card - APENAS para boosters na página /boosters
 * Versão simplificada do HolographicCard sem containers visíveis
 * Com áudio de folhear booster
 */

interface BoosterCard3DProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

// Audio instance (singleton)
let boosterFlipAudio: HTMLAudioElement | null = null;

// Initialize audio on client side
if (typeof window !== 'undefined' && !boosterFlipAudio) {
  boosterFlipAudio = new Audio('/sfx/booster_flip.mp3');
  boosterFlipAudio.volume = 0.3; // Volume moderado
}

export default function BoosterCard3D({
  children,
  className,
  onClick,
}: BoosterCard3DProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isTouching, setIsTouching] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Inicializar áudio
  useEffect(() => {
    audioRef.current = new Audio('/sfx/booster_flip.mp3');
    audioRef.current.volume = 0.3; // 30% do volume
  }, []);

  // Tocar som quando começar a interagir
  const playShuffleSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0; // Reiniciar do início
      audioRef.current.play().catch(() => {
        // Ignorar erro se navegador bloquear autoplay
      });
    }
  };

  // Mouse tracking para parallax tilt (Desktop)
  useEffect(() => {
    if (!isHovered || isTouching) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!cardRef.current) return;

      const card = cardRef.current;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Rotação -20 a +20 graus (aumentada de 15 para 20)
      // Sensibilidade aumentada para movimentos mais pronunciados
      const rotateY = ((x - centerX) / centerX) * 20;
      const rotateX = ((centerY - y) / centerY) * 20;

      setRotation({ x: rotateX, y: rotateY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isHovered, isTouching]);

  // Touch tracking para parallax tilt (Mobile)
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!cardRef.current || !isTouching) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Rotação -20 a +20 graus
    const rotateY = ((x - centerX) / centerX) * 20;
    const rotateX = ((centerY - y) / centerY) * 20;

    setRotation({ x: rotateX, y: rotateY });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsTouching(true);
    setIsHovered(true);
    playShuffleSound(); // Tocar som ao tocar
    handleTouchMove(e);
  };

  const handleTouchEnd = () => {
    setIsTouching(false);
    setIsHovered(false);
    setRotation({ x: 0, y: 0 });
  };

  const handleMouseEnter = () => {
    if (!isTouching) {
      setIsHovered(true);
      playShuffleSound(); // Tocar som ao passar mouse
    }
  };

  const handleMouseLeave = () => {
    if (!isTouching) {
      setIsHovered(false);
      setRotation({ x: 0, y: 0 });
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={onClick}
      className={cn(
        'cursor-pointer transition-all duration-300 transform-gpu relative touch-none',
        className
      )}
      style={{
        transform: `
          perspective(1000px)
          rotateX(${rotation.x}deg)
          rotateY(${rotation.y}deg)
          ${isHovered ? 'translateZ(20px) scale(1.05)' : 'translateZ(0) scale(1)'}
        `,
        transformStyle: 'preserve-3d',
        willChange: 'transform',
      }}
    >
      {children}
    </div>
  );
}
