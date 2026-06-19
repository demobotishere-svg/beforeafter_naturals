# Salon Cinematic Editor: Concept & Ideation

## 1. Core Vision
The **Salon Cinematic Editor** is a specialized, programmatic video editing application built with Next.js and Remotion. It is designed to solve a critical marketing problem for modern hair salons (like Naturals): the need for high-end, engaging, and professional "Before & After" social media reels without the cost, time, or technical overhead of hiring an editor or using complex software like Premiere Pro or CapCut.

## 2. The Problem
- **High Friction:** Stylists are busy. Recording footage is easy, but editing it into a high-retention reel takes hours.
- **Inconsistent Quality:** Videos are often poorly color-graded, have jarring transitions, or lack narrative flow.
- **Low Retention:** Standard side-by-side photo comparisons or basic crossfades do not capture the attention of TikTok/Instagram audiences.

## 3. The Solution (Our Ideation)
Provide a 1-click dashboard where a stylist uploads exactly 4 raw clips. The system automatically structures them into a proven narrative arc:
1. **The Hook (Entering):** Setting the scene.
2. **The Consultation (Choosing):** Establishing the "Before" state.
3. **The Process (Haircut):** Fast-paced, kinetic energy cuts to build anticipation.
4. **The Payoff (Reveal):** Slow, heroic, beautifully color-graded "After" shot.

By enforcing this narrative constraint, we guarantee a high-retention video. We then apply programmatic Remotion templates to wrap these clips in world-class aesthetics.

## 4. Architectural Concept
- **Frontend:** Next.js with a dark, premium, glassmorphism UI that feels like a high-end creative tool.
- **Video Engine:** Remotion. We use `Sequence`, `AbsoluteFill`, and complex math (`interpolate`, `Easing`) to manipulate DOM-based video elements on a frame-by-frame basis. This allows us to define "templates" purely in React code.
- **Aesthetic Diversity:** We offer distinct "Styles" (Cinematic Glass, Hype Energy, Minimalist Luxury, Vlog) rather than raw tools. We sell *outcomes*, not *features*.
