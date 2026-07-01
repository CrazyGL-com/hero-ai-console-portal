import * as React from 'react';
import CrazyGLWrapper, {
	useContent,
	useHeroReady,
	type HeroComponentProps,
} from '@crazygl/core';
import metadata from './metadata.json';
import './style.css';

/* ─────────────────────────────────────────────────────────────────────────
   AI Console Portal — a glowing torus portal, with the AI console
   screenshot stepping forward out of the ring, surrounded by orbiting
   prompt/output cards and a stream of inbound particles.

   Layered structure (back → front):
     1. CSS radial vignette backdrop (deep cool blue, bg-edge → bg-vignette).
     2. Far/inbound particles (Points), spawned behind the portal, drifting
        toward the camera; brief intensity boost as they cross the ring.
     3. Portal back-glow plane: soft additive radial gradient filling the
        ring's hollow.
     4. Portal ring: TorusGeometry shaded with a smooth gradient around
        the tube + inner-rim hot spot + N bright Gaussian streaks
        traveling at independent speeds.
     5. Screenshot plane in front of the portal (MeshStandardMaterial +
        emissive map + scanline injection).
     6. Orbiting prompt/output cards on inclined elliptical paths,
        billboarded each frame.

   References:
     - Three.js TorusGeometry / ShaderMaterial.
     - hero-hologram-projection — scanline pattern, dust shader, panel mat.
     - hero-orbital-carousel — onBeforeCompile material injection.
     - hero-command-center — sceneEpoch pattern for StrictMode-double-mount
       safety; lazy-load Three.js via React.lazy.
   ───────────────────────────────────────────────────────────────────────── */

const PortalStage = React.lazy(() => import('./PortalStage'));

function AIConsolePortalHero(props: HeroComponentProps) {
	const {
		size,
		input,
		seed,
		reducedMotion,
		rootRef,
		// Screenshot
		screenshot = 'https://crazygl.com/samples/screenshot-dashboard-dark.avif',
		screenshotX = 0,
		screenshotY = 0,
		screenshotScale = 1.4,
		screenshotTilt = -18.5,
		screenEmissive = 0.55,
		// Portal
		portalRadius = 1.6,
		portalTube = 0.06,
		portalColor1 = '#6ab2ff',
		portalColor2 = '#a070ff',
		portalIntensity = 1.0,
		portalPulseCount = 3,
		portalPulseSpeed = 0.4,
		// Cards
		cardCount = 6,
		cardOrbitRadius = 2.8,
		cardOrbitSpeed = 0.05,
		// Per-card (text or image). Defaults reproduce the prior hardcoded set
		// so existing screenshots are unchanged.
		card1Mode = 'text',
		card1Image = '',
		card1Tag = 'PROMPT',
		card1Body = 'Summarize this Q3 board report in three bullet points.',
		card1Color = '#56e3ff',
		card2Mode = 'text',
		card2Image = '',
		card2Tag = 'OUTPUT',
		card2Body = 'Q3 revenue grew 24% YoY, driven by enterprise SaaS and rising APAC demand.',
		card2Color = '#ffb45a',
		card3Mode = 'text',
		card3Image = '',
		card3Tag = 'SOURCE',
		card3Body = 'docs/architecture.md — 3 passages cited.',
		card3Color = '#a070ff',
		card4Mode = 'text',
		card4Image = '',
		card4Tag = 'ACTION',
		card4Body = 'Drafted email → Lina. Subject: Q3 review ready.',
		card4Color = '#3cffe0',
		card5Mode = 'text',
		card5Image = '',
		card5Tag = 'PROMPT',
		card5Body = 'Generate SQL: top 10 users by 30-day session time.',
		card5Color = '#ff3c8a',
		card6Mode = 'text',
		card6Image = '',
		card6Tag = 'OUTPUT',
		card6Body = 'Updated 3 files, 12 lines changed. Tests: 24/24 passing.',
		card6Color = '#dceaff',
		// Particles
		particleCount = 300,
		particleColor = '#6ab2ff',
		particleSpeed = 0.35,
		// Atmosphere
		scanlineStrength = 0.06,
		bgVignette = '#0a1230',
		bgEdge = '#02040c',
		transparentBackground = false,
		// Motion
		parallaxStrength = 0.5,
	} = props as any;

	const content = useContent(props);
	useHeroReady(props);
	const [mounted, setMounted] = React.useState(false);
	React.useEffect(() => setMounted(true), []);

	const cardConfigs = React.useMemo(
		() => [
			{ mode: card1Mode, image: card1Image, tag: card1Tag, body: card1Body, color: card1Color },
			{ mode: card2Mode, image: card2Image, tag: card2Tag, body: card2Body, color: card2Color },
			{ mode: card3Mode, image: card3Image, tag: card3Tag, body: card3Body, color: card3Color },
			{ mode: card4Mode, image: card4Image, tag: card4Tag, body: card4Body, color: card4Color },
			{ mode: card5Mode, image: card5Image, tag: card5Tag, body: card5Body, color: card5Color },
			{ mode: card6Mode, image: card6Image, tag: card6Tag, body: card6Body, color: card6Color },
		],
		[
			card1Mode, card1Image, card1Tag, card1Body, card1Color,
			card2Mode, card2Image, card2Tag, card2Body, card2Color,
			card3Mode, card3Image, card3Tag, card3Body, card3Color,
			card4Mode, card4Image, card4Tag, card4Body, card4Color,
			card5Mode, card5Image, card5Tag, card5Body, card5Color,
			card6Mode, card6Image, card6Tag, card6Body, card6Color,
		],
	);

	const bgStyle: React.CSSProperties = transparentBackground
		? { background: 'transparent' }
		: {
				background: `radial-gradient(ellipse at 50% 50%, ${bgVignette} 0%, ${bgEdge} 75%)`,
			};

	return (
		<>
			<crazygl-stage
				style={
					{
						position: 'absolute',
						inset: 0,
						zIndex: 0,
						overflow: 'hidden',
						...bgStyle,
					} as React.CSSProperties
				}
			>
				{mounted ? (
					<React.Suspense fallback={null}>
						<PortalStage
							rootRef={rootRef}
							size={size}
							input={input}
							seed={seed}
							reducedMotion={reducedMotion}
							screenshot={screenshot}
							screenshotX={screenshotX}
							screenshotY={screenshotY}
							screenshotScale={screenshotScale}
							screenshotTilt={screenshotTilt}
							screenEmissive={screenEmissive}
							portalRadius={portalRadius}
							portalTube={portalTube}
							portalColor1={portalColor1}
							portalColor2={portalColor2}
							portalIntensity={portalIntensity}
							portalPulseCount={portalPulseCount}
							portalPulseSpeed={portalPulseSpeed}
							cardCount={cardCount}
							cardOrbitRadius={cardOrbitRadius}
							cardOrbitSpeed={cardOrbitSpeed}
							cardConfigs={cardConfigs}
							particleCount={particleCount}
							particleColor={particleColor}
							particleSpeed={particleSpeed}
							scanlineStrength={scanlineStrength}
							parallaxStrength={parallaxStrength}
							transparent={!!transparentBackground}
						/>
					</React.Suspense>
				) : null}
			</crazygl-stage>
			<crazygl-content
				style={
					{
						position: 'absolute',
						inset: 0,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'flex-start',
						zIndex: 1,
						pointerEvents: 'none',
					} as React.CSSProperties
				}
			>
				<div className="crazygl-acp-content">{content.node}</div>
			</crazygl-content>
		</>
	);
}

export { metadata };
export default function AIConsolePortal(props: any) {
	return <CrazyGLWrapper hero={AIConsolePortalHero} metadata={metadata as any} {...props} />;
}
