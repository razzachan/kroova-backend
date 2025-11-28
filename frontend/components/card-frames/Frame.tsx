"use client";

import React from "react";
import { DefaultCardFrame } from "./DefaultCardFrame";
import { DesignerV1Frame } from "./DesignerV1Frame";

export type FrameKey = "default" | "designerV1";

export function resolveFrameFromSkinOrMeta(skin?: string, _rarity?: string): FrameKey {
  const key = (skin || "").toLowerCase();
  if (key.includes("frame_v1") || key.includes("designer_v1")) return "designerV1";
  return "default";
}

export function CardFrame({ frame = "default", children }: { frame?: FrameKey; children: React.ReactNode }) {
  if (frame === "designerV1") {
    return <DesignerV1Frame>{children}</DesignerV1Frame>;
  }
  return <DefaultCardFrame>{children}</DefaultCardFrame>;
}
