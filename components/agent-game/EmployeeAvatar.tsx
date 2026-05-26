"use client";

import type { Employee } from "@/app/technical/agent-game/cards";

interface EmployeeAvatarProps {
  employee: Employee;
  projected?: { loyalty: number; isAsleep: boolean } | null;
}

export function EmployeeAvatar({ employee, projected }: EmployeeAvatarProps) {
  const initial = employee.name.charAt(0).toUpperCase();
  const traitColor = employee.traitId
    ? `var(--sim-color-${employee.traitId}, var(--color-bg-raised))`
    : "var(--color-bg-raised)";
  const heartBuckets = 5;
  const filledHearts = Math.round((employee.loyalty / 100) * heartBuckets);
  return (
    <div
      className="sim-avatar"
      aria-label={`${employee.name}, level ${employee.promotionLevel}, loyalty ${employee.loyalty}%`}
    >
      <div className="sim-avatar__circle" style={{ background: traitColor }} aria-hidden>
        <span className="sim-avatar__initial">{initial}</span>
      </div>
      <div className="sim-avatar__name">{employee.name}</div>
      <div className="sim-avatar__level">L{employee.promotionLevel}</div>
      <div className="sim-avatar__hearts" aria-hidden>
        {Array.from({ length: heartBuckets }, (_, i) => (
          <span key={i} className={i < filledHearts ? "is-filled" : ""}>♥</span>
        ))}
      </div>
      {projected && projected.loyalty !== employee.loyalty && (
        <div className="sim-avatar__projected" aria-hidden>
          ~{projected.loyalty}❤
        </div>
      )}
    </div>
  );
}
