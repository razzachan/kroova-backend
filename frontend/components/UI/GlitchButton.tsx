'use client';

import { ButtonHTMLAttributes, ReactNode, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { cardAudio } from '@/lib/cardAudio';

/**
 * KROOVA Glitch Button
 * 
 * Signature button component with:
 * - Neon border glow (magenta/cyan)
 * - Ripple effect on click
 * - Subtle glitch on hover
 * - Audio feedback integration ready
 * - No perfect rectangles (subtle corner distortion)
 * 
 * Variants:
 * - primary: Magenta glow
 * - secondary: Cyan glow
 * - success: Amber glow
 * - danger: Red glow
 */

interface GlitchButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  glitchIntensity?: 'subtle' | 'medium' | 'intense';
  isLoading?: boolean;
}

const VARIANT_STYLES = {
  primary: {
    border: 'border-[#FF006D]',
    shadow: 'shadow-[0_0_20px_rgba(255,0,109,0.5)]',
    glow: 'hover:shadow-[0_0_30px_rgba(255,0,109,0.8)]',
    bg: 'bg-[#FF006D]/10',
    hoverBg: 'hover:bg-[#FF006D]/20',
    text: 'text-[#FF006D]',
  },
  secondary: {
    border: 'border-[#00F0FF]',
    shadow: 'shadow-[0_0_20px_rgba(0,240,255,0.5)]',
    glow: 'hover:shadow-[0_0_30px_rgba(0,240,255,0.8)]',
    bg: 'bg-[#00F0FF]/10',
    hoverBg: 'hover:bg-[#00F0FF]/20',
    text: 'text-[#00F0FF]',
  },
  success: {
    border: 'border-[#FFC700]',
    shadow: 'shadow-[0_0_20px_rgba(255,199,0,0.5)]',
    glow: 'hover:shadow-[0_0_30px_rgba(255,199,0,0.8)]',
    bg: 'bg-[#FFC700]/10',
    hoverBg: 'hover:bg-[#FFC700]/20',
    text: 'text-[#FFC700]',
  },
  danger: {
    border: 'border-red-500',
    shadow: 'shadow-[0_0_20px_rgba(239,68,68,0.5)]',
    glow: 'hover:shadow-[0_0_30px_rgba(239,68,68,0.8)]',
    bg: 'bg-red-500/10',
    hoverBg: 'hover:bg-red-500/20',
    text: 'text-red-500',
  },
};

const SIZE_STYLES = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

export default function GlitchButton({
  children,
  variant = 'primary',
  size = 'md',
  glitchIntensity = 'subtle',
  isLoading = false,
  className,
  onClick,
  disabled,
  ...props
}: GlitchButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);
  const [isHovered, setIsHovered] = useState(false);

  const styles = VARIANT_STYLES[variant];

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || isLoading) return;

    // Play cyber click sound
    cardAudio.playClickCyber();

    // Create ripple effect
    const button = buttonRef.current;
    if (button) {
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = Date.now();
      
      setRipples((prev) => [...prev, { x, y, id }]);
      
      // Remove ripple after animation
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 600);
    }

    onClick?.(e);
  };

  const handleMouseEnter = () => {
    if (!disabled && !isLoading) {
      setIsHovered(true);
      cardAudio.playHoverGlitch();
    }
  };

  // Glitch distortion transform
  const glitchTransform = isHovered && !disabled && !isLoading
    ? `skewX(${Math.random() * 2 - 1}deg) skewY(${Math.random() * 2 - 1}deg)`
    : 'none';

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
      disabled={disabled || isLoading}
      className={cn(
        // Base styles
        'relative overflow-hidden font-bold uppercase tracking-wider',
        'border-2 transition-all duration-200',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent',
        
        // Variant styles
        styles.border,
        styles.shadow,
        styles.glow,
        styles.bg,
        styles.hoverBg,
        styles.text,
        `focus:ring-${variant === 'primary' ? '[#FF006D]' : '[#00F0FF]'}`,
        
        // Size
        SIZE_STYLES[size],
        
        // Custom
        className
      )}
      style={{
        transform: glitchTransform,
        clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))',
        willChange: 'transform',
      }}
      {...props}
    >
      {/* Scan line effect */}
      <div 
        className="absolute inset-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
        style={{
          top: isHovered ? '0%' : '-100%',
          transition: 'top 0.6s linear',
          animation: isHovered ? 'scanline 2s linear infinite' : 'none',
        }}
      />

      {/* Ripple effects */}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute rounded-full animate-ripple pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: '100px',
            height: '100px',
            transform: 'translate(-50%, -50%)',
            background: `radial-gradient(circle, ${variant === 'primary' ? 'rgba(255,0,109,0.4)' : 'rgba(0,240,255,0.4)'} 0%, transparent 70%)`,
          }}
        />
      ))}

      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 opacity-50" style={{ borderColor: 'currentColor' }} />
      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 opacity-50" style={{ borderColor: 'currentColor' }} />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 opacity-50" style={{ borderColor: 'currentColor' }} />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 opacity-50" style={{ borderColor: 'currentColor' }} />

      {/* Content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {isLoading && (
          <svg 
            className="animate-spin h-5 w-5" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </span>
    </button>
  );
}

// Add scanline animation to global CSS if needed
// @keyframes scanline {
//   0% { top: -100%; }
//   100% { top: 100%; }
// }

// @keyframes ripple {
//   to {
//     transform: translate(-50%, -50%) scale(4);
//     opacity: 0;
//   }
// }
