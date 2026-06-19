/**
 * ============================================================
 * VLOG — Clean modern day-in-the-life  (T4)  v2
 * ============================================================
 * Bright, friendly HDR colour, snappy beat-synced zoom punches on the process,
 * soft-glow / luma-dissolve cuts (no glitch), and clean Inter titles. The
 * approachable, "real" counterpoint to the cinematic and luxury styles.
 *
 * TIMELINE (unchanged):
 *   0  – 3s   (f   0– 71) → Clip1 Entering   (72f)
 *   3  – 5s   (f  72–119) → Clip2 Choosing    (48f)
 *   5  – 15s  (f 120–359) → Clip3 Process      (240f, 6 snap-zoom beats)
 *  15  – 20s  (f 360–479) → Clip4 Reveal       (120f, clean pull-back)
 * ============================================================
 */

import React from "react";
import { AbsoluteFill, Sequence, Video, OffthreadVideo, Audio, interpolate, useCurrentFrame } from "remotion";

import { EASE_GLIDE, EASE_SNAP, EASE_SETTLE } from "../lib/easing";
import { ip, organic, cam, type Cam } from "../lib/interp";
import { CLEAN_HDR, CLEAN_PUNCH, CLEAN_REVEAL } from "../lib/grade";
import { Vignette, SoftFlash, LumaFade } from "../lib/transitions";
import { MaskedReveal, type RevealTheme } from "../lib/text";
import { FONT_INTER } from "../lib/fonts";

// ── TIMELINE (locked) ───────────────────────────────────────────────────────
const FPS = 24;
const TOTAL = 480;
const S1 = 0;
const S2 = 72; // 3s
const S3 = 120; // 5s
const S4 = 360; // 15s
const D1 = S2 - S1; // 72
const D2 = S3 - S2; // 48
const D3 = S4 - S3; // 240
const D4 = TOTAL - S4; // 120
const IW = 18; // soft-glow cut window
const SEC = 40; // 6 × 40

const RATE_C1 = 2.6 / ((D1 + IW) / FPS); // ≈0.693 — full clip (was hardcoded 0.45)
const RATE_C3 = 10.005 / ((D3 + IW) / FPS); // ≈0.931
const RATE_C4 = 6.0 / (D4 / FPS); // 1.2

const ACCENT = "#FFD23C";
const BG = "#111111";

// ── CLIP 1 — gentle bright push-in ──────────────────────────────────────────
const Clip1: React.FC<{ src: string; frame: number }> = ({ src, frame }) => {
  const lf = frame - S1;
  const base: Cam = { scale: ip(lf, [0, D1 + IW], [1.06, 1.12], EASE_GLIDE), tx: 0, ty: ip(lf, [0, D1 + IW], [12, -12], EASE_GLIDE), rot: ip(lf, [0, D1 + IW], [-0.4, 0.3], EASE_GLIDE) };
  const c = organic(base, frame, { swayPx: 9, breathe: 0.005, rotDeg: 0.5, seed: 0.3 });
  return <Video src={src} muted playbackRate={RATE_C1} style={{ width: "100%", height: "100%", objectFit: "cover", transform: cam(c), filter: CLEAN_HDR }} />;
};

// ── CLIP 2 — lateral pull, settle ───────────────────────────────────────────
const Clip2: React.FC<{ src: string; frame: number }> = ({ src, frame }) => {
  const lf = frame - S2;
  const base: Cam = { scale: ip(lf, [0, D2 + IW], [1.12, 1.06], EASE_SETTLE), tx: ip(lf, [0, D2 + IW], [18, -12], EASE_GLIDE), ty: 0, rot: ip(lf, [0, D2 + IW], [0.5, -0.3], EASE_GLIDE) };
  const c = organic(base, frame, { swayPx: 9, breathe: 0.005, rotDeg: 0.5, seed: 1.2 });
  return <OffthreadVideo startFrom={0} src={src} muted style={{ width: "100%", height: "100%", objectFit: "cover", transform: cam(c), filter: CLEAN_HDR }} />;
};

// ── CLIP 3 — snap-zoom beats (punch in on each cut, alt pan/tilt) ───────────
const Clip3: React.FC<{ src: string; frame: number }> = ({ src, frame }) => {
  const lf = frame - S3;
  const section = Math.min(Math.floor(lf / SEC), 5);
  const sf = lf - section * SEC;
  // Punch in hard at the cut, ease to a hold.
  const zoom = interpolate(sf, [0, 5, SEC], [1.2, 1.08, 1.05], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_SNAP });
  const base: Cam = {
    scale: zoom,
    tx: section % 2 === 0 ? ip(sf, [0, SEC], [16, -16], EASE_GLIDE) : 0,
    ty: section % 2 !== 0 ? ip(sf, [0, SEC], [16, -16], EASE_GLIDE) : 0,
    rot: section % 2 === 0 ? 0.4 : -0.4,
  };
  const c = organic(base, frame, { swayPx: 7, breathe: 0.005, rotDeg: 0.5, seed: section * 0.6 });
  return <Video src={src} muted playbackRate={RATE_C3} style={{ width: "100%", height: "100%", objectFit: "cover", transform: cam(c), filter: CLEAN_PUNCH }} />;
};

// ── CLIP 4 — clean confident pull-back ──────────────────────────────────────
const Clip4: React.FC<{ src: string; frame: number }> = ({ src, frame }) => {
  const lf = frame - S4;
  const base: Cam = { scale: ip(lf, [0, D4], [1.14, 1.04], EASE_GLIDE), tx: 0, ty: ip(lf, [0, D4], [12, -8], EASE_GLIDE), rot: ip(lf, [0, D4], [0.4, -0.2], EASE_GLIDE) };
  const c = organic(base, frame, { swayPx: 6, breathe: 0.004, rotDeg: 0.4, seed: 2.3 });
  const sat = ip(lf, [0, D4 * 0.5], [1.18, 1.34], EASE_GLIDE);
  return <Video src={src} muted playbackRate={RATE_C4} style={{ width: "100%", height: "100%", objectFit: "cover", transform: cam(c), filter: `${CLEAN_REVEAL} saturate(${sat.toFixed(3)})` }} />;
};

// ── TEXT — clean Inter ──────────────────────────────────────────────────────
const TextOverlays: React.FC<{ frame: number }> = ({ frame }) => {
  const beforeTheme: RevealTheme = { fontFamily: FONT_INTER, fontSize: 84, fontWeight: 800, letterSpacing: 2, color: "rgba(255,255,255,0.97)", textShadow: "0 6px 28px rgba(0,0,0,0.85)", textTransform: "uppercase" };
  const afterTheme: RevealTheme = { fontFamily: FONT_INTER, fontSize: 104, fontWeight: 800, letterSpacing: 1, color: ACCENT, textShadow: "0 6px 28px rgba(0,0,0,0.85)", textTransform: "uppercase" };
  return (
    <>
      <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 180, zIndex: 60 }}>
        <MaskedReveal frame={frame} text="Before" inAt={10} outAt={S4 - 16} theme={beforeTheme} inDur={14} />
      </AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 180, zIndex: 60 }}>
        <MaskedReveal frame={frame} text="After" inAt={S4 + 4} theme={afterTheme} inDur={16} />
      </AbsoluteFill>
    </>
  );
};

// ── MAIN COMPOSITION ────────────────────────────────────────────────────────
export const VlogTemplate: React.FC<{ videoUrls: string[]; bgmUrl?: string }> = ({
  videoUrls,
  bgmUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <Audio src={bgmUrl} volume={(f) => interpolate(f, [0, 22, TOTAL - 22, TOTAL], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />

      {videoUrls[0] && (<Sequence from={S1} durationInFrames={D1 + IW}><Clip1 src={videoUrls[0]} frame={frame} /></Sequence>)}
      {videoUrls[1] && (<Sequence from={S2} durationInFrames={D2 + IW}><Clip2 src={videoUrls[1]} frame={frame} /></Sequence>)}
      {videoUrls[2] && (<Sequence from={S3} durationInFrames={D3 + IW}><Clip3 src={videoUrls[2]} frame={frame} /></Sequence>)}
      {videoUrls[3] && (<Sequence from={S4} durationInFrames={D4}><Clip4 src={videoUrls[3]} frame={frame} /></Sequence>)}

      {/* Clean soft-glow + luma cuts */}
      <SoftFlash frame={frame} at={S2} blend="overlay" peak={0.38} />
      <SoftFlash frame={frame} at={S3} blend="overlay" peak={0.38} />
      <LumaFade frame={frame} at={S4} window={12} color="255,255,255" />
      <SoftFlash frame={frame} at={S4} blend="screen" peak={0.5} color="rgba(255,255,255,1)" />

      {/* Clip3 beat flashes */}
      {[1, 2, 3, 4, 5].map((i) => (<SoftFlash key={i} frame={frame} at={S3 + i * SEC} window={6} blend="overlay" peak={0.3} />))}

      <Vignette background="radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.5) 80%, rgba(0,0,0,0.85) 100%)" zIndex={50} />
      <TextOverlays frame={frame} />

      <AbsoluteFill style={{ backgroundColor: BG, opacity: ip(frame, [0, 16], [1, 0], EASE_GLIDE), pointerEvents: "none", zIndex: 70 }} />
      <AbsoluteFill style={{ backgroundColor: BG, opacity: ip(frame, [TOTAL - 20, TOTAL], [0, 1], EASE_GLIDE), pointerEvents: "none", zIndex: 70 }} />
    </AbsoluteFill>
  );
};
