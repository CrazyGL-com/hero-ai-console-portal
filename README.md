<sub>*Hero made by [@ybouane](https://x.com/ybouane).*</sub>
<p align="center">
  <img src="https://crazygl.com/heroes/hero-ai-console-portal/banner-full.png" alt="AI Console Portal" width="640">
</p>

# @crazygl/hero-ai-console-portal

A glowing torus portal opens onto an AI console screenshot stepping forward into the scene, surrounded by orbiting prompt and output cards and a stream of particles slipping past the ring toward the camera.

## Demo
[AI Console Portal](https://crazygl.com/hero/ai-console-portal)

## Install

```bash
npm install @crazygl/hero-ai-console-portal
```

## Usage

```tsx
import AIConsolePortal from '@crazygl/hero-ai-console-portal';

export default function Page() {
  return (
    <AIConsolePortal
      screenshot="https://example.com/console.png"
      portalColor1="#6ab2ff"
      portalColor2="#a070ff"
      cardCount={6}
    />
  );
}
```

## Customise

- **Screenshot** — `screenshot` URL (PNG/JPG/AVIF/WebP, dark UIs read best), plus `screenshotX/Y`, `screenshotScale`, `screenshotTilt`, `screenEmissive`.
- **Portal** — `portalRadius`, `portalTube`, `portalColor1`/`portalColor2` (gradient + halo), `portalIntensity`, `portalPulseCount` and `portalPulseSpeed` (the streaks racing around the ring).
- **Cards** — `cardCount` (0–6), `cardOrbitRadius`, `cardOrbitSpeed`; each card (`card1*`…`card6*`) toggles `text` vs `image` mode with its own `Tag`, `Body`, tag `Color`, or `Image` URL.
- **Particles** — `particleCount` (0–600), `particleColor`, `particleSpeed` for the inbound stream.
- **Atmosphere & motion** — `scanlineStrength`, `bgVignette`, `bgEdge`, `transparentBackground`, `parallaxStrength`.

## Best for

- AI agents, copilots, and prompt-engineering products
- Developer-facing SaaS and dev-tools launch pages
- Automation and model-playground onboarding pages
- Data and analytics dashboards



This hero is part of [CrazyGL](https://crazygl.com), a collection of production-ready WebGL, canvas, 3D, and typography effects. Every CrazyGL hero ships with an agent-ready `SKILL.md` file that helps developers and coding agents adapt the effect into custom landing pages and interactive experiences.
