'use client';

import { useEffect, useState } from 'react';

interface PityExplosionProps {
  type: 'legendary' | 'godmode';
  onComplete: () => void;
}

export function PityExplosion({ type, onComplete }: PityExplosionProps) {
  const [particles, setParticles] = useState<Array<{ x: number; y: number; vx: number; vy: number; color: string; size: number }>>([]);
  const [shake, setShake] = useState(false);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    // Initial effects
    if (type === 'godmode') {
      setShake(true);
      setTimeout(() => setShake(false), 1000);
    }
    
    setFlash(true);
    setTimeout(() => setFlash(false), 300);

    // Generate particles
    const particleCount = type === 'godmode' ? 150 : 80;
    const colors = type === 'godmode' 
      ? ['#fbbf24', '#f59e0b', '#ef4444', '#dc2626', '#ffffff'] // gold/red/white
      : ['#a855f7', '#ec4899', '#f472b6', '#c084fc', '#ffffff']; // purple/pink/white

    const newParticles = Array.from({ length: particleCount }).map(() => ({
      x: 50, // center
      y: 50,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 8 - 2, // slight upward bias
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4
    }));

    setParticles(newParticles);

    // Animate particles
    const interval = setInterval(() => {
      setParticles((prev) =>
        prev.map((p) => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vy: p.vy + 0.2, // gravity
          vx: p.vx * 0.98 // air resistance
        }))
      );
    }, 16);

    // Auto complete after animation
    const timeout = setTimeout(() => {
      onComplete();
    }, type === 'godmode' ? 3000 : 2000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [type, onComplete]);

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      
      {/* Flash overlay */}
      {flash && (
        <div
          className={`absolute inset-0 transition-opacity duration-300 ${
            type === 'godmode' 
              ? 'bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600'
              : 'bg-gradient-to-br from-purple-600 via-pink-500 to-purple-600'
          }`}
          style={{ opacity: flash ? 0.6 : 0 }}
        />
      )}

      {/* Screen shake container */}
      <div
        className={shake ? 'animate-shake' : ''}
        style={{
          animation: shake ? 'shake 0.5s ease-in-out' : 'none'
        }}
      >
        {/* Particles */}
        {particles.map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color,
              boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
              opacity: Math.max(0, 1 - (Math.abs(p.x - 50) + Math.abs(p.y - 50)) / 100),
              transition: 'all 0.016s linear'
            }}
          />
        ))}
      </div>

      {/* Center text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={`text-6xl font-black text-transparent bg-clip-text animate-pulse ${
            type === 'godmode'
              ? 'bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500'
              : 'bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600'
          }`}
          style={{
            textShadow: type === 'godmode' 
              ? '0 0 40px rgba(251,191,36,0.8), 0 0 80px rgba(251,191,36,0.4)'
              : '0 0 30px rgba(168,85,247,0.8), 0 0 60px rgba(168,85,247,0.4)',
            animation: 'scaleIn 0.5s ease-out'
          }}
        >
          {type === 'godmode' ? '👑 GODMODE!' : '💎 LEGENDARY!'}
        </div>
      </div>

      {/* Inline keyframes */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          10% { transform: translate(-5px, -5px) rotate(-2deg); }
          20% { transform: translate(5px, 5px) rotate(2deg); }
          30% { transform: translate(-5px, 5px) rotate(-1deg); }
          40% { transform: translate(5px, -5px) rotate(1deg); }
          50% { transform: translate(-3px, -3px) rotate(-0.5deg); }
          60% { transform: translate(3px, 3px) rotate(0.5deg); }
          70% { transform: translate(-3px, 3px) rotate(-0.5deg); }
          80% { transform: translate(3px, -3px) rotate(0.5deg); }
          90% { transform: translate(-2px, -2px) rotate(-0.2deg); }
        }

        @keyframes scaleIn {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
