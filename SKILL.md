---
name: ai-console-portal
description: "A glowing torus portal opens onto an AI console screenshot stepping forward into the scene, surrounded by orbiting prompt and output cards and a stream of particles slipping past the ring toward the camera."
metadata:
  author: "@ybouane"
  version: "0.1.1"
---

## How To Use This Skill

Use this skill to help users work with the `ai-console-portal` effect.

First consider whether the official React component is enough. If the user wants the standard hero with configuration changes, use `npm install @crazygl/hero-ai-console-portal` directly and customize it with the available props.

- CrazyGL hero page: https://crazygl.com/hero/ai-console-portal
- GitHub repository: https://github.com/crazygl-com/hero-ai-console-portal

Here is the list of props / customizations that the react component supports:
{
  "sections": [
    {
      "label": "Content",
      "fields": [
        {
          "id": "contentType",
          "label": "Content Type",
          "type": "select",
          "default": "heading",
          "options": [
            {
              "label": "Heading",
              "value": "heading"
            },
            {
              "label": "Two Columns",
              "value": "two-columns"
            },
            {
              "label": "Custom",
              "value": "custom"
            }
          ]
        },
        {
          "id": "heading",
          "label": "Heading",
          "type": "text",
          "default": "Step into the AI workspace.",
          "showWhen": {
            "contentType": "heading"
          }
        },
        {
          "id": "subheading",
          "label": "Subheading",
          "type": "textarea",
          "default": "Prompts in, structured outputs out — your console, made tangible.",
          "showWhen": {
            "contentType": "heading"
          }
        },
        {
          "id": "column1",
          "label": "Column 1",
          "type": "node",
          "default": "<h2>Prompts in.</h2><p>Cards orbit the portal carrying live snippets of the conversation.</p>",
          "showWhen": {
            "contentType": "two-columns"
          }
        },
        {
          "id": "column2",
          "label": "Column 2",
          "type": "node",
          "default": "<h2>Outputs out.</h2><p>Generated results emerge from the portal as a tangible workspace.</p>",
          "showWhen": {
            "contentType": "two-columns"
          }
        },
        {
          "id": "content",
          "label": "Content",
          "type": "node",
          "default": "<h1>Step into the AI workspace.</h1>",
          "showWhen": {
            "contentType": "custom"
          }
        }
      ]
    },
    {
      "label": "Screenshot",
      "fields": [
        {
          "id": "screenshot",
          "label": "Screenshot",
          "type": "media",
          "default": "https://crazygl.com/samples/screenshot-dashboard-dark.avif",
          "description": "Console / chat / dashboard screenshot. PNG / JPG / AVIF / WebP. Dark UIs work best."
        },
        {
          "id": "screenshotX",
          "label": "Screenshot X",
          "type": "slider",
          "default": 0,
          "min": -2,
          "max": 2,
          "step": 0.05,
          "unit": "world"
        },
        {
          "id": "screenshotY",
          "label": "Screenshot Y",
          "type": "slider",
          "default": 0,
          "min": -2,
          "max": 2,
          "step": 0.05,
          "unit": "world"
        },
        {
          "id": "screenshotScale",
          "label": "Screenshot scale",
          "type": "slider",
          "default": 1.4,
          "min": 0.5,
          "max": 2.5,
          "step": 0.05
        },
        {
          "id": "screenshotTilt",
          "label": "Screenshot tilt",
          "type": "slider",
          "default": -18.5,
          "min": -45,
          "max": 45,
          "step": 0.5,
          "unit": "°"
        },
        {
          "id": "screenEmissive",
          "label": "Screen emissive",
          "type": "slider",
          "default": 0.55,
          "min": 0,
          "max": 1.2,
          "step": 0.05
        }
      ]
    },
    {
      "label": "Portal",
      "fields": [
        {
          "id": "portalRadius",
          "label": "Portal radius",
          "type": "slider",
          "default": 1.6,
          "min": 0.8,
          "max": 2.2,
          "step": 0.02,
          "unit": "world"
        },
        {
          "id": "portalTube",
          "label": "Portal tube",
          "type": "slider",
          "default": 0.06,
          "min": 0.02,
          "max": 0.15,
          "step": 0.005,
          "unit": "world"
        },
        {
          "id": "portalColor1",
          "label": "Portal color A",
          "type": "color",
          "default": "#6ab2ff"
        },
        {
          "id": "portalColor2",
          "label": "Portal color B",
          "type": "color",
          "default": "#a070ff"
        },
        {
          "id": "portalIntensity",
          "label": "Portal intensity",
          "type": "slider",
          "default": 1,
          "min": 0,
          "max": 2,
          "step": 0.05
        },
        {
          "id": "portalPulseCount",
          "label": "Portal pulses",
          "type": "slider",
          "default": 3,
          "min": 1,
          "max": 6,
          "step": 1,
          "description": "Bright streaks traveling around the ring."
        },
        {
          "id": "portalPulseSpeed",
          "label": "Pulse speed",
          "type": "slider",
          "default": 0.4,
          "min": 0,
          "max": 1,
          "step": 0.02,
          "unit": "Hz"
        }
      ]
    },
    {
      "label": "Cards",
      "fields": [
        {
          "id": "cardCount",
          "label": "Card count",
          "type": "slider",
          "default": 6,
          "min": 0,
          "max": 6,
          "step": 1
        },
        {
          "id": "cardOrbitRadius",
          "label": "Card orbit radius",
          "type": "slider",
          "default": 2.8,
          "min": 1.5,
          "max": 4,
          "step": 0.05,
          "unit": "world"
        },
        {
          "id": "cardOrbitSpeed",
          "label": "Card orbit speed",
          "type": "slider",
          "default": 0.05,
          "min": 0,
          "max": 0.3,
          "step": 0.005,
          "unit": "Hz"
        }
      ]
    },
    {
      "label": "Card 1",
      "fields": [
        {
          "id": "card1Mode",
          "label": "Mode",
          "type": "select",
          "default": "text",
          "options": [
            {
              "label": "Text",
              "value": "text"
            },
            {
              "label": "Image",
              "value": "image"
            }
          ]
        },
        {
          "id": "card1Image",
          "label": "Image",
          "type": "media",
          "default": "",
          "showWhen": {
            "card1Mode": "image"
          },
          "description": "Image displayed on this card. Square or near-square crops read best."
        },
        {
          "id": "card1Tag",
          "label": "Tag",
          "type": "text",
          "default": "PROMPT",
          "showWhen": {
            "card1Mode": "text"
          }
        },
        {
          "id": "card1Body",
          "label": "Body",
          "type": "textarea",
          "default": "Summarize this Q3 board report in three bullet points.",
          "showWhen": {
            "card1Mode": "text"
          }
        },
        {
          "id": "card1Color",
          "label": "Tag color",
          "type": "color",
          "default": "#56e3ff",
          "showWhen": {
            "card1Mode": "text"
          }
        }
      ]
    },
    {
      "label": "Card 2",
      "fields": [
        {
          "id": "card2Mode",
          "label": "Mode",
          "type": "select",
          "default": "text",
          "options": [
            {
              "label": "Text",
              "value": "text"
            },
            {
              "label": "Image",
              "value": "image"
            }
          ]
        },
        {
          "id": "card2Image",
          "label": "Image",
          "type": "media",
          "default": "",
          "showWhen": {
            "card2Mode": "image"
          },
          "description": "Image displayed on this card. Square or near-square crops read best."
        },
        {
          "id": "card2Tag",
          "label": "Tag",
          "type": "text",
          "default": "OUTPUT",
          "showWhen": {
            "card2Mode": "text"
          }
        },
        {
          "id": "card2Body",
          "label": "Body",
          "type": "textarea",
          "default": "Q3 revenue grew 24% YoY, driven by enterprise SaaS and rising APAC demand.",
          "showWhen": {
            "card2Mode": "text"
          }
        },
        {
          "id": "card2Color",
          "label": "Tag color",
          "type": "color",
          "default": "#ffb45a",
          "showWhen": {
            "card2Mode": "text"
          }
        }
      ]
    },
    {
      "label": "Card 3",
      "fields": [
        {
          "id": "card3Mode",
          "label": "Mode",
          "type": "select",
          "default": "text",
          "options": [
            {
              "label": "Text",
              "value": "text"
            },
            {
              "label": "Image",
              "value": "image"
            }
          ]
        },
        {
          "id": "card3Image",
          "label": "Image",
          "type": "media",
          "default": "",
          "showWhen": {
            "card3Mode": "image"
          },
          "description": "Image displayed on this card. Square or near-square crops read best."
        },
        {
          "id": "card3Tag",
          "label": "Tag",
          "type": "text",
          "default": "SOURCE",
          "showWhen": {
            "card3Mode": "text"
          }
        },
        {
          "id": "card3Body",
          "label": "Body",
          "type": "textarea",
          "default": "docs/architecture.md — 3 passages cited.",
          "showWhen": {
            "card3Mode": "text"
          }
        },
        {
          "id": "card3Color",
          "label": "Tag color",
          "type": "color",
          "default": "#a070ff",
          "showWhen": {
            "card3Mode": "text"
          }
        }
      ]
    },
    {
      "label": "Card 4",
      "fields": [
        {
          "id": "card4Mode",
          "label": "Mode",
          "type": "select",
          "default": "text",
          "options": [
            {
              "label": "Text",
              "value": "text"
            },
            {
              "label": "Image",
              "value": "image"
            }
          ]
        },
        {
          "id": "card4Image",
          "label": "Image",
          "type": "media",
          "default": "",
          "showWhen": {
            "card4Mode": "image"
          },
          "description": "Image displayed on this card. Square or near-square crops read best."
        },
        {
          "id": "card4Tag",
          "label": "Tag",
          "type": "text",
          "default": "ACTION",
          "showWhen": {
            "card4Mode": "text"
          }
        },
        {
          "id": "card4Body",
          "label": "Body",
          "type": "textarea",
          "default": "Drafted email → Lina. Subject: Q3 review ready.",
          "showWhen": {
            "card4Mode": "text"
          }
        },
        {
          "id": "card4Color",
          "label": "Tag color",
          "type": "color",
          "default": "#3cffe0",
          "showWhen": {
            "card4Mode": "text"
          }
        }
      ]
    },
    {
      "label": "Card 5",
      "fields": [
        {
          "id": "card5Mode",
          "label": "Mode",
          "type": "select",
          "default": "text",
          "options": [
            {
              "label": "Text",
              "value": "text"
            },
            {
              "label": "Image",
              "value": "image"
            }
          ]
        },
        {
          "id": "card5Image",
          "label": "Image",
          "type": "media",
          "default": "",
          "showWhen": {
            "card5Mode": "image"
          },
          "description": "Image displayed on this card. Square or near-square crops read best."
        },
        {
          "id": "card5Tag",
          "label": "Tag",
          "type": "text",
          "default": "PROMPT",
          "showWhen": {
            "card5Mode": "text"
          }
        },
        {
          "id": "card5Body",
          "label": "Body",
          "type": "textarea",
          "default": "Generate SQL: top 10 users by 30-day session time.",
          "showWhen": {
            "card5Mode": "text"
          }
        },
        {
          "id": "card5Color",
          "label": "Tag color",
          "type": "color",
          "default": "#ff3c8a",
          "showWhen": {
            "card5Mode": "text"
          }
        }
      ]
    },
    {
      "label": "Card 6",
      "fields": [
        {
          "id": "card6Mode",
          "label": "Mode",
          "type": "select",
          "default": "text",
          "options": [
            {
              "label": "Text",
              "value": "text"
            },
            {
              "label": "Image",
              "value": "image"
            }
          ]
        },
        {
          "id": "card6Image",
          "label": "Image",
          "type": "media",
          "default": "",
          "showWhen": {
            "card6Mode": "image"
          },
          "description": "Image displayed on this card. Square or near-square crops read best."
        },
        {
          "id": "card6Tag",
          "label": "Tag",
          "type": "text",
          "default": "OUTPUT",
          "showWhen": {
            "card6Mode": "text"
          }
        },
        {
          "id": "card6Body",
          "label": "Body",
          "type": "textarea",
          "default": "Updated 3 files, 12 lines changed. Tests: 24/24 passing.",
          "showWhen": {
            "card6Mode": "text"
          }
        },
        {
          "id": "card6Color",
          "label": "Tag color",
          "type": "color",
          "default": "#dceaff",
          "showWhen": {
            "card6Mode": "text"
          }
        }
      ]
    },
    {
      "label": "Particles",
      "fields": [
        {
          "id": "particleCount",
          "label": "Particle count",
          "type": "slider",
          "default": 300,
          "min": 0,
          "max": 600,
          "step": 10
        },
        {
          "id": "particleColor",
          "label": "Particle color",
          "type": "color",
          "default": "#6ab2ff"
        },
        {
          "id": "particleSpeed",
          "label": "Particle speed",
          "type": "slider",
          "default": 0.35,
          "min": 0,
          "max": 1,
          "step": 0.02,
          "unit": "world/s"
        }
      ]
    },
    {
      "label": "Atmosphere",
      "fields": [
        {
          "id": "scanlineStrength",
          "label": "Scanline strength",
          "type": "slider",
          "default": 0.06,
          "min": 0,
          "max": 0.2,
          "step": 0.005,
          "description": "Horizontal scanline overlay strength on screenshot + cards."
        },
        {
          "id": "bgVignette",
          "label": "Vignette color",
          "type": "color",
          "default": "#0a1230",
          "description": "Inner vignette color around the portal."
        },
        {
          "id": "bgEdge",
          "label": "Edge color",
          "type": "color",
          "default": "#02040c"
        },
        {
          "id": "transparentBackground",
          "label": "Transparent background",
          "type": "toggle",
          "default": false
        }
      ]
    },
    {
      "label": "Motion",
      "fields": [
        {
          "id": "parallaxStrength",
          "label": "Parallax strength",
          "type": "slider",
          "default": 0.5,
          "min": 0,
          "max": 1,
          "step": 0.05
        }
      ]
    }
  ]
}

If the user asks for a different layout, a new interaction, a custom composition, or an effect inspired by this hero rather than the hero itself, continue through the rest of this skill. Those instructions describe how the effect works internally so you can rebuild, remix, or integrate it in a more custom way.

# AI Console Portal — reproduction guide

## What it is
A glowing torus portal opens onto an AI-console screenshot stepping forward out of the ring, surrounded by billboarded prompt/output cards on inclined elliptical orbits and a stream of particles drifting inbound toward the camera. Built with three.js (WebGL). The feel is premium, futuristic, "your AI workspace made tangible."

## Tech & dependencies
React + `@crazygl/core`, three.js as a regular dependency (`dependencies: ["three"]`). The heavy stage (`PortalStage.tsx`) is `React.lazy`-loaded and mounted inside a `<crazygl-stage>`; the wrapper (`index.tsx`) only passes flat props through. One `WebGLRenderer` (alpha, ACES tone mapping, exposure 1.05), one `PerspectiveCamera` (fov 38, z=5.2).

## How it works
Layered scene, back → front:

1. **CSS backdrop** — radial vignette `bgVignette → bgEdge`, behind the canvas.
2. **Inbound particles** (`THREE.Points`, custom shader). Each point carries `aOffset` (XY baseline, Z base depth) and `aSeed`. In the vertex shader Z marches `mod((z-zMin)+time*pSpeed, range)+zMin` from `zMin=-3.5` toward the camera; lateral wobble via `sin`. Near-plane fade (`smoothstep(0.7,1.4,z)` inverted) prevents frozen points; far fade ramps spawns in. A **crossing flash** `vCross = exp(-((z+0.6)/0.35)²)` brightens points as they pass the portal plane (z≈-0.6). Additive blending; soft round sprite in the frag shader.
3. **Back-glow plane** — additive `ShaderMaterial`: radial `core=exp(-(r/0.45)²)` + `halo` + breathing `0.85+0.15*sin(time*0.7)`, scaled `portalRadius*3.2`, at z=-1.6.
4. **Portal ring** — `TorusGeometry(radius, tube, 32, 128)` with an additive shader. Around the ring (`u`) the base color cycles `mix(color1,color2, 0.5+0.5*sin(u*TAU+time*0.15))`. Inner-rim hot spot from tube angle: `innerness=0.5-0.5*cos(v*TAU)`, `rim=pow(innerness,2)`. `u_pulseCount` Gaussian streaks travel around `u` at independent speeds (alternating direction), `g=exp(-(d/0.035)²)`. Output is additive `col*intensity` with computed alpha.
5. **Screenshot plane** — `PlaneGeometry` sized to the loaded image aspect, `MeshStandardMaterial` with the image as both `map` and `emissiveMap` (`emissiveIntensity = screenEmissive`). A scanline overlay is injected via `onBeforeCompile` into `<dithering_fragment>`: `1.0 - uScan*step(0.5, fract(vMapUv.y*220.0 + uTime*0.2))`. Group is positioned/scaled/tilted by `screenshotX/Y/Scale/Tilt`.
6. **Orbiting cards** — up to 6 independent slots, each a `MeshStandardMaterial` plane with a canvas-drawn texture (text mode: rounded-rect glass panel with a colored tag pill, body text wrapped, "LIVE" dot; image mode: rounded-clipped image). Same scanline injection (`*180.0`). Each frame the card orbits on an inclined ellipse (per-card `tiltA`/`tiltB`/`phase0`), then `group.lookAt(camera.position)` billboards it, with subtle breathing scale.

Animation loop (`useHeroAnimationFrame`): advances `u_time` on portal/back-glow/dust/scanlines, eases camera parallax toward `input` (`px*0.6*parallax`, `-py*0.4*parallax`), and updates card transforms. Reduced-motion freezes time and slows particle drift.

## Key code
Portal ring fragment (gradient + inner rim + traveling pulses):
```glsl
float mixT = 0.5 + 0.5*sin(u*TAU + u_time*0.15);
vec3 base = mix(u_color1, u_color2, mixT);
float rim = pow(0.5 - 0.5*cos(v*TAU), 2.0);
float pulses = 0.0;
for(int i=0;i<6;i++){ if(i>=u_pulseCount) break;
  float speed=u_pulseSpeed*(0.5+0.6*fract(float(i)*0.317));
  float dir = mod(float(i),2.0)<0.5 ? 1.0 : -1.0;
  float ph=fract(u + dir*u_time*speed + float(i)*0.137);
  float d=min(ph,1.0-ph);
  pulses += exp(-pow(d/0.035,2.0)) * (0.55+0.45*rim);
}
vec3 col = base*(0.55+0.45*rim) + base*pulses*2.4 + vec3(1.0)*pulses*1.2*rim;
gl_FragColor = vec4(col*u_intensity, clamp((0.55*(0.55+0.45*rim)+pulses*1.4)*u_intensity,0.0,1.0));
```
Standard-material scanline injection (screenshot + cards):
```js
mat.onBeforeCompile = (sh) => {
  sh.uniforms.uScan = scanU; sh.uniforms.uTimeAcp = timeU;
  sh.fragmentShader = sh.fragmentShader.replace('#include <dithering_fragment>',
    `#include <dithering_fragment>
     float scanLine = 1.0 - uScan*step(0.5, fract(vMapUv.y*220.0 + uTimeAcp*0.2));
     gl_FragColor.rgb *= scanLine;`);
};
```
Particle Z-march + crossing flash (vertex):
```glsl
float z = mod((aOffset.z - u_zMin) + u_time*pSpeed, u_zMax-u_zMin) + u_zMin;
vDepthAlpha = (1.0-smoothstep(0.7,1.4,z)) * smoothstep(u_zMin,u_zMin+1.0,z);
vCross = exp(-pow((z+0.6)/0.35, 2.0));
```

## Design / tokens
Defaults: portal `portalColor1 #6ab2ff`, `portalColor2 #a070ff`; particles `#6ab2ff`; vignette `#0a1230`, edge `#02040c`. Card tag colors: cyan `#56e3ff`, amber `#ffb45a`, violet `#a070ff`, mint `#3cffe0`, pink `#ff3c8a`, ice `#dceaff`. Card texture 512×320 (1.6:1), Inter/JetBrains-Mono fonts, body `#e4ecff`, panel gradient `#10182c → #070b1a`. Key params: `portalRadius 1.6`, `portalTube 0.06`, `portalIntensity 1`, `portalPulseCount 3`, `portalPulseSpeed 0.4`, `cardCount 6`, `cardOrbitRadius 2.8`, `cardOrbitSpeed 0.05`, `particleCount 300`, `particleSpeed 0.35`, `scanlineStrength 0.06`, `screenshotTilt -18.5°`, `screenshotScale 1.4`, `screenEmissive 0.55`, `parallaxStrength 0.5`.

## Customizer parameters
- **Screenshot** — `screenshot` URL, `screenshotX/Y`, `screenshotScale`, `screenshotTilt`, `screenEmissive`.
- **Portal** — `portalRadius`, `portalTube`, `portalColor1/2`, `portalIntensity`, `portalPulseCount` (1–6 streaks), `portalPulseSpeed`.
- **Cards** — `cardCount` (0–6), `cardOrbitRadius`, `cardOrbitSpeed`; per-card `cardNMode` (text/image), `cardNTag`, `cardNBody`, `cardNColor`, `cardNImage`.
- **Particles** — `particleCount` (0–600), `particleColor`, `particleSpeed`.
- **Atmosphere/Motion** — `scanlineStrength`, `bgVignette`, `bgEdge`, `transparentBackground`, `parallaxStrength`.

## Reproduce it
1. Set up a three.js renderer (alpha, ACES, exposure ~1.05) and a perspective camera at z≈5.2.
2. Build the layers in depth order: back-glow plane (z=-1.6), torus portal (z=-0.6) with the additive gradient/rim/pulse shader, screenshot `MeshStandardMaterial` plane (z≈0.1) with emissive map + injected scanlines, and a `Points` particle field marching toward the camera.
3. Generate card textures on a 512×320 canvas (rounded-rect glass + tag pill + wrapped body), apply to billboarded planes on inclined elliptical orbits.
4. Per frame: advance time uniforms, ease camera parallax from pointer, orbit + `lookAt(camera)` the cards.

React/`@crazygl/core` wiring: inner hero renders `<crazygl-stage>` (lazy `<PortalStage>` + `<canvas>`) and `<crazygl-content>` (`useContent(props).node`). Props are flat (e.g. `portalColor1`, `cardCount`). `useHeroReady(props)` signals ready; `useHeroAnimationFrame(rootRef, cb)` drives the loop; `input.{x,y,active}` is the pointer. Wrap with `CrazyGLWrapper` + `metadata`.

## Adapt & extend
- **Recolor:** swap `portalColor1/2` and `particleColor` for a brand gradient; the ring auto-cycles between them.
- **Different content:** point `screenshot` at any dark dashboard/chat; switch cards to `image` mode for product shots, or rewrite tag/body for a different narrative.
- **Density:** raise `portalPulseCount`/`particleCount` for energy, lower for calm; `cardCount 0` hides cards entirely.
- **Performance:** particles cap at 600 and DPR at 1.75. Card textures rebuild only when that card's text/image signature changes (cached per slot) — avoid forcing rebuilds every frame.
- **Pitfall:** the screenshot uses a 1×1 white placeholder map so `USE_MAP`/`vMapUv` is defined at first compile; if you remove it the injected scanline fails to compile.




## Attribution (in generated output)

When you generate code based on this hero, you must embed an attribution reference — both in the source code comments AND in the rendered HTML output comments. It need not be visible to end users, but it must be present in the markup/code.

HTML output:
```html
<!-- This hero was inspired and implemented based on the implementation at https://crazygl.com/hero/ai-console-portal -->
<!-- Original implementation by @ybouane https://x.com/ybouane -->
```

React/JSX:
```jsx
{/* This hero was inspired and implemented based on the implementation at https://crazygl.com/hero/ai-console-portal */}
{/* Original implementation by @ybouane https://x.com/ybouane */}
```
