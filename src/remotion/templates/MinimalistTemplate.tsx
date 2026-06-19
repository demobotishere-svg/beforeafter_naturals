/**
 * ============================================================
 * MINIMALIST — Luxury Editorial  (T3)  v2
 * ============================================================
 * High-fashion magazine feel: rose-gold duotone, ink-wipe + iris-reveal
 * transitions, ultra-slow deliberate Ken Burns (no snaps), halftone print
 * texture, gold rule lines, and thin lowercase Cormorant titles that rise
 * from behind the baseline. Silence and weight instead of flash.
 *
 * TIMELINE (unchanged):
 *   0  – 3s   (f   0– 71) → Clip1 Entering   (72f)
 *   3  – 5s   (f  72–119) → Clip2 Choosing    (48f)
 *   5  – 15s  (f 120–359) → Clip3 Process      (240f, 3 slow phases)
 *  15  – 20s  (f 360–479) → Clip4 Reveal       (120f, iris + gold bloom)
 * ============================================================
 */

import React from "react";
import { AbsoluteFill, Sequence, Video, OffthreadVideo, Audio, interpolate, useCurrentFrame } from "remotion";

import { EASE_LUXE, EASE_GLIDE, EASE_INK } from "../lib/easing";
import { ip, organic, cam, type Cam } from "../lib/interp";
import { ROSE_FILM, ROSE_DEEP, ROSE_GOLD_REVEAL, SPLIT_ROSE, grade } from "../lib/grade";
import { Vignette, SplitTone, InkWipe, IrisReveal } from "../lib/transitions";
import { MaskedReveal, type RevealTheme } from "../lib/text";
import { FONT_CORMORANT } from "../lib/fonts";

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
const IW = 20; // ink-wipe window
const PH = Math.floor(D3 / 3); // 80 frames per phase

const RATE_C1 = 2.6 / ((D1 + IW) / FPS); // ≈0.678 — full clip (was hardcoded 0.45)
const RATE_C3 = 10.005 / ((D3 + IW) / FPS); // ≈0.924
const RATE_C4 = 6.0 / (D4 / FPS); // 1.2

const ROSE_GOLD = "#c9a77a";

// ── HALFTONE PRINT TEXTURE ──────────────────────────────────────────────────
const Halftone: React.FC = () => (
  <AbsoluteFill style={{ backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.18) 1px, transparent 1px)", backgroundSize: "6px 6px", opacity: 0.42, mixBlendMode: "multiply", pointerEvents: "none", zIndex: 51 }} />
);

// ── DUST LINES (analog luxury) ──────────────────────────────────────────────
const DustLines: React.FC<{ frame: number }> = ({ frame }) => {
  const lines = [{ x: "18%", seed: 7 }, { x: "54%", seed: 13 }, { x: "81%", seed: 3 }];
  return (
    <AbsoluteFill style={{ pointerEvents: "none", zIndex: 52 }}>
      {lines.map(({ x, seed }, i) => {
        const op = 0.04 + 0.06 * Math.abs(Math.sin((frame + seed * 11) * 0.07 + i));
        return <div key={i} style={{ position: "absolute", left: x, top: 0, width: 1, height: "100%", background: `linear-gradient(to bottom, transparent 0%, rgba(201,167,122,${op * 2}) 20%, rgba(201,167,122,${op}) 80%, transparent 100%)` }} />;
      })}
    </AbsoluteFill>
  );
};

// ── GOLD RULE LINES (editorial frame) ───────────────────────────────────────
const GoldRules: React.FC<{ frame: number }> = ({ frame }) => {
  const lineW = ip(frame, [6, 30], [0, 100], EASE_GLIDE);
  const globalOp = ip(frame, [TOTAL - 22, TOTAL], [1, 0], EASE_GLIDE);
  const rule = (top?: number, bottom?: number) => (
    <div style={{ position: "absolute", top, bottom, left: "6%", width: `${lineW}%`, maxWidth: "88%", height: 1, background: `linear-gradient(to right, ${ROSE_GOLD}, rgba(201,167,122,0.2))`, opacity: globalOp * 0.8 }} />
  );
  return <AbsoluteFill style={{ pointerEvents: "none", zIndex: 53 }}>{rule(84, undefined)}{rule(undefined, 84)}</AbsoluteFill>;
};

// ── DUOTONE / GOLD BLOOM ON REVEAL ──────────────────────────────────────────
const DuotoneOverlay: React.FC<{ frame: number }> = ({ frame }) => {
  const tintOp = ip(frame, [S4 + 10, S4 + 38], [0.22, 0], EASE_GLIDE);
  return <AbsoluteFill style={{ background: "linear-gradient(160deg, rgba(180,90,100,0.18) 0%, rgba(80,40,55,0.28) 100%)", opacity: tintOp, mixBlendMode: "multiply", pointerEvents: "none", zIndex: 48 }} />;
};
const GoldBloom: React.FC<{ frame: number }> = ({ frame }) => {
  const op = interpolate(frame, [S4 + 8, S4 + 22, S4 + 55, S4 + D4], [0, 0.4, 0.12, 0.05], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_GLIDE });
  return <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 42%, rgba(220,180,90,1) 0%, rgba(200,140,60,0) 55%)", opacity: op, mixBlendMode: "soft-light", pointerEvents: "none", zIndex: 47 }} />;
};

// ── CLIPS — ultra-slow, deliberate Ken Burns ────────────────────────────────
const Clip1: React.FC<{ src: string; frame: number }> = ({ src, frame }) => {
  const lf = frame - S1;
  const base: Cam = { scale: ip(lf, [0, D1 + IW], [1.06, 1.13], EASE_LUXE), tx: 0, ty: ip(lf, [0, D1 + IW], [-10, 14], EASE_LUXE), rot: ip(lf, [0, D1 + IW], [-0.4, 0.3], EASE_LUXE) };
  const c = organic(base, frame, { swayPx: 6, breathe: 0.003, rotDeg: 0.35, seed: 0.2 });
  return <Video src={src} muted playbackRate={RATE_C1} style={{ width: "100%", height: "100%", objectFit: "cover", transform: cam(c), filter: ROSE_FILM }} />;
};
const Clip2: React.FC<{ src: string; frame: number }> = ({ src, frame }) => {
  const lf = frame - S2;
  const base: Cam = { scale: ip(lf, [0, D2 + IW], [1.13, 1.07], EASE_LUXE), tx: ip(lf, [0, D2 + IW], [-12, 12], EASE_LUXE), ty: 0, rot: ip(lf, [0, D2 + IW], [0.4, -0.2], EASE_LUXE) };
  const c = organic(base, frame, { swayPx: 6, breathe: 0.003, rotDeg: 0.35, seed: 1.1 });
  return <OffthreadVideo startFrom={0} src={src} muted style={{ width: "100%", height: "100%", objectFit: "cover", transform: cam(c), filter: ROSE_FILM }} />;
};
const Clip3: React.FC<{ src: string; frame: number }> = ({ src, frame }) => {
  const lf = frame - S3;
  const phase = Math.min(Math.floor(lf / PH), 2);
  const pf = lf - phase * PH;
  let base: Cam = { scale: 1.08, tx: 0, ty: 0, rot: 0 };
  let filter = ROSE_FILM;
  switch (phase) {
    case 0: base = { scale: ip(pf, [0, PH], [1.12, 1.05], EASE_LUXE), tx: 0, ty: ip(pf, [0, PH], [-12, 14], EASE_LUXE), rot: 0.3 }; filter = ROSE_FILM; break;
    case 1: base = { scale: ip(pf, [0, PH], [1.06, 1.1], EASE_LUXE), tx: ip(pf, [0, PH], [-12, 12], EASE_LUXE), ty: 0, rot: -0.3 }; filter = ROSE_DEEP; break;
    case 2: {
      base = { scale: ip(pf, [0, PH], [1.05, 1.13], EASE_LUXE), tx: 0, ty: ip(pf, [0, PH], [16, -16], EASE_LUXE), rot: 0.3 };
      const warmth = ip(pf, [PH * 0.6, PH], [0.28, 0.14], EASE_GLIDE);
      filter = grade({ brightness: 0.92, contrast: 1.12, saturate: 0.78, sepia: warmth, hue: 320 });
      break;
    }
  }
  const c = organic(base, frame, { swayPx: 5, breathe: 0.003, rotDeg: 0.3, seed: phase * 0.8 });
  return <Video src={src} muted playbackRate={RATE_C3} style={{ width: "100%", height: "100%", objectFit: "cover", transform: cam(c), filter }} />;
};
const Clip4: React.FC<{ src: string; frame: number }> = ({ src, frame }) => {
  const lf = frame - S4;
  const base: Cam = { scale: ip(lf, [0, D4], [1.12, 1.04], EASE_LUXE), tx: 0, ty: ip(lf, [0, D4], [12, -10], EASE_LUXE), rot: ip(lf, [0, D4], [0.4, -0.2], EASE_LUXE) };
  const c = organic(base, frame, { swayPx: 5, breathe: 0.003, rotDeg: 0.3, seed: 2.2 });
  const sat = ip(lf, [0, D4 * 0.6], [1.18, 1.36], EASE_GLIDE);
  return <Video src={src} muted playbackRate={RATE_C4} style={{ width: "100%", height: "100%", objectFit: "cover", transform: cam(c), filter: `${ROSE_GOLD_REVEAL} saturate(${sat.toFixed(3)})` }} />;
};

// ── TEXT — thin lowercase Cormorant ────────────────────────────────────────
const TextOverlays: React.FC<{ frame: number }> = ({ frame }) => {
  const t = (color: string, size: number): RevealTheme => ({ fontFamily: FONT_CORMORANT, fontSize: size, fontWeight: 300, letterSpacing: 18, color, textShadow: "0 4px 28px rgba(0,0,0,0.7)" });
  return (
    <>
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 220, zIndex: 60 }}>
        <MaskedReveal frame={frame} text="before" inAt={14} outAt={S4 - 18} theme={t("rgba(245,237,224,0.95)", 84)} inDur={22} />
      </AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 220, zIndex: 60 }}>
        <MaskedReveal frame={frame} text="revealed" inAt={S4 + 8} theme={t(ROSE_GOLD, 100)} inDur={26} />
      </AbsoluteFill>
    </>
  );
};

// ── MAIN COMPOSITION ────────────────────────────────────────────────────────
export const MinimalistTemplate: React.FC<{ videoUrls: string[]; bgmUrl?: string }> = ({
  videoUrls,
  bgmUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#0d0d0d" }}>
      <Audio src={bgmUrl} volume={(f) => interpolate(f, [0, 36, TOTAL - 36, TOTAL], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />

      {videoUrls[0] && (<Sequence from={S1} durationInFrames={D1 + IW}><Clip1 src={videoUrls[0]} frame={frame} /></Sequence>)}
      {videoUrls[1] && (<Sequence from={S2} durationInFrames={D2 + IW}><Clip2 src={videoUrls[1]} frame={frame} /></Sequence>)}
      {videoUrls[2] && (<Sequence from={S3} durationInFrames={D3 + IW}><Clip3 src={videoUrls[2]} frame={frame} /></Sequence>)}
      {videoUrls[3] && (<Sequence from={S4} durationInFrames={D4}><Clip4 src={videoUrls[3]} frame={frame} /></Sequence>)}

      <SplitTone shadow={SPLIT_ROSE.shadow} highlight={SPLIT_ROSE.highlight} opacity={ip(frame, [S4 + 6, S4 + 34], [0.7, 0.25], EASE_GLIDE)} blend="multiply" zIndex={45} />
      <DuotoneOverlay frame={frame} />
      <GoldBloom frame={frame} />

      {/* Weighted ink-wipe cuts; iris on the reveal */}
      <InkWipe frame={frame} at={S2} window={IW} easing={EASE_INK} />
      <InkWipe frame={frame} at={S3} window={IW} easing={EASE_INK} />
      <InkWipe frame={frame} at={S4} window={IW} easing={EASE_INK} />
      <IrisReveal frame={frame} start={S4} window={50} easing={EASE_LUXE} />

      <Vignette background="radial-gradient(ellipse 70% 60% at 50% 50%, transparent 38%, rgba(0,0,0,0.72) 78%, rgba(0,0,0,0.96) 100%)" zIndex={50} />
      <Halftone />
      <DustLines frame={frame} />
      <GoldRules frame={frame} />
      <TextOverlays frame={frame} />

      <AbsoluteFill style={{ backgroundColor: "#0d0d0d", opacity: ip(frame, [0, 22], [1, 0], EASE_LUXE), pointerEvents: "none", zIndex: 70 }} />
      <AbsoluteFill style={{ backgroundColor: "#0d0d0d", opacity: ip(frame, [TOTAL - 28, TOTAL], [0, 1], EASE_LUXE), pointerEvents: "none", zIndex: 70 }} />
    </AbsoluteFill>
  );
};
