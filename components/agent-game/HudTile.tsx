"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface HudTileProps {
  icon: ReactNode;
  value: ReactNode;
  subtitle?: ReactNode;
  projected?: ReactNode;
  ariaLabel: string;
}

export function HudTile({ icon, value, subtitle, projected, ariaLabel }: HudTileProps) {
  return (
    <div className="sim-hud-tile" aria-label={ariaLabel} role="group">
      <div className="sim-hud-tile__icon" aria-hidden>{icon}</div>
      <div className="sim-hud-tile__value">{value}</div>
      {subtitle && <div className="sim-hud-tile__subtitle">{subtitle}</div>}
      {projected && <div className="sim-hud-tile__projected" aria-hidden>{projected}</div>}
    </div>
  );
}

// Phase 5d.12 — CountUp helper.
// Animates a numeric value toward `to` with easeOutCubic over `durationMs`.
// Honors prefers-reduced-motion: snaps to the final value when reduced
// motion is requested or when `to` hasn't actually changed.
interface CountUpProps {
  to: number;
  format: (n: number) => string;
  durationMs?: number;
}

export function CountUp({ to, format, durationMs = 320 }: CountUpProps) {
  const [display, setDisplay] = useState(to);
  const prevRef = useRef(to);
  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced || prevRef.current === to) {
      setDisplay(to);
      prevRef.current = to;
      return;
    }
    const start = prevRef.current;
    const delta = to - start;
    const t0 = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / durationMs);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(start + delta * eased));
      if (p < 1) raf = requestAnimationFrame(step);
      else prevRef.current = to;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to, durationMs]);
  return <>{format(display)}</>;
}
