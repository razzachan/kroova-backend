'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { cardAudio } from '@/lib/cardAudio';

/**
 * Global Ambient Audio Manager
 * Automatically manages ambient music based on current route
 */
export function GlobalAmbientManager() {
  const pathname = usePathname();

  useEffect(() => {
    // Route-based ambient intensity mapping
    const getIntensityForRoute = (path: string): 'idle' | 'active' | 'intense' | null => {
      // No ambient on auth pages
      if (path === '/login' || path === '/register') {
        return null;
      }

      // IDLE (volume 0.1) - Quiet browsing
      if (
        path === '/' ||              // Home
        path === '/dashboard' ||     // Dashboard
        path === '/profile' ||       // Profile
        path === '/inventory'        // Inventory browsing
      ) {
        return 'idle';
      }

      // ACTIVE (volume 0.25) - Active areas
      if (
        path === '/boosters' ||      // Boosters store
        path === '/marketplace' ||   // Marketplace
        path === '/wallet'           // Wallet management
      ) {
        return 'active';
      }

      // INTENSE handled manually in purchase flow
      // Default: idle for unknown routes
      return 'idle';
    };

    const intensity = getIntensityForRoute(pathname);

    if (intensity === null) {
      // Stop ambient on auth pages
      cardAudio.stopAmbient();
    } else {
      // Start or transition to appropriate intensity
      cardAudio.startAmbient(intensity);
    }

    // Cleanup on unmount (component removed)
    return () => {
      // Don't stop here - let route changes handle transitions
    };
  }, [pathname]);

  return null; // This component renders nothing
}
