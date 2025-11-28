"use client";

import React from "react";
import { GhostFrame } from "./GhostFrame";
import { HoloGlitchFrame } from "./HoloGlitchFrame";
import { RarityRingFrame } from "./RarityRingFrame";

export type EffectKey = "none" | "rarityRing" | "ghost" | "holoGlitch";

export function resolveEffectFromSkinOrRarity(skin?: string, rarity?: string): EffectKey {
  const key = (skin || "").toLowerCase();
  if (key.includes("holo") || key.includes("glitch")) return "holoGlitch";
  if (key.includes("ghost")) return "ghost";
  // default based on rarity ring styling
  return "rarityRing";
}

export function EffectFrame({
  effect = "rarityRing",
  rarity,
  children,
}: {
  effect?: EffectKey;
  rarity?: string;
  children: React.ReactNode;
}) {
  if (effect === "ghost") {
    return <GhostFrame>{children}</GhostFrame>;
  }
  if (effect === "holoGlitch") {
    return <HoloGlitchFrame>{children}</HoloGlitchFrame>;
  }
  if (effect === "none") {
    return <div className="w-full h-full rounded-lg overflow-hidden">{children}</div>;
  }
  return <RarityRingFrame rarity={(rarity || "").toLowerCase()}>{children}</RarityRingFrame>;
}
