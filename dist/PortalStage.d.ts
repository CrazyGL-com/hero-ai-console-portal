import * as React from 'react';
export interface CardConfig {
    mode: 'text' | 'image';
    image: string;
    tag: string;
    body: string;
    color: string;
}
interface StageProps {
    rootRef: React.RefObject<HTMLElement | null>;
    size: {
        width: number;
        height: number;
        dpr: number;
    };
    input: {
        x: number;
        y: number;
        active: boolean;
    };
    seed: number;
    reducedMotion: boolean;
    screenshot: string;
    screenshotX: number;
    screenshotY: number;
    screenshotScale: number;
    screenshotTilt: number;
    screenEmissive: number;
    portalRadius: number;
    portalTube: number;
    portalColor1: string;
    portalColor2: string;
    portalIntensity: number;
    portalPulseCount: number;
    portalPulseSpeed: number;
    cardCount: number;
    cardOrbitRadius: number;
    cardOrbitSpeed: number;
    cardConfigs: CardConfig[];
    particleCount: number;
    particleColor: string;
    particleSpeed: number;
    scanlineStrength: number;
    parallaxStrength: number;
    transparent: boolean;
}
export default function PortalStage(props: StageProps): import("react/jsx-runtime").JSX.Element;
export {};
