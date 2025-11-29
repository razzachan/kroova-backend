'use client';

/**
 * KROOVA Glitch Overlay
 * 
 * Adds constant subtle corruption effects:
 * - Scan lines
 * - Film grain
 * - Chromatic aberration (subtle)
 * - Random glitch flashes
 * 
 * Performance: GPU-accelerated, minimal CPU usage
 */

export default function GlitchOverlay() {
  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {/* Scan lines */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              rgba(0, 0, 0, 0.1) 0px,
              transparent 1px,
              transparent 2px,
              rgba(0, 0, 0, 0.1) 3px
            )
          `,
          animation: 'scanlineMove 8s linear infinite',
        }}
      />

      {/* Film grain */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          animation: 'grain 0.5s steps(1) infinite',
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.8) 100%)',
        }}
      />

      {/* Chromatic aberration flash (rare) */}
      <div
        className="absolute inset-0 opacity-0 mix-blend-screen"
        style={{
          animation: 'chromaticFlash 5s ease-in-out infinite',
          background: 'linear-gradient(45deg, #FF006D 0%, transparent 50%, #00F0FF 100%)',
        }}
      />
    </div>
  );
}
