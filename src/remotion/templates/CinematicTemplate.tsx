/**
 * ============================================================
 * CINEMATIC — "Alexa/Portra" editorial film  (T1)  v4
 * ============================================================
 * Teal-shadow / warm-skin filmic grade, animated grain, organic hand-held
 * camera, warm light-leak + luma-dissolve transitions, a single chromatic
 * spike on the hero reveal, and Playfair masked-baseline titles.
 *
 * TIMELINE (unchanged, locked @ 24fps):
 *   0  – 3s   (f   0– 71) → Clip1 Entering   (slow luxe push-in)
 *   3  – 5s   (f  72–119) → Clip2 Choosing    (settle pull-back)
 *   5  – 15s  (f 120–359) → Clip3 Process      (6 organic sections + chroma)
 *  15  – 20s  (f 360–479) → Clip4 Reveal       (heroic pull-back)
 *
 * Art elevated; the S1–S4 architecture and Sequence windows are untouched.
 * ============================================================
 */

import {
  AbsoluteFill,
  Sequence,
  Video,
  OffthreadVideo,
  Audio,
  useCurrentFrame,
  interpolate,
} from "remotion";
import React from "react";

import { EASE_LUXE, EASE_GLIDE, EASE_ACCEL } from "../lib/easing";
import { ip, osc, organic, cam, type Cam } from "../lib/interp";
import { KODAK_PORTRA, ALEXA_ARRI, KODAK_2383, SPLIT_TEAL_AMBER } from "../lib/grade";
import { FilmGrain } from "../lib/grain";
import { Vignette, SplitTone, LightLeak, LumaFade } from "../lib/transitions";
import { ChromaClip, chromaTextShadow } from "../lib/chroma";
import { MaskedReveal, type RevealTheme } from "../lib/text";
import { FONT_PLAYFAIR } from "../lib/fonts";

// ── TIMELINE CONSTANTS (locked) ─────────────────────────────────────────────
const FPS = 24;
const TOTAL = 20 * FPS; // 480
const S1 = 0;
const S2 = 3 * FPS; // 72
const S3 = 5 * FPS; // 120
const S4 = 15 * FPS; // 360
const D1 = S2 - S1; // 72
const D2 = S3 - S2; // 48
const D3 = S4 - S3; // 240
const D4 = TOTAL - S4; // 120
const XF = 8; // cross-fade window
const SEC = Math.floor(D3 / 6); // 40 frames per Clip3 section

// Raw clip durations (ffprobe) → playbackRate so Video fills its slot, no freeze.
const RAW_C1 = 2.6;
const RAW_C3 = 10.005;
const RAW_C4 = 6.0;
const RATE_C1 = RAW_C1 / ((D1 + XF) / FPS); // ≈0.78 — plays the FULL clip (was hardcoded 0.45)
const RATE_C3 = RAW_C3 / ((D3 + XF) / FPS); // ≈0.968
const RATE_C4 = RAW_C4 / (D4 / FPS); // 1.2

const fadeIn = (frame: number, seqStart: number) => ip(frame, [seqStart, seqStart + XF], [0, 1], EASE_GLIDE);

// ── CLIP 1 — Entering (slow luxe push-in + drift) ───────────────────────────
const Clip1: React.FC<{ src: string; frame: number }> = ({ src, frame }) => {
  const lf = frame - S1;
  const base: Cam = {
    scale: ip(lf, [0, D1 + XF], [1.08, 1.2], EASE_LUXE),
    tx: 0,
    ty: ip(lf, [0, D1 + XF], [22, -22], EASE_LUXE),
    rot: ip(lf, [0, D1 + XF], [-0.5, 0.4], EASE_LUXE),
  };
  const c = organic(base, frame, { swayPx: 10, breathe: 0.005, rotDeg: 0.5, seed: 0.2 });
  return <Video src={src} muted playbackRate={RATE_C1} style={{ width: "100%", height: "100%", objectFit: "cover", transform: cam(c), filter: KODAK_PORTRA }} />;
};

// ── CLIP 2 — Choosing (settle pull-back, cross-fades in) ────────────────────
const Clip2: React.FC<{ src: string; frame: number }> = ({ src, frame }) => {
  const lf = frame - S2;
  const base: Cam = {
    scale: ip(lf, [0, D2 + XF], [1.18, 1.07], EASE_LUXE),
    tx: ip(lf, [0, D2 + XF], [-18, 14], EASE_GLIDE),
    ty: 0,
    rot: ip(lf, [0, D2 + XF], [0.5, -0.3], EASE_LUXE),
  };
  const c = organic(base, frame, { swayPx: 9, breathe: 0.005, rotDeg: 0.5, seed: 1.1 });
  return (
    <AbsoluteFill style={{ opacity: fadeIn(frame, S2) }}>
      <OffthreadVideo startFrom={0} src={src} muted style={{ width: "100%", height: "100%", objectFit: "cover", transform: cam(c), filter: ALEXA_ARRI }} />
    </AbsoluteFill>
  );
};

// ── CLIP 3 — Process (6 organic sections, chroma fringe on each cut) ────────
const Clip3: React.FC<{ src: string; frame: number }> = ({ src, frame }) => {
  const lf = frame - S3;
  const section = Math.min(Math.floor(lf / SEC), 5);
  const sf = lf - section * SEC;

  let base: Cam = { scale: 1.1, tx: 0, ty: 0, rot: 0 };
  switch (section) {
    case 0: base = { scale: ip(sf, [0, SEC], [1.06, 1.16], EASE_LUXE), tx: 0, ty: ip(sf, [0, SEC], [14, -14], EASE_GLIDE), rot: 0.3 }; break;
    case 1: base = { scale: 1.14, tx: ip(sf, [0, SEC], [24, -24], EASE_GLIDE), ty: 0, rot: -0.4 }; break;
    case 2: base = { scale: ip(sf, [0, SEC], [1.16, 1.07], EASE_LUXE), tx: 0, ty: ip(sf, [0, SEC], [-12, 12], EASE_GLIDE), rot: 0.4 }; break;
    case 3: base = { scale: 1.1, tx: ip(sf, [0, SEC], [-18, 18], EASE_GLIDE), ty: ip(sf, [0, SEC], [10, -10], EASE_GLIDE), rot: -0.3 }; break;
    case 4: base = { scale: 1.12, tx: 0, ty: ip(sf, [0, SEC], [22, -22], EASE_GLIDE), rot: 0.5 }; break;
    case 5: base = { scale: ip(sf, [0, SEC], [1.07, 1.2], EASE_ACCEL), tx: 0, ty: 0, rot: -0.4 }; break;
  }
  const c = organic(base, frame, { swayPx: 8, breathe: 0.005, rotDeg: 0.4, seed: section * 0.7 });
  // Subtle RGB fringe at each section cut (sf≈0), classy not glitchy.
  const splitPx = ip(sf, [0, 5], [3.5, 0], EASE_ACCEL);
  const filter = section === 1 || section === 4 ? ALEXA_ARRI : KODAK_PORTRA;
  return (
    <AbsoluteFill style={{ opacity: fadeIn(frame, S3) }}>
      <ChromaClip src={src} transform={cam(c)} filter={filter} splitPx={splitPx} playbackRate={RATE_C3} />
    </AbsoluteFill>
  );
};

// ── CLIP 4 — Reveal (heroic pull-back, print-film punch) ───────────────────
const Clip4: React.FC<{ src: string; frame: number }> = ({ src, frame }) => {
  const lf = frame - S4;
  const base: Cam = {
    scale: ip(lf, [0, D4], [1.2, 1.06], EASE_LUXE),
    tx: ip(lf, [0, D4], [14, -12], EASE_LUXE),
    ty: 0,
    rot: ip(lf, [0, D4], [0.6, -0.2], EASE_LUXE),
  };
  const c = organic(base, frame, { swayPx: 7, breathe: 0.004, rotDeg: 0.4, seed: 2.4 });
  // Saturation/warmth drifts up across the reveal → earns the payoff.
  const warm = ip(lf, [0, D4 * 0.6], [1.16, 1.26], EASE_GLIDE);
  const filter = `${KODAK_2383} saturate(${warm.toFixed(3)})`;
  return (
    <AbsoluteFill style={{ opacity: fadeIn(frame, S4) }}>
      <Video src={src} muted playbackRate={RATE_C4} style={{ width: "100%", height: "100%", objectFit: "cover", transform: cam(c), filter }} />
    </AbsoluteFill>
  );
};

// ── SPARKLE ✦ (signature corner accent, refined pulse) ─────────────────────
const Sparkle: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = 0.45 + 0.45 * Math.abs(Math.sin(frame * 0.14));
  const scale = 0.82 + 0.26 * Math.abs(Math.sin(frame * 0.1));
  return (
    <AbsoluteFill style={{ pointerEvents: "none", zIndex: 52 }}>
      <div style={{ position: "absolute", bottom: 92, right: 78, fontSize: 64, color: "white", opacity, transform: `scale(${scale}) rotate(${osc(frame, 260, 6)}deg)`, textShadow: "0 0 22px rgba(255,255,255,0.95), 0 0 46px rgba(255,210,150,0.5)", fontFamily: "serif", lineHeight: 1 }}>✦</div>
    </AbsoluteFill>
  );
};

// ── GOLDEN REVEAL GLOW ──────────────────────────────────────────────────────
const RevealGlow: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [S4, S4 + 6, S4 + 28, S4 + D4], [0, 0.5, 0.14, 0.06], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_GLIDE });
  return <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 42%, rgba(255,225,100,1) 0%, rgba(255,200,80,0) 62%)", opacity, mixBlendMode: "screen", pointerEvents: "none", zIndex: 46 }} />;
};

// ── TEXT — Playfair masked baseline reveals ────────────────────────────────
const TextOverlays: React.FC<{ frame: number }> = ({ frame }) => {
  const beforeTheme: RevealTheme = { fontFamily: FONT_PLAYFAIR, fontSize: 92, fontWeight: 500, letterSpacing: 26, color: "rgba(255,255,255,0.96)", textShadow: chromaTextShadow(1.2), textTransform: "uppercase" };
  const afterTheme: RevealTheme = { fontFamily: FONT_PLAYFAIR, fontSize: 116, fontWeight: 600, letterSpacing: 34, color: "#f5d061", textShadow: chromaTextShadow(1.6, "0 6px 36px rgba(0,0,0,0.92)"), textTransform: "uppercase" };
  return (
    <>
      <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 190, zIndex: 60 }}>
        <MaskedReveal frame={frame} text="Before" inAt={12} outAt={S4 - 18} theme={beforeTheme} />
      </AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 190, zIndex: 60 }}>
        <MaskedReveal frame={frame} text="After" inAt={S4 + 6} theme={afterTheme} inDur={20} />
      </AbsoluteFill>
    </>
  );
};

// ── MAIN COMPOSITION ────────────────────────────────────────────────────────
export const CinematicTemplate: React.FC<{ videoUrls: string[]; bgmUrl?: string }> = ({
  videoUrls,
  bgmUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Audio src={bgmUrl} volume={(f) => interpolate(f, [0, 24, TOTAL - 24, TOTAL], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />

      {videoUrls[0] && (
        <Sequence from={S1} durationInFrames={D1 + XF}><Clip1 src={videoUrls[0]} frame={frame} /></Sequence>
      )}
      {videoUrls[1] && (
        <Sequence from={S2} durationInFrames={D2 + XF}><Clip2 src={videoUrls[1]} frame={frame} /></Sequence>
      )}
      {videoUrls[2] && (
        <Sequence from={S3} durationInFrames={D3 + XF}><Clip3 src={videoUrls[2]} frame={frame} /></Sequence>
      )}
      {videoUrls[3] && (
        <Sequence from={S4} durationInFrames={D4}><Clip4 src={videoUrls[3]} frame={frame} /></Sequence>
      )}

      {/* Signature split-tone finish (cool shadows + warm highlights) */}
      <SplitTone shadow={SPLIT_TEAL_AMBER.shadow} highlight={SPLIT_TEAL_AMBER.highlight} opacity={0.6} zIndex={45} />

      {/* Main transitions — warm light leaks + luma dissolves */}
      <LightLeak frame={frame} at={S2} window={XF} />
      <LightLeak frame={frame} at={S3} window={XF} />
      <LightLeak frame={frame} at={S4} window={XF} peak={0.55} />
      <LumaFade frame={frame} at={S2} window={10} />
      <LumaFade frame={frame} at={S3} window={10} />

      {/* Internal Clip3 section leaks */}
      {[1, 2, 3, 4, 5].map((i) => (
        <LightLeak key={i} frame={frame} at={S3 + i * SEC} window={XF} peak={0.3} />
      ))}

      <RevealGlow frame={frame} />

      {/* Global finishing layers */}
      <Vignette background="radial-gradient(ellipse at 50% 50%, transparent 42%, rgba(0,0,0,0.86) 100%)" zIndex={50} />
      <FilmGrain frame={frame} opacity={0.055} />
      <Sparkle frame={frame} />
      <TextOverlays frame={frame} />

      {/* Opening fade up */}
      <AbsoluteFill style={{ backgroundColor: "black", opacity: ip(frame, [0, 16], [1, 0], EASE_GLIDE), pointerEvents: "none", zIndex: 70 }} />
      {/* Closing fade out */}
      <AbsoluteFill style={{ backgroundColor: "black", opacity: ip(frame, [TOTAL - 22, TOTAL], [0, 1], EASE_GLIDE), pointerEvents: "none", zIndex: 70 }} />
    </AbsoluteFill>
  );
};
