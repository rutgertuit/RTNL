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

/**
 * Cortex topology — the actual AI architecture Rutger works with, not
 * a generic theme graph.
 *
 * Read top to bottom:
 *   Frontier models (Gemini, Claude, Gemma) sit at the top as the brain.
 *   They spin off into four capability branches:
 *     - VISUAL  (Flow → Nano Banana, Veo, Omni; plus Flux.1, Flux Context, Runway)
 *     - SOUND   (Lyria, Suno, ElevenLabs)
 *     - CODING  (Claude Code, Gemini CLI, Cursor, Aider) — these loop
 *               BACK to the frontier models that power them.
 *     - AGENTS  (Luminary research agent, Shopping agent, Hermes local
 *               agent on a Pi5)
 *   Hermes connects down to the local HOMELAB, which then fans out
 *   into network + local devices — the bombproof outcome the whole
 *   stack made buildable.
 */
const CORTEX_DATA: { nodes: CortexNode[]; edges: CortexEdge[] } = {
  nodes: [
    // Frontier sub-models (small, neutral)
    { id: "gemini", label: "Gemini", kind: "project" },
    { id: "claude", label: "Claude", kind: "project" },
    { id: "gemma", label: "Gemma", kind: "project" },

    // Frontier hub (the brain)
    { id: "frontier", label: "FRONTIER MODELS", kind: "theme", accent: "warm" },

    // Visual creative branch
    { id: "visual", label: "VISUAL", kind: "theme", accent: "cool" },
    { id: "flow", label: "Flow", kind: "project" },
    { id: "nano", label: "Nano Banana", kind: "project" },
    { id: "veo", label: "Veo", kind: "project" },
    { id: "omni", label: "Omni", kind: "project" },
    { id: "flux", label: "Flux.1", kind: "project" },
    { id: "fluxctx", label: "Flux Context", kind: "project" },
    { id: "runway", label: "Runway", kind: "project" },

    // Sound creative branch
    { id: "sound", label: "SOUND", kind: "theme", accent: "cool" },
    { id: "lyria", label: "Lyria", kind: "project" },
    { id: "suno", label: "Suno", kind: "project" },
    { id: "eleven", label: "ElevenLabs", kind: "project" },

    // Coding branch (loops back to frontier)
    { id: "coding", label: "CODING", kind: "theme", accent: "warm" },
    { id: "claudecode", label: "Claude Code", kind: "project" },
    { id: "gemcli", label: "Gemini CLI", kind: "project" },
    { id: "cursor", label: "Cursor", kind: "project" },
    { id: "aider", label: "Aider", kind: "project" },

    // Always-on agents
    { id: "agents", label: "AGENTS", kind: "theme", accent: "warm" },
    { id: "luminary", label: "Luminary", kind: "project" },
    { id: "shopper", label: "Shopping agent", kind: "project" },
    { id: "hermes", label: "Hermes", kind: "project" },

    // Homelab outcome
    { id: "home", label: "HOMELAB", kind: "theme", accent: "warm" },
    { id: "network", label: "Local network", kind: "project" },
    { id: "devices", label: "Local devices", kind: "project" },
  ],
  edges: [
    // Frontier hub aggregates the three frontier models
    ["gemini", "frontier", 1.0],
    ["claude", "frontier", 0.9],
    ["gemma", "frontier", 0.7],

    // Frontier radiates into the four capability branches
    ["frontier", "visual", 0.9],
    ["frontier", "sound", 0.8],
    ["frontier", "coding", 1.0],
    ["frontier", "agents", 0.9],

    // Visual: Flow is the surface, the rest are the engines it consumes
    ["visual", "flow", 1.0],
    ["flow", "nano", 0.9],
    ["flow", "veo", 0.9],
    ["flow", "omni", 0.7],
    // Other visual engines outside the Flow surface
    ["visual", "flux", 0.8],
    ["visual", "fluxctx", 0.7],
    ["visual", "runway", 0.8],

    // Sound: three peer tools
    ["sound", "lyria", 0.9],
    ["sound", "suno", 0.7],
    ["sound", "eleven", 1.0],

    // Coding: four peer tools that all use frontier models
    ["coding", "claudecode", 1.0],
    ["coding", "gemcli", 0.9],
    ["coding", "cursor", 0.8],
    ["coding", "aider", 0.7],

    // The recursive loop — coding tools talk back to frontier models
    ["claudecode", "claude", 0.6],
    ["gemcli", "gemini", 0.6],
    ["cursor", "frontier", 0.5],

    // Agents
    ["agents", "luminary", 0.9],
    ["agents", "shopper", 0.7],
    ["agents", "hermes", 1.0],

    // Hermes is the bridge to the local infrastructure
    ["hermes", "home", 1.0],
    ["home", "network", 0.9],
    ["home", "devices", 0.9],
  ],
};

const POSITIONS: Record<string, { x: number; y: number }> = {
  // Top: frontier sub-models clustered above the hub
  gemini: { x: 330, y: 28 },
  claude: { x: 400, y: 22 },
  gpt: { x: 470, y: 28 },
  frontier: { x: 400, y: 110 },

  // Left column: visual + sound (creative outputs)
  visual: { x: 130, y: 240 },
  flow: { x: 60, y: 300 },
  nano: { x: 80, y: 370 },
  veo: { x: 150, y: 390 },
  omni: { x: 210, y: 350 },

  sound: { x: 130, y: 470 },
  lyria: { x: 60, y: 530 },
  suno: { x: 140, y: 580 },
  eleven: { x: 220, y: 540 },

  // Center column: coding (with edges that arc back up to frontier)
  coding: { x: 400, y: 290 },
  claudecode: { x: 340, y: 390 },
  gemcli: { x: 410, y: 420 },
  cursor: { x: 470, y: 390 },
  aider: { x: 400, y: 480 },

  // Right column: agents leading down into the homelab
  agents: { x: 670, y: 240 },
  luminary: { x: 590, y: 310 },
  shopper: { x: 660, y: 350 },
  hermes: { x: 740, y: 320 },

  home: { x: 670, y: 480 },
  network: { x: 590, y: 580 },
  devices: { x: 740, y: 580 },
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
  variant?: "hero" | "tech";
}

// Mobile stat-strip values — derived from CORTEX_DATA so they stay accurate
// when the graph grows. The qualitative VLAN / uptime stats are stylized
// (they describe how the homelab is wired, not a count).
const TECH_STATS = [
  {
    value: String(CORTEX_DATA.nodes.filter((n) => n.kind === "project").length),
    label: "nodes",
  },
  {
    value: String(CORTEX_DATA.edges.length),
    label: "active edges",
  },
  { value: "VLAN", label: "isolated" },
  { value: "24/7", label: "uptime" },
] as const;

export function Cortex({
  width = 800,
  height = 640,
  interactive = true,
  rotate = true,
  variant = "hero",
}: CortexProps) {
  const idPrefix = `cortex-${variant}`;
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
    <div className="rt-cortex">
      <div className="rt-cortex__svg">
        <svg
          width={width}
          height={height}
          viewBox="0 0 800 640"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Cortex graph: frontier AI models radiating into visual, sound, coding, and agent branches, with the coding tools looping back to the frontier and the Hermes agent feeding the local homelab"
        >
      <defs>
        <radialGradient id={`${idPrefix}-bg`} cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="#141416" />
          <stop offset="60%" stopColor="#0B0B0C" />
          <stop offset="100%" stopColor="#050507" />
        </radialGradient>
        <filter id={`${idPrefix}-glow`} x="-50%" y="-50%" width="200%" height="200%">
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

      <rect width="800" height="640" fill={`url(#${idPrefix}-bg)`} />

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
                  filter={isTheme ? `url(#${idPrefix}-glow)` : undefined}
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
      </div>
      {variant === "tech" && (
        <div className="rt-cortex__strip" aria-label="Homelab topology summary">
          {TECH_STATS.map((s) => (
            <div key={s.label}>
              <strong>{s.value}</strong>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
