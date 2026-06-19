/**
 * FILM GRAIN — animated fractal-noise tile shifted every frame.
 * Renders inside Remotion's headless Chromium fine (pure SVG data-URI + CSS).
 */
import React from "react";
import { AbsoluteFill } from "remotion";

const NOISE = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

export const FilmGrain: React.FC<{
  frame: number;
  opacity?: number;
  blend?: React.CSSProperties["mixBlendMode"];
  zIndex?: number;
}> = ({ frame, opacity = 0.05, blend = "overlay", zIndex = 51 }) => {
  const ox = (frame * 37) % 256;
  const oy = (frame * 59) % 256;
  return (
    <AbsoluteFill
      style={{
        backgroundImage: NOISE,
        backgroundSize: "256px 256px",
        backgroundPosition: `${ox}px ${oy}px`,
        opacity,
        mixBlendMode: blend,
        pointerEvents: "none",
        zIndex,
      }}
    />
  );
};
