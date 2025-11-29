'use client';

import { useEffect, useState, ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * KROOVA Text Glitch
 * 
 * Text appears with reconstruction effect:
 * - Letters arrive in random order
 * - Glitch characters during reconstruction
 * - Final stable state
 * - Looks like Interface processing text
 */

interface TextGlitchProps {
  children: string;
  className?: string;
  delay?: number; // ms before starting
  speed?: number; // ms per character
  glitchChars?: string;
}

const DEFAULT_GLITCH_CHARS = '█▓▒░!@#$%^&*()_+-=[]{}|;:,.<>?/~`';

export default function TextGlitch({
  children,
  className,
  delay = 0,
  speed = 50,
  glitchChars = DEFAULT_GLITCH_CHARS,
}: TextGlitchProps) {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (delay > 0) {
      const delayTimeout = setTimeout(() => {
        startGlitch();
      }, delay);
      return () => clearTimeout(delayTimeout);
    } else {
      startGlitch();
    }
  }, []);

  const startGlitch = () => {
    const chars = children.split('');
    const indices = chars.map((_, i) => i);
    
    // Shuffle indices for random reveal order
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    let revealed = new Array(chars.length).fill(false);
    let current = 0;

    const interval = setInterval(() => {
      if (current >= indices.length) {
        clearInterval(interval);
        setDisplayText(children);
        setIsComplete(true);
        return;
      }

      const revealIndex = indices[current];
      revealed[revealIndex] = true;

      const display = chars.map((char, i) => {
        if (char === ' ') return ' ';
        if (revealed[i]) return char;
        return glitchChars[Math.floor(Math.random() * glitchChars.length)];
      }).join('');

      setDisplayText(display);
      setCurrentIndex(current);
      current++;
    }, speed);

    return () => clearInterval(interval);
  };

  return (
    <span
      className={cn(
        'inline-block font-mono',
        !isComplete && 'animate-glitch-text',
        className
      )}
      style={{
        textShadow: !isComplete
          ? '0 0 5px rgba(0, 240, 255, 0.5), 0 0 10px rgba(255, 0, 109, 0.3)'
          : 'none',
      }}
    >
      {displayText || children}
    </span>
  );
}
