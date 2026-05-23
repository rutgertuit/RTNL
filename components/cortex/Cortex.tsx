"use client";

import { useEffect, useRef, useState } from "react";

type NodeKind = "theme" | "project";
type AccentKey = "warm" | "cool";

interface CortexNode {
  id: string;
  label: string;
  kind: NodeKind;
  accent?: AccentKey;
}

type CortexEdge = [string, string, number];

const CORTEX_DATA: { nodes: CortexNode[]; edges: CortexEdge[] } = {
  nodes: [
    { id: "ai-trans", label: "AI TRANSFORMATION", kind: "theme", accent: "warm" },
    { id: "media", label: "FUTURE OF MEDIA", kind: "theme", accent: "cool" },
    { id: "culture", label: "CREATIVE CULTURE", kind: "theme", accent: "cool" },
    { id: "jazz", label: "JAZZ SWING", kind: "theme", accent: "warm" },
    { id: "home", label: "HOMELAB", kind: "theme", accent: "cool" },
    { id: "geo", label: "GEO / LLMO", kind: "theme", accent: "warm" },
    { id: "lum", label: "Luminary", kind: "project" },
    { id: "vibe", label: "Vibe-coded sites", kind: "project" },
    { id: "llmo", label: "LLM training", kind: "project" },
    { id: "yt", label: "YouTube economy", kind: "project" },
    { id: "gen", label: "Generative art", kind: "project" },
    { id: "w3", label: "Brand in Web3", kind: "project" },
    { id: "cw", label: "Codewoord", kind: "project" },
    { id: "bed", label: "Bedtime Stories", kind: "project" },
  ],
  edges: [
    ["ai-trans", "lum", 1.0],
    ["ai-trans", "llmo", 0.9],
    ["ai-trans", "geo", 1.0],
    ["ai-trans", "media", 0.8],
    ["media", "yt", 1.0],
    ["media", "geo", 0.8],
    ["culture", "gen", 0.7],
    ["culture", "cw", 0.9],
    ["culture", "jazz", 1.0],
    ["jazz", "lum", 0.5],
    ["jazz", "cw", 0.8],
    ["home", "lum", 0.8],
    ["home", "bed", 0.7],
    ["home", "vibe", 0.6],
    ["geo", "vibe", 0.5],
    ["w3", "culture", 0.5],
  ],
};

const POSITIONS: Record<string, { x: number; y: number }> = {
  "ai-trans": { x: 220, y: 240 },
  media: { x: 580, y: 200 },
  culture: { x: 640, y: 460 },
  jazz: { x: 380, y: 540 },
  home: { x: 140, y: 460 },
  geo: { x: 420, y: 100 },
  lum: { x: 260, y: 380 },
  vibe: { x: 120, y: 280 },
  llmo: { x: 340, y: 200 },
  yt: { x: 720, y: 280 },
  gen: { x: 540, y: 580 },
  w3: { x: 740, y: 540 },
  cw: { x: 480, y: 420 },
  bed: { x: 60, y: 380 },
};

function accentColor(accent?: AccentKey): string {
  if (accent === "warm") return "#C8553D";
  if (accent === "cool") return "#4A6FA5";
  return "#F2EEE5";
}

interface CortexProps {
  width?: number;
  height?: number;
  interactive?: boolean;
  rotate?: boolean;
}

export function Cortex({
  width = 800,
  height = 640,
  interactive = true,
  rotate = true,
}: CortexProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const groupRef = useRef<SVGGElement | null>(null);
  const [t, setT] = useState(0);

  useEffect(() => {
    if (!rotate) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      setT((now - start) / 1000);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [rotate]);

  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const drift = reduced ? 0 : Math.sin(t * 0.1) * 0.02;

  const edgeIsActive = (a: string, b: string) =>
    hovered !== null && (hovered === a || hovered === b);

  return (
    <svg
      className="rt-cortex"
      width={width}
      height={height}
      viewBox="0 0 800 640"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Cortex graph connecting themes and projects"
    >
      <defs>
        <radialGradient id="cortex-bg" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="#141416" />
          <stop offset="60%" stopColor="#0B0B0C" />
          <stop offset="100%" stopColor="#050507" />
        </radialGradient>
        <filter id="cortex-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <style>{`
          @keyframes cortex-dash-flow { to { stroke-dashoffset: -24; } }
          @media (prefers-reduced-motion: reduce) {
            .rt-cortex__edge-active { animation: none !important; }
          }
        `}</style>
      </defs>

      <rect width="800" height="640" fill="url(#cortex-bg)" />

      <g
        ref={groupRef}
        style={{
          transform: `rotate(${drift}rad) translate(0,0)`,
          transformOrigin: "400px 320px",
          transition: "transform 2400ms linear",
        }}
      >
        <g>
          {CORTEX_DATA.edges.map(([a, b, w], i) => {
            const pa = POSITIONS[a];
            const pb = POSITIONS[b];
            if (!pa || !pb) return null;
            const active = edgeIsActive(a, b);
            return (
              <line
                key={i}
                className={active ? "rt-cortex__edge-active" : undefined}
                x1={pa.x}
                y1={pa.y}
                x2={pb.x}
                y2={pb.y}
                stroke={active ? "#5B85C4" : "#4A6FA5"}
                strokeOpacity={active ? 0.9 : 0.18 + w * 0.18}
                strokeWidth={active ? 1.8 : 0.9 + w * 0.3}
                strokeDasharray={active ? "6 6" : undefined}
                style={{
                  transition:
                    "stroke 200ms cubic-bezier(0.34, 0.05, 0.18, 1), stroke-opacity 200ms",
                  animation: active ? "cortex-dash-flow 1.1s linear infinite" : undefined,
                }}
              />
            );
          })}
        </g>

        <g>
          {CORTEX_DATA.nodes.map((n) => {
            const p = POSITIONS[n.id];
            if (!p) return null;
            const isTheme = n.kind === "theme";
            const isHover = hovered === n.id;
            const r = isTheme ? 7.5 : 3.5;
            const fill = isTheme ? accentColor(n.accent) : "#B8B2A4";
            return (
              <g
                key={n.id}
                onMouseEnter={() => interactive && setHovered(n.id)}
                onMouseLeave={() => interactive && setHovered(null)}
                style={{ cursor: interactive ? "pointer" : "default" }}
              >
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHover ? r * 1.18 : r}
                  fill={fill}
                  filter={isTheme ? "url(#cortex-glow)" : undefined}
                  style={{ transition: "r 200ms cubic-bezier(0.34, 0.05, 0.18, 1)" }}
                />
                <circle cx={p.x} cy={p.y} r={20} fill="transparent" />
                {(isTheme || isHover) && (
                  <text
                    x={p.x + (isTheme ? 14 : 10)}
                    y={p.y + 4}
                    fontFamily="IBM Plex Mono, monospace"
                    fontSize={isTheme ? 11 : 10}
                    fill={isTheme ? "#B8B2A4" : "#F2EEE5"}
                    letterSpacing={isTheme ? 1.8 : 0.6}
                    style={{
                      textTransform: isTheme ? "uppercase" : "none",
                      pointerEvents: "none",
                    }}
                  >
                    {n.label}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </g>
    </svg>
  );
}
