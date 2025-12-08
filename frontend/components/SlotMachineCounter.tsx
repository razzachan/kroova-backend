'use client';

import { useEffect, useState } from 'react';

interface SlotMachineCounterProps {
  targetValue: number;
  duration?: number; // milliseconds
  onComplete?: () => void;
}

export function SlotMachineCounter({ 
  targetValue, 
  duration = 2000,
  onComplete 
}: SlotMachineCounterProps) {
  const [currentValue, setCurrentValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    const startTime = Date.now();
    const endTime = startTime + duration;

    // Easing function - starts slow, speeds up, slows down at end (cubic ease-in-out)
    const easeInOutCubic = (t: number): number => {
      return t < 0.5 
        ? 4 * t * t * t 
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const easedProgress = easeInOutCubic(progress);
      const value = easedProgress * targetValue;
      
      setCurrentValue(value);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCurrentValue(targetValue);
        setIsAnimating(false);
        onComplete?.();
      }
    };

    requestAnimationFrame(animate);

    // Optional: play ticking sound during animation
    // This would require adding sound effects to cardAudio
  }, [targetValue, duration, onComplete]);

  return (
    <div className="relative inline-block">
      <span 
        className={`text-3xl font-bold font-mono tabular-nums transition-all ${
          isAnimating ? 'text-yellow-300 animate-pulse' : 'text-white'
        }`}
        style={{
          textShadow: isAnimating 
            ? '0 0 10px rgba(250, 204, 21, 0.8), 0 0 20px rgba(250, 204, 21, 0.4)' 
            : '0 2px 4px rgba(0,0,0,0.3)'
        }}
      >
        R$ {currentValue.toFixed(2)}
      </span>
      
      {/* Glow effect during animation */}
      {isAnimating && (
        <div 
          className="absolute inset-0 blur-md bg-yellow-400/30 rounded-lg -z-10"
          style={{
            animation: 'pulse 0.5s ease-in-out infinite'
          }}
        />
      )}
    </div>
  );
}
