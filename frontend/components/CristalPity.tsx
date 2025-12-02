'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface CristalPityProps {
  averageProgress: number; // 0-100
}

export function CristalPity({ averageProgress }: CristalPityProps) {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation((prev) => (prev + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Evolutionary stages based on progress
  const getStage = () => {
    if (averageProgress >= 100) return 5; // DIVINE
    if (averageProgress >= 75) return 4;  // COSMIC
    if (averageProgress >= 50) return 3;  // CHARGED
    if (averageProgress >= 25) return 2;  // AWAKENING
    return 1; // DORMANT
  };

  const stage = getStage();

  const getCrystalImage = () => {
    switch (stage) {
      case 5: return '/assets/pity-crystal/crystal-divine.png';
      case 4: return '/assets/pity-crystal/crystal-cosmic.png';
      case 3: return '/assets/pity-crystal/crystal-charged.png';
      case 2: return '/assets/pity-crystal/crystal-awakening.png';
      default: return '/assets/pity-crystal/crystal-dormant.png';
    }
  };

  const getColors = () => {
    switch (stage) {
      case 5: return 'from-yellow-300 via-orange-500 to-red-600'; // DIVINE
      case 4: return 'from-purple-400 via-pink-500 to-purple-600'; // COSMIC
      case 3: return 'from-blue-400 via-cyan-500 to-blue-600'; // CHARGED
      case 2: return 'from-green-400 via-emerald-500 to-green-600'; // AWAKENING
      default: return 'from-gray-500 via-gray-600 to-gray-700'; // DORMANT
    }
  };

  const getGlow = () => {
    switch (stage) {
      case 5: return 'shadow-[0_0_60px_rgba(251,191,36,0.9)]';
      case 4: return 'shadow-[0_0_50px_rgba(168,85,247,0.8)]';
      case 3: return 'shadow-[0_0_40px_rgba(34,211,238,0.7)]';
      case 2: return 'shadow-[0_0_30px_rgba(52,211,153,0.6)]';
      default: return 'shadow-[0_0_20px_rgba(107,114,128,0.3)]';
    }
  };

  const getPulse = () => {
    if (stage >= 4) return 'animate-pulse';
    return '';
  };

  const getParticleCount = () => {
    return stage * 3; // 3, 6, 9, 12, 15 particles
  };

  return (
    <div className="relative flex items-center justify-center w-32 h-32">
      
      {/* Particle orbit */}
      <div className="absolute inset-0">
        {Array.from({ length: getParticleCount() }).map((_, i) => {
          const angle = (360 / getParticleCount()) * i + rotation;
          const radius = 50;
          const x = Math.cos((angle * Math.PI) / 180) * radius;
          const y = Math.sin((angle * Math.PI) / 180) * radius;
          
          return (
            <div
              key={i}
              className={`absolute w-1.5 h-1.5 rounded-full bg-gradient-to-r ${getColors()} ${getGlow()}`}
              style={{
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
                transform: 'translate(-50%, -50%)',
                opacity: 0.6 + (stage * 0.1)
              }}
            />
          );
        })}
      </div>

      {/* Crystal core - IMAGEM REAL */}
      <div className="relative w-24 h-24">
        <Image
          src={getCrystalImage()}
          alt={`Crystal ${stage}`}
          width={96}
          height={96}
          className={`object-contain ${getPulse()} ${getGlow()}`}
          style={{
            transform: `rotate(${rotation / 2}deg)`,
            filter: stage >= 4 ? 'drop-shadow(0 0 20px rgba(255,255,255,0.6))' : 'none'
          }}
        />
      </div>

      {/* Stage label */}
      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
        <span className={`text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r ${getColors()}`}>
          {stage === 5 && '✨ DIVINE'}
          {stage === 4 && '🌌 COSMIC'}
          {stage === 3 && '⚡ CHARGED'}
          {stage === 2 && '🌱 AWAKENING'}
          {stage === 1 && '💤 DORMANT'}
        </span>
      </div>
    </div>
  );
}
