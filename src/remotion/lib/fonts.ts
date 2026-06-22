/**
 * ============================================================
 * DISPLAY FONTS (via @remotion/google-fonts)
 * ============================================================
 * Next.js / Geist / Outfit fonts do NOT reach the Remotion render context,
 * so we load high-end display faces directly through @remotion/google-fonts.
 * `loadFont()` registers the @font-face at module import and internally holds
 * the render via delayRender() until the font is ready — so just import these
 * constants and use the returned `fontFamily`.
 *
 *   Playfair Display — high-contrast serif  → Cinematic headlines
 *   Cormorant        — thin editorial serif → Minimalist / luxury
 *   Anton            — heavy condensed sans  → Hype (aggressive caps)
 *   Inter            — clean grotesque       → Vlog (modern, friendly)
 * ============================================================
 */

import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadCormorant } from "@remotion/google-fonts/Cormorant";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

export const FONT_PLAYFAIR = loadPlayfair("normal", { ignoreTooManyRequestsWarning: true }).fontFamily;
export const FONT_CORMORANT = loadCormorant("normal", { ignoreTooManyRequestsWarning: true }).fontFamily;
export const FONT_ANTON = loadAnton("normal", { ignoreTooManyRequestsWarning: true }).fontFamily;
export const FONT_INTER = loadInter("normal", { ignoreTooManyRequestsWarning: true }).fontFamily;

// Serif/sans fallbacks kept so text never collapses if a face fails to load.
export const SERIF_STACK = `'Georgia', 'Times New Roman', serif`;
export const SANS_STACK = `system-ui, -apple-system, 'Segoe UI', sans-serif`;
