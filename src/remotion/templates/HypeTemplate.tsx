/**
 * ============================================================
 * HYPE — Street Tri-X mono → full-colour drop  (T2)  v3
 * ============================================================
 * Crushed near-monochrome (Tri-X push) for the "before" world, exploding into
 * vibrant Kodak-2383 print colour on the reveal. Aggressive snap-zoom organic
 * camera, directional-blur wipes + RGB chroma splits on every hard cut, CRT
 * scanlines, and Anton heavy-condensed caps with chromatic fringe.
 *
 * TIMELINE (unchanged — note Hype's faster S2=60):
 *   0  – 2.5s (f   0– 59) → Clip1 Entering  (60f, fast push)
 *   2.5– 5s   (f  60–119) → Clip2 Choosing  (60f, snap pull)
 *   5  – 15s  (f 120–359) → Clip3 Process   (240f, 6×40f, chroma cuts)
 *  15  – 20s  (f 360–479) → Clip4 Reveal    (120f, slow colour pull-back)
 * ============================================================
 */

import React from "react";
import { AbsoluteFill, Sequence, Video, OffthreadVideo, Audio, interpolate, useCurrentFrame } from "remotion";

import { EASE_SNAP, EASE_GLIDE, EASE_ACCEL, EASE_SETTLE } from "../lib/easing";
import { ip, organic, cam, type Cam } from "../lib/interp";
import { TRIX_BW, TRIX_CRUSH, KODAK_2383, SPLIT_COOL } from "../lib/grade";
import { Vignette, SplitTone, DirectionalBlurWipe, SoftFlash } from "../lib/transitions";
import { ChromaClip, chromaTextShadow } from "../lib/chroma";
import { MaskedReveal, type RevealTheme } from "../lib/text";
import { FONT_ANTON } from "../lib/fonts";

// ── TIMELINE (locked) ───────────────────────────────────────────────────────
const FPS = 24;
const TOTAL = 480;
const S1 = 0;
const S2 = 60; // 2.5s
const S3 = 120; // 5s
const S4 = 360; // 15s
const D1 = S2 - S1; // 60
const D2 = S3 - S2; // 60
const D3 = S4 - S3; // 240
const D4 = TOTAL - S4; // 120
const GW = 6; // glitch/cut window
const SEC = 40; // 6 × 40

const RATE_C1 = 2.6 / ((D1 + GW) / FPS); // ≈0.945 — full clip (was hardcoded 0.45)
const RATE_C3 = 10.005 / ((D3 + GW) / FPS); // ≈0.976
const RATE_C4 = 6.0 / (D4 / FPS); // 1.2

// ── CRT SCANLINES ───────────────────────────────────────────────────────────
const Scanlines: React.FC<{ frame: number }> = ({ frame }) => {
  const offset = (frame * 2) % 8;
  return (
    <AbsoluteFill
      style={{
        backgroundImage: `repeating-linear-gradient(to bottom, transparent 0px, transparent 3px, rgba(0,0,0,0.18) 3px, rgba(0,0,0,0.18) 4px)`,
        backgroundPosition: `0 ${offset}px`,
        opacity: 0.7,
        pointerEvents: "none",
        zIndex: 51,
      }}
    />
  );
};

// ── CLIP 1 — fast snap push-in ──────────────────────────────────────────────
const Clip1: React.FC<{ src: string; frame: number }> = ({ src, frame }) => {
  const lf = frame - S1;
  const base: Cam = {
    scale: ip(lf, [0, 20], [1.42, 1.12], EASE_SNAP),
    tx: 0,
    ty: ip(lf, [0, 20], [-18, 0], EASE_SNAP),
    rot: ip(lf, [0, 24], [-0.8, 0.3], EASE_SNAP),
  };
  const c = organic(base, frame, { swayPx: 9, breathe: 0.006, rotDeg: 0.7, seed: 0.3 });
  return <Video src={src} muted playbackRate={RATE_C1} style={{ width: "100%", height: "100%", objectFit: "cover", transform: cam(c), filter: TRIX_BW }} />;
};

// ── CLIP 2 — snap pull-back ─────────────────────────────────────────────────
const Clip2: React.FC<{ src: string; frame: number }> = ({ src, frame }) => {
  const lf = frame - S2;
  const base: Cam = {
    scale: ip(lf, [0, 18], [1.05, 1.16], EASE_SETTLE),
    tx: ip(lf, [0, D2], [20, -14], EASE_GLIDE),
    ty: 0,
    rot: ip(lf, [0, 20], [0.6, -0.2], EASE_SNAP),
  };
  const c = organic(base, frame, { swayPx: 8, breathe: 0.006, rotDeg: 0.7, seed: 1.2 });
  return <OffthreadVideo startFrom={0} src={src} muted style={{ width: "100%", height: "100%", objectFit: "cover", transform: cam(c), filter: TRIX_BW }} />;
};

// ── CLIP 3 — 6 rapid-fire sections, chroma split on each cut ────────────────
const Clip3: React.FC<{ src: string; frame: number }> = ({ src, frame }) => {
  const lf = frame - S3;
  const section = Math.min(Math.floor(lf / SEC), 5);
  const sf = lf - section * SEC;

  let base: Cam = { scale: 1.1, tx: 0, ty: 0, rot: 0 };
  switch (section) {
    case 0: base = { scale: ip(sf, [0, 22], [1.26, 1.1], EASE_SNAP), tx: 0, ty: ip(sf, [0, 22], [-14, 0], EASE_SNAP), rot: 0.5 }; break;
    case 1: base = { scale: 1.12, tx: ip(sf, [0, SEC], [-26, 26], EASE_GLIDE), ty: 0, rot: -0.6 }; break;
    case 2: base = { scale: ip(sf, [0, SEC], [1.08, 1.16], EASE_GLIDE), tx: 0, ty: ip(sf, [0, SEC], [-16, 16], EASE_GLIDE), rot: ip(sf, [0, SEC], [-0.8, 0.8], EASE_GLIDE) }; break;
    case 3: base = { scale: ip(sf, [0, 10], [1.2, 1.08], EASE_SNAP), tx: 0, ty: 0, rot: 0.4 }; break; // pump
    case 4: base = { scale: 1.12, tx: 0, ty: ip(sf, [0, SEC], [22, -22], EASE_GLIDE), rot: -0.6 }; break;
    case 5: base = { scale: ip(sf, [0, SEC], [1.06, 1.22], EASE_ACCEL), tx: 0, ty: 0, rot: 0.5 }; break;
  }
  const c = organic(base, frame, { swayPx: 7, breathe: 0.007, rotDeg: 0.6, seed: section * 0.9 });
  const splitPx = ip(sf, [0, 6], [9, 0], EASE_ACCEL); // hard chroma fringe on cut
  const filter = section % 2 === 0 ? TRIX_BW : TRIX_CRUSH;
  return <ChromaClip src={src} transform={cam(c)} filter={filter} splitPx={splitPx} playbackRate={RATE_C3} />;
};

// ── CLIP 4 — slow heroic colour pull-back ──────────────────────────────────
const Clip4: React.FC<{ src: string; frame: number }> = ({ src, frame }) => {
  const lf = frame - S4;
  const base: Cam = {
    scale: ip(lf, [0, D4], [1.26, 1.06], EASE_GLIDE),
    tx: 0,
    ty: ip(lf, [0, D4], [24, -12], EASE_GLIDE),
    rot: ip(lf, [0, D4], [0.7, -0.2], EASE_GLIDE),
  };
  const c = organic(base, frame, { swayPx: 7, breathe: 0.004, rotDeg: 0.4, seed: 2.1 });
  const sat = ip(lf, [0, D4 * 0.5], [1.1, 1.4], EASE_GLIDE);
  const filter = `${KODAK_2383} saturate(${sat.toFixed(3)})`;
  return <Video src={src} muted playbackRate={RATE_C4} style={{ width: "100%", height: "100%", objectFit: "cover", transform: cam(c), filter }} />;
};

// ── COLOUR EXPLOSION on the reveal ─────────────────────────────────────────
const ColorExplosion: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [S4, S4 + 4, S4 + 20, S4 + 50], [0, 0.85, 0.3, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_SNAP });
  return <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, rgba(255,220,60,1) 0%, rgba(255,100,0,0.6) 35%, transparent 70%)", opacity, mixBlendMode: "screen", pointerEvents: "none", zIndex: 46 }} />;
};

// ── TEXT — Anton heavy caps with chroma fringe ─────────────────────────────
const TextOverlays: React.FC<{ frame: number }> = ({ frame }) => {
  const beforeTheme: RevealTheme = { fontFamily: FONT_ANTON, fontSize: 128, fontWeight: 400, letterSpacing: 6, color: "rgba(255,255,255,0.97)", textShadow: chromaTextShadow(2.4), textTransform: "uppercase" };
  const afterTheme: RevealTheme = { fontFamily: FONT_ANTON, fontSize: 150, fontWeight: 400, letterSpacing: 4, color: "#ffd23c", textShadow: chromaTextShadow(3, "0 6px 30px rgba(0,0,0,0.9)"), textTransform: "uppercase" };
  return (
    <>
      <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 170, zIndex: 60 }}>
        <MaskedReveal frame={frame} text="Before" inAt={8} outAt={S4 - 16} theme={beforeTheme} inDur={12} />
      </AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 170, zIndex: 60 }}>
        <MaskedReveal frame={frame} text="After" inAt={S4 + 4} theme={afterTheme} inDur={14} />
      </AbsoluteFill>
    </>
  );
};

// ── MAIN COMPOSITION ────────────────────────────────────────────────────────
export const HypeTemplate: React.FC<{ videoUrls: string[]; bgmUrl?: string }> = ({
  videoUrls,
  bgmUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Audio src={bgmUrl} volume={(f) => interpolate(f, [0, 16, TOTAL - 16, TOTAL], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />

      {videoUrls[0] && (<Sequence from={S1} durationInFrames={D1 + GW}><Clip1 src={videoUrls[0]} frame={frame} /></Sequence>)}
      {videoUrls[1] && (<Sequence from={S2} durationInFrames={D2 + GW}><Clip2 src={videoUrls[1]} frame={frame} /></Sequence>)}
      {videoUrls[2] && (<Sequence from={S3} durationInFrames={D3 + GW}><Clip3 src={videoUrls[2]} frame={frame} /></Sequence>)}
      {videoUrls[3] && (<Sequence from={S4} durationInFrames={D4}><Clip4 src={videoUrls[3]} frame={frame} /></Sequence>)}

      {/* Cool split-tone on the mono before-world */}
      <SplitTone shadow={SPLIT_COOL.shadow} highlight={SPLIT_COOL.highlight} opacity={ip(frame, [S4, S4 + 12], [0.7, 0], EASE_GLIDE)} zIndex={45} />

      {/* Hard cuts → directional blur wipes + flash */}
      <DirectionalBlurWipe frame={frame} at={S2} dir="right" />
      <DirectionalBlurWipe frame={frame} at={S3} dir="left" />
      <DirectionalBlurWipe frame={frame} at={S4} dir="up" color="rgba(255,220,120,0.6)" />
      <SoftFlash frame={frame} at={S2} peak={0.45} />
      <SoftFlash frame={frame} at={S3} peak={0.45} />

      {/* Clip3 internal cuts */}
      {[1, 2, 3, 4, 5].map((i) => (<SoftFlash key={i} frame={frame} at={S3 + i * SEC} window={6} peak={0.35} />))}

      <ColorExplosion frame={frame} />

      <Vignette background="radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(0,0,0,0.92) 100%)" zIndex={50} />
      <Scanlines frame={frame} />
      <TextOverlays frame={frame} />

      {/* Aggressive open / clean close */}
      <AbsoluteFill style={{ backgroundColor: "black", opacity: ip(frame, [0, 9], [1, 0], EASE_SNAP), pointerEvents: "none", zIndex: 70 }} />
      <AbsoluteFill style={{ backgroundColor: "black", opacity: ip(frame, [TOTAL - 18, TOTAL], [0, 1], EASE_GLIDE), pointerEvents: "none", zIndex: 70 }} />
    </AbsoluteFill>
  );
};
