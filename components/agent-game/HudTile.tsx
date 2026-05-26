"use client";

import type { ReactNode } from "react";

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
