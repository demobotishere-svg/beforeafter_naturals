/**
 * ============================================================
 * HOUSE EASING CURVES
 * ============================================================
 * Curated cubic-bezier curves used across every template, replacing the
 * generic `Easing.inOut(Easing.ease)`. These are the editorial "feel" of the
 * whole product — buttery decelerations for luxury, violent snaps for hype.
 *
 * Reference (cubic-bezier control points):
 *   LUXE  (0.22, 1, 0.36, 1)   → expo-out, lands with a long, soft glide
 *   GLIDE (0.25, 1, 0.5, 1)    → softer slow-down, the default for drifts
 *   SNAP  (0.87, 0, 0.13, 1)   → aggressive in-out, the "punch zoom"
 *   DRIFT (0.40, 0, 0.20, 1)   → gentle, near-linear for continuous motion
 *   INK   (0.65, 0, 0.35, 1)   → weighted in-out for wipes / ink spreads
 *   ACCEL (0.50, 0, 0.75, 0)   → accelerate INTO a hard cut
 * ============================================================
 */

import { Easing } from "remotion";

export const EASE_LUXE = Easing.bezier(0.22, 1, 0.36, 1);
export const EASE_GLIDE = Easing.bezier(0.25, 1, 0.5, 1);
export const EASE_SNAP = Easing.bezier(0.87, 0, 0.13, 1);
export const EASE_DRIFT = Easing.bezier(0.4, 0, 0.2, 1);
export const EASE_INK = Easing.bezier(0.65, 0, 0.35, 1);
export const EASE_ACCEL = Easing.bezier(0.5, 0, 0.75, 0);

// A touch of overshoot for organic settles (kept subtle — luxury, not bounce).
export const EASE_SETTLE = Easing.bezier(0.34, 1.32, 0.64, 1);
