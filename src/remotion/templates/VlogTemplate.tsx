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

const FPS = 24;
const IW = 18; // soft-glow cut window

const ACCENT = "#FFD23C";
const BG = "#111111";

// ── CLIP 1 — gentle bright push-in ──────────────────────────────────────────
const Clip1: React.FC<{ src: string; frame: number; config?: any; S1: number; D1: number; playbackRate: number }> = ({ src, frame, config, S1, D1, playbackRate }) => {
  const lf = frame - S1;
  const base: Cam = { scale: ip(lf, [0, D1 + IW], [1.06, 1.12], EASE_GLIDE), tx: 0, ty: ip(lf, [0, D1 + IW], [12, -12], EASE_GLIDE), rot: ip(lf, [0, D1 + IW], [-0.4, 0.3], EASE_GLIDE) };
  const c = organic(base, frame, { swayPx: 9, breathe: 0.005, rotDeg: 0.5, seed: 0.3 });
  const startFrom = config ? Math.floor(config.trimStart * FPS) : 0;
  return <Video startFrom={startFrom} src={src} muted playbackRate={playbackRate} style={{ width: "100%", height: "100%", objectFit: "cover", transform: cam(c), filter: CLEAN_HDR }} />;
};

// ── CLIP 2 — lateral pull, settle ───────────────────────────────────────────
const Clip2: React.FC<{ src: string; frame: number; config?: any; S2: number; D2: number; playbackRate: number }> = ({ src, frame, config, S2, D2, playbackRate }) => {
  const lf = frame - S2;
  const base: Cam = { scale: ip(lf, [0, D2 + IW], [1.12, 1.06], EASE_SETTLE), tx: ip(lf, [0, D2 + IW], [18, -12], EASE_GLIDE), ty: 0, rot: ip(lf, [0, D2 + IW], [0.5, -0.3], EASE_GLIDE) };
  const c = organic(base, frame, { swayPx: 9, breathe: 0.005, rotDeg: 0.5, seed: 1.2 });
  const startFrom = config ? Math.floor(config.trimStart * FPS) : 0;
  return <OffthreadVideo startFrom={startFrom} src={src} muted playbackRate={playbackRate} style={{ width: "100%", height: "100%", objectFit: "cover", transform: cam(c), filter: CLEAN_HDR }} />;
};

// ── CLIP 3 — snap-zoom beats (punch in on each cut, alt pan/tilt) ───────────
const Clip3: React.FC<{ src: string; frame: number; config?: any; S3: number; D3: number; SEC: number; playbackRate: number }> = ({ src, frame, config, S3, D3, SEC, playbackRate }) => {
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
  const startFrom = config ? Math.floor(config.trimStart * FPS) : 0;
  return <Video startFrom={startFrom} src={src} muted playbackRate={playbackRate} style={{ width: "100%", height: "100%", objectFit: "cover", transform: cam(c), filter: CLEAN_PUNCH }} />;
};

// ── CLIP 4 — clean confident pull-back ──────────────────────────────────────
const Clip4: React.FC<{ src: string; frame: number; config?: any; S4: number; D4: number; playbackRate: number }> = ({ src, frame, config, S4, D4, playbackRate }) => {
  const lf = frame - S4;
  const base: Cam = { scale: ip(lf, [0, D4], [1.14, 1.04], EASE_GLIDE), tx: 0, ty: ip(lf, [0, D4], [12, -8], EASE_GLIDE), rot: ip(lf, [0, D4], [0.4, -0.2], EASE_GLIDE) };
  const c = organic(base, frame, { swayPx: 6, breathe: 0.004, rotDeg: 0.4, seed: 2.3 });
  const sat = ip(lf, [0, D4 * 0.5], [1.18, 1.34], EASE_GLIDE);
  const startFrom = config ? Math.floor(config.trimStart * FPS) : 0;
  return <Video startFrom={startFrom} src={src} muted playbackRate={playbackRate} style={{ width: "100%", height: "100%", objectFit: "cover", transform: cam(c), filter: `${CLEAN_REVEAL} saturate(${sat.toFixed(3)})` }} />;
};

// ── TEXT — clean Inter ──────────────────────────────────────────────────────
const TextOverlays: React.FC<{ frame: number; S4: number }> = ({ frame, S4 }) => {
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
export const VlogTemplate: React.FC<{ videoUrls: string[]; bgmUrl?: string; claudeConfig?: any }> = ({
  videoUrls,
  bgmUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
  claudeConfig
}) => {
  const frame = useCurrentFrame();

  // DYNAMIC TIMING MATH
  let D1 = 3 * FPS;
  let D2 = 2 * FPS;
  let D3 = 10 * FPS;
  let D4 = 5 * FPS;

  let r1 = 1, r2 = 1, r3 = 1, r4 = 1;

  if (claudeConfig) {
    if (claudeConfig.entering) {
      r1 = claudeConfig.entering.playbackRate || 1;
      D1 = Math.max(1, Math.floor(((claudeConfig.entering.trimEnd - claudeConfig.entering.trimStart) / r1) * FPS));
    }
    if (claudeConfig.choosing) {
      r2 = claudeConfig.choosing.playbackRate || 1;
      D2 = Math.max(1, Math.floor(((claudeConfig.choosing.trimEnd - claudeConfig.choosing.trimStart) / r2) * FPS));
    }
    if (claudeConfig.haircut) {
      r3 = claudeConfig.haircut.playbackRate || 1;
      D3 = Math.max(1, Math.floor(((claudeConfig.haircut.trimEnd - claudeConfig.haircut.trimStart) / r3) * FPS));
    }
    if (claudeConfig.reveal) {
      r4 = claudeConfig.reveal.playbackRate || 1;
      D4 = Math.max(1, Math.floor(((claudeConfig.reveal.trimEnd - claudeConfig.reveal.trimStart) / r4) * FPS));
    }
  }

  const S1 = 0;
  const S2 = S1 + D1;
  const S3 = S2 + D2;
  const S4 = S3 + D3;
  const TOTAL = S4 + D4;
  const SEC = Math.floor(D3 / 6);

  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>

      {videoUrls[0] && (<Sequence from={S1} durationInFrames={D1 + IW}><Clip1 src={videoUrls[0]} frame={frame} config={claudeConfig?.entering} S1={S1} D1={D1} playbackRate={r1} /></Sequence>)}
      {videoUrls[1] && (<Sequence from={S2} durationInFrames={D2 + IW}><Clip2 src={videoUrls[1]} frame={frame} config={claudeConfig?.choosing} S2={S2} D2={D2} playbackRate={r2} /></Sequence>)}
      {videoUrls[2] && (<Sequence from={S3} durationInFrames={D3 + IW}><Clip3 src={videoUrls[2]} frame={frame} config={claudeConfig?.haircut} S3={S3} D3={D3} SEC={SEC} playbackRate={r3} /></Sequence>)}
      {videoUrls[3] && (<Sequence from={S4} durationInFrames={D4}><Clip4 src={videoUrls[3]} frame={frame} config={claudeConfig?.reveal} S4={S4} D4={D4} playbackRate={r4} /></Sequence>)}

      {/* Clean soft-glow + luma cuts */}
      <SoftFlash frame={frame} at={S2} blend="overlay" peak={0.38} />
      <SoftFlash frame={frame} at={S3} blend="overlay" peak={0.38} />
      <LumaFade frame={frame} at={S4} window={12} color="255,255,255" />
      <SoftFlash frame={frame} at={S4} blend="screen" peak={0.5} color="rgba(255,255,255,1)" />

      {/* Clip3 beat flashes */}
      {[1, 2, 3, 4, 5].map((i) => (<SoftFlash key={i} frame={frame} at={S3 + i * SEC} window={6} blend="overlay" peak={0.3} />))}

      <Vignette background="radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.5) 80%, rgba(0,0,0,0.85) 100%)" zIndex={50} />
      <TextOverlays frame={frame} S4={S4} />

      <AbsoluteFill style={{ backgroundColor: BG, opacity: ip(frame, [0, 16], [1, 0], EASE_GLIDE), pointerEvents: "none", zIndex: 70 }} />
      <AbsoluteFill style={{ backgroundColor: BG, opacity: ip(frame, [TOTAL - 20, TOTAL], [0, 1], EASE_GLIDE), pointerEvents: "none", zIndex: 70 }} />
    </AbsoluteFill>
  );
};
