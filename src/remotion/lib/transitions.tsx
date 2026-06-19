/**
 * ============================================================
 * TRANSITIONS + GRADING OVERLAYS
 * ============================================================
 * Parametric, render-safe transition primitives shared by all templates.
 * All are pure CSS (gradients / blend modes / masks / transforms) — no
 * backdrop-filter (broken in Remotion render). Each returns null outside its
 * active window so it costs nothing the rest of the timeline.
 * ============================================================
 */
import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { EASE_GLIDE, EASE_INK, EASE_SNAP } from "./easing";

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// ── VIGNETTE (parametric — templates pass their signature gradient) ─────────
export const Vignette: React.FC<{ background: string; zIndex?: number }> = ({ background, zIndex = 50 }) => (
  <AbsoluteFill style={{ background, pointerEvents: "none", zIndex }} />
);

// ── SPLIT-TONE (cool shadows + warm highlights → the "LUT" finish) ──────────
export const SplitTone: React.FC<{
  shadow: string;
  highlight: string;
  opacity?: number;
  angle?: number;
  blend?: React.CSSProperties["mixBlendMode"];
  zIndex?: number;
}> = ({ shadow, highlight, opacity = 1, angle = 160, blend = "soft-light", zIndex = 45 }) => (
  <AbsoluteFill
    style={{
      background: `linear-gradient(${angle}deg, ${shadow} 0%, transparent 48%, ${highlight} 100%)`,
      opacity,
      mixBlendMode: blend,
      pointerEvents: "none",
      zIndex,
    }}
  />
);

// ── LIGHT LEAK (warm diagonal sweep, screen-blended) ────────────────────────
export const LightLeak: React.FC<{
  frame: number;
  at: number;
  window?: number;
  angle?: number;
  color?: string;
  peak?: number;
  zIndex?: number;
}> = ({ frame, at, window = 8, angle = 58, color = "rgba(255,200,140,0.85)", peak = 0.42, zIndex = 55 }) => {
  const opacity = interpolate(frame, [at - 4, at + 3, at + window + 4], [0, peak, 0], { ...CLAMP, easing: EASE_GLIDE });
  if (opacity <= 0.001) return null;
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${angle}deg, transparent 0%, ${color} 48%, transparent 100%)`,
        opacity,
        mixBlendMode: "screen",
        pointerEvents: "none",
        zIndex,
      }}
    />
  );
};

// ── LUMA-STYLE DISSOLVE (feathered radial dip — organic, non-uniform fade) ──
export const LumaFade: React.FC<{
  frame: number;
  at: number;
  window?: number;
  color?: string;
  zIndex?: number;
}> = ({ frame, at, window = 12, color = "0,0,0", zIndex = 64 }) => {
  const half = window / 2;
  const p = interpolate(frame, [at - half, at, at + half], [0, 1, 0], { ...CLAMP, easing: EASE_INK });
  if (p <= 0.001) return null;
  // Alpha baked into the gradient → a feathered centre-to-edge dissolve.
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% 50%, rgba(${color},${(p * 0.82).toFixed(3)}) 0%, rgba(${color},${Math.min(1, p * 1.25).toFixed(3)}) 72%)`,
        pointerEvents: "none",
        zIndex,
      }}
    />
  );
};

// ── DIRECTIONAL BLUR WIPE (blurred light streak sweeping across the cut) ─────
export const DirectionalBlurWipe: React.FC<{
  frame: number;
  at: number;
  window?: number;
  dir?: "left" | "right" | "up" | "down";
  color?: string;
  zIndex?: number;
}> = ({ frame, at, window = 9, dir = "right", color = "rgba(255,255,255,0.5)", zIndex = 57 }) => {
  const half = window / 2;
  if (frame < at - half || frame > at + half) return null;
  const t = interpolate(frame, [at - half, at + half], [0, 1], { ...CLAMP, easing: EASE_SNAP });
  const pos = -30 + t * 160; // streak position (%)
  const angle = dir === "right" ? 90 : dir === "left" ? 270 : dir === "up" ? 0 : 180;
  const opacity = Math.sin(t * Math.PI); // 0 → 1 → 0
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${angle}deg, transparent ${pos - 20}%, ${color} ${pos}%, transparent ${pos + 20}%)`,
        opacity: opacity * 0.9,
        filter: "blur(7px)",
        mixBlendMode: "screen",
        pointerEvents: "none",
        zIndex,
      }}
    />
  );
};

// ── INK WIPE (vertical sheet that covers then reveals, with slight spring) ──
export const InkWipe: React.FC<{
  frame: number;
  at: number;
  window?: number;
  color?: string;
  easing?: (t: number) => number;
  zIndex?: number;
}> = ({ frame, at, window = 20, color = "#0d0d0d", easing = EASE_INK, zIndex = 65 }) => {
  const half = window / 2;
  if (frame < at - half || frame > at + half) return null;
  const coverY = interpolate(frame, [at - half, at], [-100, 0], { ...CLAMP, easing });
  const revealY = interpolate(frame, [at, at + half], [0, 100], { ...CLAMP, easing });
  const y = frame < at ? coverY : revealY;
  return (
    <AbsoluteFill
      style={{ transform: `translateY(${y}%)`, backgroundColor: color, pointerEvents: "none", zIndex }}
    />
  );
};

// ── IRIS REVEAL (oval mask expands away from centre) ───────────────────────
export const IrisReveal: React.FC<{
  frame: number;
  start: number;
  window?: number;
  color?: string;
  easing?: (t: number) => number;
  zIndex?: number;
}> = ({ frame, start, window = 50, color = "#0d0d0d", easing = EASE_GLIDE, zIndex = 64 }) => {
  if (frame < start || frame > start + window) return null;
  const progress = interpolate(frame, [start, start + window], [0, 1], { ...CLAMP, easing });
  const size = progress * 150;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", zIndex }}>
      <AbsoluteFill
        style={{ background: `radial-gradient(ellipse ${size}% ${size * 0.85}% at 50% 48%, transparent 95%, ${color} 100%)` }}
      />
    </AbsoluteFill>
  );
};

// ── SOFT FLASH (gentle screen/overlay bloom on a cut) ──────────────────────
export const SoftFlash: React.FC<{
  frame: number;
  at: number;
  window?: number;
  color?: string;
  peak?: number;
  blend?: React.CSSProperties["mixBlendMode"];
  zIndex?: number;
}> = ({ frame, at, window = 8, color = "white", peak = 0.4, blend = "screen", zIndex = 56 }) => {
  const opacity = interpolate(frame, [at - 1, at, at + window], [0, peak, 0], { ...CLAMP, easing: EASE_SNAP });
  if (opacity <= 0.001) return null;
  return (
    <AbsoluteFill
      style={{ backgroundColor: color, opacity, mixBlendMode: blend, pointerEvents: "none", zIndex }}
    />
  );
};
