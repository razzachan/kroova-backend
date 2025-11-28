"use client";

import React from "react";

const rarityRing: Record<string, string> = {
  trash: "ring-gray-700",
  meme: "ring-blue-400 shadow-blue-500/20",
  viral: "ring-purple-400 shadow-purple-500/20",
  legendary: "ring-yellow-400 shadow-yellow-500/20",
  godmode: "ring-pink-500 shadow-pink-500/30",
  epica: "ring-pink-500 shadow-pink-500/30",
};

export function RarityRingFrame({ rarity, children }: { rarity?: string; children: React.ReactNode }) {
  const ring = rarityRing[(rarity || "trash").toLowerCase()] || rarityRing.trash;
  return (
    <div className={`w-full h-full rounded-lg shadow-md ring-2 ${ring} transition-all`}> 
      {children}
    </div>
  );
}
