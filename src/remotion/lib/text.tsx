/**
 * ============================================================
 * KINETIC TYPOGRAPHY — MASKED BASELINE REVEALS
 * ============================================================
 * Replaces the identical fade-in BEFORE/AFTER block that was copy-pasted into
 * all four templates. Text rises up from behind an invisible baseline
 * (overflow:hidden clip), the hallmark of a high-end title sequence, and exits
 * by sliding up + blurring out. Per-word, optional per-letter stagger.
 * ============================================================
 */
import React from "react";
import { ip } from "./interp";
import { EASE_LUXE } from "./easing";

export type RevealTheme = {
  fontFamily: string;
  fontSize: number;
  fontWeight?: number | string;
  letterSpacing?: number;
  color: string;
  textShadow?: string;
  textTransform?: React.CSSProperties["textTransform"];
};

/**
 * A single masked line. `inAt` = frame the rise begins; `outAt` (optional) =
 * frame the exit begins. `index`/`stagger` shift timing for sequential lines.
 */
export const MaskedReveal: React.FC<{
  frame: number;
  text: string;
  inAt: number;
  outAt?: number;
  theme: RevealTheme;
  inDur?: number;
  outDur?: number;
  index?: number;
  stagger?: number;
}> = ({ frame, text, inAt, outAt, theme, inDur = 18, outDur = 12, index = 0, stagger = 0 }) => {
  const start = inAt + index * stagger;
  const enterY = ip(frame, [start, start + inDur], [115, 0], EASE_LUXE);
  const exitY = outAt != null ? ip(frame, [outAt, outAt + outDur], [0, -125], EASE_LUXE) : 0;
  const exiting = outAt != null && frame >= outAt;
  const y = exiting ? exitY : enterY;
  const blur = exiting ? ip(frame, [outAt, outAt + outDur], [0, 9], EASE_LUXE) : 0;

  return (
    <span
      style={{
        display: "inline-block",
        overflow: "hidden",
        paddingTop: "0.08em",
        paddingBottom: "0.22em",
        lineHeight: 1,
      }}
    >
      <span
        style={{
          display: "inline-block",
          transform: `translateY(${y.toFixed(2)}%)`,
          filter: blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : undefined,
          margin: 0,
          fontFamily: theme.fontFamily,
          fontSize: theme.fontSize,
          fontWeight: theme.fontWeight ?? 400,
          letterSpacing: theme.letterSpacing ?? 0,
          color: theme.color,
          textShadow: theme.textShadow,
          textTransform: theme.textTransform,
          userSelect: "none",
          whiteSpace: "nowrap",
        }}
      >
        {text}
      </span>
    </span>
  );
};
