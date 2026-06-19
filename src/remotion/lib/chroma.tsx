/**
 * ============================================================
 * CHROMATIC ABERRATION
 * ============================================================
 * Two flavours:
 *   1. chromaTextShadow() — cheap, always-on RGB fringe on text via layered
 *      text-shadows. Sub-pixel offsets read as expensive lens dispersion.
 *   2. <ChromaClip> — real RGB split on the VIDEO by stacking two extra tinted
 *      copies (red shifted +x, blue shifted −x, screen-blended). It's heavier
 *      (3× video layers) so drive `splitPx` to spike only at cut moments and
 *      sit at 0 elsewhere — at 0 it renders a single plain <Video>.
 *
 * Video-only (uses playbackRate); Clip2/OffthreadVideo paths don't need CA.
 * ============================================================
 */
import React from "react";
import { Video } from "remotion";

export const chromaTextShadow = (px: number, base = "0 6px 32px rgba(0,0,0,0.9)"): string =>
  `${base}, ${px.toFixed(2)}px 0 rgba(255,42,80,0.5), ${(-px).toFixed(2)}px 0 rgba(0,220,255,0.5)`;

const COVER: React.CSSProperties = {
  position: "absolute",
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

export const ChromaClip: React.FC<{
  src: string;
  transform: string;
  filter: string;
  splitPx: number;
  playbackRate?: number;
}> = ({ src, transform, filter, splitPx, playbackRate }) => {
  if (splitPx < 0.2) {
    return <Video src={src} muted playbackRate={playbackRate} style={{ ...COVER, transform, filter }} />;
  }
  return (
    <>
      <Video src={src} muted playbackRate={playbackRate} style={{ ...COVER, transform, filter }} />
      <Video
        src={src}
        muted
        playbackRate={playbackRate}
        style={{
          ...COVER,
          transform: `${transform} translateX(${splitPx.toFixed(2)}px)`,
          filter: `${filter} sepia(1) saturate(5) hue-rotate(-50deg)`,
          mixBlendMode: "screen",
          opacity: 0.5,
        }}
      />
      <Video
        src={src}
        muted
        playbackRate={playbackRate}
        style={{
          ...COVER,
          transform: `${transform} translateX(${(-splitPx).toFixed(2)}px)`,
          filter: `${filter} sepia(1) saturate(5) hue-rotate(160deg)`,
          mixBlendMode: "screen",
          opacity: 0.5,
        }}
      />
    </>
  );
};
