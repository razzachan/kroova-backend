'use client';

import { useEffect, useRef } from 'react';
import Lottie, { LottieRefCurrentProps } from 'lottie-react';
import jackpotAnimation from '@/public/animations/jackpot-coins.json';

interface LottieJackpotProps {
  isPlaying: boolean;
  size?: number;
  speed?: number;
  loop?: boolean;
  onComplete?: () => void;
}

export function LottieJackpot({ 
  isPlaying, 
  size = 200, 
  speed = 1,
  loop = true,
  onComplete 
}: LottieJackpotProps) {
  const lottieRef = useRef<LottieRefCurrentProps>(null);

  useEffect(() => {
    if (lottieRef.current) {
      if (isPlaying) {
        lottieRef.current.play();
      } else {
        lottieRef.current.pause();
      }
    }
  }, [isPlaying]);

  return (
    <div 
      style={{ 
        width: size, 
        height: size,
        pointerEvents: 'none' // Don't block clicks
      }}
    >
      <Lottie
        lottieRef={lottieRef}
        animationData={jackpotAnimation}
        loop={loop}
        autoplay={false}
        onComplete={onComplete}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
