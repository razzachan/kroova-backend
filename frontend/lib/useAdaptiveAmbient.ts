// Adaptive Ambient Audio Hook for KROOVA
// Automatically manages audio intensity based on page/context

import { useEffect } from 'react';
import { cardAudio } from './cardAudio';

export type AmbientIntensity = 'idle' | 'active' | 'intense';

/**
 * Hook to manage adaptive ambient audio
 * @param intensity - Audio intensity level ('idle' | 'active' | 'intense')
 * @param enabled - Whether ambient should play (default: true)
 */
export function useAdaptiveAmbient(
  intensity: AmbientIntensity = 'idle',
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return;
    
    cardAudio.startAmbient(intensity);
    
    return () => {
      cardAudio.stopAmbient();
    };
  }, [intensity, enabled]);
}

/**
 * Hook to change ambient intensity dynamically
 * Useful for modal states or user interactions
 */
export function useAmbientIntensity(intensity: AmbientIntensity) {
  useEffect(() => {
    cardAudio.setAmbientIntensity(intensity);
  }, [intensity]);
}
