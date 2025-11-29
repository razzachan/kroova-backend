'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { cardAudio } from '@/lib/cardAudio';

// Use window object to persist state across hot reloads and route changes
declare global {
  interface Window {
    __kroovaAudioInitialized?: boolean;
    __kroovaListenersAttached?: boolean;
  }
}

/**
 * Global Ambient Audio Manager
 * Automatically manages ambient music based on current route
 * Waits for user interaction before starting (browser autoplay policy)
 */
export function GlobalAmbientManager() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Route-based ambient intensity mapping
    const getIntensityForRoute = (path: string): 'idle' | 'active' | 'intense' | null => {
      if (path === '/login' || path === '/register') return null;
      if (path === '/' || path === '/dashboard' || path === '/profile' || path === '/inventory') return 'idle';
      if (path === '/boosters' || path === '/marketplace' || path === '/wallet') return 'active';
      return 'idle';
    };

    // Attach listeners only once globally
    if (!window.__kroovaListenersAttached) {
      window.__kroovaListenersAttached = true;
      console.log('🎵 Attaching audio listeners (ONE TIME)');

      const startAudio = () => {
        if (window.__kroovaAudioInitialized) return;
        window.__kroovaAudioInitialized = true;
        
        console.log('🎵 FIRST CLICK DETECTED!');
        const intensity = getIntensityForRoute(window.location.pathname);
        console.log('🎵 Starting ambient:', intensity);
        
        if (intensity) {
          cardAudio.startAmbient(intensity);
        }
      };

      window.addEventListener('click', startAudio, { capture: true });
      window.addEventListener('keydown', startAudio, { capture: true });
      window.addEventListener('touchstart', startAudio, { capture: true });
      window.addEventListener('mousemove', startAudio, { once: true, capture: true });
      window.addEventListener('scroll', startAudio, { once: true, capture: true });
      
      // Auto-start after 100ms (aggressive but works in most browsers)
      setTimeout(() => {
        if (!window.__kroovaAudioInitialized) {
          console.log('🎵 Auto-starting audio after delay...');
          startAudio();
        }
      }, 100);
    }

    // Update on route change if already initialized
    if (window.__kroovaAudioInitialized) {
      const intensity = getIntensityForRoute(pathname);
      console.log('🎵 Route change:', pathname, '→', intensity);
      
      if (intensity === null) {
        cardAudio.stopAmbient();
      } else {
        cardAudio.startAmbient(intensity);
      }
    }
  }, [pathname]);

  return null;
}
