import { jsx as _jsx } from "react/jsx-runtime";
import * as React from 'react';
import * as THREE from 'three';
import { useHeroAnimationFrame, useHeroAssetGate } from '@crazygl/core';
const MAX_CARDS = 6;
const MAX_PARTICLES = 600;
/* ─────────────────────────────────────────────────────────────────────────
   Portal ring shader.

   Coordinate spaces:
     vUv     — torus UV: U = around the ring (longitudinal, 0..1), V = around
               the tube (0..1, where 0.5 = outside of the tube and 0.0/1.0 =
               innermost edge facing the ring center).
     u_time  — accumulated seconds.

   Composition:
     base   = mix(color1, color2) by U cycling slowly (cool→warm around).
     rim    = inner-tube hot spot: V close to 0 or 1 (the side facing the
              hollow center) brightens.
     pulses = N Gaussian streaks traveling around the ring (U direction)
              at independent speeds.
     alpha  = intensity * (base envelope + rim + pulses), additive.
   ───────────────────────────────────────────────────────────────────────── */
const PORTAL_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;
const PORTAL_FRAG = /* glsl */ `
precision highp float;
// Coordinate spaces:
//   vUv     — torus UV; .x = around ring, .y = around tube
//   u_time  — seconds
varying vec2 vUv;
uniform float u_time;
uniform vec3  u_color1;
uniform vec3  u_color2;
uniform float u_intensity;
uniform int   u_pulseCount;
uniform float u_pulseSpeed;

const float PI = 3.14159265359;
const float TAU = 6.28318530718;

void main() {
    float u = vUv.x;
    float v = vUv.y;

    // Gradient around the ring — cool→warm cycling slowly.
    float phase = u * TAU + u_time * 0.15;
    float mixT = 0.5 + 0.5 * sin(phase);
    vec3 base = mix(u_color1, u_color2, mixT);

    // Tube cross-section profile. v=0 (or 1) is the side facing the hollow
    // center of the torus — boost there for the inner-rim hot spot.
    // We treat the tube angle as 2*pi*v, so cos(2pi v) ≈ +1 toward the
    // outer side of the tube, ≈ -1 toward the inner side (facing center).
    float tubeAngle = v * TAU;
    float innerness = 0.5 - 0.5 * cos(tubeAngle); // 0 outer, 1 inner
    float rim = pow(innerness, 2.0);

    // Base radial brightness — bright through the whole tube but boosted
    // on the inside-of-ring side.
    float bodyBright = 0.55 + 0.45 * rim;

    // Pulses: N Gaussian streaks traveling around the ring at varying
    // speeds. We loop a fixed upper bound and break by u_pulseCount.
    float pulses = 0.0;
    for (int i = 0; i < 6; i++) {
        if (i >= u_pulseCount) break;
        float fi = float(i);
        float speed = u_pulseSpeed * (0.5 + 0.6 * fract(fi * 0.317));
        // Offset each pulse around the ring; direction alternates.
        float dir = mod(fi, 2.0) < 0.5 ? 1.0 : -1.0;
        float phase = fract(u + dir * u_time * speed + fi * 0.137);
        // Wrap so distance is the minimum of phase / (1 - phase).
        float d = min(phase, 1.0 - phase);
        float w = 0.035; // streak half-width in U units
        float g = exp(-pow(d / w, 2.0));
        // Modulate by inner-rim so the streak reads as energy along the
        // inside surface — but keep some on the outside too.
        pulses += g * (0.55 + 0.45 * rim);
    }

    vec3 col = base * bodyBright + base * pulses * 2.4 + vec3(1.0) * pulses * 1.2 * rim;
    float a = (bodyBright * 0.55 + pulses * 1.4) * u_intensity;
    a = clamp(a, 0.0, 1.0);
    // Premultiply-ish: we use additive blending so we output col*a as RGB.
    gl_FragColor = vec4(col * u_intensity, a);
}
`;
/* Back-glow plane (sits behind portal, fills the ring's hollow). */
const BACKGLOW_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;
const BACKGLOW_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform vec3 u_color;
uniform float u_intensity;
uniform float u_time;
void main() {
    vec2 p = vUv - 0.5;
    float r = length(p) * 2.0;
    // Bright core, soft falloff, faint extra ripple breathing.
    float core = exp(-pow(r / 0.45, 2.0));
    float halo = exp(-pow(r / 0.95, 2.0)) * 0.45;
    float breathe = 0.85 + 0.15 * sin(u_time * 0.7);
    float a = (core + halo) * 0.9 * u_intensity * breathe;
    gl_FragColor = vec4(u_color * (1.4 + core * 1.0), a);
}
`;
/* Particle field shader (Points). */
const DUST_VERT = /* glsl */ `
attribute float aSeed;
attribute vec3 aOffset; // X,Y baseline; Z is base depth
uniform float u_time;
uniform float u_speed;
uniform float u_dpr;
uniform float u_zMin;
uniform float u_zMax;
varying float vSeed;
varying float vDepthAlpha;
varying float vCross;
void main() {
    vSeed = aSeed;
    // Per-particle speed
    float pSpeed = u_speed * (0.5 + 1.2 * fract(aSeed * 7.13));
    float range = u_zMax - u_zMin;
    // Particles spawn at z=u_zMin (far) and travel toward camera (+Z).
    float z = mod((aOffset.z - u_zMin) + u_time * pSpeed, range) + u_zMin;
    // Lateral wobble
    float wob = 0.04 * sin(u_time * 0.5 + aSeed * 23.0);
    vec3 p = vec3(aOffset.x + wob, aOffset.y + wob * 0.7, z);
    // Mandatory near-plane alpha fade — particles past z~+0.9 fade out
    // before they reach the camera at z=+3, so no frozen near-plane points.
    float nearEnd = 0.7;  // start fading
    float nearOff = 1.4;  // fully gone
    vDepthAlpha = 1.0 - smoothstep(nearEnd, nearOff, p.z);
    // Far fade so particles ramp in at spawn instead of popping.
    float farFade = smoothstep(u_zMin, u_zMin + 1.0, p.z);
    vDepthAlpha *= farFade;
    // Crossing flash: brief intensity boost as particles pass z=-0.6 (the
    // portal plane). vCross peaks at the portal, falls off ±0.3 either side.
    vCross = exp(-pow((p.z - (-0.6)) / 0.35, 2.0));
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float depth = -mv.z;
    gl_PointSize = (2.5 + 5.0 * fract(aSeed * 3.71)) * u_dpr * (2.4 / max(depth, 0.1));
}
`;
const DUST_FRAG = /* glsl */ `
precision highp float;
varying float vSeed;
varying float vDepthAlpha;
varying float vCross;
uniform vec3 u_color;
void main() {
    vec2 q = gl_PointCoord - 0.5;
    float r = length(q);
    if (r > 0.5) discard;
    float core = exp(-pow(r / 0.16, 2.0));
    float halo = exp(-pow(r / 0.38, 2.0)) * 0.4;
    float twinkle = 0.7 + 0.3 * sin(vSeed * 31.0);
    float boost = 1.0 + vCross * 1.8;
    float a = (core + halo) * 0.65 * twinkle * vDepthAlpha * boost;
    vec3 col = mix(u_color, vec3(1.0), step(0.75, fract(vSeed * 11.0)) * 0.4);
    col *= 1.0 + vCross * 0.6; // mild brightness pop crossing the portal
    gl_FragColor = vec4(col, a);
}
`;
function hexToColor(hex) {
    return new THREE.Color(hex);
}
/* ─────────────────────────────────────────────────────────────────────────
   Text card canvas texture builder. Each card has a user-configurable tag,
   body, and accent color, rendered at 512x320 (~1.6:1 landscape). Drawn via
   canvas2D, uploaded as CanvasTexture, used as the map on a plane.

   Used only when the card mode is "text"; image-mode cards load the user
   URL via THREE.TextureLoader and bypass this function entirely.
   ───────────────────────────────────────────────────────────────────────── */
const CARD_TEX_W = 512;
const CARD_TEX_H = 320;
const CARD_ASPECT = CARD_TEX_W / CARD_TEX_H;
function isLight(hex) {
    // Crude luminance check so the tag-pill foreground (text color) reads
    // against any user-picked tag color.
    const c = new THREE.Color(hex);
    const lum = 0.299 * c.r + 0.587 * c.g + 0.114 * c.b;
    return lum > 0.6;
}
function hexToRgba(hex, alpha) {
    const c = new THREE.Color(hex);
    return `rgba(${Math.round(c.r * 255)}, ${Math.round(c.g * 255)}, ${Math.round(c.b * 255)}, ${alpha})`;
}
function wrapText(ctx, text, maxWidth) {
    const explicit = text.split('\n');
    const out = [];
    for (const para of explicit) {
        const words = para.split(/\s+/).filter(Boolean);
        if (words.length === 0) {
            out.push('');
            continue;
        }
        let line = words[0];
        for (let i = 1; i < words.length; i++) {
            const test = line + ' ' + words[i];
            if (ctx.measureText(test).width > maxWidth) {
                out.push(line);
                line = words[i];
            }
            else {
                line = test;
            }
        }
        out.push(line);
    }
    return out;
}
function makeTextCardTexture({ tag, body, color, }) {
    const W = CARD_TEX_W;
    const H = CARD_TEX_H;
    const cv = document.createElement('canvas');
    cv.width = W;
    cv.height = H;
    const ctx = cv.getContext('2d');
    const tagFg = isLight(color) ? '#0c1424' : '#f3f7ff';
    const tagBorder = hexToRgba(color, 0.55);
    // Start fully transparent so the rounded-rect corners stay alpha=0.
    ctx.clearRect(0, 0, W, H);
    // Clip to a rounded rectangle so EVERYTHING drawn below (background,
    // border, content) is masked by the rounded corners — outside the
    // rounded rect the canvas remains transparent.
    const r = 28;
    const pathRR = () => {
        ctx.beginPath();
        ctx.moveTo(r, 2);
        ctx.lineTo(W - r, 2);
        ctx.quadraticCurveTo(W - 2, 2, W - 2, r);
        ctx.lineTo(W - 2, H - r);
        ctx.quadraticCurveTo(W - 2, H - 2, W - r, H - 2);
        ctx.lineTo(r, H - 2);
        ctx.quadraticCurveTo(2, H - 2, 2, H - r);
        ctx.lineTo(2, r);
        ctx.quadraticCurveTo(2, 2, r, 2);
        ctx.closePath();
    };
    ctx.save();
    pathRR();
    ctx.clip();
    // Background panel — dark glassy with slight gradient (inside rounded clip).
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#10182c');
    grad.addColorStop(1, '#070b1a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    // Rounded border (re-stroke; clip will trim the outer half cleanly).
    ctx.strokeStyle = tagBorder;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(r, 2);
    ctx.lineTo(W - r, 2);
    ctx.quadraticCurveTo(W - 2, 2, W - 2, r);
    ctx.lineTo(W - 2, H - r);
    ctx.quadraticCurveTo(W - 2, H - 2, W - r, H - 2);
    ctx.lineTo(r, H - 2);
    ctx.quadraticCurveTo(2, H - 2, 2, H - r);
    ctx.lineTo(2, r);
    ctx.quadraticCurveTo(2, 2, r, 2);
    ctx.stroke();
    // Inner subtle scanlines (kept low — main scanline pass is added shader-side)
    ctx.fillStyle = 'rgba(255,255,255,0.025)';
    for (let y = 8; y < H; y += 4)
        ctx.fillRect(8, y, W - 16, 1);
    // Tag pill — width sized to text + padding so user tags of any length fit.
    const tagText = (tag || '').toUpperCase();
    ctx.font = '700 22px "Inter", system-ui, sans-serif';
    const tagPadX = 18;
    const tagTextW = ctx.measureText(tagText).width;
    const tagW = Math.max(70, Math.min(W - 100, Math.ceil(tagTextW + tagPadX * 2)));
    const tagH = 40;
    const tagX = 24;
    const tagY = 22;
    ctx.fillStyle = color;
    const tr = 10;
    ctx.beginPath();
    ctx.moveTo(tagX + tr, tagY);
    ctx.lineTo(tagX + tagW - tr, tagY);
    ctx.quadraticCurveTo(tagX + tagW, tagY, tagX + tagW, tagY + tr);
    ctx.lineTo(tagX + tagW, tagY + tagH - tr);
    ctx.quadraticCurveTo(tagX + tagW, tagY + tagH, tagX + tagW - tr, tagY + tagH);
    ctx.lineTo(tagX + tr, tagY + tagH);
    ctx.quadraticCurveTo(tagX, tagY + tagH, tagX, tagY + tagH - tr);
    ctx.lineTo(tagX, tagY + tr);
    ctx.quadraticCurveTo(tagX, tagY, tagX + tr, tagY);
    ctx.fill();
    ctx.fillStyle = tagFg;
    ctx.textBaseline = 'middle';
    ctx.fillText(tagText, tagX + tagPadX, tagY + tagH / 2 + 1);
    // Small status dot top right
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(W - 38, 42, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(206, 219, 240, 0.55)';
    ctx.font = '500 18px "Inter", system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('LIVE', W - 56, 46);
    ctx.textAlign = 'left';
    // Body — wrap user text. SELECT-ish snippets get monospaced.
    const isCode = /\bSELECT\b|\bFROM\b|\bWHERE\b|=>|\{\s|;\s*$/m.test(body);
    const bodyFont = isCode
        ? '500 22px "JetBrains Mono", "Menlo", monospace'
        : '500 24px "Inter", system-ui, sans-serif';
    ctx.font = bodyFont;
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#e4ecff';
    const maxBodyW = W - 52;
    const lines = wrapText(ctx, body || '', maxBodyW).slice(0, 5);
    const startY = 110;
    const lineH = 36;
    for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], 26, startY + i * lineH);
    }
    // Footer hint
    ctx.fillStyle = 'rgba(150, 170, 200, 0.45)';
    ctx.font = '500 16px "Inter", system-ui, sans-serif';
    ctx.fillText('▍ ai-console', 26, H - 24);
    ctx.restore();
    return cv;
}
export default function PortalStage(props) {
    const { rootRef, size, input, seed, reducedMotion, screenshot, screenshotX, screenshotY, screenshotScale, screenshotTilt, screenEmissive, portalRadius, portalTube, portalColor1, portalColor2, portalIntensity, portalPulseCount, portalPulseSpeed, cardCount, cardOrbitRadius, cardOrbitSpeed, cardConfigs, particleCount, particleColor, particleSpeed, scanlineStrength, parallaxStrength, transparent, } = props;
    void seed;
    // Gate hero readiness on the off-DOM screenshot GL texture (loaded via
    // `new Image()` → THREE.Texture, or the TextureLoader fallback) — the DOM
    // cannot see it, so the readiness system must be told explicitly.
    const [assetReady, setAssetReady] = React.useState(false);
    useHeroAssetGate(assetReady);
    const canvasRef = React.useRef(null);
    const rendererRef = React.useRef(null);
    const sceneRef = React.useRef(null);
    const cameraRef = React.useRef(null);
    // Portal
    const portalMeshRef = React.useRef(null);
    const portalMatRef = React.useRef(null);
    const backglowMeshRef = React.useRef(null);
    const backglowMatRef = React.useRef(null);
    // Screenshot panel
    const screenGroupRef = React.useRef(null);
    const screenMeshRef = React.useRef(null);
    const screenMatRef = React.useRef(null);
    const screenTexRef = React.useRef(null);
    const screenAspectRef = React.useRef(16 / 9);
    const screenScanlineUniRef = React.useRef(null);
    const screenTimeUniRef = React.useRef(null);
    // Cards. Each slot owns its own geometry + material + texture so that
    // changing one card's mode/source/text does not affect any other card.
    // `signature` is the cached input signature so we only rebuild on change.
    const cardsRef = React.useRef([]);
    // One-shot cancel flags per slot for in-flight image loads.
    const cardLoadCancelsRef = React.useRef([]);
    // Particles
    const dustGeomRef = React.useRef(null);
    const dustMatRef = React.useRef(null);
    const dustPointsRef = React.useRef(null);
    const camOffRef = React.useRef({ x: 0, y: 0 });
    // Kick off the screenshot download AS EARLY AS POSSIBLE (during the first
    // render, before any effect) so the network fetch overlaps the synchronous
    // WebGL context creation + scene construction in the setup effect below.
    // The texture-load effect consumes this preloaded image when the URL matches.
    const screenPreloadRef = React.useRef(null);
    if (typeof Image !== 'undefined' &&
        screenshot &&
        screenPreloadRef.current?.url !== screenshot) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = screenshot;
        screenPreloadRef.current = { url: screenshot, img };
    }
    // One-time scene setup
    React.useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            alpha: true,
            premultipliedAlpha: false,
            powerPreference: 'high-performance',
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.05;
        renderer.setClearColor(0x000000, 0);
        rendererRef.current = renderer;
        const scene = new THREE.Scene();
        scene.background = null;
        sceneRef.current = scene;
        const camera = new THREE.PerspectiveCamera(38, 1, 0.05, 60);
        camera.position.set(0, 0, 5.2);
        camera.lookAt(0, 0, 0);
        cameraRef.current = camera;
        // Lights — soft fill so screenshot's MeshStandardMaterial is visible
        // even without an env map. Most of the visual energy is emissive.
        const amb = new THREE.AmbientLight(0xffffff, 0.55);
        scene.add(amb);
        const dir = new THREE.DirectionalLight(0xb0c8ff, 0.6);
        dir.position.set(2, 2, 4);
        scene.add(dir);
        // ── Back-glow plane behind portal ──
        const bgGeom = new THREE.PlaneGeometry(1, 1);
        const bgMat = new THREE.ShaderMaterial({
            uniforms: {
                u_color: { value: hexToColor(portalColor1) },
                u_intensity: { value: portalIntensity },
                u_time: { value: 0 },
            },
            vertexShader: BACKGLOW_VERT,
            fragmentShader: BACKGLOW_FRAG,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
        });
        const bgMesh = new THREE.Mesh(bgGeom, bgMat);
        bgMesh.position.set(0, 0, -1.6);
        bgMesh.scale.set(portalRadius * 3.2, portalRadius * 3.2, 1);
        scene.add(bgMesh);
        backglowMeshRef.current = bgMesh;
        backglowMatRef.current = bgMat;
        // ── Portal ring (TorusGeometry) ──
        const torusGeom = new THREE.TorusGeometry(portalRadius, portalTube, 32, 128);
        const portalMat = new THREE.ShaderMaterial({
            uniforms: {
                u_time: { value: 0 },
                u_color1: { value: hexToColor(portalColor1) },
                u_color2: { value: hexToColor(portalColor2) },
                u_intensity: { value: portalIntensity },
                u_pulseCount: { value: portalPulseCount },
                u_pulseSpeed: { value: portalPulseSpeed },
            },
            vertexShader: PORTAL_VERT,
            fragmentShader: PORTAL_FRAG,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
        });
        portalMatRef.current = portalMat;
        const portalMesh = new THREE.Mesh(torusGeom, portalMat);
        portalMesh.position.set(0, 0, -0.6);
        scene.add(portalMesh);
        portalMeshRef.current = portalMesh;
        // ── Screenshot plane (in front of portal) ──
        const screenGroup = new THREE.Group();
        screenGroup.position.set(screenshotX, screenshotY, 0.1);
        scene.add(screenGroup);
        screenGroupRef.current = screenGroup;
        const aspect = screenAspectRef.current;
        const baseH = 1.6;
        const screenGeom = new THREE.PlaneGeometry(baseH * aspect, baseH);
        // 1×1 white placeholder map so the MeshStandardMaterial compiles with
        // USE_MAP defined from the very first frame — the injected scanline reads
        // `vMapUv`, which three only declares when the material has a `.map`.
        // Without this the first compile errors ("vMapUv undeclared"). The real
        // screenshot replaces it later; USE_MAP stays defined so the constant
        // customProgramCacheKey program remains valid (no recompile).
        const placeholderTex = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1, THREE.RGBAFormat);
        placeholderTex.needsUpdate = true;
        const screenMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            emissive: 0xffffff,
            emissiveIntensity: screenEmissive,
            map: placeholderTex,
            metalness: 0.0,
            roughness: 0.6,
            transparent: true,
            depthWrite: true,
            side: THREE.FrontSide,
        });
        // Inject scanline overlay into the standard material's fragment shader.
        const screenScanU = { value: scanlineStrength };
        const screenTimeU = { value: 0 };
        screenScanlineUniRef.current = screenScanU;
        screenTimeUniRef.current = screenTimeU;
        screenMat.customProgramCacheKey = () => 'crazygl-acp-scanline-screen';
        screenMat.onBeforeCompile = (shader) => {
            shader.uniforms.uScan = screenScanU;
            shader.uniforms.uTimeAcp = screenTimeU;
            shader.fragmentShader = shader.fragmentShader.replace('#include <common>', `#include <common>
				uniform float uScan;
				uniform float uTimeAcp;`);
            shader.fragmentShader = shader.fragmentShader.replace('#include <dithering_fragment>', `#include <dithering_fragment>
				// Horizontal scanline modulation. vMapUv is provided by the
				// map_fragment chunk; we use it for per-card / per-screen UV.
				float scanLine = 1.0 - uScan * step(0.5, fract(vMapUv.y * 220.0 + uTimeAcp * 0.2));
				gl_FragColor.rgb *= scanLine;`);
        };
        screenMatRef.current = screenMat;
        const screenMesh = new THREE.Mesh(screenGeom, screenMat);
        screenGroup.add(screenMesh);
        screenMeshRef.current = screenMesh;
        // ── Cards (allocate MAX_CARDS slots) ──
        // Each card starts with a 1.6:1 placeholder plane. Geometry + texture +
        // material are rebuilt by the per-card config effect below.
        const cardBaseH = 0.7;
        for (let i = 0; i < MAX_CARDS; i++) {
            const scanU = { value: scanlineStrength };
            const timeU = { value: 0 };
            const mat = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                emissive: 0xffffff,
                emissiveIntensity: 0.55,
                map: placeholderTex,
                metalness: 0.0,
                roughness: 0.8,
                transparent: true,
                depthWrite: false,
                side: THREE.DoubleSide,
            });
            mat.customProgramCacheKey = () => 'crazygl-acp-scanline-card';
            mat.onBeforeCompile = (shader) => {
                shader.uniforms.uScan = scanU;
                shader.uniforms.uTimeAcp = timeU;
                shader.fragmentShader = shader.fragmentShader.replace('#include <common>', `#include <common>
					uniform float uScan;
					uniform float uTimeAcp;`);
                shader.fragmentShader = shader.fragmentShader.replace('#include <dithering_fragment>', `#include <dithering_fragment>
					float scanLine = 1.0 - uScan * step(0.5, fract(vMapUv.y * 180.0 + uTimeAcp * 0.2));
					gl_FragColor.rgb *= scanLine;`);
            };
            const geom = new THREE.PlaneGeometry(cardBaseH * CARD_ASPECT, cardBaseH);
            const group = new THREE.Group();
            const mesh = new THREE.Mesh(geom, mat);
            mesh.scale.set(0.85, 0.85, 1);
            group.add(mesh);
            scene.add(group);
            // Random tilt of orbit plane per card
            const tiltA = Math.sin(i * 1.37 + 0.4) * 0.6; // ±0.6 rad around X
            const tiltB = Math.cos(i * 0.91 + 0.7) * 0.5; // ±0.5 rad around Z
            const phase0 = (i / MAX_CARDS) * Math.PI * 2 + Math.sin(i * 2.13) * 0.4;
            cardsRef.current.push({
                group,
                mesh,
                mat,
                tex: null,
                geom,
                aspect: CARD_ASPECT,
                phase0,
                tiltA,
                tiltB,
                scanlineUni: scanU,
                timeUni: timeU,
                signature: '',
            });
            cardLoadCancelsRef.current.push(null);
        }
        // ── Particle field ──
        const positions = new Float32Array(MAX_PARTICLES * 3);
        const seeds = new Float32Array(MAX_PARTICLES);
        for (let i = 0; i < MAX_PARTICLES; i++) {
            // X,Y spread across the scene around the portal; Z far behind.
            const r = Math.sqrt(Math.random()) * 2.4;
            const ang = Math.random() * Math.PI * 2;
            positions[i * 3] = Math.cos(ang) * r;
            positions[i * 3 + 1] = Math.sin(ang) * r * 0.75;
            // Spread initial z across the depth range so the stream is
            // continuous from the start.
            positions[i * 3 + 2] = -3.5 + Math.random() * 4.5;
            seeds[i] = Math.random();
        }
        const dustGeom = new THREE.BufferGeometry();
        dustGeom.setAttribute('aOffset', new THREE.BufferAttribute(positions, 3));
        // We need a non-empty 'position' attribute for THREE.Points to render;
        // we co-opt aOffset by also setting position to it (the vertex shader
        // uses aOffset directly).
        dustGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        dustGeom.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
        dustGeomRef.current = dustGeom;
        const dustMat = new THREE.ShaderMaterial({
            uniforms: {
                u_time: { value: 0 },
                u_speed: { value: particleSpeed },
                u_dpr: { value: renderer.getPixelRatio() },
                u_zMin: { value: -3.5 },
                u_zMax: { value: 1.0 },
                u_color: { value: hexToColor(particleColor) },
            },
            vertexShader: DUST_VERT,
            fragmentShader: DUST_FRAG,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
        });
        dustMatRef.current = dustMat;
        const dustPoints = new THREE.Points(dustGeom, dustMat);
        dustPoints.frustumCulled = false;
        dustGeom.setDrawRange(0, Math.min(MAX_PARTICLES, Math.floor(particleCount)));
        dustPoints.renderOrder = 1;
        scene.add(dustPoints);
        dustPointsRef.current = dustPoints;
        return () => {
            renderer.dispose();
            torusGeom.dispose();
            portalMat.dispose();
            bgGeom.dispose();
            bgMat.dispose();
            screenGeom.dispose();
            screenMat.dispose();
            screenTexRef.current?.dispose();
            screenTexRef.current = null;
            for (const cancel of cardLoadCancelsRef.current) {
                if (cancel)
                    cancel.cancelled = true;
            }
            cardLoadCancelsRef.current.length = 0;
            for (const c of cardsRef.current) {
                c.geom.dispose();
                c.mat.dispose();
                c.tex?.dispose();
            }
            cardsRef.current.length = 0;
            dustGeom.dispose();
            dustMat.dispose();
            rendererRef.current = null;
            sceneRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    // Resize
    React.useEffect(() => {
        const renderer = rendererRef.current;
        const camera = cameraRef.current;
        if (!renderer || !camera)
            return;
        const w = Math.max(1, Math.floor(size.width));
        const h = Math.max(1, Math.floor(size.height));
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        const dust = dustMatRef.current;
        if (dust)
            dust.uniforms.u_dpr.value = renderer.getPixelRatio();
    }, [size.width, size.height]);
    // Live portal uniforms
    React.useEffect(() => {
        const pm = portalMatRef.current;
        if (pm) {
            pm.uniforms.u_color1.value = hexToColor(portalColor1);
            pm.uniforms.u_color2.value = hexToColor(portalColor2);
            pm.uniforms.u_intensity.value = portalIntensity;
            pm.uniforms.u_pulseCount.value = Math.max(1, Math.min(6, Math.round(portalPulseCount)));
            pm.uniforms.u_pulseSpeed.value = portalPulseSpeed;
        }
        const bg = backglowMatRef.current;
        if (bg) {
            bg.uniforms.u_color.value = hexToColor(portalColor1);
            bg.uniforms.u_intensity.value = portalIntensity;
        }
    }, [portalColor1, portalColor2, portalIntensity, portalPulseCount, portalPulseSpeed]);
    // Rebuild torus geometry when radius or tube changes
    React.useEffect(() => {
        const mesh = portalMeshRef.current;
        if (!mesh)
            return;
        mesh.geometry.dispose();
        mesh.geometry = new THREE.TorusGeometry(portalRadius, portalTube, 32, 128);
        const bgMesh = backglowMeshRef.current;
        if (bgMesh)
            bgMesh.scale.set(portalRadius * 3.2, portalRadius * 3.2, 1);
    }, [portalRadius, portalTube]);
    // Screenshot texture loader. Consumes the image preloaded during render
    // (see screenPreloadRef) when its URL matches, so the network fetch has
    // already been running in parallel with scene construction.
    React.useEffect(() => {
        // No screenshot URL → nothing async to wait for; release the gate.
        if (!screenshot) {
            setAssetReady(true);
            return;
        }
        let cancelled = false;
        const applyImage = (img) => {
            if (cancelled)
                return;
            const tex = new THREE.Texture(img);
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.minFilter = THREE.LinearMipmapLinearFilter;
            tex.magFilter = THREE.LinearFilter;
            tex.generateMipmaps = true;
            tex.anisotropy = 8;
            tex.wrapS = THREE.ClampToEdgeWrapping;
            tex.wrapT = THREE.ClampToEdgeWrapping;
            tex.needsUpdate = true;
            screenTexRef.current?.dispose();
            screenTexRef.current = tex;
            const iw = img.naturalWidth || img.width || 16;
            const ih = img.naturalHeight || img.height || 9;
            screenAspectRef.current = iw / Math.max(1, ih);
            const mat = screenMatRef.current;
            const mesh = screenMeshRef.current;
            if (mat) {
                mat.map = tex;
                mat.emissiveMap = tex;
                mat.needsUpdate = true;
            }
            if (mesh) {
                const baseH = 1.6;
                mesh.geometry.dispose();
                mesh.geometry = new THREE.PlaneGeometry(baseH * screenAspectRef.current, baseH);
            }
        };
        // Reuse the image whose download was kicked off during render.
        const preload = screenPreloadRef.current;
        const img = preload && preload.url === screenshot ? preload.img : null;
        if (img) {
            if (img.complete && img.naturalWidth > 0) {
                applyImage(img);
                setAssetReady(true);
            }
            else if (img.complete) {
                // Already finished but with no pixels (errored) — load/error
                // will never fire again; release the gate now.
                setAssetReady(true);
            }
            else {
                img.addEventListener('load', () => {
                    applyImage(img);
                    setAssetReady(true);
                }, { once: true });
                // onerror: fail silently — leave placeholder white. Still
                // release the gate so readiness can never hang on a bad URL.
                img.addEventListener('error', () => setAssetReady(true), { once: true });
            }
            return () => {
                cancelled = true;
            };
        }
        // Fallback (e.g. no Image global): load via three.
        const loader = new THREE.TextureLoader();
        loader.setCrossOrigin('anonymous');
        loader.load(screenshot, (tex) => {
            setAssetReady(true);
            if (cancelled) {
                tex.dispose();
                return;
            }
            const loaded = tex.image;
            tex.dispose();
            if (loaded)
                applyImage(loaded);
        }, undefined, () => {
            /* fail silently — leave placeholder white */
            setAssetReady(true);
        });
        return () => {
            cancelled = true;
        };
    }, [screenshot]);
    // Screenshot transform + emissive live updates
    React.useEffect(() => {
        const g = screenGroupRef.current;
        if (g) {
            g.position.set(screenshotX, screenshotY, 0.1);
            g.scale.setScalar(Math.max(0.1, screenshotScale));
            g.rotation.x = (screenshotTilt * Math.PI) / 180;
        }
        const mat = screenMatRef.current;
        if (mat)
            mat.emissiveIntensity = screenEmissive;
    }, [screenshotX, screenshotY, screenshotScale, screenshotTilt, screenEmissive]);
    // Scanline strength live update
    React.useEffect(() => {
        if (screenScanlineUniRef.current)
            screenScanlineUniRef.current.value = scanlineStrength;
        for (const c of cardsRef.current)
            c.scanlineUni.value = scanlineStrength;
    }, [scanlineStrength]);
    // Card count visibility
    React.useEffect(() => {
        const n = Math.max(0, Math.min(MAX_CARDS, Math.round(cardCount)));
        for (let i = 0; i < MAX_CARDS; i++) {
            const c = cardsRef.current[i];
            if (!c)
                continue;
            c.group.visible = i < n;
        }
    }, [cardCount]);
    // Per-card content: rebuild texture + geometry when this card's config
    // changes. Each card is independent; touching card 3 doesn't disturb
    // card 1. Image loads are StrictMode-safe via a per-slot cancel flag.
    const cardConfigsKey = React.useMemo(() => cardConfigs
        .map((c) => c.mode === 'image'
        ? `i|${c.image}`
        : `t|${c.tag}|${c.body}|${c.color}`)
        .join('||'), [cardConfigs]);
    React.useEffect(() => {
        const cards = cardsRef.current;
        if (cards.length === 0)
            return; // scene not yet set up
        const cardBaseH = 0.7;
        const applyTextCard = (slot, cfg) => {
            const cv = makeTextCardTexture({ tag: cfg.tag, body: cfg.body, color: cfg.color });
            const tex = new THREE.CanvasTexture(cv);
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.minFilter = THREE.LinearMipmapLinearFilter;
            tex.magFilter = THREE.LinearFilter;
            tex.generateMipmaps = true;
            tex.anisotropy = 8;
            tex.needsUpdate = true;
            // Geometry: only rebuild if aspect actually changed.
            if (Math.abs(slot.aspect - CARD_ASPECT) > 1e-4) {
                slot.geom.dispose();
                slot.geom = new THREE.PlaneGeometry(cardBaseH * CARD_ASPECT, cardBaseH);
                slot.mesh.geometry = slot.geom;
                slot.aspect = CARD_ASPECT;
            }
            slot.tex?.dispose();
            slot.tex = tex;
            slot.mat.map = tex;
            slot.mat.emissiveMap = tex;
            slot.mat.needsUpdate = true;
        };
        for (let i = 0; i < MAX_CARDS; i++) {
            const slot = cards[i];
            const cfg = cardConfigs[i];
            if (!slot || !cfg)
                continue;
            const sig = cfg.mode === 'image'
                ? `i|${cfg.image}`
                : `t|${cfg.tag}|${cfg.body}|${cfg.color}`;
            if (sig === slot.signature)
                continue;
            slot.signature = sig;
            // Cancel any in-flight image load for this slot.
            const prev = cardLoadCancelsRef.current[i];
            if (prev)
                prev.cancelled = true;
            cardLoadCancelsRef.current[i] = null;
            if (cfg.mode === 'text' || !cfg.image) {
                applyTextCard(slot, cfg);
                continue;
            }
            // Image mode. Render the text card immediately as a placeholder so
            // the card doesn't go blank while the URL loads, then swap on load.
            applyTextCard(slot, { ...cfg, body: '' });
            const cancel = { cancelled: false };
            cardLoadCancelsRef.current[i] = cancel;
            const loader = new THREE.TextureLoader();
            loader.setCrossOrigin('anonymous');
            loader.load(cfg.image, (tex) => {
                if (cancel.cancelled) {
                    tex.dispose();
                    return;
                }
                const img = tex.image;
                const iw = (img?.naturalWidth || img?.width || 16);
                const ih = (img?.naturalHeight || img?.height || 9);
                const aspect = iw / Math.max(1, ih);
                // Draw the loaded image into a rounded-rect-clipped canvas
                // so the corners of the card stay TRANSPARENT (no black fill).
                const cardH = CARD_TEX_H;
                const cardW = Math.max(8, Math.round(cardH * aspect));
                const cv = document.createElement('canvas');
                cv.width = cardW;
                cv.height = cardH;
                const cctx = cv.getContext('2d');
                cctx.clearRect(0, 0, cardW, cardH);
                const rr = 28;
                cctx.save();
                cctx.beginPath();
                cctx.moveTo(rr, 2);
                cctx.lineTo(cardW - rr, 2);
                cctx.quadraticCurveTo(cardW - 2, 2, cardW - 2, rr);
                cctx.lineTo(cardW - 2, cardH - rr);
                cctx.quadraticCurveTo(cardW - 2, cardH - 2, cardW - rr, cardH - 2);
                cctx.lineTo(rr, cardH - 2);
                cctx.quadraticCurveTo(2, cardH - 2, 2, cardH - rr);
                cctx.lineTo(2, rr);
                cctx.quadraticCurveTo(2, 2, rr, 2);
                cctx.closePath();
                cctx.clip();
                if (img) {
                    cctx.drawImage(img, 0, 0, cardW, cardH);
                }
                cctx.restore();
                // Three.js can use the original loaded texture's image as a
                // CanvasImageSource via drawImage above; we no longer need the
                // raw GPU upload of the original image.
                tex.dispose();
                const canvasTex = new THREE.CanvasTexture(cv);
                canvasTex.colorSpace = THREE.SRGBColorSpace;
                canvasTex.minFilter = THREE.LinearMipmapLinearFilter;
                canvasTex.magFilter = THREE.LinearFilter;
                canvasTex.generateMipmaps = true;
                canvasTex.anisotropy = 8;
                canvasTex.wrapS = THREE.ClampToEdgeWrapping;
                canvasTex.wrapT = THREE.ClampToEdgeWrapping;
                canvasTex.needsUpdate = true;
                // Rebuild geometry to the image's native aspect.
                slot.geom.dispose();
                slot.geom = new THREE.PlaneGeometry(cardBaseH * aspect, cardBaseH);
                slot.mesh.geometry = slot.geom;
                slot.aspect = aspect;
                // Swap material to plain image (no emissive overlay so colors
                // are not blown out) and clear the placeholder canvas tex.
                slot.tex?.dispose();
                slot.tex = canvasTex;
                slot.mat.map = canvasTex;
                slot.mat.emissiveMap = canvasTex;
                slot.mat.emissiveIntensity = 0.35;
                slot.mat.needsUpdate = true;
            }, undefined, () => {
                /* network fail — placeholder text card remains visible */
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cardConfigsKey]);
    // Particle count + color + speed live update
    React.useEffect(() => {
        const geom = dustGeomRef.current;
        if (geom)
            geom.setDrawRange(0, Math.max(0, Math.min(MAX_PARTICLES, Math.floor(particleCount))));
        const mat = dustMatRef.current;
        if (mat) {
            mat.uniforms.u_color.value = hexToColor(particleColor);
            mat.uniforms.u_speed.value = particleSpeed;
        }
    }, [particleCount, particleColor, particleSpeed]);
    // Animation loop
    useHeroAnimationFrame(rootRef, ({ delta, elapsed }) => {
        const renderer = rendererRef.current;
        const scene = sceneRef.current;
        const camera = cameraRef.current;
        if (!renderer || !scene || !camera)
            return;
        const t = reducedMotion ? 0 : elapsed;
        const dt = reducedMotion ? 0 : Math.min(delta, 0.066);
        // Portal time uniform.
        const pm = portalMatRef.current;
        if (pm)
            pm.uniforms.u_time.value = t;
        const bg = backglowMatRef.current;
        if (bg)
            bg.uniforms.u_time.value = t;
        // Screenshot scanline time.
        if (screenTimeUniRef.current)
            screenTimeUniRef.current.value = t;
        // Camera parallax — gentle nudge by pointer.
        const px = (input?.x ?? 0.5) - 0.5;
        const py = (input?.y ?? 0.5) - 0.5;
        const targetCamX = px * 0.6 * parallaxStrength;
        const targetCamY = -py * 0.4 * parallaxStrength;
        const camLerp = 1 - Math.exp(-Math.max(0.001, delta) * 3.5);
        camOffRef.current.x += (targetCamX - camOffRef.current.x) * camLerp;
        camOffRef.current.y += (targetCamY - camOffRef.current.y) * camLerp;
        camera.position.set(camOffRef.current.x, camOffRef.current.y, 5.2);
        camera.lookAt(0, 0, 0);
        // Particle uniforms
        const dust = dustMatRef.current;
        if (dust)
            dust.uniforms.u_time.value = reducedMotion ? elapsed * 0.15 : elapsed;
        // Orbit cards on inclined elliptical paths around portal center.
        const cards = cardsRef.current;
        const n = Math.max(0, Math.min(MAX_CARDS, Math.round(cardCount)));
        const orbitOmega = cardOrbitSpeed * Math.PI * 2;
        const radius = cardOrbitRadius;
        for (let i = 0; i < n; i++) {
            const c = cards[i];
            if (!c)
                continue;
            const ang = c.phase0 + t * orbitOmega * (i % 2 === 0 ? 1 : -1) * 0.6 + t * orbitOmega * 0.4;
            // Base orbit in XY plane; then tilt by tiltA (around X) and tiltB (around Z).
            let x = Math.cos(ang) * radius;
            let y = Math.sin(ang) * radius * 0.65; // slight ellipse
            let z = 0;
            // Apply rotation around X axis (pitch)
            const caX = Math.cos(c.tiltA), saX = Math.sin(c.tiltA);
            const y1 = y * caX - z * saX;
            const z1 = y * saX + z * caX;
            y = y1;
            z = z1;
            // Rotation around Z axis (roll)
            const caZ = Math.cos(c.tiltB), saZ = Math.sin(c.tiltB);
            const x2 = x * caZ - y * saZ;
            const y2 = x * saZ + y * caZ;
            x = x2;
            y = y2;
            // Push portal center back a bit
            c.group.position.set(x, y, z - 0.3);
            // Billboard to camera
            c.group.lookAt(camera.position);
            c.timeUni.value = t;
            // Pulse subtle scale breathing
            const breathe = 1.0 + 0.04 * Math.sin(t * 1.3 + i * 0.9);
            c.group.scale.setScalar(breathe);
        }
        void dt;
        renderer.render(scene, camera);
    });
    return _jsx("canvas", { ref: canvasRef, className: "crazygl-acp-canvas", "aria-hidden": "true" });
}
