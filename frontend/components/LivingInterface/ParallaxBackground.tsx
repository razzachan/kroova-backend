'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';

/**
 * KROOVA Living Interface - Parallax Background System
 * 
 * Creates a 5-layer depth system where each layer moves at different speeds
 * based on mouse position, creating cinematic depth and immersion.
 * 
 * Layer Movement:
 * - Layer 1 (Distant): 20% movement (slowest)
 * - Layer 2 (Buildings): 40% movement
 * - Layer 3 (Neon Signs): 60% movement
 * - Layer 4 (UI Elements): 80% movement
 * - Layer 5 (Glitch Overlay): 100% movement (fastest)
 * 
 * Features:
 * - Route-based background switching
 * - Smooth parallax mouse tracking
 * - Performance optimized (transform-only animations)
 * - Preloading for smooth transitions
 * - WebP format for optimal file size
 */

interface ParallaxLayer {
  id: number;
  speed: number; // 0.2 to 1.0 (20% to 100% movement)
  zIndex: number;
  opacity: number;
}

const PARALLAX_LAYERS: ParallaxLayer[] = [
  { id: 1, speed: 0.2, zIndex: 1, opacity: 1.0 },   // Distant city
  { id: 2, speed: 0.4, zIndex: 2, opacity: 0.9 },   // Buildings
  { id: 3, speed: 0.6, zIndex: 3, opacity: 0.8 },   // Neon signs
  { id: 4, speed: 0.8, zIndex: 4, opacity: 0.7 },   // UI elements
  { id: 5, speed: 1.0, zIndex: 5, opacity: 0.3 },   // Glitch overlay
];

// Route to background mapping
const ROUTE_BACKGROUNDS: Record<string, string> = {
  '/': 'home',
  '/home': 'home',
  '/dashboard': 'home',
  '/boosters': 'boosters',
  '/marketplace': 'marketplace',
  '/inventory': 'inventory',
  '/wallet': 'wallet',
  '/profile': 'home',
};

export default function ParallaxBackground() {
  const pathname = usePathname();
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 }); // Normalized 0-1
  const [currentBg, setCurrentBg] = useState<string>('home');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Determine background from route
  useEffect(() => {
    const newBg = ROUTE_BACKGROUNDS[pathname] || 'home';
    if (newBg !== currentBg) {
      setIsTransitioning(true);
      // Preload new background
      const img = new Image();
      img.src = `/backgrounds/${newBg}.webp`;
      img.onload = () => {
        setCurrentBg(newBg);
        setTimeout(() => setIsTransitioning(false), 600); // Match transition duration
      };
    }
  }, [pathname, currentBg]);

  // Track mouse position for parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Calculate parallax transform for each layer
  const getLayerTransform = (speed: number) => {
    // Center is 0,0 - max movement is ±30px
    const maxMovement = 30;
    const x = (mousePos.x - 0.5) * maxMovement * speed;
    const y = (mousePos.y - 0.5) * maxMovement * speed;
    return `translate3d(${x}px, ${y}px, 0) scale(1.1)`;
  };

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 w-full min-h-screen overflow-hidden pointer-events-none"
      style={{ 
        zIndex: 0,
        height: '100vh',
        minHeight: '100vh',
      }}
    >
      {/* Base background layer (no parallax) */}
      <div
        className="absolute inset-0 w-full h-full bg-[#0a0a0f] transition-opacity duration-600"
        style={{
          opacity: isTransitioning ? 0 : 1,
          minHeight: '100vh',
        }}
      />

      {/* Parallax layers */}
      {PARALLAX_LAYERS.map((layer) => (
        <div
          key={layer.id}
          className="absolute inset-0 w-full h-full transition-all duration-100 ease-out"
          style={{
            zIndex: layer.zIndex,
            transform: getLayerTransform(layer.speed),
            willChange: 'transform',
            backfaceVisibility: 'hidden',
            perspective: 1000,
            minHeight: '100vh',
          }}
        >
          {/* Background image (only on layer 1) */}
          {layer.id === 1 && (
            <div
              className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat transition-opacity duration-600"
              style={{
                backgroundImage: `url(/backgrounds/${currentBg}.webp)`,
                opacity: isTransitioning ? 0 : layer.opacity,
                filter: 'blur(0px)',
                backgroundSize: 'cover',
                backgroundPosition: 'center top',
                backgroundAttachment: 'fixed',
                minHeight: '100vh',
              }}
            />
          )}

          {/* Gradient overlays for depth (layers 2-4) */}
          {layer.id === 2 && (
            <div
              className="absolute inset-0 w-full h-full transition-opacity duration-600"
              style={{
                opacity: isTransitioning ? 0 : layer.opacity,
                background: 'radial-gradient(ellipse at center, transparent 0%, rgba(10,10,15,0.3) 100%)',
              }}
            />
          )}

          {layer.id === 3 && (
            <div
              className="absolute inset-0 w-full h-full transition-opacity duration-600"
              style={{
                opacity: isTransitioning ? 0 : layer.opacity,
                background: 'radial-gradient(ellipse at 30% 50%, rgba(255,0,109,0.05) 0%, transparent 50%)',
              }}
            />
          )}

          {layer.id === 4 && (
            <div
              className="absolute inset-0 w-full h-full transition-opacity duration-600"
              style={{
                opacity: isTransitioning ? 0 : layer.opacity,
                background: 'radial-gradient(ellipse at 70% 50%, rgba(0,240,255,0.05) 0%, transparent 50%)',
              }}
            />
          )}

          {/* Glitch overlay (layer 5) */}
          {layer.id === 5 && (
            <div
              className="absolute inset-0 w-full h-full mix-blend-overlay transition-opacity duration-600"
              style={{
                opacity: isTransitioning ? 0 : layer.opacity,
                backgroundImage: `
                  repeating-linear-gradient(
                    0deg,
                    rgba(0,0,0,0.1) 0px,
                    transparent 1px,
                    transparent 2px,
                    rgba(0,0,0,0.1) 3px
                  )
                `,
                pointerEvents: 'none',
              }}
            />
          )}
        </div>
      ))}

      {/* Vignette effect */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          zIndex: 10,
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 100%)',
        }}
      />
    </div>
  );
}
