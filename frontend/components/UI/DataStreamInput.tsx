'use client';

import { InputHTMLAttributes, forwardRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { cardAudio } from '@/lib/cardAudio';

/**
 * KROOVA Data Stream Input
 * 
 * Cyber-styled input component with:
 * - Neon border glow
 * - Animated scan line on focus
 * - Custom neon caret
 * - Glitch effect on typing
 * - Floating label animation
 * - Audio feedback ready
 */

interface DataStreamInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  variant?: 'magenta' | 'cyan' | 'amber';
  icon?: React.ReactNode;
}

const VARIANT_STYLES = {
  magenta: {
    border: 'border-[#FF006D]',
    focusShadow: 'focus:shadow-[0_0_20px_rgba(255,0,109,0.5)]',
    text: 'text-[#FF006D]',
    bg: 'bg-[#FF006D]/5',
  },
  cyan: {
    border: 'border-[#00F0FF]',
    focusShadow: 'focus:shadow-[0_0_20px_rgba(0,240,255,0.5)]',
    text: 'text-[#00F0FF]',
    bg: 'bg-[#00F0FF]/5',
  },
  amber: {
    border: 'border-[#FFC700]',
    focusShadow: 'focus:shadow-[0_0_20px_rgba(255,199,0,0.5)]',
    text: 'text-[#FFC700]',
    bg: 'bg-[#FFC700]/5',
  },
};

const DataStreamInput = forwardRef<HTMLInputElement, DataStreamInputProps>(
  (
    {
      label,
      error,
      variant = 'cyan',
      icon,
      className,
      disabled,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isGlitching, setIsGlitching] = useState(false);
    
    const styles = VARIANT_STYLES[variant];
    const hasValue = value !== undefined && value !== '';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Trigger subtle glitch on typing
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 100);
      
      // Play data flow sound
      cardAudio.playDataFlow();
      
      onChange?.(e);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      cardAudio.playPortalOpen();
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      props.onBlur?.(e);
    };

    return (
      <div className={cn('relative w-full', className)}>
        {/* Label */}
        {label && (
          <label
            className={cn(
              'absolute left-3 transition-all duration-200 pointer-events-none',
              'font-mono text-sm uppercase tracking-wider',
              isFocused || hasValue
                ? `top-1 text-xs ${styles.text}`
                : 'top-1/2 -translate-y-1/2 text-gray-500'
            )}
          >
            {label}
          </label>
        )}

        {/* Input container */}
        <div className="relative">
          {/* Icon */}
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              {icon}
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            value={value}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled}
            className={cn(
              // Base styles
              'w-full px-4 py-3 bg-black/50 backdrop-blur-sm',
              'border-2 transition-all duration-200',
              'font-mono text-white placeholder-gray-600',
              'focus:outline-none',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              
              // Variant styles
              styles.border,
              styles.focusShadow,
              isFocused && styles.bg,
              
              // Icon spacing
              icon && 'pl-12',
              
              // Label spacing
              label && 'pt-6 pb-2',
              
              // Error state
              error && 'border-red-500 focus:shadow-[0_0_20px_rgba(239,68,68,0.5)]',
            )}
            style={{
              clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))',
              transform: isGlitching ? `translateX(${Math.random() * 2 - 1}px)` : 'none',
              caretColor: variant === 'magenta' ? '#FF006D' : variant === 'cyan' ? '#00F0FF' : '#FFC700',
            }}
            {...props}
          />

          {/* Scan line effect on focus */}
          {isFocused && (
            <div
              className="absolute left-0 right-0 h-px pointer-events-none"
              style={{
                top: '0%',
                background: `linear-gradient(90deg, transparent 0%, ${
                  variant === 'magenta' ? '#FF006D' : variant === 'cyan' ? '#00F0FF' : '#FFC700'
                } 50%, transparent 100%)`,
                animation: 'scanline 2s linear infinite',
              }}
            />
          )}

          {/* Corner accents */}
          <div 
            className={cn(
              "absolute top-0 left-0 w-2 h-2 border-t border-l opacity-50 transition-opacity",
              isFocused && 'opacity-100'
            )} 
            style={{ borderColor: variant === 'magenta' ? '#FF006D' : variant === 'cyan' ? '#00F0FF' : '#FFC700' }} 
          />
          <div 
            className={cn(
              "absolute top-0 right-0 w-2 h-2 border-t border-r opacity-50 transition-opacity",
              isFocused && 'opacity-100'
            )} 
            style={{ borderColor: variant === 'magenta' ? '#FF006D' : variant === 'cyan' ? '#00F0FF' : '#FFC700' }} 
          />
          <div 
            className={cn(
              "absolute bottom-0 left-0 w-2 h-2 border-b border-l opacity-50 transition-opacity",
              isFocused && 'opacity-100'
            )} 
            style={{ borderColor: variant === 'magenta' ? '#FF006D' : variant === 'cyan' ? '#00F0FF' : '#FFC700' }} 
          />
          <div 
            className={cn(
              "absolute bottom-0 right-0 w-2 h-2 border-b border-r opacity-50 transition-opacity",
              isFocused && 'opacity-100'
            )} 
            style={{ borderColor: variant === 'magenta' ? '#FF006D' : variant === 'cyan' ? '#00F0FF' : '#FFC700' }} 
          />
        </div>

        {/* Error message */}
        {error && (
          <p className="mt-2 text-sm text-red-500 font-mono flex items-center gap-2">
            <span className="inline-block w-1 h-1 bg-red-500 rounded-full animate-pulse" />
            {error}
          </p>
        )}

        {/* Data stream effect (subtle particles) */}
        {isFocused && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="absolute w-px h-2 opacity-50"
                style={{
                  left: `${20 + i * 30}%`,
                  top: '-10px',
                  background: variant === 'magenta' ? '#FF006D' : variant === 'cyan' ? '#00F0FF' : '#FFC700',
                  animation: `dataStream ${1 + i * 0.3}s linear infinite`,
                }}
              />
            ))}
          </div>
        )}
      </div>
    );
  }
);

DataStreamInput.displayName = 'DataStreamInput';

export default DataStreamInput;

// Add to globals.css:
// @keyframes dataStream {
//   0% {
//     transform: translateY(0);
//     opacity: 0;
//   }
//   50% {
//     opacity: 1;
//   }
//   100% {
//     transform: translateY(60px);
//     opacity: 0;
//   }
// }
