'use client';

import { useState, useEffect } from 'react';
import GlitchButton from '@/components/UI/GlitchButton';

interface RecycleSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardsRecycled: number;
  rewardBooster: {
    booster_id: string;
    booster_name: string;
    booster_description?: string;
  };
  onOpenBooster?: () => void;
}

export default function RecycleSuccessModal({
  isOpen,
  onClose,
  cardsRecycled,
  rewardBooster,
  onOpenBooster
}: RecycleSuccessModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleOpenBooster = () => {
    handleClose();
    if (onOpenBooster) {
      onOpenBooster();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div
        className={`
          relative w-full max-w-md bg-gradient-to-br from-[#1a0033] to-[#0a0015] 
          border-2 border-[#A855F7] rounded-lg shadow-2xl
          transition-all duration-300 transform
          ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
        `}
        style={{
          boxShadow: '0 0 30px rgba(168, 85, 247, 0.3), inset 0 0 20px rgba(168, 85, 247, 0.1)'
        }}
      >
        {/* Glitch effect overlay */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
          <div className="absolute inset-0 bg-[#A855F7] opacity-5 animate-pulse" />
        </div>

        {/* Content */}
        <div className="relative p-6 text-center">
          {/* Success Icon */}
          <div className="mb-4 flex justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#A855F7] to-[#7C3AED] flex items-center justify-center animate-bounce">
              <span className="text-4xl">🎉</span>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-[#A855F7] mb-2 tracking-wider">
            RECICLAGEM COMPLETA!
          </h2>

          {/* Stats */}
          <div className="mb-4 p-4 bg-black/40 rounded border border-[#A855F7]/30">
            <p className="text-gray-300 text-sm mb-2">
              <span className="text-[#A855F7] font-bold text-lg">{cardsRecycled}</span> cartas recicladas
            </p>
            <div className="h-px bg-gradient-to-r from-transparent via-[#A855F7] to-transparent my-3" />
            <p className="text-gray-300 text-sm">
              Você ganhou:
            </p>
            <p className="text-white font-bold text-xl mt-1 text-[#A855F7]">
              {rewardBooster.booster_name}
            </p>
            {rewardBooster.booster_description && (
              <p className="text-gray-400 text-xs mt-2 italic">
                {rewardBooster.booster_description}
              </p>
            )}
          </div>

          {/* Booster Preview */}
          <div className="mb-6 p-4 bg-gradient-to-br from-[#A855F7]/10 to-transparent rounded border border-[#A855F7]/20">
            <div className="text-5xl mb-2 animate-pulse">📦</div>
            <p className="text-gray-400 text-xs">
              O booster está esperando por você!
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-center">
            <GlitchButton
              onClick={handleOpenBooster}
              glitchIntensity="medium"
              className="flex-1"
            >
              ABRIR AGORA
            </GlitchButton>
            <GlitchButton
              onClick={handleClose}
              variant="secondary"
              glitchIntensity="subtle"
              className="flex-1"
            >
              ABRIR DEPOIS
            </GlitchButton>
          </div>
        </div>

        {/* Corner decorations */}
        <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#A855F7]" />
        <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#A855F7]" />
        <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#A855F7]" />
        <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#A855F7]" />
      </div>
    </div>
  );
}
