"use client";

import type { ReactNode } from "react";

interface EdgarProps {
  eyebrow?: string;
  title: string;
  children: ReactNode;
  cta: string;
  onCtaClick(): void;
  onDismiss(): void;
}

export function Edgar({ eyebrow, title, children, cta, onCtaClick, onDismiss }: EdgarProps) {
  return (
    <aside className="sim-edgar" role="note" aria-labelledby="edgar-title">
      <div className="sim-edgar__avatar" aria-hidden>E</div>
      <div className="sim-edgar__bubble">
        {eyebrow && <div className="sim-edgar__eyebrow">{eyebrow}</div>}
        <h3 id="edgar-title" className="sim-edgar__name">{title}</h3>
        <div className="sim-edgar__body">{children}</div>
        <div className="sim-edgar__actions">
          <button type="button" className="sim-edgar__cta" onClick={onCtaClick}>
            {cta} <span aria-hidden>→</span>
          </button>
          <button
            type="button"
            className="sim-edgar__dismiss"
            onClick={onDismiss}
            aria-label="Dismiss Edgar"
          >×</button>
        </div>
      </div>
    </aside>
  );
}
