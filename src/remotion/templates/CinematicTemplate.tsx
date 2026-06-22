/**
 * ============================================================
 * CINEMATIC — "Alexa/Portra" editorial film  (T1)  v4
 * ============================================================
 * Teal-shadow / warm-skin filmic grade, animated grain, organic hand-held
 * camera, warm light-leak + luma-dissolve transitions, a single chromatic
 * spike on the hero reveal, and Playfair masked-baseline titles.
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

const FPS = 24;
const XF = 8; // cross-fade window

const fadeIn = (frame: number, seqStart: number) => ip(frame, [seqStart, seqStart + XF], [0, 1], EASE_GLIDE);

// ── CLIP 1 — Entering ────────────────────────────────────────────────────────
const Clip1: React.FC<{ src: string; frame: number; config?: any; S1: number; D1: number; playbackRate: number }> = ({ src, frame, config, S1, D1, playbackRate }) => {
  const lf = frame - S1;
  const base: Cam = {
    scale: ip(lf, [0, D1 + XF], [1.08, 1.2], EASE_LUXE),
    tx: 0,
    ty: ip(lf, [0, D1 + XF], [22, -22], EASE_LUXE),
    rot: ip(lf, [0, D1 + XF], [-0.5, 0.4], EASE_LUXE),
  };
  const c = organic(base, frame, { swayPx: 10, breathe: 0.005, rotDeg: 0.5, seed: 0.2 });
  const startFrom = config ? Math.floor(config.trimStart * FPS) : 0;
  return <Video startFrom={startFrom} src={src} muted playbackRate={playbackRate} style={{ width: "100%", height: "100%", objectFit: "cover", transform: cam(c), filter: KODAK_PORTRA }} />;
};

// ── CLIP 2 — Choosing ────────────────────────────────────────────────────────
const Clip2: React.FC<{ src: string; frame: number; config?: any; S2: number; D2: number; playbackRate: number }> = ({ src, frame, config, S2, D2, playbackRate }) => {
  const lf = frame - S2;
  const base: Cam = {
    scale: ip(lf, [0, D2 + XF], [1.18, 1.07], EASE_LUXE),
    tx: ip(lf, [0, D2 + XF], [-18, 14], EASE_GLIDE),
    ty: 0,
    rot: ip(lf, [0, D2 + XF], [0.5, -0.3], EASE_LUXE),
  };
  const c = organic(base, frame, { swayPx: 9, breathe: 0.005, rotDeg: 0.5, seed: 1.1 });
  const startFrom = config ? Math.floor(config.trimStart * FPS) : 0;
  return (
    <AbsoluteFill style={{ opacity: fadeIn(frame, S2) }}>
      <OffthreadVideo startFrom={startFrom} src={src} muted playbackRate={playbackRate} style={{ width: "100%", height: "100%", objectFit: "cover", transform: cam(c), filter: ALEXA_ARRI }} />
    </AbsoluteFill>
  );
};

// ── CLIP 3 — Process ────────────────────────────────────────────────────────
const Clip3: React.FC<{ src: string; frame: number; config?: any; S3: number; D3: number; SEC: number; playbackRate: number }> = ({ src, frame, config, S3, D3, SEC, playbackRate }) => {
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
  const splitPx = ip(sf, [0, 5], [3.5, 0], EASE_ACCEL);
  const filter = section === 1 || section === 4 ? ALEXA_ARRI : KODAK_PORTRA;
  const startFrom = config ? Math.floor(config.trimStart * FPS) : 0;
  return (
    <AbsoluteFill style={{ opacity: fadeIn(frame, S3) }}>
      <ChromaClip src={src} transform={cam(c)} filter={filter} splitPx={splitPx} playbackRate={playbackRate} startFrom={startFrom} />
    </AbsoluteFill>
  );
};

// ── CLIP 4 — Reveal ────────────────────────────────────────────────────────
const Clip4: React.FC<{ src: string; frame: number; config?: any; S4: number; D4: number; playbackRate: number }> = ({ src, frame, config, S4, D4, playbackRate }) => {
  const lf = frame - S4;
  const base: Cam = {
    scale: ip(lf, [0, D4], [1.2, 1.06], EASE_LUXE),
    tx: ip(lf, [0, D4], [14, -12], EASE_LUXE),
    ty: 0,
    rot: ip(lf, [0, D4], [0.6, -0.2], EASE_LUXE),
  };
  const c = organic(base, frame, { swayPx: 7, breathe: 0.004, rotDeg: 0.4, seed: 2.4 });
  const warm = ip(lf, [0, D4 * 0.6], [1.16, 1.26], EASE_GLIDE);
  const filter = `${KODAK_2383} saturate(${warm.toFixed(3)})`;
  const startFrom = config ? Math.floor(config.trimStart * FPS) : 0;
  return (
    <AbsoluteFill style={{ opacity: fadeIn(frame, S4) }}>
      <Video startFrom={startFrom} src={src} muted playbackRate={playbackRate} style={{ width: "100%", height: "100%", objectFit: "cover", transform: cam(c), filter }} />
    </AbsoluteFill>
  );
};


// ── GOLDEN REVEAL GLOW ──────────────────────────────────────────────────────
const RevealGlow: React.FC<{ frame: number; S4: number; D4: number }> = ({ frame, S4, D4 }) => {
  const opacity = interpolate(frame, [S4, S4 + 6, S4 + 28, S4 + D4], [0, 0.5, 0.14, 0.06], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_GLIDE });
  return <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 42%, rgba(255,225,100,1) 0%, rgba(255,200,80,0) 62%)", opacity, mixBlendMode: "screen", pointerEvents: "none", zIndex: 46 }} />;
};

// ── TEXT OVERLAYS ────────────────────────────────────────────────────────
const TextOverlays: React.FC<{ frame: number; S4: number }> = ({ frame, S4 }) => {
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
export const CinematicTemplate: React.FC<{ videoUrls: string[]; bgmUrl?: string; claudeConfig?: any }> = ({
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
    <AbsoluteFill style={{ backgroundColor: "#000" }}>

      {videoUrls[0] && (
        <Sequence from={S1} durationInFrames={D1 + XF}><Clip1 src={videoUrls[0]} frame={frame} config={claudeConfig?.entering} S1={S1} D1={D1} playbackRate={r1} /></Sequence>
      )}
      {videoUrls[1] && (
        <Sequence from={S2} durationInFrames={D2 + XF}><Clip2 src={videoUrls[1]} frame={frame} config={claudeConfig?.choosing} S2={S2} D2={D2} playbackRate={r2} /></Sequence>
      )}
      {videoUrls[2] && (
        <Sequence from={S3} durationInFrames={D3 + XF}><Clip3 src={videoUrls[2]} frame={frame} config={claudeConfig?.haircut} S3={S3} D3={D3} SEC={SEC} playbackRate={r3} /></Sequence>
      )}
      {videoUrls[3] && (
        <Sequence from={S4} durationInFrames={D4}><Clip4 src={videoUrls[3]} frame={frame} config={claudeConfig?.reveal} S4={S4} D4={D4} playbackRate={r4} /></Sequence>
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

      <RevealGlow frame={frame} S4={S4} D4={D4} />

      {/* Global finishing layers */}
      <Vignette background="radial-gradient(ellipse at 50% 50%, transparent 42%, rgba(0,0,0,0.86) 100%)" zIndex={50} />
      <FilmGrain frame={frame} opacity={0.055} />
      <TextOverlays frame={frame} S4={S4} />

      {/* Opening fade up */}
      <AbsoluteFill style={{ backgroundColor: "black", opacity: ip(frame, [0, 16], [1, 0], EASE_GLIDE), pointerEvents: "none", zIndex: 70 }} />
      {/* Closing fade out */}
      <AbsoluteFill style={{ backgroundColor: "black", opacity: ip(frame, [TOTAL - 22, TOTAL], [0, 1], EASE_GLIDE), pointerEvents: "none", zIndex: 70 }} />
    </AbsoluteFill>
  );
};
