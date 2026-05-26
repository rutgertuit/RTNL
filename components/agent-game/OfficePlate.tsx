"use client";

import type { OfficeTier } from "@/app/technical/agent-game/office";

export function OfficePlate({ tier }: { tier: OfficeTier }) {
  return (
    <div className={`sim-office sim-office--${tier}`} aria-hidden>
      {tier === "home" && <HomePlate />}
      {tier === "coworking" && <CoworkingPlate />}
      {tier === "kantoorpand" && <KantoorpandPlate />}
    </div>
  );
}

function HomePlate() {
  return (
    <svg viewBox="0 0 1200 120" preserveAspectRatio="xMidYMid slice">
      {/* Home office: window + chair + plant + lamp — all single-stroke line art */}
      <rect x="80" y="20" width="180" height="80" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M170 20 L170 100 M80 60 L260 60" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="380" cy="80" r="20" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M380 100 L380 110 M370 110 L390 110" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M500 110 L500 80 M495 90 Q500 70 505 90 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <line x1="700" y1="100" x2="900" y2="100" stroke="currentColor" strokeWidth="1.5" />
      <line x1="750" y1="100" x2="750" y2="60" stroke="currentColor" strokeWidth="1.5" />
      <rect x="730" y="40" width="40" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function CoworkingPlate() {
  return (
    <svg viewBox="0 0 1200 120" preserveAspectRatio="xMidYMid slice">
      {/* Glass-walled co-working: vertical mullions + warm neon strip along bottom */}
      {Array.from({ length: 8 }, (_, i) => (
        <line key={i} x1={150 * i + 100} y1={10} x2={150 * i + 100} y2={110} stroke="currentColor" strokeWidth={1.2} />
      ))}
      <line x1="60" y1="60" x2="1140" y2="60" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
      <rect x="60" y="100" width="1080" height="3" fill="var(--color-accent-warm)" opacity="0.6" />
    </svg>
  );
}

function KantoorpandPlate() {
  return (
    <svg viewBox="0 0 1200 120" preserveAspectRatio="xMidYMid slice">
      {/* Herengracht canal-house frontage: stepped gable + window panels + canal trees */}
      <rect x="40" y="20" width="200" height="90" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <rect x="60" y="40" width="50" height="60" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <rect x="130" y="40" width="50" height="60" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="M40 20 L140 0 L240 20" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="320" cy="80" r="20" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="380" cy="80" r="22" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <line x1="280" y1="100" x2="1140" y2="100" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
      <rect x="500" y="30" width="180" height="80" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <line x1="500" y1="60" x2="680" y2="60" stroke="currentColor" strokeWidth="1.2" />
      <line x1="590" y1="30" x2="590" y2="110" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}
