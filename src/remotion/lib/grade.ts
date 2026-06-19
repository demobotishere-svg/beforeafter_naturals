/**
 * ============================================================
 * FILMIC COLOR GRADES (CSS-filter LUT approximations)
 * ============================================================
 * A single CSS `filter` can apply a global tone/saturation curve but CANNOT
 * split-tone (cool shadows + warm highlights independently). So the "LUT"
 * is two parts:
 *   1. `grade({...})` → the tonal/saturation curve via filter().
 *   2. A low-opacity <SplitTone> overlay (see ./transitions) blended over the
 *      video to push shadows/highlights toward the stock's signature tint.
 *
 * Presets approximate real stocks/sensors:
 *   KODAK_PORTRA  — creamy warm skin, gentle contrast, muted greens
 *   ALEXA_ARRI    — neutral-cinematic, slightly cool, controlled highlights
 *   KODAK_2383    — print-film punch for the reveal (rich, contrasty)
 *   TRIX_BW       — Tri-X push: crushed near-mono with a sliver of warmth
 *   ROSE_FILM     — rose-gold duotone editorial
 *   CLEAN_HDR     — modern bright vlog look
 * ============================================================
 */

export type GradeParams = {
  brightness?: number;
  contrast?: number;
  saturate?: number;
  sepia?: number;
  hue?: number; // degrees
  grayscale?: number;
  blur?: number; // px
};

/** Compose an ordered CSS filter string. Order matters (sepia before hue). */
export const grade = (p: GradeParams): string => {
  const f: string[] = [];
  if (p.brightness != null) f.push(`brightness(${p.brightness})`);
  if (p.contrast != null) f.push(`contrast(${p.contrast})`);
  if (p.saturate != null) f.push(`saturate(${p.saturate})`);
  if (p.grayscale != null) f.push(`grayscale(${p.grayscale})`);
  if (p.sepia != null) f.push(`sepia(${p.sepia})`);
  if (p.hue != null) f.push(`hue-rotate(${p.hue}deg)`);
  if (p.blur != null) f.push(`blur(${p.blur}px)`);
  return f.join(" ");
};

// ── Cinematic (T1) ────────────────────────────────────────────────────────
export const KODAK_PORTRA = grade({ brightness: 1.02, contrast: 1.06, saturate: 1.08, sepia: 0.12, hue: -6 });
export const ALEXA_ARRI = grade({ brightness: 0.98, contrast: 1.13, saturate: 1.1, sepia: 0.05, hue: -4 });

// ── Hype (T2): crushed mono → print-film reveal ─────────────────────────────
export const TRIX_BW = grade({ brightness: 0.92, contrast: 1.5, saturate: 0.12, sepia: 0.14, grayscale: 0.85 });
export const TRIX_CRUSH = grade({ brightness: 0.85, contrast: 1.72, saturate: 0.08, sepia: 0.1, grayscale: 0.9 });
export const KODAK_2383 = grade({ brightness: 1.05, contrast: 1.18, saturate: 1.26, sepia: 0.04 });

// ── Minimalist (T3): rose-gold duotone → gold reveal ───────────────────────
export const ROSE_FILM = grade({ brightness: 0.92, contrast: 1.12, saturate: 0.74, sepia: 0.26, hue: 318 });
export const ROSE_DEEP = grade({ brightness: 0.85, contrast: 1.18, saturate: 0.56, sepia: 0.38, hue: 316 });
export const ROSE_GOLD_REVEAL = grade({ brightness: 1.07, contrast: 1.08, saturate: 1.34, sepia: 0.06, hue: 2 });

// ── Vlog (T4): clean modern HDR ────────────────────────────────────────────
export const CLEAN_HDR = grade({ brightness: 1.04, contrast: 1.06, saturate: 1.14 });
export const CLEAN_PUNCH = grade({ brightness: 1.05, contrast: 1.12, saturate: 1.24 });
export const CLEAN_REVEAL = grade({ brightness: 1.07, contrast: 1.1, saturate: 1.32 });

/**
 * Signature split-tone overlays (pass to <SplitTone>). `shadow`/`highlight`
 * are rgba strings; the overlay uses `soft-light` so they tint without washing.
 */
export const SPLIT_TEAL_AMBER = { shadow: "rgba(0,40,55,0.55)", highlight: "rgba(255,180,120,0.4)" };
export const SPLIT_ROSE = { shadow: "rgba(60,25,40,0.5)", highlight: "rgba(220,180,150,0.35)" };
export const SPLIT_COOL = { shadow: "rgba(10,20,40,0.45)", highlight: "rgba(255,255,255,0.18)" };
