"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

interface SimButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  label: ReactNode;
  cost?: ReactNode;
  variant?: "default" | "office" | "next";
  locked?: boolean;
}

export function SimButton({
  icon,
  label,
  cost,
  variant = "default",
  locked,
  disabled,
  className,
  ...rest
}: SimButtonProps) {
  const classes = ["sim-btn", `sim-btn--${variant}`, locked ? "is-locked" : "", className ?? ""]
    .filter(Boolean)
    .join(" ");
  return (
    <button type="button" disabled={disabled || locked} className={classes} {...rest}>
      <span className="sim-btn__icon" aria-hidden>{icon}</span>
      <span className="sim-btn__label">{label}</span>
      {cost && <span className="sim-btn__cost">{cost}</span>}
    </button>
  );
}
