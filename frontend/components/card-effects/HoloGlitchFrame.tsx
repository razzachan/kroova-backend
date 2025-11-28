"use client";

import React from "react";

export function HoloGlitchFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden">
      {/* Holo spectrum border */}
      <div className="pointer-events-none absolute -inset-[2px] rounded-[12px] opacity-80" style={{
        background: "conic-gradient(from 0deg, #ff00e1, #00e1ff, #00ff99, #ffd400, #ff00e1)",
        filter: "blur(6px)",
        mixBlendMode: "screen"
      }} />
      <div className="absolute inset-0 rounded-lg ring-2 ring-white/10" />
      {/* Subtle glitch scanlines */}
      <div className="pointer-events-none absolute inset-0 opacity-20 mix-blend-screen" style={{
        backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,0.15) 0, rgba(255,255,255,0.15) 1px, transparent 1px, transparent 3px)"
      }} />
      {/* Chromatic aberration flicker */}
      <div className="pointer-events-none absolute inset-0 animate-chroma" />
      <div className="w-full h-full">{children}</div>
      <style jsx>{`
        @keyframes chroma {
          0% { box-shadow: 0 0 0px rgba(255,0,153,0.0), 0 0 0px rgba(0,255,255,0.0); }
          50% { box-shadow: 2px 0 6px rgba(255,0,153,0.25), -2px 0 6px rgba(0,255,255,0.25); }
          100% { box-shadow: 0 0 0px rgba(255,0,153,0.0), 0 0 0px rgba(0,255,255,0.0); }
        }
        .animate-chroma { animation: chroma 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
