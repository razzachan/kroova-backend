# Card Effects Integration Guide (for Designers)

This guide explains how to plug custom visual frames/effects (e.g., Ghost, Holo Glitch, Rarity Ring) and card frames (outer molduras) into the card reveal UI without touching business logic. Effects wrap the card image; frames provide the outer card moldura.

## Where Things Live
- Effects directory: `frontend/components/card-effects/`
  - `EffectFrame.tsx`: Effect registry and resolver.
  - `RarityRingFrame.tsx`: Default rarity-colored ring/border.
  - `GhostFrame.tsx`: Subtle glow/ghost effect.
  - `HoloGlitchFrame.tsx`: Iridescent holo + scanline + chroma flicker.
- Frames directory: `frontend/components/card-frames/`
  - `Frame.tsx`: Card frame registry and resolver.
  - `DefaultCardFrame.tsx`: Default subtle bevel/vignette frame.
  - `DesignerV1Frame.tsx`: Placeholder moldura com camadas prontas para substituir pela arte final.
- Flip/reveal UI: `frontend/components/OpeningSession.tsx`
  - Wraps the revealed face with `<EffectFrame ...>`.
  - Card area is strictly sized (`w-full h-64`) to preserve 3:4 visuals.

## How Effects Are Chosen
- We infer the effect from the card `skin` (string) or, optionally, from an explicit `effect` key supplied by backend.
- Resolver: `resolveEffectFromSkinOrRarity(skin, rarity)` in `EffectFrame.tsx`.
  - Contains "holo" or "glitch" → `holoGlitch` (HoloGlitchFrame)
  - Contains "ghost" → `ghost` (GhostFrame)
  - Otherwise → `rarityRing` (RarityRingFrame)
- In `OpeningSession.tsx` we pass: `effect={resolveEffectFromSkinOrRarity(card.skin || card.effect, card.rarity)}`. If you later prefer a pure `effect` field, keep it and ignore `skin`.

## How Frames (Molduras) Are Chosen
- We infer the frame from `card.frame` or from `skin` as a fallback.
- Resolver: `resolveFrameFromSkinOrMeta(skin, rarity)` in `card-frames/Frame.tsx`.
- In `OpeningSession.tsx` we wrap as: `<CardFrame frame={resolveFrameFromSkinOrMeta(card.frame || card.skin, card.rarity)}>` and inside it we render the `<EffectFrame>` and the card image.

Layering order on reveal face (outer → inner):
- CardFrame (moldura)
- EffectFrame (FX overlays like holo/ghost/rarity ring)
- Card image (children)

## Designer Workflow: Replacing an Effect
1. Open the corresponding file under `frontend/components/card-effects/`:
   - Replace `HoloGlitchFrame.tsx` content with the final art/effect.
   - Or replace `GhostFrame.tsx`, etc.
2. Keep the same outer contract: the component must render a wrapper that fills the entire card face area and place `{children}` inside.
3. Build and preview (see Deploy/Preview below).

Effect component contract:
- Must fill the card face container: use `className="relative w-full h-full rounded-lg overflow-hidden"` or equivalent.
- Put the artwork/overlays as absolutely-positioned layers with `pointer-events: none` when they are purely visual.
- Render `{children}` (the actual card image) inside, typically as the lowest content layer.
- Do not change the flip container’s size/aspect; it is controlled by the parent (`w-full h-64`).

Effect example skeleton:

```tsx
"use client";
import React from "react";

export function PrismFoilFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden">
      {/* Visual layers (pointer-events-none) */}
      <div className="pointer-events-none absolute -inset-[2px] rounded-[12px] opacity-90" style={{
        background: "conic-gradient(from 0deg, #ff00e1, #00e1ff, #00ff99, #ffd400, #ff00e1)",
        filter: "blur(6px)",
        mixBlendMode: "screen",
      }} />

      {/* Card image (content) */}
      <div className="w-full h-full">{children}</div>
    </div>
  );
}
```

## Adding a New Effect
1. Create a new file under `frontend/components/card-effects/`, e.g., `PrismFoilFrame.tsx`.
2. Export your component: `export function PrismFoilFrame(...) { ... }`.
3. Register it in `EffectFrame.tsx`:
   - Import it.
   - Update the `EffectKey` union (e.g., add `"prismFoil"`).
   - Update the component selection block to return `<PrismFoilFrame>` when `effect === "prismFoil"`.
4. Update the resolver mapping if you want to infer it from `skin` naming conventions (e.g., if `skin` contains `prism` → `prismFoil`).

## Naming Conventions
- File/component names: PascalCase (`HoloGlitchFrame.tsx`, `GhostFrame.tsx`).
- Effect keys: lowerCamel in code/JSON (`holoGlitch`, `ghost`, `rarityRing`).
- Skin keywords: simple lowercase substrings are matched by the resolver ("holo", "glitch", "ghost").

## Visual Constraints & Best Practices
- Aspect ratio: Parent sets `w-full h-64` (3:4 visual). Your frame must fill `100%` of the provided space.
- Rounded corners: Keep `rounded-lg` to match card shape; avoid overflowing outside.
- Layers: Use `position: absolute` overlays for glows/gradients; use `pointer-events: none` for purely decorative layers.
- Performance: Prefer CSS gradients/filters/animations. Avoid heavy JS or expensive blurs on large areas.
- Backface: Do not modify `backface-visibility` or `transform` on the outer flip container; effects should be contained.

## Previewing Your Effect
Option A: Skin-driven
- Set the card’s `skin` to include your keyword (e.g., `ghost_v1`, `holo_glitch_v2`). The resolver will pick the corresponding frame.

Option B: Force globally (dev-only)
- In `EffectFrame.tsx`, temporarily change the resolver to `return "yourEffectKey";` to preview on all cards.

Option C: Explicit `effect` field
- If the backend supplies `effect` per card, it will be used (we fall back to `skin` otherwise).

## Deploy/Preview
Local dev (if needed):
```powershell
Push-Location "C:\Kroova\frontend"
npm install
npm run dev
Pop-Location
```

Production deploy:
```powershell
Push-Location "C:\Kroova\frontend"
vercel --prod
Pop-Location
```

After deploy, open a booster to see the flip. The revealed face will render with your effect frame.

## Do/Don’t Checklist
- Do: fill the provided area, keep children visible, keep rounded corners.
- Do: set decorative layers to `pointer-events: none`.
- Do: use lightweight CSS effects; keep animations subtle and performant.
- Don’t: resize the flip area or change its transform/perspective.
- Don’t: intercept clicks on the revealed card layer.
- Don’t: rely on external network images with text (keep the UI text-free inside frames).

## Card Frames (Molduras)
- Create or edit components under `frontend/components/card-frames/`.
- `DefaultCardFrame.tsx` is the base; replace it or add new frames (e.g., `DesignerV1Frame.tsx`).
- Register in `card-frames/Frame.tsx` by expanding `FrameKey` and the switch to return your frame.
- Keep the same wrapper contract (full-size, rounded, overlays as `pointer-events: none`) and render `{children}` inside.

Previewing a frame:
- Set `card.frame` to your frame key (e.g., `designerV1`) or add a keyword to `skin` (e.g., `designer_v1`) so the resolver picks it.
- Temporarily hardcode the resolver to return your frame key for global preview.

## Files to Touch vs. Avoid
- Touch: files in `frontend/components/card-effects/*`, and (optionally) the resolver in `EffectFrame.tsx`.
 - Touch: files in `frontend/components/card-frames/*`, and (optionally) the resolver in `Frame.tsx`.
- Avoid: `OpeningSession.tsx` flipping logic, API routes, and card data structures.

If you need a new parameter exposed (e.g., intensity), tell engineering to add it to the card data and pass it through to the frame.
