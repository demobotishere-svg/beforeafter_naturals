# Salon Cinematic Editor: Future Roadmap

## Phase 1: Advanced AI Pre-Processing
- **Smart Cropping (Face Tracking):** Integrate a lightweight ML model (like MediaPipe) to detect the subject's face in the uploaded clips. Automatically adjust the `translateX` and `translateY` values in Remotion to keep the face perfectly framed, even if the raw footage is sloppy.
- **Auto-Trimming:** Automatically detect the most "interesting" segments of the raw clips (based on motion density or facial expressions) and trim them to fit the required 4-second or 10-second slots perfectly.

## Phase 2: Dynamic Audio & Beat Syncing
- **Audio Transient Analysis:** Implement a backend service that analyzes uploaded background music for beats and drops.
- **Reactive Edits:** Pass the beat-map into the Remotion `MasterTemplate` so that `Clip3` (The Process) automatically snaps, glitches, or cuts precisely on the kick drums, and `Clip4` (The Reveal) triggers exactly on the beat drop.

## Phase 3: Cloud Rendering Pipeline
- **Headless AWS Lambda Integration:** Move the Remotion rendering off the Next.js server and onto scalable AWS Lambda instances using `@remotion/lambda`. This will allow 100 stylists to generate videos simultaneously without crashing the server.
- **Webhooks & Notifications:** Send an email or push notification to the user when their 4K render is complete.

## Phase 4: Monetization & B2B Expansion
- **White-labeling:** Allow individual salons to upload their own watermarks, brand colors, and custom fonts.
- **Subscription Model:** Freemium tier for basic 720p 30fps renders with a standard watermark, and a Pro tier for 4K 60fps renders with custom branding.

## Phase 5: Expanded Template Ecosystem
- Introduce a marketplace of templates engineered by professional editors.
- Add support for 5-clip and 6-clip structures (e.g., adding a "Client Reaction" clip at the very end).
