"use client";

import React from "react";

export function GhostFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden">
      <div className="absolute inset-0 rounded-lg pointer-events-none" style={{
        background: "radial-gradient(120% 120% at 50% 0%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 60%)"
      }} />
      <div className="absolute inset-0 rounded-lg ring-2 ring-white/20" />
      <div className="absolute -inset-[2px] rounded-[12px] animate-ghostGlow pointer-events-none" />
      <div className="w-full h-full">{children}</div>
      <style jsx>{`
        @keyframes ghostGlow {
          0% { box-shadow: 0 0 0px rgba(255,255,255,0.0); }
          50% { box-shadow: 0 0 24px rgba(255,255,255,0.15); }
          100% { box-shadow: 0 0 0px rgba(255,255,255,0.0); }
        }
        .animate-ghostGlow { animation: ghostGlow 2.8s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
