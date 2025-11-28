"use client";

import React from "react";

// Placeholder moldura 1:1 com comportamento esperado:
// - Wrapper full-size com cantos arredondados
// - Borda externa metálica sutil
// - Bisel interno e vinheta leve
// - Sem capturar eventos (camadas decorativas com pointer-events none)
// Troque as camadas visuais abaixo pela arte final do designer.
export function DesignerV1Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden">
      {/* Moldura metálica externa */}
      <div
        className="pointer-events-none absolute -inset-[2px] rounded-[14px] opacity-90"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.22), rgba(255,255,255,0.04) 30%, rgba(0,0,0,0.25) 70%, rgba(255,255,255,0.15))",
          filter: "blur(0.5px)",
        }}
      />

      {/* Bisel interno */}
      <div
        className="pointer-events-none absolute inset-0 rounded-xl"
        style={{
          boxShadow:
            "inset 0 0 0 1px rgba(255,255,255,0.10), inset 0 0 18px rgba(0,0,0,0.35)",
        }}
      />

      {/* Vinheta para profundidade */}
      <div
        className="pointer-events-none absolute inset-0 rounded-xl"
        style={{
          background:
            "radial-gradient(120% 120% at 50% 10%, rgba(0,0,0,0.00) 0%, rgba(0,0,0,0.18) 70%, rgba(0,0,0,0.38) 100%)",
          mixBlendMode: "multiply",
        }}
      />

      {/* Conteúdo da carta */}
      <div className="w-full h-full rounded-lg">{children}</div>
    </div>
  );
}
