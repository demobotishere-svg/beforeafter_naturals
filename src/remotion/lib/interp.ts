/**
 * ============================================================
 * INTERPOLATION + ORGANIC MOTION CORE
 * ============================================================
 * The shared math behind every camera move. The key idea: a "professional"
 * edit never sits perfectly still — so `organic()` layers a keyframed primary
 * move (micro-zoom + parallax) on top of continuous, low-amplitude sine drift
 * (breathing scale, sway, rotational drift). Templates supply the keyframed
 * base; this module adds the life.
 *
 * All px magnitudes here are tuned for the REAL 1080×1920 render canvas
 * (the original templates used 720×1280-era values that read as nearly static).
 * ============================================================
 */

import { interpolate } from "remotion";
import { EASE_GLIDE } from "./easing";

type EasingFn = (t: number) => number;

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Clamped two-stop interpolate with a default house easing. */
export const ip = (
  frame: number,
  input: number[],
  output: number[],
  easing: EasingFn = EASE_GLIDE
): number => interpolate(frame, input, output, { ...CLAMP, easing });

/** Clamped multi-stop interpolate (e.g. fade up, hold, fade down). */
export const ramp = (
  frame: number,
  input: number[],
  output: number[],
  easing: EasingFn = EASE_GLIDE
): number => interpolate(frame, input, output, { ...CLAMP, easing });

/** A symmetric 0 → peak → 0 pulse around `at` (for flashes, blur/chroma spikes). */
export const spike = (
  frame: number,
  at: number,
  half: number,
  peak: number,
  easing: EasingFn = EASE_GLIDE
): number => interpolate(frame, [at - half, at, at + half], [0, peak, 0], { ...CLAMP, easing });

/** Continuous (un-clamped) sine drift — the organic "never static" ingredient. */
export const osc = (frame: number, period: number, amp: number, phase = 0): number =>
  Math.sin((frame / period) * Math.PI * 2 + phase) * amp;

export type Cam = { scale: number; tx: number; ty: number; rot: number };

/** Build a CSS transform string from a camera state. */
export const cam = (c: Cam): string =>
  `scale(${c.scale.toFixed(4)}) translate(${c.tx.toFixed(2)}px, ${c.ty.toFixed(2)}px) rotate(${c.rot.toFixed(3)}deg)`;

export type OrganicOpts = {
  swayPx?: number; // amplitude of horizontal/vertical drift (px @1080×1920)
  breathe?: number; // amplitude of continuous scale breathing
  rotDeg?: number; // amplitude of rotational drift (deg) — keep 0.5–1
  seed?: number; // phase offset so clips don't drift in lock-step
};

/**
 * Compose a keyframed base camera move with continuous organic drift.
 * Periods are deliberately co-prime-ish (190/220/240/300) so the layered
 * sine waves never visibly repeat within a 20s reel.
 */
export const organic = (base: Cam, frame: number, opts: OrganicOpts = {}): Cam => {
  const { swayPx = 12, breathe = 0.006, rotDeg = 0.6, seed = 0 } = opts;
  return {
    scale: base.scale + osc(frame, 220, breathe, seed),
    tx: base.tx + osc(frame, 190, swayPx, seed + 1.3),
    ty: base.ty + osc(frame, 240, swayPx * 0.7, seed + 0.4),
    rot: base.rot + osc(frame, 300, rotDeg, seed + 0.9),
  };
};
